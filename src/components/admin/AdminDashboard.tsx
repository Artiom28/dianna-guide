"use client";

import { useState, useTransition, type DragEvent } from "react";
import { deleteAgreementAction, logoutAction, saveContentAction } from "@/app/admin/actions";
import { agreementEntryKey } from "@/lib/agreementLogKey";
import type { AgreementLogEntry, ManagedButton, ManagedSocial } from "@/lib/content";
import { AgreementLogTable } from "@/components/admin/AgreementLogTable";
import { ButtonRow } from "@/components/admin/ButtonRow";
import { SocialRow } from "@/components/admin/SocialRow";

type AdminDashboardProps = {
  initialButtons: ManagedButton[];
  initialRulesText: string;
  initialSocials: ManagedSocial[];
  initialAgreementLog: AgreementLogEntry[];
  initialAgreementCount: number;
};

function newButtonId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `btn-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AdminDashboard({
  initialButtons,
  initialRulesText,
  initialSocials,
  initialAgreementLog,
  initialAgreementCount,
}: AdminDashboardProps) {
  const [buttons, setButtons] = useState<ManagedButton[]>(initialButtons);
  const [rulesText, setRulesText] = useState(initialRulesText);
  const [socials, setSocials] = useState<ManagedSocial[]>(initialSocials);
  const [agreementLog, setAgreementLog] = useState<AgreementLogEntry[]>(initialAgreementLog);
  const [agreementCount, setAgreementCount] = useState(initialAgreementCount);
  const [deletingAgreementKey, setDeletingAgreementKey] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function markDirty() {
    setStatus("idle");
    setErrorMessage(null);
  }

  function updateButton(index: number, patch: Partial<ManagedButton>) {
    setButtons((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
    markDirty();
  }

  function deleteButton(index: number) {
    setButtons((prev) => prev.filter((_, i) => i !== index));
    markDirty();
  }

  function addButton() {
    setButtons((prev) => [
      ...prev,
      { id: newButtonId(), label: "", type: "link", url: "", content: "", accent: false },
    ]);
    markDirty();
  }

  function moveButton(index: number, direction: -1 | 1) {
    setButtons((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    markDirty();
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(index: number, event: DragEvent) {
    event.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setButtons((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  }

  function handleDrop() {
    setDragIndex(null);
    markDirty();
  }

  function updateSocial(index: number, patch: Partial<ManagedSocial>) {
    setSocials((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    markDirty();
  }

  function deleteSocial(index: number) {
    setSocials((prev) => prev.filter((_, i) => i !== index));
    markDirty();
  }

  function addSocial() {
    setSocials((prev) => [...prev, { icon: "instagram", url: "" }]);
    markDirty();
  }

  async function handleDeleteAgreement(key: string) {
    if (!window.confirm("Видалити цей запис із журналу погоджень? Це незворотньо.")) {
      return;
    }
    setDeletingAgreementKey(key);
    const result = await deleteAgreementAction(key);
    setDeletingAgreementKey(null);
    if (result.success) {
      setAgreementLog((prev) => prev.filter((entry) => agreementEntryKey(entry) !== key));
      setAgreementCount((prev) => Math.max(0, prev - 1));
    } else {
      window.alert(result.error ?? "Не вдалося видалити запис.");
    }
  }

  function handleSave() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await saveContentAction({ buttons, rulesText, socials });
      if (result.success) {
        setStatus("saved");
        setTimeout(() => {
          setStatus((s) => (s === "saved" ? "idle" : s));
        }, 3000);
      } else {
        setStatus("error");
        setErrorMessage(result.error);
      }
    });
  }

  return (
    <div className="min-h-dvh bg-slate-50 pb-28">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="font-serif text-lg font-bold uppercase tracking-wide text-sky-950">
            DiAnna Guide — Admin
          </h1>
          <form action={logoutAction}>
            <button type="submit" className="text-sm font-medium text-slate-500 hover:text-slate-800">
              Вийти
            </button>
          </form>
        </div>
        <a
          href="#agreement-log"
          className="block border-t border-slate-100 bg-sky-50 px-5 py-2 text-center text-sm font-medium text-sky-700 hover:bg-sky-100"
        >
          Журнал погоджень ({agreementCount}) ↓
        </a>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-6">
        <section className="mb-8">
          <h2 className="mb-1 text-base font-semibold text-slate-900">Кнопки другого екрану</h2>
          <p className="mb-4 text-sm text-slate-500">
            Тип «Посилання» веде на URL, тип «Текст» розкриває вміст прямо під кнопкою (напр.
            «Послуги»). Перетягніть ⠿, щоб змінити порядок, або скористайтесь стрілками.
          </p>
          <div className="flex flex-col gap-3">
            {buttons.map((button, index) => (
              <ButtonRow
                key={button.id}
                button={button}
                index={index}
                total={buttons.length}
                onChange={updateButton}
                onDelete={deleteButton}
                onMove={moveButton}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                dragging={dragIndex === index}
              />
            ))}
            {buttons.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
                Кнопок ще немає — додайте першу нижче.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={addButton}
            className="mt-3 w-full rounded-xl border border-dashed border-sky-300 py-3 text-sm font-medium text-sky-700 hover:bg-sky-50"
          >
            + Додати нову
          </button>
        </section>

        <section className="mb-8">
          <h2 className="mb-1 text-base font-semibold text-slate-900">Соцмережі</h2>
          <p className="mb-4 text-sm text-slate-500">
            Круглі іконки внизу другого екрана — оберіть іконку та вкажіть посилання.
          </p>
          <div className="flex flex-col gap-2.5">
            {socials.map((social, index) => (
              <SocialRow
                key={index}
                social={social}
                index={index}
                onChange={updateSocial}
                onDelete={deleteSocial}
              />
            ))}
            {socials.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
                Соцмереж ще немає — додайте першу нижче.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={addSocial}
            className="mt-3 w-full rounded-xl border border-dashed border-sky-300 py-3 text-sm font-medium text-sky-700 hover:bg-sky-50"
          >
            + Додати соцмережу
          </button>
        </section>

        <section className="mb-8">
          <h2 className="mb-1 text-base font-semibold text-slate-900">Текст правил проживання</h2>
          <p className="mb-3 text-sm text-slate-500">
            Абзаци розділяйте порожнім рядком — так само, як показано на першому екрані.
          </p>
          <textarea
            value={rulesText}
            onChange={(e) => {
              setRulesText(e.target.value);
              markDirty();
            }}
            rows={16}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-xs leading-relaxed outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          />
        </section>

        <AgreementLogTable
          entries={agreementLog}
          totalCount={agreementCount}
          onDelete={handleDeleteAgreement}
          deletingKey={deletingAgreementKey}
        />
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-full bg-sky-700 px-6 py-3 text-sm font-semibold text-white transition-colors enabled:hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Збереження..." : "Зберегти зміни"}
          </button>
          {status === "saved" && (
            <span className="text-sm font-medium text-emerald-600">✓ Збережено</span>
          )}
          {status === "error" && (
            <span className="text-sm font-medium text-red-600">
              {errorMessage ?? "Помилка збереження"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
