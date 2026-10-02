"use client";

import { useState, useEffect } from "react";
import { X, HeartHandshake, ArrowRight, Heart, CheckCircle2 } from "lucide-react";
import {
  AppSettings,
  PaidBy,
  PaymentOptionItem,
  SettlementItem,
  SettlementType,
} from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settlementData: Partial<SettlementItem>) => Promise<void>;
  pendingBalance: number;
  settings: AppSettings;
  paymentOptions?: PaymentOptionItem[];
}

const DEFAULT_CHANNELS = ["Bank UPI", "Bank Account", "Cash", "Wallet"];

export function SettlementModal({
  isOpen,
  onClose,
  onSave,
  pendingBalance,
  settings,
  paymentOptions = [],
}: SettlementModalProps) {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState<PaidBy>("WIFE");
  const [to, setTo] = useState<PaidBy>("HUSBAND");
  const [type, setType] = useState<SettlementType>("DEBT_REDUCTION");
  const [paymentMethod, setPaymentMethod] = useState("Bank UPI");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = settings.currency || "₹";
  const husbandName = settings.husbandName || "Ravi";
  const wifeName = settings.wifeName || "Chandani";

  const availableChannels = paymentOptions.length > 0
    ? paymentOptions.map((p) => p.name)
    : DEFAULT_CHANNELS;

  useEffect(() => {
    if (isOpen) {
      if (pendingBalance > 0) {
        setAmount(pendingBalance.toString());
        setFrom("WIFE");
        setTo("HUSBAND");
        setType("DEBT_REDUCTION");
        setNotes(`Household settlement transfer`);
      } else {
        setAmount("");
        setFrom("WIFE");
        setTo("HUSBAND");
        setType("DEBT_REDUCTION");
        setNotes("");
      }
      setPaymentMethod(availableChannels[0] || "Bank UPI");
      setDate(new Date().toISOString().slice(0, 10));
      setError(null);
    }
  }, [isOpen, pendingBalance]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid transfer amount.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({
        amount: parsedAmount,
        from,
        to,
        type,
        paymentMethod: paymentMethod.trim() || "Bank UPI",
        date: new Date(date).toISOString(),
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to record spousal transfer.");
    } finally {
      setLoading(false);
    }
  };

  const autofillDue = () => {
    if (pendingBalance > 0) {
      setAmount(pendingBalance.toString());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-7 text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading">
                Record Transfer / Contribution
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Money received from {wifeName} to settle household expenses
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

        {error && (
          <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Household Difference Banner */}
          {pendingBalance > 0 ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
              <div>
                <p className="font-semibold">
                  Household Balance Due: {formatCurrency(pendingBalance, currency)}
                </p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                  {husbandName} spent this for the household upfront
                </p>
              </div>
              <button
                type="button"
                onClick={autofillDue}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-[11px] hover:bg-amber-400 transition-colors cursor-pointer shrink-0"
              >
                Auto-fill Due
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
              <span className="font-semibold">
                Household accounts are currently settled!
              </span>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                Any transfer recorded now will be credited as advance or extra support.
              </p>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
              Amount Transferred ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-stone-400">
                {currency}
              </span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 text-2xl sm:text-3xl font-extrabold font-heading text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Transfer Direction */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1.5">
              Who Sent The Money?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFrom("WIFE");
                  setTo("HUSBAND");
                }}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  from === "WIFE" && to === "HUSBAND"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs"
                    : "bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                <span>{wifeName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{husbandName}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFrom("HUSBAND");
                  setTo("WIFE");
                }}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  from === "HUSBAND" && to === "WIFE"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs"
                    : "bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                <span>{husbandName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{wifeName}</span>
              </button>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1.5">
              Transfer Classification
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("DEBT_REDUCTION")}
                className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                  type === "DEBT_REDUCTION"
                    ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-transparent shadow-xs"
                    : "bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Household Settlement
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Reimburses {husbandName}&apos;s upfront household & personal payments
                </p>
              </button>

              <button
                type="button"
                onClick={() => setType("GENERAL_TRANSFER")}
                className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                  type === "GENERAL_TRANSFER"
                    ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-transparent shadow-xs"
                    : "bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                <p className="font-bold flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  Parents / Extra Support
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Direct contribution towards parents care or extra support
                </p>
              </button>
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                Transfer Channel / Mode
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 text-base sm:text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
              >
                {availableChannels.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 text-base sm:text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          {/* Reference Notes */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
              Transfer Note / Reference
            </label>
            <input
              type="text"
              placeholder="e.g. UPI Ref #, Salary transfer, D-Mart split"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 text-base sm:text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Recording..." : "Record Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
