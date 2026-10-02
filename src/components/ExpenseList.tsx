"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Home,
  User,
  Sparkles,
  Heart,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  Edit2,
  Trash2,
  Calendar,
  ArrowUpDown,
} from "lucide-react";
import { AppSettings, ExpenseBucket, ExpenseItem, PaidBy } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface ExpenseListProps {
  expenses: ExpenseItem[];
  settings: AppSettings;
  activeBucketFilter: ExpenseBucket | "ALL";
  onSelectBucketFilter: (bucket: ExpenseBucket | "ALL") => void;
  onEditExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (id: string) => Promise<void>;
  onOpenAddExpense: () => void;
}

export function ExpenseList({
  expenses,
  settings,
  activeBucketFilter,
  onSelectBucketFilter,
  onEditExpense,
  onDeleteExpense,
  onOpenAddExpense,
}: ExpenseListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [payerFilter, setPayerFilter] = useState<PaidBy | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"date_desc" | "amount_desc">("date_desc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currency = settings.currency || "₹";
  const husbandName = settings.husbandName || "Husband";
  const wifeName = settings.wifeName || "Wife";

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        if (activeBucketFilter !== "ALL" && exp.bucket !== activeBucketFilter) {
          return false;
        }
        if (payerFilter !== "ALL" && exp.paidBy !== payerFilter) {
          return false;
        }
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = exp.title.toLowerCase().includes(term);
          const matchCat = exp.category?.toLowerCase().includes(term);
          const matchNotes = exp.notes?.toLowerCase().includes(term);
          return matchTitle || matchCat || matchNotes;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "amount_desc") {
          return b.amount - a.amount;
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [expenses, activeBucketFilter, payerFilter, searchTerm, sortBy]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        setDeletingId(id);
        await onDeleteExpense(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getBucketBadge = (bucket: ExpenseBucket) => {
    switch (bucket) {
      case "HOUSEHOLD":
        return {
          icon: Home,
          label: "Household",
          bg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
        };
      case "MYSELF":
        return {
          icon: User,
          label: husbandName,
          bg: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
        };
      case "WIFE":
        return {
          icon: Sparkles,
          label: wifeName,
          bg: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
        };
      case "PARENTS":
        return {
          icon: Heart,
          label: "Parents",
          bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        };
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "CREDIT_CARD":
        return <CreditCard className="w-3 h-3 inline mr-1" />;
      case "BANK_ACCOUNT":
        return <Building className="w-3 h-3 inline mr-1" />;
      case "UPI":
        return <Smartphone className="w-3 h-3 inline mr-1" />;
      case "CASH":
        return <Banknote className="w-3 h-3 inline mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-stone-900 p-5 sm:p-7 shadow-xs border border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading">
            Expense Activity
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {filteredExpenses.length} transactions recorded
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <span>+ Add Expense</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search expenses by title, category, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-950/60 p-1 rounded-xl border border-stone-200/80 dark:border-stone-800 self-start md:self-auto">
          <button
            onClick={() => setPayerFilter("ALL")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              payerFilter === "ALL"
                ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            All Payers
          </button>
          <button
            onClick={() => setPayerFilter("HUSBAND")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              payerFilter === "HUSBAND"
                ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            {husbandName} Paid
          </button>
          <button
            onClick={() => setPayerFilter("WIFE")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              payerFilter === "WIFE"
                ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            {wifeName} Paid
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setSortBy(sortBy === "date_desc" ? "amount_desc" : "date_desc")
            }
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortBy === "date_desc" ? "Latest First" : "Highest Amount"}</span>
          </button>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 mx-auto flex items-center justify-center mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            No expenses found
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Try adjusting your search or filters, or add a new expense.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredExpenses.map((exp) => {
            const badge = getBucketBadge(exp.bucket);
            const BadgeIcon = badge.icon;
            const expDate = new Date(exp.date);
            const dateStr = expDate.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            });

            return (
              <div
                key={exp.id}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-950/40 hover:bg-stone-100/80 dark:hover:bg-stone-950/80 border border-stone-200/60 dark:border-stone-800/60 transition-all gap-3"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${badge.bg}`}
                  >
                    <BadgeIcon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-stone-900 dark:text-stone-100 font-heading">
                        {exp.title}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span>{exp.category}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        {getPaymentMethodIcon(exp.paymentMethod)}
                        <span className="capitalize">
                          {exp.paymentMethod.replace("_", " ").toLowerCase()}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-stone-700 dark:text-stone-300">
                        Paid by {exp.paidBy === "HUSBAND" ? husbandName : wifeName}
                      </span>
                    </div>

                    {exp.notes && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 italic mt-1">
                        &quot;{exp.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/50 dark:border-stone-800/50">
                  <span className="text-base sm:text-lg font-bold font-heading text-stone-900 dark:text-stone-100">
                    {formatCurrency(exp.amount, currency)}
                  </span>

                  <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditExpense(exp)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Edit Expense"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      disabled={deletingId === exp.id}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

