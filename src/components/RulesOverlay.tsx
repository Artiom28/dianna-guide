"use client";

import { useEffect, useState } from "react";
import { rulesText } from "@/config/config";

type RulesOverlayProps = {
  open: boolean;
  onClose: () => void;
  /** Зберігає погодження і переводить на другий екран (та сама дія, що й раніше). */
  onAccept: () => void;
};

/**
 * Повноекранний блок з повним текстом правил. Виїжджає знизу вгору.
 * Чекбокс і кнопка "Продовжити" зафіксовані внизу — текст скролиться під ними.
 */
export function RulesOverlay({ open, onClose, onAccept }: RulesOverlayProps) {
  const [checked, setChecked] = useState(false);

  // Esc закриває оверлей, не погоджуючись — так само, як хрестик.
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Правила проживання"
      aria-hidden={!open}
      className={`fixed inset-0 z-50 flex flex-col bg-white transition-transform duration-300 ease-out ${
        open ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ visibility: open ? "visible" : "hidden" }}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-sky-100 px-5 py-4">
        <h2 className="font-serif text-lg font-bold uppercase tracking-wide text-sky-950">
          Правила проживання
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-lg text-sky-700 transition-colors hover:bg-sky-100"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">
          {rulesText}
        </p>
      </div>

      <div className="shrink-0 border-t border-sky-100 bg-white px-5 py-4">
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
