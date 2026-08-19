"use client";

import type { DragEvent } from "react";
import type { ManagedButton } from "@/lib/content";

type ButtonRowProps = {
  button: ManagedButton;
  index: number;
  total: number;
  onChange: (index: number, patch: Partial<ManagedButton>) => void;
  onDelete: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number, event: DragEvent) => void;
  onDrop: () => void;
  dragging: boolean;
};

export function ButtonRow({
  button,
  index,
  total,
  onChange,
  onDelete,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
  dragging,
}: ButtonRowProps) {
  return (
    <div
      onDragOver={(e) => onDragOver(index, e)}
      onDrop={onDrop}
      className={`rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition-opacity ${
        dragging ? "opacity-40" : "opacity-100"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          draggable
          onDragStart={() => onDragStart(index)}
          title="Перетягніть, щоб змінити порядок"
          className="cursor-grab select-none px-1 text-lg leading-none text-slate-400 active:cursor-grabbing"
        >
          ⠿
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Кнопка {index + 1}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            aria-label="Перемістити вгору"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            aria-label="Перемістити вниз"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
            aria-label="Видалити кнопку"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Назва</span>
          <input
            type="text"
            value={button.label}
            onChange={(e) => onChange(index, { label: e.target.value })}
            placeholder="Напр. SPA та процедури"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Посилання</span>
          <input
            type="text"
            value={button.url}
            onChange={(e) => onChange(index, { url: e.target.value })}
            placeholder="https://..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          />
        </label>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={button.accent}
          onChange={(e) => onChange(index, { accent: e.target.checked })}
          className="h-4 w-4 rounded border-sky-300 text-sky-600 focus:ring-sky-500"
        />
        Акцентна кнопка
      </label>
    </div>
  );
}
