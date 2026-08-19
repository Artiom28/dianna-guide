"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { SpringDropAnimation } from "@/components/SpringDropAnimation";
import { rulesText, siteConfig } from "@/config/config";

// Якщо перший удар краплі з якоїсь причини не настане (reduced motion,
// помилка завантаження зображення тощо) — картка все одно має з'явитись,
// інакше гість не зможе прийняти правила.
const REVEAL_FALLBACK_MS = 2500;

export function RulesScreen({ onAccept }: { onAccept: () => void }) {
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);

  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(reveal, REVEAL_FALLBACK_MS);
    return () => clearTimeout(timeoutId);
  }, [reveal]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-white">
      {/* Джерело серед моху — фон верхньої частини екрану + крапля, що капає */}
      <div
        className="relative w-full shrink-0 overflow-hidden"
        style={{ height: "clamp(200px, 37vh, 340px)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- декоративне фото, не потребує next/image */}
        <img
          src="/images/spring-source.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-sky-50/70 to-sky-50" />
        <SpringDropAnimation onFirstImpact={reveal} />
      </div>

      {/* Лого, заголовок і картка правил з'являються лише після першого удару краплі об воду */}
      <div
        className={`flex min-h-0 flex-1 flex-col items-center px-5 pb-8 pt-6 transition-all duration-[400ms] ease-out ${
          revealed
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <Logo className="mb-4 h-16 w-16 shrink-0" />

        <h1 className="mb-1 shrink-0 text-center font-serif text-2xl font-bold uppercase tracking-wide text-sky-950">
          Правила проживання
        </h1>
        <p className="mb-6 shrink-0 text-center text-sm text-sky-800/70">
          {siteConfig.hotelName}
        </p>

        <div className="mb-6 min-h-0 w-full max-w-md flex-1 overflow-y-auto rounded-3xl bg-white/80 p-5 text-sm leading-relaxed whitespace-pre-line text-slate-700 shadow-inner shadow-sky-900/5">
          {rulesText}
        </div>

        <div className="w-full max-w-md shrink-0">
          <label className="mb-4 flex cursor-pointer items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-sky-300 text-sky-600 focus:ring-sky-500"
            />
            <span>
              Я ознайомився(лась) з правилами і погоджуюсь їх дотримуватись
            </span>
          </label>

          <button
            type="button"
            disabled={!checked}
            onClick={onAccept}
            className="w-full rounded-full bg-sky-700 py-3.5 text-center font-sans text-base font-semibold text-white shadow-lg shadow-sky-900/20 transition-all enabled:hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
          >
            Продовжити
          </button>
        </div>
      </div>
    </div>
  );
}
