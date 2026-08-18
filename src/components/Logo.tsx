import { siteConfig } from "@/config/config";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-white/70 text-sky-700 shadow-md shadow-sky-900/10 backdrop-blur-sm ${className}`}
      aria-hidden="true"
    >
      <span className="font-serif text-2xl font-bold">
        {siteConfig.logoLetter}
      </span>
    </div>
  );
}
