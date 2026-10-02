"use client";

import {
  CheckCircle2,
  HelpCircle,
  HeartHandshake,
  Receipt,
  Plus,
} from "lucide-react";
import { AppSettings, SettlementCalculation } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface BalanceCardProps {
  calculation: SettlementCalculation;
  settings: AppSettings;
  onOpenBreakdown: () => void;
  onOpenSettleModal: () => void;
  onOpenExpenseModal: () => void;
}

export function BalanceCard({
  calculation,
  settings,
  onOpenBreakdown,
  onOpenSettleModal,
  onOpenExpenseModal,
}: BalanceCardProps) {
  const {
    netSettlementBalance,
    status,
    totalExpenses,
    husbandPaidForHousehold,
    transfersWifeToHusband,
    householdTotal,
    totalPaidByHusband,
  } = calculation;

  const currency = settings.currency || "₹";
  const husbandName = settings.husbandName || "Ravi";
  const wifeName = settings.wifeName || "Chandani";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-stone-900 dark:bg-stone-900 text-white p-5 sm:p-7 shadow-xl border border-stone-800">
      {/* Background accents */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-5 sm:gap-6">
        {/* Status Pill & Breakdown link */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {status === "WIFE_OWES_HUSBAND" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Receipt className="w-3.5 h-3.5" />
                Difference Due
              </span>
            )}
            {status === "SETTLED" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                All Settled Up
              </span>
            )}
            {status === "HUSBAND_OWES_WIFE" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Advance / Credit
              </span>
            )}
          </div>

          <button
            onClick={onOpenBreakdown}
            className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
            <span>How is difference calculated?</span>
          </button>
        </div>

        {/* Hero Settlement Display */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Household Settlement Difference
            </p>

            {status === "WIFE_OWES_HUSBAND" && (
              <>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading text-white">
                    {formatCurrency(netSettlementBalance, currency)}
                  </h2>
                </div>
                <p className="text-sm text-stone-200 mt-2 font-medium">
                  <span className="text-amber-400 font-semibold">{wifeName}</span> owes{" "}
                  <span className="text-emerald-400 font-semibold">{husbandName}</span>
                </p>
                <p className="text-xs text-stone-400 mt-1 max-w-md leading-relaxed">
                  {husbandName} spent {formatCurrency(husbandPaidForHousehold, currency)} for household expenses. {wifeName} has given {formatCurrency(transfersWifeToHusband, currency)}.
                </p>
              </>
            )}

            {status === "SETTLED" && (
              <>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading text-emerald-400">
                    {formatCurrency(0, currency)}
                  </h2>
                </div>
                <p className="text-sm text-stone-200 mt-2 font-medium">
                  Household expenses are fully balanced!
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Expenses paid by {husbandName} match the amount given by {wifeName}.
                </p>
              </>
            )}

            {status === "HUSBAND_OWES_WIFE" && (
              <>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading text-emerald-400">
                    +{formatCurrency(Math.abs(netSettlementBalance), currency)}
                  </h2>
                </div>
                <p className="text-sm text-stone-200 mt-2 font-medium">
                  <span className="text-emerald-300 font-semibold">{wifeName}</span> has paid in advance!
                </p>
                <p className="text-xs text-stone-400 mt-1 max-w-md leading-relaxed">
                  {wifeName} gave {formatCurrency(transfersWifeToHusband, currency)}, which is {formatCurrency(Math.abs(netSettlementBalance), currency)} more than the household expenses paid. This carries over for upcoming bills.
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenSettleModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Record Transfer</span>
            </button>
            <button
              onClick={onOpenExpenseModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white font-medium text-xs sm:text-sm border border-stone-700 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 border-t border-stone-800">
          <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800/60">
            <p className="text-[10px] sm:text-[11px] font-medium text-stone-400 uppercase tracking-wider truncate">
              Household Total
            </p>
            <p className="text-base sm:text-lg font-bold font-heading text-stone-100 mt-0.5">
              {formatCurrency(householdTotal, currency)}
            </p>
            <p className="text-[10px] text-stone-400 hidden sm:block mt-0.5">
              Groceries, bills & rent
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800/60">
            <p className="text-[10px] sm:text-[11px] font-medium text-stone-400 uppercase tracking-wider truncate">
              {husbandName} Paid
            </p>
            <p className="text-base sm:text-lg font-bold font-heading text-stone-100 mt-0.5">
              {formatCurrency(husbandPaidForHousehold, currency)}
            </p>
            <p className="text-[10px] text-stone-400 hidden sm:block mt-0.5">
              Cards, UPI & cash
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800/60">
            <p className="text-[10px] sm:text-[11px] font-medium text-stone-400 uppercase tracking-wider truncate">
              {wifeName} Gave
            </p>
            <p className="text-base sm:text-lg font-bold font-heading text-emerald-400 mt-0.5">
              {formatCurrency(transfersWifeToHusband, currency)}
            </p>
            <p className="text-[10px] text-stone-400 hidden sm:block mt-0.5">
              Transferred to {husbandName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
