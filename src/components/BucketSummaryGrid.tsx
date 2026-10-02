"use client";

import { Home, User, Sparkles, Heart, ChevronRight } from "lucide-react";
import { AppSettings, ExpenseBucket, SettlementCalculation } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface BucketSummaryGridProps {
  calculation: SettlementCalculation;
  settings: AppSettings;
  activeBucketFilter: ExpenseBucket | "ALL";
  onSelectBucketFilter: (bucket: ExpenseBucket | "ALL") => void;
}

export function BucketSummaryGrid({
  calculation,
  settings,
  activeBucketFilter,
  onSelectBucketFilter,
}: BucketSummaryGridProps) {
  const currency = settings.currency || "₹";
  const husbandName = settings.husbandName || "Ravi";
  const wifeName = settings.wifeName || "Chandani";

  const buckets = [
    {
      id: "HOUSEHOLD" as ExpenseBucket,
      title: "Household",
      subtitle: "Groceries, bills, recharge & rent",
      icon: Home,
      total: calculation.householdTotal,
      paidByHusband: calculation.householdPaidByHusband,
      paidByWife: calculation.householdPaidByWife,
      badge: "Shared House",
      accentBg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    },
    {
      id: "MYSELF" as ExpenseBucket,
      title: `${husbandName} (Myself)`,
      subtitle: "Fuel, commute & personal",
      icon: User,
      total: calculation.myselfTotal,
      paidByHusband: calculation.myselfPaidByHusband,
      paidByWife: calculation.myselfPaidByWife,
      badge: "Personal",
      accentBg: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    },
    {
      id: "WIFE" as ExpenseBucket,
      title: `${wifeName}`,
      subtitle: "Shopping, salon & personal",
      icon: Sparkles,
      total: calculation.wifeTotal,
      paidByHusband: calculation.wifePaidByHusband,
      paidByWife: calculation.wifePaidByWife,
      badge: "Personal",
      accentBg: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    },
    {
      id: "PARENTS" as ExpenseBucket,
      title: "Parents",
      subtitle: "Medicines, doctor & care",
      icon: Heart,
      total: calculation.parentsTotal,
      paidByHusband: calculation.parentsPaidByHusband,
      paidByWife: calculation.parentsPaidByWife,
      badge: "Family",
      accentBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Expense Buckets
        </h3>
        {activeBucketFilter !== "ALL" && (
          <button
            onClick={() => onSelectBucketFilter("ALL")}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Clear Filter (Show All)
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {buckets.map((b) => {
          const Icon = b.icon;
          const isSelected = activeBucketFilter === b.id;

          return (
            <div
              key={b.id}
              onClick={() => onSelectBucketFilter(isSelected ? "ALL" : b.id)}
              className={`group relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 bg-white dark:bg-stone-900 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                isSelected
                  ? "ring-2 ring-emerald-500 border-transparent shadow-md"
                  : "border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700"
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-2 sm:mb-3">
                <div className={`p-2 rounded-xl sm:rounded-2xl ${b.accentBg}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                  {b.badge}
                </span>
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 font-heading truncate">
                  {b.title}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mb-2">
                  {b.subtitle}
                </p>

                <div className="text-base sm:text-xl font-bold font-heading text-stone-900 dark:text-stone-100 mb-2 sm:mb-3">
                  {formatCurrency(b.total, currency)}
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-0.5 text-[10px] sm:text-[11px]">
                  <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                    <span>{husbandName}:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {formatCurrency(b.paidByHusband, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                    <span>{wifeName}:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {formatCurrency(b.paidByWife, currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                <span>{isSelected ? "Filtering" : "Filter"}</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
