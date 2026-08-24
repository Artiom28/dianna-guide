"use client";

import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { RulesOverlay } from "@/components/RulesOverlay";
import { siteConfig } from "@/config/config";

type RulesScreenProps = {
  onAccept: () => void;
  rulesText: string;
};

export function RulesScreen({ onAccept, rulesText }: RulesScreenProps) {
  const [overlayOpen, setOverlayOpen] = useState(false);

  // Щільний однорядковий уривок для тизер-картки — без порожніх рядків між
  // абзацами оригінального тексту, щоб у невеликому вікні влазило більше змісту.
  const rulesPreviewText = rulesText.replace(/\s+/g, " ").trim();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gradient-to-b from-moss-100 via-sand-50 to-white">
      {/* Джерело серед моху — фон верхньої частини екрану */}
      <div
        className="relative w-full shrink-0 overflow-hidden"
        style={{ height: "clamp(200px, 37vh, 340px)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- декоративне фото, не потребує next/image */}
        <img
          src="/images/spring-source.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-sand-50/70 to-sand-50" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center px-5 pt-7 pb-8">
        {/* Справжній логотип над заголовком — щоб екран читався як частина
            ДіАнна, а не системний діалог. */}
        <BrandMark className="mb-3 shrink-0" />
        <h1 className="mb-1.5 shrink-0 text-center font-serif text-2xl font-bold uppercase tracking-wide text-moss-950">
          Правила проживання
        </h1>
        <span className="mb-2 h-1 w-12 shrink-0 rounded-full bg-terra-500" aria-hidden="true" />
        <p className="mb-6 shrink-0 text-center text-lg text-moss-800/70">
          {siteConfig.hotelName}
        </p>

        {/* Компактна тизер-картка — весь блок клікабельний, відкриває повний текст */}
        <button
          type="button"
          onClick={() => setOverlayOpen(true)}
          className="w-full max-w-md rounded-[2rem] bg-sand-50/90 p-5 text-left shadow-inner shadow-moss-900/5 transition-transform active:scale-[0.98]"
        >
          <div className="relative h-24 overflow-hidden">
            <p className="text-sm leading-relaxed text-sand-800">{rulesPreviewText}</p>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-sand-50/0 via-sand-50/70 to-sand-50/95" />
          </div>
          <span className="mt-3 block text-sm font-semibold text-moss-700">
            Натисніть, щоб прочитати повністю →
          </span>
        </button>
      </div>

      <RulesOverlay
        open={overlayOpen}
        rulesText={rulesText}
        onClose={() => setOverlayOpen(false)}
        onAccept={() => {
          setOverlayOpen(false);
          onAccept();
        }}
      />
    </div>
  );
}
