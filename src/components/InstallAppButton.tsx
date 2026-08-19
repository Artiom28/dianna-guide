"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import {
  consumeInstallPrompt,
  getInstallPromptServerSnapshot,
  getInstallPromptSnapshot,
  subscribeInstallPrompt,
} from "@/lib/installPrompt";

type Platform = "ios" | "other";

function detectPlatform(): Platform {
  const ua = window.navigator.userAgent || "";
  const isIOS =
    /iphone|ipad|ipod/i.test(ua) ||
    // iPadOS 13+ маскується під macOS Safari, але має тачскрін
    (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  return isIOS ? "ios" : "other";
}

function isRunningStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

// Платформа визначається один раз і не змінюється — підписки не потрібно.
function subscribeNever() {
  return () => {};
}
function getPlatformServerSnapshot(): Platform {
  return "other";
}
function usePlatform(): Platform {
  return useSyncExternalStore(subscribeNever, detectPlatform, getPlatformServerSnapshot);
}

function subscribeInstalled(callback: () => void) {
  const mql = window.matchMedia("(display-mode: standalone)");
  window.addEventListener("appinstalled", callback);
  mql.addEventListener("change", callback);
  return () => {
    window.removeEventListener("appinstalled", callback);
    mql.removeEventListener("change", callback);
  };
}
function getInstalledServerSnapshot(): boolean {
  return false;
}
function useInstalled(): boolean {
  return useSyncExternalStore(subscribeInstalled, isRunningStandalone, getInstalledServerSnapshot);
}

export function InstallAppButton() {
  const platform = usePlatform();
  const installed = useInstalled();
  // Читаємо подію beforeinstallprompt із глобального сховища (src/lib/installPrompt.ts) —
  // слухач реєструється якнайраніше в кореневому layout, щоб не пропустити подію,
  // поки гість ще на екрані правил.
  const deferredPrompt = useSyncExternalStore(
    subscribeInstallPrompt,
    getInstallPromptSnapshot,
    getInstallPromptServerSnapshot
  );
  const [showIosHelp, setShowIosHelp] = useState(false);

  const handleClick = useCallback(async () => {
    if (platform === "ios") {
      setShowIosHelp(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    consumeInstallPrompt();
  }, [platform, deferredPrompt]);

  if (installed) return null;
  // На Android/Chrome кнопку показуємо лише коли браузер підтвердив
  // можливість встановлення (щоб клік завжди щось реально робив).
  if (platform !== "ios" && !deferredPrompt) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 rounded-full bg-white/80 px-5 py-2.5 text-sm font-semibold text-sky-950 shadow-md shadow-sky-900/10 backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:bg-white"
      >
        <DownloadIcon className="h-4 w-4 text-sky-700" />
        Встановити застосунок
      </button>

      {showIosHelp && <IosInstallOverlay onClose={() => setShowIosHelp(false)} />}
    </>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 4v11m0 0 4-4m-4 4-4-4M5 18h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="7.5" width="16" height="13.5" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 14.5V3M12 3 8 7M12 3l4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IosInstallOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Як встановити застосунок на iPhone"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 px-5 pb-8 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <ShareIcon className="mx-auto mb-4 h-10 w-10 text-sky-700" />
        <p className="mb-1 text-base font-semibold text-sky-950">Встановлення на iPhone</p>
        <p className="mb-5 text-sm leading-relaxed text-slate-600">
          Натисніть іконку «Поділитися» (квадрат зі стрілкою вгору) внизу браузера, потім
          оберіть «Додати на екран Домівки».
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full bg-sky-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-800"
        >
          Зрозуміло
        </button>
      </div>
    </div>
  );
}
