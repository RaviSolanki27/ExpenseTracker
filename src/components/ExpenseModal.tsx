"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Home,
  User,
  Sparkles,
  Heart,
  CreditCard,
  Tag,
} from "lucide-react";
import {
  AppSettings,
  CategoryItem,
  ExpenseBucket,
  ExpenseItem,
  PaidBy,
  PaymentOptionItem,
} from "@/lib/types";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Partial<ExpenseItem>) => Promise<void>;
  editingExpense?: ExpenseItem | null;
  settings: AppSettings;
  categories?: CategoryItem[];
  paymentOptions?: PaymentOptionItem[];
}

const DEFAULT_CATEGORIES: Array<{ name: string; bucket: ExpenseBucket }> = [
  { name: "Groceries", bucket: "HOUSEHOLD" },
  { name: "Electricity Bill", bucket: "HOUSEHOLD" },
  { name: "Mobile Recharge & WiFi", bucket: "HOUSEHOLD" },
  { name: "Water Bill", bucket: "HOUSEHOLD" },
  { name: "Online Shopping", bucket: "HOUSEHOLD" },
  { name: "Household Items", bucket: "HOUSEHOLD" },
  { name: "Fuel & Travel", bucket: "MYSELF" },
  { name: "Tech & Work", bucket: "MYSELF" },
  { name: "Personal Grooming", bucket: "WIFE" },
  { name: "Shopping & Care", bucket: "WIFE" },
  { name: "Doctor & Medicines", bucket: "PARENTS" },
  { name: "Parents Living Cost", bucket: "PARENTS" },
];

const DEFAULT_PAYMENT_METHODS = [
  "Credit Card",
  "Bank UPI",
  "Cash",
  "Wallet Amount",
  "Bank Account",
];

export function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  settings,
  categories = [],
  paymentOptions = [],
}: ExpenseModalProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [bucket, setBucket] = useState<ExpenseBucket>("HOUSEHOLD");
  const [category, setCategory] = useState("Groceries");
  const [paidBy, setPaidBy] = useState<PaidBy>("HUSBAND");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = settings.currency || "₹";
  const husbandName = settings.husbandName || "Ravi";
  const wifeName = settings.wifeName || "Chandani";

  // Available categories list
  const availableCats = categories.length > 0
    ? categories
    : DEFAULT_CATEGORIES.map((c, i) => ({ id: `default-${i}`, name: c.name, bucket: c.bucket }));

  // Filter categories matching current bucket, plus others
  const bucketCats = availableCats.filter((c) => c.bucket === bucket);
  const displayCats = bucketCats.length > 0 ? bucketCats : availableCats;

  // Available payment methods
  const availablePaymentMethods = paymentOptions.length > 0
    ? paymentOptions.map((p) => p.name)
    : DEFAULT_PAYMENT_METHODS;

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setBucket(editingExpense.bucket);
      setCategory(editingExpense.category || "Groceries");
      setPaidBy(editingExpense.paidBy);
      setPaymentMethod(editingExpense.paymentMethod || "Credit Card");
      setDate(new Date(editingExpense.date).toISOString().slice(0, 10));
      setNotes(editingExpense.notes || "");
    } else {
      setTitle("");
      setAmount("");
      setBucket("HOUSEHOLD");
      const firstCat = bucketCats[0]?.name || "Groceries";
      setCategory(firstCat);
      setPaidBy("HUSBAND");
      setPaymentMethod(availablePaymentMethods[0] || "Credit Card");
      setDate(new Date().toISOString().slice(0, 10));
      setNotes("");
    }
    setError(null);
  }, [editingExpense, isOpen]);

  // When bucket changes in new expense mode, auto-select first category for that bucket
  const handleBucketChange = (newBucket: ExpenseBucket) => {
    setBucket(newBucket);
    const firstMatching = availableCats.find((c) => c.bucket === newBucket);
    if (firstMatching) {
      setCategory(firstMatching.name);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide an expense title.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({
        id: editingExpense?.id,
        title: title.trim(),
        amount: parsedAmount,
        bucket,
        category: category.trim() || "General",
        paidBy,
        paymentMethod: paymentMethod.trim() || "Credit Card",
        date: new Date(date).toISOString(),
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save expense.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuickCategory = (catName: string) => {
    setCategory(catName);
    if (!title.trim() || title === "Groceries" || title === "Electricity Bill") {
      setTitle(catName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-7 text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading">
                {editingExpense ? "Edit Expense" : "Log New Expense"}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Record spending with payment method & spousal allocation
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
          {/* Amount input */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
              Amount ({currency})
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

          {/* Title input */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
              Expense Item / Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Grocery at D-Mart, Electricity Bill, Petrol"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 text-base sm:text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Bucket selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Expense Category Bucket
              </label>
              <span className="text-[11px] text-stone-400 font-medium">
                {bucket === "HOUSEHOLD"
                  ? "Tracked for Household settlement"
                  : bucket === "PARENTS"
                  ? "Parents Care"
                  : `${bucket === "MYSELF" ? husbandName : wifeName} Personal`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleBucketChange("HOUSEHOLD")}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                  bucket === "HOUSEHOLD"
                    ? "bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-400 shadow-xs"
                    : "bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300"
                }`}
              >
                <Home className="w-4 h-4 mb-1 text-indigo-600 dark:text-indigo-400" />
                <span>Household</span>
              </button>

              <button
                type="button"
                onClick={() => handleBucketChange("MYSELF")}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                  bucket === "MYSELF"
                    ? "bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400 shadow-xs"
                    : "bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300"
                }`}
              >
                <User className="w-4 h-4 mb-1 text-blue-600 dark:text-blue-400" />
                <span>{husbandName}</span>
              </button>

              <button
                type="button"
                onClick={() => handleBucketChange("WIFE")}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                  bucket === "WIFE"
                    ? "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 shadow-xs"
                    : "bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300"
                }`}
              >
                <Sparkles className="w-4 h-4 mb-1 text-rose-500 dark:text-rose-400" />
                <span>{wifeName}</span>
              </button>

              <button
                type="button"
                onClick={() => handleBucketChange("PARENTS")}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                  bucket === "PARENTS"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300"
                }`}
              >
                <Heart className="w-4 h-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                <span>Parents</span>
              </button>
            </div>
          </div>

          {/* Who Paid */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1.5">
              Who Paid Upfront Out of Pocket?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaidBy("HUSBAND")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  paidBy === "HUSBAND"
                    ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-transparent shadow-xs"
                    : "bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                <span>{husbandName} (I Paid)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaidBy("WIFE")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  paidBy === "WIFE"
                    ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-transparent shadow-xs"
                    : "bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                <span>{wifeName} Paid</span>
              </button>
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                Payment Method Used
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 text-base sm:text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
              >
                {availablePaymentMethods.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
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

          {/* Category Selection & Custom Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                Category
              </label>
              <div className="space-y-1.5">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 text-base sm:text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                >
                  {displayCats.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  <option value="Other">Other / Custom</option>
                </select>

                {/* Quick Category Chips */}
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {displayCats.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectQuickCategory(c.name)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                        category === c.name
                          ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-transparent"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                Notes / Memo (Optional)
              </label>
              <input
                type="text"
                placeholder="Bill #, split detail, store name..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 text-base sm:text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
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
              {loading ? "Saving..." : editingExpense ? "Update Expense" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
