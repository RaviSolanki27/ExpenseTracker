"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { BalanceCard } from "@/components/BalanceCard";
import { BucketSummaryGrid } from "@/components/BucketSummaryGrid";
import { ExpenseList } from "@/components/ExpenseList";
import { SettlementHistory } from "@/components/SettlementHistory";
import { AnalyticsView } from "@/components/AnalyticsView";
import { ExpenseModal } from "@/components/ExpenseModal";
import { SettlementModal } from "@/components/SettlementModal";
import { CalculationBreakdownModal } from "@/components/CalculationBreakdownModal";
import { SettingsModal } from "@/components/SettingsModal";
import { BottomNav } from "@/components/BottomNav";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAInstallModal } from "@/components/PWAInstallModal";
import { PasscodeScreen } from "@/components/PasscodeScreen";
import {
  AppSettings,
  CategoryItem,
  ExpenseBucket,
  ExpenseItem,
  PaymentMethodType,
  PaymentOptionItem,
  SettlementItem,
} from "@/lib/types";
import { calculateSettlement } from "@/lib/calculations";
import { LayoutDashboard, Receipt, HeartHandshake, BarChart3, Plus, Sparkles } from "lucide-react";

const SESSION_KEY = "duoledger_session";

interface SessionData {
  isUnlocked: boolean;
  expiresAt: number;
  passcodeUpdatedAt?: string;
}

export default function Home() {
  // Passcode security state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [currentMonth, setCurrentMonth] = useState<string>("current");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptionItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    id: "default",
    husbandName: "Ravi",
    wifeName: "Chandani",
    currency: "₹",
    theme: "system",
  });

  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "expenses" | "settlements" | "analytics">("dashboard");
  const [activeBucketFilter, setActiveBucketFilter] = useState<ExpenseBucket | "ALL">("ALL");

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsModalTab, setSettingsModalTab] = useState<"general" | "security" | "categories" | "payment">("general");
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Check 24-hour passcode session on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const session: SessionData = JSON.parse(stored);
        if (session.isUnlocked && session.expiresAt && Date.now() < session.expiresAt) {
          setIsUnlocked(true);
        } else {
          localStorage.removeItem(SESSION_KEY);
          setIsUnlocked(false);
        }
      } else {
        setIsUnlocked(false);
      }
    } catch {
      setIsUnlocked(false);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  // 2. PWA beforeinstallprompt capture
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  // 3. Fetch data from Neon DB
  const fetchData = useCallback(async (monthToFetch?: string) => {
    try {
      setLoading(true);
      const queryMonth = monthToFetch !== undefined ? monthToFetch : currentMonth;
      const res = await fetch(`/api/data?month=${encodeURIComponent(queryMonth)}`);
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses || []);
        setSettlements(data.settlements || []);
        if (data.categories) setCategories(data.categories);
        if (data.paymentOptions) setPaymentOptions(data.paymentOptions);
        if (data.settings) {
          setSettings(data.settings);

          // Validate if passcode was changed on another session
          try {
            const stored = localStorage.getItem(SESSION_KEY);
            if (stored) {
              const session: SessionData = JSON.parse(stored);
              if (
                session.passcodeUpdatedAt &&
                data.settings.passcodeUpdatedAt &&
                session.passcodeUpdatedAt !== data.settings.passcodeUpdatedAt
              ) {
                localStorage.removeItem(SESSION_KEY);
                setIsUnlocked(false);
                showToast("Passcode was changed. Please enter the new passcode.");
              }
            }
          } catch {}
        }
        if (data.availableMonths) setAvailableMonths(data.availableMonths);
        if (queryMonth === "current" && data.month) {
          setCurrentMonth(data.month);
        }
      }
    } catch (err) {
      console.error("Failed to fetch ledger data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    if (isUnlocked) {
      fetchData();
    }
  }, [fetchData, isUnlocked]);

  // Auth Handlers
  const handlePasscodeSuccess = (session: { expiresAt: number; passcodeUpdatedAt: string }) => {
    const sessionData: SessionData = {
      isUnlocked: true,
      expiresAt: session.expiresAt,
      passcodeUpdatedAt: session.passcodeUpdatedAt,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    setIsUnlocked(true);
    showToast("Unlocked! Session valid for 24 hours.");
  };

  const handleLockNow = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsUnlocked(false);
    showToast("Ledger locked.");
  };

  const handleChangePasscode = async (currentPin: string, newPin: string) => {
    const res = await fetch("/api/auth/change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPasscode: currentPin, newPasscode: newPin }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to update passcode");
    }

    const updatedSession: SessionData = {
      isUnlocked: true,
      expiresAt: data.expiresAt,
      passcodeUpdatedAt: data.passcodeUpdatedAt,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    setSettings((prev) => ({ ...prev, passcodeUpdatedAt: data.passcodeUpdatedAt }));
    showToast("Passcode updated successfully!");
  };

  const handleMonthChange = (newMonth: string) => {
    setCurrentMonth(newMonth);
    fetchData(newMonth);
  };

  const calculation = calculateSettlement(
    expenses,
    settlements,
    settings
  );

  const handleSaveExpense = async (expData: Partial<ExpenseItem>) => {
    if (expData.id) {
      const res = await fetch(`/api/expenses/${expData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      showToast("Expense updated successfully");
    } else {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      showToast("Expense recorded successfully");
    }
    fetchData();
  };

  const handleDeleteExpense = async (id: string) => {
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    showToast("Expense removed");
    fetchData();
  };

  const handleSaveSettlement = async (settlementData: Partial<SettlementItem>) => {
    const res = await fetch("/api/settlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settlementData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    showToast("Transfer recorded successfully!");
    fetchData();
  };

  const handleDeleteSettlement = async (id: string) => {
    const res = await fetch(`/api/settlements/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    showToast("Transfer removed");
    fetchData();
  };

  const handleSaveSettings = async (updated: Partial<AppSettings>) => {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setSettings(data.settings);
    showToast("Settings updated");
    fetchData();
  };

  const handleAddCategory = async (catData: { name: string; bucket: ExpenseBucket }) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    showToast(`Category "${catData.name}" created`);
    fetchData();
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    showToast("Category removed");
    fetchData();
  };

  const handleAddPaymentOption = async (payData: { name: string; type: PaymentMethodType }) => {
    const res = await fetch("/api/payment-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    showToast(`Payment method "${payData.name}" created`);
    fetchData();
  };

  const handleDeletePaymentOption = async (id: string) => {
    const res = await fetch(`/api/payment-options/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    showToast("Payment method removed");
    fetchData();
  };

  const handleLoadDemoData = async () => {
    try {
      setDemoLoading(true);
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: "regular" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      showToast("Sample month data loaded!");
      fetchData();
    } catch (err: any) {
      alert("Seed failed: " + err.message);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleResetData = async () => {
    for (const e of expenses) {
      await fetch(`/api/expenses/${e.id}`, { method: "DELETE" });
    }
    for (const s of settlements) {
      await fetch(`/api/settlements/${s.id}`, { method: "DELETE" });
    }
    fetchData();
  };

  // Initial Auth Loading Screen
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#090a0b] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  // Passcode Number Board Screen
  if (!isUnlocked) {
    return (
      <PasscodeScreen
        onSuccess={handlePasscodeSuccess}
        husbandName={settings.husbandName}
        wifeName={settings.wifeName}
      />
    );
  }

  // Unlocked Main Application
  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#090a0b] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors pb-24 sm:pb-12 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-stone-800 dark:border-stone-200">
          <Sparkles className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentMonth={currentMonth}
        availableMonths={availableMonths}
        onMonthChange={handleMonthChange}
        onOpenSettings={() => {
          setSettingsModalTab("general");
          setIsSettingsModalOpen(true);
        }}
        onOpenPWAInstall={() => setIsPWAInstallModalOpen(true)}
        onLoadDemoData={handleLoadDemoData}
        onLockNow={handleLockNow}
        isDemoLoading={demoLoading}
        settings={settings}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6">
        {/* Desktop View Navigation Tabs */}
        <div className="hidden sm:flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800/80 pb-3">
          <div className="flex items-center gap-1.5 bg-stone-200/50 dark:bg-stone-900/60 p-1 rounded-2xl border border-stone-300/40 dark:border-stone-800">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("expenses")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "expenses"
                  ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>All Expenses</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700">
                {expenses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("settlements")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "settlements"
                  ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Transfers</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700">
                {settlements.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics & Insights</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Dashboard View */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <BalanceCard
              calculation={calculation}
              settings={settings}
              onOpenBreakdown={() => setIsBreakdownModalOpen(true)}
              onOpenSettleModal={() => setIsSettleModalOpen(true)}
              onOpenExpenseModal={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
            />

            <BucketSummaryGrid
              calculation={calculation}
              settings={settings}
              activeBucketFilter={activeBucketFilter}
              onSelectBucketFilter={(b) => {
                setActiveBucketFilter(b);
                setActiveTab("expenses");
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ExpenseList
                  expenses={expenses.slice(0, 8)}
                  settings={settings}
                  activeBucketFilter={activeBucketFilter}
                  onSelectBucketFilter={setActiveBucketFilter}
                  onEditExpense={(exp) => {
                    setEditingExpense(exp);
                    setIsExpenseModalOpen(true);
                  }}
                  onDeleteExpense={handleDeleteExpense}
                  onOpenAddExpense={() => {
                    setEditingExpense(null);
                    setIsExpenseModalOpen(true);
                  }}
                />
              </div>

              <div>
                <SettlementHistory
                  settlements={settlements.slice(0, 5)}
                  settings={settings}
                  onOpenSettleModal={() => setIsSettleModalOpen(true)}
                  onDeleteSettlement={handleDeleteSettlement}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Expenses Activity View */}
        {activeTab === "expenses" && (
          <div className="space-y-6">
            <BucketSummaryGrid
              calculation={calculation}
              settings={settings}
              activeBucketFilter={activeBucketFilter}
              onSelectBucketFilter={setActiveBucketFilter}
            />

            <ExpenseList
              expenses={expenses}
              settings={settings}
              activeBucketFilter={activeBucketFilter}
              onSelectBucketFilter={setActiveBucketFilter}
              onEditExpense={(exp) => {
                setEditingExpense(exp);
                setIsExpenseModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
              onOpenAddExpense={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 3: Settlements History View */}
        {activeTab === "settlements" && (
          <div className="space-y-6">
            <BalanceCard
              calculation={calculation}
              settings={settings}
              onOpenBreakdown={() => setIsBreakdownModalOpen(true)}
              onOpenSettleModal={() => setIsSettleModalOpen(true)}
              onOpenExpenseModal={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
            />

            <SettlementHistory
              settlements={settlements}
              settings={settings}
              onOpenSettleModal={() => setIsSettleModalOpen(true)}
              onDeleteSettlement={handleDeleteSettlement}
            />
          </div>
        )}

        {/* Tab 4: Analytics View */}
        {activeTab === "analytics" && (
          <AnalyticsView
            expenses={expenses}
            calculation={calculation}
            settings={settings}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
      />

      {/* PWA Floating Banner */}
      <PWAInstallPrompt
        onOpenGuide={() => setIsPWAInstallModalOpen(true)}
        deferredPrompt={deferredPrompt}
      />

      {/* PWA Installation Modal Guide */}
      <PWAInstallModal
        isOpen={isPWAInstallModalOpen}
        onClose={() => setIsPWAInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstalled={() => {
          showToast("DuoLedger successfully installed!");
          setDeferredPrompt(null);
        }}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        settings={settings}
        categories={categories}
        paymentOptions={paymentOptions}
      />

      {/* Settlement Modal */}
      <SettlementModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        onSave={handleSaveSettlement}
        pendingBalance={calculation.netSettlementBalance}
        settings={settings}
        paymentOptions={paymentOptions}
      />

      {/* Calculation Breakdown Modal */}
      <CalculationBreakdownModal
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        calculation={calculation}
        settings={settings}
      />

      {/* Settings, Security & Categories Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        categories={categories}
        paymentOptions={paymentOptions}
        onSaveSettings={handleSaveSettings}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddPaymentOption={handleAddPaymentOption}
        onDeletePaymentOption={handleDeletePaymentOption}
        onChangePasscode={handleChangePasscode}
        onLockNow={handleLockNow}
        onResetData={handleResetData}
        initialTab={settingsModalTab}
      />
    </div>
  );
}

