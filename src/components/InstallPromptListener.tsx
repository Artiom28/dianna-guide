"use client";

import { useEffect } from "react";
import { initInstallPromptListener } from "@/lib/installPrompt";

/**
 * Монтується один раз у кореневому layout — реєструє слухач beforeinstallprompt
 * якнайраніше, щоб не пропустити подію, поки гість ще на екрані правил.
 * Нічого не рендерить.
 */
export function InstallPromptListener() {
  useEffect(() => initInstallPromptListener(), []);
  return null;
}
