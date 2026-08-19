import type { ReactNode } from "react";

function isExternal(url: string) {
  return /^https?:\/\//.test(url);
}

const BASE_CLASSES =
  "block w-full rounded-full px-6 py-4 text-center font-sans text-base font-semibold shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0";

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

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${BASE_CLASSES} ${accent ? ACCENT_CLASSES : NORMAL_CLASSES} ${className}`}
    >
      {children}
    </a>
  );
}
