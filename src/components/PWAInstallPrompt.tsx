"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface PWAInstallPromptProps {
  onOpenGuide: () => void;
  deferredPrompt: any;
}

export function PWAInstallPrompt({
  onOpenGuide,
  deferredPrompt,
}: PWAInstallPromptProps) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const isMob = /iphone|ipad|ipod|android/.test(ua);
    setIsMobile(isMob);

    // Register service worker if available
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("SW registered"))
        .catch((err) => console.log("SW registration failed:", err));
    }
  }, []);

  if (isStandalone || dismissed) return null;

  return (
    <aside
      aria-label="PWA Installation Banner"
      className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 bg-stone-900/95 dark:bg-stone-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-stone-700/60 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          {deferredPrompt ? (
            <Download className="w-4 h-4" />
          ) : (
            <Smartphone className="w-4 h-4" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-semibold truncate">
            Install DuoLedger App
          </p>
          <p className="text-[11px] text-stone-300 truncate">
            {isMobile ? "Add to phone home screen" : "Fast desktop & mobile access"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenGuide}
          className="px-3 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-stone-950 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
        >
          {deferredPrompt ? "Install" : "Setup"}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
