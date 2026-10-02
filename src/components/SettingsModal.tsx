"use client";

import { useState, useEffect } from "react";
import {
  X,
  Settings as SettingsIcon,
  Database,
  CheckCircle,
  Trash2,
  Tag,
  CreditCard,
  Plus,
  Lock,
  KeyRound,
  ShieldCheck,
  LogOut,
  User,
} from "lucide-react";
import {
  AppSettings,
  CategoryItem,
  ExpenseBucket,
  PaymentMethodType,
  PaymentOptionItem,
} from "@/lib/types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  categories: CategoryItem[];
  paymentOptions: PaymentOptionItem[];
  onSaveSettings: (updated: Partial<AppSettings>) => Promise<void>;
  onAddCategory: (data: { name: string; bucket: ExpenseBucket }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onAddPaymentOption: (data: { name: string; type: PaymentMethodType }) => Promise<void>;
  onDeletePaymentOption: (id: string) => Promise<void>;
  onChangePasscode: (currentPin: string, newPin: string) => Promise<void>;
  onLockNow: () => void;
  onResetData: () => Promise<void>;
  initialTab?: "general" | "security" | "categories" | "payment";
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  categories,
  paymentOptions,
  onSaveSettings,
  onAddCategory,
  onDeleteCategory,
  onAddPaymentOption,
  onDeletePaymentOption,
  onChangePasscode,
  onLockNow,
  onResetData,
  initialTab = "general",
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "security" | "categories" | "payment">(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // General Settings state
  const [husbandName, setHusbandName] = useState(settings.husbandName || "Ravi");
  const [wifeName, setWifeName] = useState(settings.wifeName || "Chandani");
  const [currency, setCurrency] = useState(settings.currency || "₹");
  const [loadingGeneral, setLoadingGeneral] = useState(false);

  // New Category state
  const [newCatName, setNewCatName] = useState("");
  const [newCatBucket, setNewCatBucket] = useState<ExpenseBucket>("HOUSEHOLD");
  const [addingCat, setAddingCat] = useState(false);
  const [catFilter, setCatFilter] = useState<ExpenseBucket | "ALL">("ALL");

  // New Payment Option state
  const [newPayName, setNewPayName] = useState("");
  const [newPayType, setNewPayType] = useState<PaymentMethodType>("UPI");
  const [addingPay, setAddingPay] = useState(false);

  // Passcode / Security state
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [changingPasscode, setChangingPasscode] = useState(false);

  // Danger zone state
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingGeneral(true);
      setMessage(null);
      await onSaveSettings({
        husbandName: husbandName.trim() || "Ravi",
        wifeName: wifeName.trim() || "Chandani",
        currency: currency.trim() || "₹",
      });
      setMessage("Profile settings saved successfully!");
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      setMessage(err.message || "Failed to update settings.");
    } finally {
      setLoadingGeneral(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setAddingCat(true);
      setMessage(null);
      await onAddCategory({
        name: newCatName.trim(),
        bucket: newCatBucket,
      });
      setNewCatName("");
      setMessage("Category added successfully!");
      setTimeout(() => setMessage(null), 2000);
    } catch (err: any) {
      setMessage(err.message || "Failed to add category.");
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Delete this category?")) {
      try {
        await onDeleteCategory(id);
      } catch (err: any) {
        alert(err.message || "Failed to delete category");
      }
    }
  };

  const handleCreatePaymentOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayName.trim()) return;
    try {
      setAddingPay(true);
      setMessage(null);
      await onAddPaymentOption({
        name: newPayName.trim(),
        type: newPayType,
      });
      setNewPayName("");
      setMessage("Payment option added!");
      setTimeout(() => setMessage(null), 2000);
    } catch (err: any) {
      setMessage(err.message || "Failed to add payment option.");
    } finally {
      setAddingPay(false);
    }
  };

  const handleDeletePaymentOption = async (id: string) => {
    if (window.confirm("Delete this payment option?")) {
      try {
        await onDeletePaymentOption(id);
      } catch (err: any) {
        alert(err.message || "Failed to delete payment option");
      }
    }
  };

  const handleChangePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);

    if (currentPin.length !== 4 || !/^\d{4}$/.test(currentPin)) {
      setPasscodeError("Current passcode must be 4 digits.");
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPasscodeError("New passcode must be exactly 4 digits.");
      return;
    }

    if (newPin !== confirmPin) {
      setPasscodeError("New passcode and confirmation do not match.");
      return;
    }

    try {
      setChangingPasscode(true);
      await onChangePasscode(currentPin, newPin);
      setMessage("Passcode changed successfully! New sessions will require this passcode.");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setPasscodeError(err.message || "Failed to change passcode.");
    } finally {
      setChangingPasscode(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to clear current month expenses and settlements?")) {
      try {
        setIsResetting(true);
        await onResetData();
        setMessage("Month data cleared!");
      } catch (err: any) {
        setMessage(err.message || "Reset failed");
      } finally {
        setIsResetting(false);
      }
    }
  };

  const getBucketInfo = (bucket: ExpenseBucket) => {
    switch (bucket) {
      case "HOUSEHOLD":
        return { label: "Household", bg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20" };
      case "MYSELF":
        return { label: husbandName, bg: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" };
      case "WIFE":
        return { label: wifeName, bg: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20" };
      case "PARENTS":
        return { label: "Parents", bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" };
    }
  };

  const filteredCategories = categories.filter((c) =>
    catFilter === "ALL" ? true : c.bucket === catFilter
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-7 text-stone-900 dark:text-stone-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading">
                Settings & Passcode
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Manage names, 4-digit PIN, categories & payment modes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Status Badge */}
        <div className="my-3 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Neon PostgreSQL Connected
            </span>
          </div>
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Live & Synced
          </span>
        </div>

        {/* Feedback Message */}
        {message && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shrink-0">
            {message}
          </div>
        )}

        {/* Navigation Tabs with High-Visibility Labels */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 p-1 rounded-2xl mb-4 shrink-0 overflow-x-auto scrollbar-none gap-1">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex-1 min-w-[70px] py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "general"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 min-w-[95px] py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Passcode PIN</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex-1 min-w-[80px] py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "categories"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-800"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Categories</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("payment")}
            className={`flex-1 min-w-[75px] py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "payment"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-800"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payments</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700">
              {paymentOptions.length}
            </span>
          </button>
        </div>

        {/* Tab 1: General Profile Settings */}
        {activeTab === "general" && (
          <form onSubmit={handleGeneralSubmit} className="space-y-4">
            {/* Quick Passcode Callout Banner inside General tab */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    4-Digit Passcode Protection
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Default PIN: <strong>0000</strong> • Stays unlocked for 24h
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-all"
              >
                Change PIN &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                  Husband&apos;s Name
                </label>
                <input
                  type="text"
                  required
                  value={husbandName}
                  onChange={(e) => setHusbandName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                  Wife&apos;s Name
                </label>
                <input
                  type="text"
                  required
                  value={wifeName}
                  onChange={(e) => setWifeName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                Currency Symbol
              </label>
              <div className="flex gap-2 flex-wrap">
                {["₹", "$", "€", "£", "AED", "CAD"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      currency === c
                        ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-transparent shadow-xs"
                        : "bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loadingGeneral}
                className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold shadow-xs hover:bg-stone-800 dark:hover:bg-white transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingGeneral ? "Saving..." : "Save Profile Settings"}
              </button>
            </div>

            {/* Clear Month Data */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
              <label className="text-xs font-semibold uppercase tracking-wider text-rose-500 block mb-1">
                Danger Zone
              </label>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-2">
                Clear all expenses and transfers for the active month. This cannot be undone.
              </p>
              <button
                type="button"
                onClick={handleReset}
                disabled={isResetting}
                className="px-3.5 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isResetting ? "Clearing..." : "Clear Current Month Records"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security & 4-Digit Passcode Management */}
        {activeTab === "security" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold">4-Digit Security Passcode</span>
              </div>
              <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
                The default passcode is <strong>0000</strong>. When entered on the number board, you remain unlocked for <strong>24 hours</strong> on this phone/browser. You can change your 4-digit code below:
              </p>
            </div>

            {passcodeError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {passcodeError}
              </div>
            )}

            {/* Change Passcode Form */}
            <form onSubmit={handleChangePasscodeSubmit} className="space-y-3.5 p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Change Your Passcode
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                  Current Passcode (Default: 0000)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  placeholder="e.g. 0000"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-base sm:text-xs font-mono font-bold tracking-widest focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                    New Passcode (4 Digits)
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    placeholder="New 4-digit PIN"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-base sm:text-xs font-mono font-bold tracking-widest focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                    Confirm New Passcode
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    placeholder="Repeat new 4-digit PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-base sm:text-xs font-mono font-bold tracking-widest focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPasscode || newPin.length !== 4 || confirmPin.length !== 4}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {changingPasscode ? "Updating Passcode..." : "Save New 4-Digit Passcode"}
              </button>
            </form>

            {/* Quick Lock Now button */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Lock Session Now
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Lock immediately and test the number board screen
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLockNow();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-200/70 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Lock Now</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Categories Management */}
        {activeTab === "categories" && (
          <div className="space-y-4">
            {/* Add New Category Form */}
            <form
              onSubmit={handleCreateCategory}
              className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Add New Category
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Water Bill, Online Shopping"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500/30"
                />

                <select
                  value={newCatBucket}
                  onChange={(e) => setNewCatBucket(e.target.value as ExpenseBucket)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="HOUSEHOLD">Household (Groceries, Bills, etc.)</option>
                  <option value="MYSELF">{husbandName} (Fuel, Tech, Personal)</option>
                  <option value="WIFE">{wifeName} (Salon, Shopping, Personal)</option>
                  <option value="PARENTS">Parents (Medicines, Doctor, Care)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={addingCat || !newCatName.trim()}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {addingCat ? "Adding..." : "+ Save Category"}
              </button>
            </form>

            {/* Bucket Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {(["ALL", "HOUSEHOLD", "MYSELF", "WIFE", "PARENTS"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setCatFilter(b)}
                  className={`shrink-0 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    catFilter === b
                      ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
                  }`}
                >
                  {b === "ALL" ? "All" : b === "HOUSEHOLD" ? "Household" : b === "MYSELF" ? husbandName : b === "WIFE" ? wifeName : "Parents"}
                </button>
              ))}
            </div>

            {/* Existing Categories List */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {filteredCategories.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">No categories found in this bucket.</p>
              ) : (
                filteredCategories.map((cat) => {
                  const bInfo = getBucketInfo(cat.bucket);
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/60 dark:border-stone-800/60 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {cat.name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${bInfo.bg}`}>
                          {bInfo.label}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Payment Options Management */}
        {activeTab === "payment" && (
          <div className="space-y-4">
            {/* Add New Payment Option Form */}
            <form
              onSubmit={handleCreatePaymentOption}
              className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Add New Payment Method
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Bank UPI, HDFC Card, Cash"
                  value={newPayName}
                  onChange={(e) => setNewPayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500/30"
                />

                <select
                  value={newPayType}
                  onChange={(e) => setNewPayType(e.target.value as PaymentMethodType)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="BANK">Bank Account / NetBanking</option>
                  <option value="CASH">Cash</option>
                  <option value="WALLET">Wallet (Paytm / Amazon Pay)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={addingPay || !newPayName.trim()}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {addingPay ? "Adding..." : "+ Save Payment Method"}
              </button>
            </form>

            {/* Existing Payment Options List */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {paymentOptions.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">No payment methods found.</p>
              ) : (
                paymentOptions.map((pay) => (
                  <div
                    key={pay.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/60 dark:border-stone-800/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {pay.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                        {pay.type}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePaymentOption(pay.id)}
                      className="p-1 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete payment option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

