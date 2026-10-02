"use client";

import { useState, useEffect } from "react";
import {
  X,
  Download,
  Share2,
  PlusSquare,
  Smartphone,
  Globe,
  CheckCircle,
  HelpCircle,
  Laptop,
} from "lucide-react";

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstalled?: () => void;
}

export function PWAInstallModal({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled,
}: PWAInstallModalProps) {
  const [deviceTab, setDeviceTab] = useState<"android" | "ios" | "desktop">("android");
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setDeviceTab("ios");
      } else if (/android/.test(ua)) {
        setDeviceTab("android");
      } else {
        setDeviceTab("desktop");
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    try {
      setInstalling(true);
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        onInstalled?.();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading">
                Install DuoLedger App
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                PWA setup for mobile & desktop
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

        {/* 1-Tap button if browser triggered install prompt */}
        {deferredPrompt && (
          <div className="my-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2.5">
              Your browser supports 1-Tap installation:
            </p>
            <button
              onClick={handleNativeInstall}
              disabled={installing}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{installing ? "Installing..." : "Install Now (1-Tap)"}</span>
            </button>
          </div>
        )}

        {/* Tab switchers */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl my-4 text-xs font-semibold">
          <button
            onClick={() => setDeviceTab("android")}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              deviceTab === "android"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android / Chrome</span>
          </button>

          <button
            onClick={() => setDeviceTab("ios")}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              deviceTab === "ios"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iOS / Safari</span>
          </button>

          <button
            onClick={() => setDeviceTab("desktop")}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              deviceTab === "desktop"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>

        {/* Tab 1: Android Chrome Instructions */}
        {deviceTab === "android" && (
          <div className="space-y-3.5 text-xs text-stone-600 dark:text-stone-300">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                1
              </span>
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  Open Chrome Menu
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Tap the three vertical dots (<strong>⋮</strong>) in the top-right corner of Google Chrome.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                2
              </span>
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  Tap &ldquo;Install app&rdquo; or &ldquo;Add to Home screen&rdquo;
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Select <strong>Install app</strong> (or <strong>Add to Home screen</strong>). Confirm when prompted.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                3
              </span>
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  Launch like a native app
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  DuoLedger will appear as a standalone app icon on your phone home screen with full-screen experience.
                </p>
              </div>
            </div>

            {/* Port Forwarding / Local Testing note */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Testing via local IP / Port Forwarding?</span>
              </p>
              <p className="leading-relaxed">
                Modern Chrome requires <strong>HTTPS</strong> or <strong>localhost</strong> for automated PWA install banners. If testing over an HTTP port forward, you can still install via Chrome Menu (⋮) &rarr; <em>&ldquo;Add to Home screen&rdquo;</em>, or use an HTTPS tunnel (e.g., ngrok or Cloudflare tunnel).
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: iOS Safari Instructions */}
        {deviceTab === "ios" && (
          <div className="space-y-3.5 text-xs text-stone-600 dark:text-stone-300">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                1
              </span>
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  Open in Apple Safari
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  iOS only allows PWA installation from Safari (not Chrome or in-app browser).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                2
              </span>
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                  Tap the Share Button <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" />
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Tap the Share button at the bottom navigation bar of Safari (the square box with an arrow pointing up).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                3
              </span>
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                  Tap &ldquo;Add to Home Screen&rdquo; <PlusSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" />
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Scroll down the share sheet and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong> at top right.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Desktop Instructions */}
        {deviceTab === "desktop" && (
          <div className="space-y-3.5 text-xs text-stone-600 dark:text-stone-300">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  Address Bar Install Icon
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  In Chrome, Edge, or Brave, click the install icon (computer with down arrow) located on the right side of the URL address bar.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200/60 dark:border-stone-800">
              <Globe className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  Browser Menu
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Click the 3 dots menu &rarr; <em>Save and Share</em> &rarr; <em>Install DuoLedger</em>.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
