"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Sun,
  Moon,
  Settings as SettingsIcon,
  Download,
  ChevronDown,
  Sparkles,
  Lock,
} from "lucide-react";
import { AppSettings } from "@/lib/types";

interface HeaderProps {
  currentMonth: string;
  availableMonths: string[];
  onMonthChange: (month: string) => void;
  onOpenSettings: () => void;
  onOpenPWAInstall: () => void;
  onLoadDemoData: () => void;
  onLockNow?: () => void;
  isDemoLoading: boolean;
  settings: AppSettings;
}

export function Header({
  currentMonth,
  availableMonths,
  onMonthChange,
  onOpenSettings,
  onOpenPWAInstall,
  onLoadDemoData,
  onLockNow,
  isDemoLoading,
  settings,
}: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();

    // Listen for class attribute changes on <html>
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const isCurrentlyDark = root.classList.contains("dark");
    if (isCurrentlyDark) {
      root.classList.remove("dark");
      localStorage.setItem("duoledger-theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("duoledger-theme", "dark");
      setIsDark(true);
    }
  };

  const formatMonthName = (monthStr: string) => {
    if (monthStr === "all") return "All Time";
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <header className="sticky top-0 z-30 bg-stone-50/90 dark:bg-[#090a0b]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo & Names */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-900 dark:bg-stone-100 flex items-center justify-center shadow-xs shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 dark:text-emerald-600"
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
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 font-heading leading-tight truncate">
              DuoLedger
            </h1>
            <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 truncate max-w-[90px] xs:max-w-[130px] sm:max-w-none">
              {settings.husbandName} & {settings.wifeName}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Month Dropdown */}
          <div className="relative inline-flex items-center">
            <div className="flex items-center gap-1 pl-2 pr-5 sm:pr-6 py-1.5 rounded-xl bg-stone-200/70 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold border border-stone-300/50 dark:border-stone-700">
              <Calendar className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 shrink-0" />
              <select
                value={currentMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-xs font-semibold appearance-none text-stone-900 dark:text-stone-100 pr-0.5"
                aria-label="Select ledger month"
              >
                {availableMonths.map((m) => (
                  <option
                    key={m}
                    value={m}
                    className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  >
                    {formatMonthName(m)}
                  </option>
                ))}
                <option
                  value="all"
                  className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                >
                  All Time
                </option>
              </select>
              <ChevronDown className="w-3 h-3 text-stone-400 pointer-events-none absolute right-1.5 sm:right-2" />
            </div>
          </div>

          {/* Install PWA Button */}
          <button
            onClick={onOpenPWAInstall}
            title="Install App as PWA"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden md:inline">Install App</span>
            <span className="md:hidden text-[11px]">PWA</span>
          </button>

          {/* Quick Demo Data Seed (desktop only) */}
          <button
            onClick={onLoadDemoData}
            disabled={isDemoLoading}
            title="Reset to Sample Month Data"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200/70 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isDemoLoading ? "Loading..." : "Sample Data"}</span>
          </button>

          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light/dark theme"
            className="p-1.5 sm:p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-200/50 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-300/40 dark:border-stone-700 transition-colors cursor-pointer active:scale-95"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-700" />
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings, Security & Categories"
            className="p-1.5 sm:p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-200/50 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-300/40 dark:border-stone-700 transition-colors cursor-pointer active:scale-95"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Quick Lock Trigger */}
          {onLockNow && (
            <button
              onClick={onLockNow}
              title="Lock App (Require Passcode)"
              aria-label="Lock App"
              className="p-1.5 sm:p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-stone-300/40 dark:border-stone-700 transition-colors cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

