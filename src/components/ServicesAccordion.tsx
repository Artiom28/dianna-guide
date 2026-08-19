"use client";

import { useState } from "react";
import { servicesTitle } from "@/config/config";

type ServicesAccordionProps = {
  /** Текст послуг — по одному пункту на рядок. */
  servicesText: string;
};

export function ServicesAccordion({ servicesText }: ServicesAccordionProps) {
  const [open, setOpen] = useState(false);

  const items = servicesText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return (
    <div className="w-full overflow-hidden rounded-3xl bg-white/80 shadow-md shadow-sky-900/10 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-full px-6 py-4 text-left font-sans text-base font-semibold text-sky-950"
      >
        <span>{servicesTitle}</span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-sky-700 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
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
          <ul className="flex flex-col gap-2 px-6 pb-5 pt-1">
            {items.map((item, index) => (
              <li
                key={`${index}-${item}`}
                className="rounded-2xl bg-sky-50/80 px-4 py-3 text-sm text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
