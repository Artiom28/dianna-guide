"use client";

import type { ManagedSocial } from "@/lib/content";
import type { SocialIcon } from "@/config/config";

const ICON_OPTIONS: { value: SocialIcon; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "phone", label: "Телефон" },
  { value: "telegram", label: "Телеграм" },
  { value: "youtube", label: "YouTube" },
];

type SocialRowProps = {
  social: ManagedSocial;
  index: number;
  onChange: (index: number, patch: Partial<ManagedSocial>) => void;
  onDelete: (index: number) => void;
};

export function SocialRow({ social, index, onChange, onDelete }: SocialRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-white p-3">
      <select
        value={social.icon}
        onChange={(e) => onChange(index, { icon: e.target.value as SocialIcon })}
        className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
      >
        {ICON_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={social.url}
        onChange={(e) => onChange(index, { url: e.target.value })}
        placeholder="https:// або tel:+380..."
        className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
      />

      <button
        type="button"
        onClick={() => onDelete(index)}
        className="shrink-0 rounded-lg p-1.5 text-red-500 hover:bg-red-50"
        aria-label="Видалити соцмережу"
      >
        ✕
      </button>
    </div>
  );
}
