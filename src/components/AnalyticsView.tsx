"use client";

import { useMemo } from "react";
import { PieChart, BarChart3 } from "lucide-react";
import { AppSettings, ExpenseItem, SettlementCalculation } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface AnalyticsViewProps {
  expenses: ExpenseItem[];
  calculation: SettlementCalculation;
  settings: AppSettings;
}

export function AnalyticsView({
  expenses,
  calculation,
  settings,
}: AnalyticsViewProps) {
  const currency = settings.currency || "₹";
  const husbandName = settings.husbandName || "Husband";
  const wifeName = settings.wifeName || "Wife";

  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const exp of expenses) {
      const cat = exp.category?.trim() || "General";
      map.set(cat, (map.get(cat) || 0) + exp.amount);
    }
    const list = Array.from(map.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
    return list;
  }, [expenses]);

  const total = calculation.totalExpenses || 1;

  const buckets = [
    {
      name: "Household",
      amount: calculation.householdTotal,
      color: "bg-indigo-500",
    },
    {
      name: `${husbandName} (Myself)`,
      amount: calculation.myselfTotal,
      color: "bg-blue-500",
    },
    {
      name: `${wifeName} (Herself)`,
      amount: calculation.wifeTotal,
      color: "bg-rose-500",
    },
    {
      name: "Parents",
      amount: calculation.parentsTotal,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white dark:bg-stone-900 p-5 sm:p-7 shadow-xs border border-stone-200/80 dark:border-stone-800 transition-colors">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300">
            <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading">
              Allocation Distribution
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Share of total family spending across the 4 key buckets
            </p>
          </div>
        </div>

        <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden flex mb-4">
          {buckets.map((b) => {
            const pct = (b.amount / total) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={b.name}
                style={{ width: `${pct}%` }}
                className={`${b.color} h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                title={`${b.name}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {buckets.map((b) => {
            const pct = Math.round((b.amount / total) * 100);
            return (
              <div
                key={b.name}
                className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/50 dark:border-stone-800/50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${b.color}`} />
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 truncate">
                    {b.name}
                  </span>
                </div>
                <div className="text-base font-bold font-heading text-stone-900 dark:text-stone-100">
                  {formatCurrency(b.amount, currency)}
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {pct}% of family total
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white dark:bg-stone-900 p-5 sm:p-7 shadow-xs border border-stone-200/80 dark:border-stone-800 transition-colors">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300">
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading">
              Spending by Category
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Ranked breakdown of itemized categories
            </p>
          </div>
        </div>

        {categoryStats.length === 0 ? (
          <p className="text-xs text-stone-400 py-6 text-center">No category data yet.</p>
        ) : (
          <div className="space-y-3">
            {categoryStats.map((item) => {
              const pct = Math.round((item.amount / total) * 100);
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {item.name}
                    </span>
                    <span className="font-bold font-heading text-stone-900 dark:text-stone-100">
                      {formatCurrency(item.amount, currency)}{" "}
                      <span className="text-[11px] font-normal text-stone-400">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

