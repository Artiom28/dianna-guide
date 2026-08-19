"use client";

import type { ReactNode } from "react";
import { TapRipples } from "@/components/TapRipples";
import { useTapRipple } from "@/lib/useTapRipple";

function isExternal(url: string) {
  return /^https?:\/\//.test(url);
}

const BASE_CLASSES =
  "relative block w-full overflow-hidden rounded-full px-6 py-4 text-center font-sans text-base font-semibold shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0";

const NORMAL_CLASSES =
  "bg-white/80 text-sky-950 shadow-sky-900/10 backdrop-blur-sm hover:bg-white";

const ACCENT_CLASSES =
  "bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-sky-900/25";

export function PillLink({
  href,
  children,
  accent = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  /** Акцентний стиль — градієнт замість білого фону (напр. для чат-бота). */
  accent?: boolean;
  className?: string;
}) {
  const external = isExternal(href);
  const { ripples, addRipple } = useTapRipple();

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onPointerDown={addRipple}
      className={`${BASE_CLASSES} ${accent ? ACCENT_CLASSES : NORMAL_CLASSES} ${className}`}
    >
      <TapRipples ripples={ripples} />
      <span className="relative z-10">{children}</span>
    </a>
  );
}
