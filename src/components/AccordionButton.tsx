"use client";

import { useState } from "react";
import { TapRipples } from "@/components/TapRipples";
import { useTapRipple } from "@/lib/useTapRipple";

type AccordionButtonProps = {
  label: string;
  /** Вміст, що розкривається під кнопкою — по одному пункту на рядок. */
  content: string;
  /** Акцентний стиль — градієнт на заголовку замість білого (як у PillLink). */
  accent?: boolean;
};

/**
 * Рядок, що закінчується тире/дефісом (— або -), трактуємо як міні-заголовок
 * усередині тексту (напр. "Дитяча кімната —") і виділяємо жирним — без
 * окремої картки навколо, просто через font-weight.
 */
function isHeadingLine(line: string): boolean {
  return /[—-]\s*$/.test(line.trimEnd()) && line.trim().length > 0;
}

/** Кнопка типу "text" — тап розкриває/згортає текстовий блок прямо під нею. */
export function AccordionButton({ label, content, accent = false }: AccordionButtonProps) {
  const [open, setOpen] = useState(false);
  const { ripples, addRipple } = useTapRipple();

  const lines = content.trim().split("\n");

  return (
    <div className="w-full overflow-hidden rounded-3xl bg-white/80 shadow-md shadow-sky-900/10 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onPointerDown={addRipple}
        aria-expanded={open}
        className={`relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-full px-6 py-4 text-left font-sans text-base font-semibold transition-colors ${
          accent
            ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-white"
            : "text-sky-950"
        }`}
      >
        <TapRipples ripples={ripples} />
        <span className="relative z-10">{label}</span>
        <span
          aria-hidden="true"
          className={`relative z-10 shrink-0 transition-transform duration-300 ${
            accent ? "text-white/90" : "text-sky-700"
          } ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="whitespace-pre-line px-6 pb-5 pt-1 text-sm leading-relaxed text-slate-700">
            {lines.map((line, index) => (
              <span key={index} className={isHeadingLine(line) ? "font-semibold text-sky-950" : undefined}>
                {line}
                {index < lines.length - 1 ? "\n" : null}
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
