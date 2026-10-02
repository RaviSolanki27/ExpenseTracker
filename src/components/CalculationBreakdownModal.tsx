"use client";

import { X, Calculator } from "lucide-react";
import { AppSettings, SettlementCalculation } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface CalculationBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: SettlementCalculation;
  settings: AppSettings;
}

export function CalculationBreakdownModal({
  isOpen,
  onClose,
  calculation,
  settings,
}: CalculationBreakdownModalProps) {
  if (!isOpen) return null;

  const currency = settings.currency || "₹";
  const husbandName = settings.husbandName || "Ravi";
  const wifeName = settings.wifeName || "Chandani";

  const {
    householdPaidByHusband,
    householdTotal,
    wifePaidByHusband,
    parentsPaidByWife,
    transfersWifeToHusband,
    netSettlementBalance,
    status,
  } = calculation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-7 text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading">
                How Difference is Calculated
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Simple and clear household accounting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 py-4 text-xs sm:text-sm">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/60 dark:border-stone-800/60 space-y-2">
            <p className="font-bold text-stone-900 dark:text-stone-100">
              1. What {husbandName} Paid for Household
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Groceries, electricity, recharge, water, maid & maintenance paid upfront by {husbandName}:
            </p>
            <div className="flex justify-between font-mono text-sm font-bold text-stone-900 dark:text-stone-100 pt-1 border-t border-stone-200 dark:border-stone-800">
              <span>Household Paid by {husbandName}:</span>
              <span>{formatCurrency(householdPaidByHusband, currency)}</span>
            </div>
          </div>

          {/* Step 2 (if any) */}
          {wifePaidByHusband > 0 && (
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/60 dark:border-stone-800/60 space-y-2">
              <p className="font-bold text-stone-900 dark:text-stone-100">
                2. {wifeName}&apos;s Personal Expenses Paid by {husbandName}
              </p>
              <div className="flex justify-between font-mono text-sm font-bold text-stone-900 dark:text-stone-100">
                <span>Personal Shopping / Salon:</span>
                <span>+{formatCurrency(wifePaidByHusband, currency)}</span>
              </div>
            </div>
          )}

          {/* Step 3 (if any) */}
          {parentsPaidByWife > 0 && (
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/60 dark:border-stone-800/60 space-y-2">
              <p className="font-bold text-stone-900 dark:text-stone-100">
                3. Offset for Parents Expenses Paid by {wifeName}
              </p>
              <div className="flex justify-between font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <span>Parents Paid Directly by {wifeName}:</span>
                <span>-{formatCurrency(parentsPaidByWife, currency)}</span>
              </div>
            </div>
          )}

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/60 dark:border-stone-800/60 space-y-2">
            <p className="font-bold text-stone-900 dark:text-stone-100">
              {wifePaidByHusband > 0 ? "4." : "2."} Amount Given by {wifeName}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Total transfers / UPI payments sent to {husbandName} for household:
            </p>
            <div className="flex justify-between font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-stone-200 dark:border-stone-800">
              <span>Given by {wifeName}:</span>
              <span>-{formatCurrency(transfersWifeToHusband, currency)}</span>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 text-white border border-stone-800 space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              Final Net Difference
            </p>

            {status === "WIFE_OWES_HUSBAND" && (
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-amber-400">
                  {wifeName} owes {husbandName} {formatCurrency(netSettlementBalance, currency)}
                </p>
                <p className="text-xs text-stone-300 mt-1">
                  Calculation: ({formatCurrency(householdPaidByHusband + wifePaidByHusband - parentsPaidByWife, currency)}) - ({formatCurrency(transfersWifeToHusband, currency)}) = {formatCurrency(netSettlementBalance, currency)}
                </p>
              </div>
            )}

            {status === "SETTLED" && (
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-400">
                  All Settled Up ({formatCurrency(0, currency)})
                </p>
                <p className="text-xs text-stone-300 mt-1">
                  Amount given by {wifeName} matches the household expenses.
                </p>
              </div>
            )}

            {status === "HUSBAND_OWES_WIFE" && (
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-400">
                  {formatCurrency(Math.abs(netSettlementBalance), currency)} Advance / Credit
                </p>
                <p className="text-xs text-stone-300 mt-1">
                  {wifeName} gave more than current household spend. This buffer can apply to upcoming bills.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
