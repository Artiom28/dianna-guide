"use client";

import { useCallback, useSyncExternalStore } from "react";
import { RULES_VALID_DAYS } from "@/config/config";

const STORAGE_KEY = "dianna-guide:rules-accepted-at";

export type RulesGateStatus = "loading" | "needs-rules" | "accepted";

type Listener = () => void;
const listeners = new Set<Listener>();

// Скидається при кожному повному перезавантаженні сторінки (це просто змінна
// модуля, не localStorage) — потрібно, щоб RULES_VALID_DAYS=0 (або дуже мале
// значення, як для тестування) не блокував перехід на другий екран одразу
// після кліку "Продовжити" в межах ПОТОЧНОГО візиту: без цього прапорця
// isAcceptanceValid() вважала б погодження простроченим за 0мс, і гість
// миттєво повертався б назад на екран правил.
let acceptedThisSession = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function isAcceptanceValid(timestamp: number | null): boolean {
  if (!timestamp || Number.isNaN(timestamp)) return false;
  const elapsedMs = Date.now() - timestamp;
  const validMs = RULES_VALID_DAYS * 24 * 60 * 60 * 1000;
  return elapsedMs >= 0 && elapsedMs < validMs;
}

function getSnapshot(): RulesGateStatus {
  if (acceptedThisSession) return "accepted";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const timestamp = raw ? Number(raw) : null;
    return isAcceptanceValid(timestamp) ? "accepted" : "needs-rules";
  } catch {
    // localStorage недоступний (приватний режим тощо) — показуємо правила.
    return "needs-rules";
  }
}

// На сервері localStorage недоступний, тож рендеримо проміжний стан
// "loading" і без миготіння показуємо правильний екран одразу після монтування.
function getServerSnapshot(): RulesGateStatus {
  return "loading";
}

/**
 * Визначає, чи потрібно показувати екран правил проживання,
 * та дозволяє зафіксувати нове погодження в localStorage.
 */
export function useRulesGate() {
  const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const accept = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ігноруємо — просто не збережеться між сесіями
    }
    acceptedThisSession = true;
    notify();
  }, []);

  return { status, accept };
}
