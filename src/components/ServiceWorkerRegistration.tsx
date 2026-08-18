"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // тихо ігноруємо — PWA-функціонал не критичний для роботи сайту
      });
    }
  }, []);

  return null;
}
