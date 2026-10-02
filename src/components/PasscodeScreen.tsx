"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, Delete, ShieldCheck, AlertCircle } from "lucide-react";

interface PasscodeScreenProps {
  onSuccess: (session: { expiresAt: number; passcodeUpdatedAt: string }) => void;
  husbandName?: string;
  wifeName?: string;
}

export function PasscodeScreen({
  onSuccess,
  husbandName = "Ravi",
  wifeName = "Chandani",
}: PasscodeScreenProps) {
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const verifyPin = useCallback(
    async (codeToVerify: string) => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passcode: codeToVerify }),
        });

        const data = await res.json();

        if (data.success) {
          if (typeof window !== "undefined" && window.navigator?.vibrate) {
            window.navigator.vibrate([30, 50, 30]);
          }
          onSuccess({
            expiresAt: data.expiresAt,
            passcodeUpdatedAt: data.passcodeUpdatedAt,
          });
        } else {
          setIsShaking(true);
          setError(data.error || "Incorrect passcode");
          if (typeof window !== "undefined" && window.navigator?.vibrate) {
            window.navigator.vibrate(100);
          }
          setTimeout(() => {
            setPin("");
            setIsShaking(false);
          }, 600);
        }
      } catch (err: any) {
        setIsShaking(true);
        setError("Network error. Please try again.");
        setTimeout(() => {
          setPin("");
          setIsShaking(false);
        }, 600);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  const handleKeyPress = useCallback(
    (digit: string) => {
      if (loading || pin.length >= 4) return;
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);

      if (typeof window !== "undefined" && window.navigator?.vibrate) {
        window.navigator.vibrate(15);
      }

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    },
    [loading, pin, verifyPin]
  );

  const handleDelete = useCallback(() => {
    if (loading || pin.length === 0) return;
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  }, [loading, pin]);

  const handleClear = useCallback(() => {
    if (loading) return;
    setPin("");
    setError(null);
  }, [loading]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, handleDelete, handleClear]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#fbfbfa] dark:bg-[#090a0b] text-stone-900 dark:text-stone-100 p-6 sm:p-8 select-none transition-colors">
      {/* Top Header & Branding */}
      <div className="w-full max-w-xs flex flex-col items-center pt-4 sm:pt-8 text-center animate-in fade-in duration-300">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-stone-900 dark:bg-stone-100 flex items-center justify-center shadow-lg mb-4">
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 dark:text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="8" cy="12" r="5" />
            <circle cx="16" cy="12" r="5" />
          </svg>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-tight">
          DuoLedger
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          {husbandName} & {wifeName}
        </p>

        <div className="mt-5 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
          <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Passcode Protected</span>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2.5 font-medium">
          Enter 4-digit PIN to access ledger
        </p>
      </div>

      {/* Center: PIN Indicators & Status */}
      <div className="flex flex-col items-center my-auto py-4">
        {/* 4 PIN Dots */}
        <div
          className={`flex items-center gap-4 sm:gap-5 transition-transform duration-200 ${
            isShaking ? "animate-bounce" : ""
          }`}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < pin.length;
            const isError = Boolean(error);

            return (
              <div
                key={index}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-all duration-200 ${
                  isError
                    ? "bg-rose-500 border-rose-500 scale-110 shadow-sm"
                    : isFilled
                    ? "bg-emerald-500 border-emerald-500 scale-110 shadow-sm"
                    : "border-stone-300 dark:border-stone-700 bg-transparent"
                }`}
              />
            );
          })}
        </div>

        {/* Status Message */}
        <div className="h-8 mt-4 flex items-center justify-center">
          {loading ? (
            <span className="text-xs font-medium text-stone-400 animate-pulse">
              Verifying passcode...
            </span>
          ) : error ? (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </p>
          ) : (
            <span className="text-[11px] text-stone-400 dark:text-stone-500">
              Default passcode: <strong className="text-stone-700 dark:text-stone-300">0000</strong>
            </span>
          )}
        </div>
      </div>

      {/* Bottom: Number Keypad */}
      <div className="w-full max-w-[280px] sm:max-w-[320px] pb-6 sm:pb-8">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit.toString())}
              disabled={loading}
              className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 text-xl sm:text-2xl font-bold font-heading text-stone-800 dark:text-stone-100 shadow-xs hover:bg-stone-100 dark:hover:bg-stone-800/60 active:scale-95 active:bg-emerald-500/10 active:border-emerald-500/30 transition-all flex items-center justify-center cursor-pointer"
            >
              {digit}
            </button>
          ))}

          {/* Clear Key */}
          <button
            type="button"
            onClick={handleClear}
            disabled={loading || pin.length === 0}
            className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-3xl text-xs font-bold text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Clear
          </button>

          {/* 0 Key */}
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            disabled={loading}
            className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 text-xl sm:text-2xl font-bold font-heading text-stone-800 dark:text-stone-100 shadow-xs hover:bg-stone-100 dark:hover:bg-stone-800/60 active:scale-95 active:bg-emerald-500/10 active:border-emerald-500/30 transition-all flex items-center justify-center cursor-pointer"
          >
            0
          </button>

          {/* Backspace Key */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || pin.length === 0}
            className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-3xl text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Delete last digit"
          >
            <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Footnote */}
        <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Stays unlocked for 24 hours once entered</span>
        </div>
      </div>
    </div>
  );
}

