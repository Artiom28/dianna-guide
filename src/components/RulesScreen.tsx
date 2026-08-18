"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { rulesText, siteConfig } from "@/config/config";

export function RulesScreen({ onAccept }: { onAccept: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex h-dvh flex-col items-center overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-white px-5 py-8">
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
  );
}
