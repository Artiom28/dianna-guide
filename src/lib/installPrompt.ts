// Глобальне сховище для події beforeinstallprompt. Браузер може викликати цю
// подію дуже рано (ще на екрані правил, до того як MainScreen взагалі
// змонтується), тож слухач реєструється один раз у кореневому layout
// (InstallPromptListener), а InstallAppButton лише читає поточний стан —
// так подія не губиться, незалежно від того, який екран зараз показаний.

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeInstallPrompt(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getInstallPromptSnapshot(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

export function getInstallPromptServerSnapshot(): BeforeInstallPromptEvent | null {
  return null;
}

export function consumeInstallPrompt(): void {
  deferredPrompt = null;
  notify();
}

/** Реєструє глобальні слухачі. Викликати один раз, якнайраніше (у кореневому layout). */
export function initInstallPromptListener(): () => void {
  const handleBeforeInstallPrompt = (event: Event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  };
  const handleAppInstalled = () => {
    deferredPrompt = null;
    notify();
  };

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);

  return () => {
    window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.removeEventListener("appinstalled", handleAppInstalled);
  };
}
