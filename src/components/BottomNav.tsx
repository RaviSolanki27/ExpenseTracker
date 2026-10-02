"use client";

import { LayoutDashboard, Receipt, Plus, HeartHandshake, BarChart3 } from "lucide-react";

interface BottomNavProps {
  currentTab: "dashboard" | "expenses" | "settlements" | "analytics";
  onChangeTab: (tab: "dashboard" | "expenses" | "settlements" | "analytics") => void;
  onOpenAddExpense: () => void;
}

export function BottomNav({
  currentTab,
  onChangeTab,
  onOpenAddExpense,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-lg border-t border-stone-200/80 dark:border-stone-800/80 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        <button
          onClick={() => onChangeTab("dashboard")}
          className={`flex flex-col items-center justify-center w-14 h-full cursor-pointer transition-colors ${
            currentTab === "dashboard"
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => onChangeTab("expenses")}
          className={`flex flex-col items-center justify-center w-14 h-full cursor-pointer transition-colors ${
            currentTab === "expenses"
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Expenses</span>
        </button>

        <div className="relative -top-3">
          <button
            onClick={onOpenAddExpense}
            className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-stone-950 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
            aria-label="Add Expense"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        <button
          onClick={() => onChangeTab("settlements")}
          className={`flex flex-col items-center justify-center w-14 h-full cursor-pointer transition-colors ${
            currentTab === "settlements"
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          }`}
        >
          <HeartHandshake className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Settle</span>
        </button>

        <button
          onClick={() => onChangeTab("analytics")}
          className={`flex flex-col items-center justify-center w-14 h-full cursor-pointer transition-colors ${
            currentTab === "analytics"
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Insights</span>
        </button>
      </div>
    </nav>
  );
}

