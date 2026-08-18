import type { ReactNode } from "react";

function isExternal(url: string) {
  return /^https?:\/\//.test(url);
}

export function PillLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const external = isExternal(href);

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`block w-full rounded-full bg-white/80 px-6 py-4 text-center font-sans text-base font-semibold text-sky-950 shadow-md shadow-sky-900/10 backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:bg-white active:translate-y-0 ${className}`}
    >
      {children}
    </a>
  );
}
