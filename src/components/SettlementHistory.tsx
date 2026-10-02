"use client";

import { useState } from "react";
import {
  HeartHandshake,
  ArrowRight,
  Heart,
  CheckCircle,
  Calendar,
  Trash2,
} from "lucide-react";
import { AppSettings, SettlementItem } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface SettlementHistoryProps {
  settlements: SettlementItem[];
  settings: AppSettings;
  onOpenSettleModal: () => void;
  onDeleteSettlement: (id: string) => Promise<void>;
}

export function SettlementHistory({
  settlements,
  settings,
  onOpenSettleModal,
  onDeleteSettlement,
}: SettlementHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currency = settings.currency || "₹";
  const husbandName = settings.husbandName || "Husband";
  const wifeName = settings.wifeName || "Wife";

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this settlement record?")) {
      try {
        setDeletingId(id);
        await onDeleteSettlement(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-stone-900 p-5 sm:p-7 shadow-xs border border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading">
              Transfers & Settlements
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Direct spousal repayments & parent support contributions
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettleModal}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
        >
          + Record Transfer
        </button>
      </div>

      {settlements.length === 0 ? (
        <div className="py-8 text-center bg-stone-50/50 dark:bg-stone-950/30 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
            No spousal transfers recorded for this period yet.
          </p>
          <button
            onClick={onOpenSettleModal}
            className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Record First Transfer
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {settlements.map((s) => {
            const sDate = new Date(s.date);
            const dateStr = sDate.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const isGeneralTransfer = s.type === "GENERAL_TRANSFER";

            return (
              <div
                key={s.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/60 dark:border-stone-800/60 gap-3"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isGeneralTransfer
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isGeneralTransfer ? (
                      <Heart className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 font-heading">
                        <span>{s.from === "WIFE" ? wifeName : husbandName}</span>
                        <ArrowRight className="w-3 h-3 text-stone-400" />
                        <span>{s.to === "HUSBAND" ? husbandName : wifeName}</span>
                      </span>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isGeneralTransfer
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {isGeneralTransfer ? "Extra Support" : "Household Settlement"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span>Via {s.paymentMethod}</span>
                      {s.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-stone-600 dark:text-stone-300">
                            &quot;{s.notes}&quot;
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/50 dark:border-stone-800/50">
                  <span className="text-base font-bold font-heading text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(s.amount, currency)}
                  </span>

                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    className="opacity-80 sm:opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer disabled:opacity-50"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

