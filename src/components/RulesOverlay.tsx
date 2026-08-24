"use client";

import { useEffect, useMemo, useState } from "react";

type RulesOverlayProps = {
  open: boolean;
  rulesText: string;
  onClose: () => void;
  /** Зберігає погодження і переводить на другий екран (та сама дія, що й раніше). */
  onAccept: () => void;
};

/** +380XXXXXXXXX або 0XXXXXXXXXX, з допустимими пробілами/дефісами/дужками. */
function isValidUkrainianPhone(raw: string): boolean {
  const cleaned = raw.trim().replace(/[\s\-()]/g, "");
  return /^\+380\d{9}$/.test(cleaned) || /^0\d{9}$/.test(cleaned);
}

type RulesParagraph = { depth: number; text: string };

/**
 * Розбиває текст правил на абзаци (розділені порожнім рядком у джерелі — так
 * само, як його редагують в адмінці) і визначає рівень вкладеності з
 * нумерації на початку абзацу: "1. " → 1 (розділ), "1.1. " → 2 (пункт),
 * "1.2.1. " → 3 (підпункт). Абзац без нумерації (заголовок документа,
 * завершальний блок з контактами) отримує рівень 0.
 */
function parseRulesParagraphs(text: string): RulesParagraph[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => {
      const match = paragraph.match(/^(\d+(?:\.\d+)*)\.\s/);
      return { depth: match ? match[1].split(".").length : 0, text: paragraph };
    });
}

/**
 * Рендерить абзаци правил з візуальною ієрархією: розділи ("1. ...") —
 * жирним, з відступом-роздільником зверху; пункти ("1.1. ...") — звичайним
 * текстом; підпункти ("1.2.1. ...") — дрібнішим, приглушеним, з лівою
 * лінією-відступом, щоб було видно вкладеність без суцільного полотна тексту.
 */
function RulesParagraphs({ paragraphs }: { paragraphs: RulesParagraph[] }) {
  const firstSectionIndex = paragraphs.findIndex((p) => p.depth === 1);

  return (
    <>
      {paragraphs.map((paragraph, index) => {
        if (paragraph.depth === 0) {
          // Перший ненумерований абзац — заголовок документа.
          if (index === 0) {
            return (
              <h3
                key={index}
                className="mb-5 font-serif text-xl font-bold uppercase tracking-wide text-moss-950"
              >
                {paragraph.text}
              </h3>
            );
          }
          return (
            <p key={index} className="mt-5 whitespace-pre-line text-base leading-relaxed text-sand-800">
              {paragraph.text}
            </p>
          );
        }

        if (paragraph.depth === 1) {
          const isFirstSection = index === firstSectionIndex;
          return (
            <h4
              key={index}
              className={`mb-2 text-base font-bold text-moss-900 ${
                isFirstSection ? "mt-1" : "mt-7 border-t border-sand-200 pt-5"
              }`}
            >
              {paragraph.text}
            </h4>
          );
        }

        if (paragraph.depth === 2) {
          return (
            <p key={index} className="mt-3 whitespace-pre-line text-base leading-relaxed text-sand-800">
              {paragraph.text}
            </p>
          );
        }

        // Рівень 3+ (напр. "1.2.1.") — підпункт, візуально вкладений під свій пункт.
        return (
          <p
            key={index}
            className="mt-2 whitespace-pre-line border-l-2 border-moss-200 pl-3 text-sm leading-relaxed text-sand-600"
          >
            {paragraph.text}
          </p>
        );
      })}
    </>
  );
}

/** Асинхронно фіксує факт погодження — не блокує перехід гостя, помилки ігноруються. */
function logAgreement(name: string, roomNumber: string, phone: string) {
  try {
    fetch("/api/log-agreement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        roomNumber,
        phone,
        userAgent: navigator.userAgent,
      }),
      keepalive: true,
    }).catch(() => {
      // fail silently — гість все одно продовжує
    });
  } catch {
    // fail silently
  }
}

/**
 * Повноекранний блок з повним текстом правил. Виїжджає знизу вгору.
 * Поля гостя, чекбокс і кнопка "Продовжити" зафіксовані внизу — текст
 * скролиться під ними.
 */
export function RulesOverlay({ open, rulesText, onClose, onAccept }: RulesOverlayProps) {
  const [checked, setChecked] = useState(false);
  const [name, setName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);

  // Поля контакту зараз необов'язкові (тестовий період) — якщо телефон
  // введено, він все одно має бути коректного формату, але порожній
  // не блокує перехід.
  const phoneValid = useMemo(
    () => phone.trim().length === 0 || isValidUkrainianPhone(phone),
    [phone]
  );
  const canContinue = checked && phoneValid;

  const rulesParagraphs = useMemo(() => parseRulesParagraphs(rulesText), [rulesText]);

  // Esc закриває оверлей, не погоджуючись — так само, як хрестик.
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function handleContinue() {
    if (!canContinue) return;
    // Не варто засмічувати журнал повністю порожніми записами, якщо гість
    // не вказав жодного контактного поля (вони необов'язкові).
    if (name.trim() || roomNumber.trim() || phone.trim()) {
      logAgreement(name.trim(), roomNumber.trim(), phone.trim());
    }
    onAccept();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Правила проживання"
      aria-hidden={!open}
      className={`fixed inset-0 z-50 flex flex-col bg-sand-50 transition-transform duration-300 ease-out ${
        open ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ visibility: open ? "visible" : "hidden" }}
    >
      <div
        className="flex shrink-0 items-center justify-between border-b border-sand-200 bg-sand-50 px-5 pb-4"
        style={{ paddingTop: "calc(1.25rem + env(safe-area-inset-top, 0px))" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-moss-700 font-serif text-sm font-bold text-moss-50">
            Д
          </span>
          <h2 className="font-serif text-lg font-bold uppercase tracking-wide text-moss-950">
            Правила проживання
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss-100 text-lg text-moss-700 transition-colors hover:bg-moss-200"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-5">
        {/* Тепле привітання перед юридичним текстом — щоб перше враження
            гостя було не суцільним переліком штрафів і застережень. */}
        <p className="mb-4 text-base font-medium text-moss-700">
          Раді вітати Вас у ДіАнна! Ознайомтесь, будь ласка, з короткими
          правилами проживання — це займе лише кілька хвилин.
        </p>
        <RulesParagraphs paragraphs={rulesParagraphs} />
      </div>

      <div className="max-h-[46dvh] shrink-0 overflow-y-auto border-t border-sand-200 bg-sand-50 px-5 py-3">
        {/* Журнал погоджень — доказ факту показу правил конкретному гостю */}
        <div className="mb-2 flex flex-col gap-1.5">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ім'я"
              aria-label="Ім'я"
              className="w-full min-w-0 rounded-xl border border-sand-200 bg-white px-3 py-1.5 text-sm text-moss-950 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-100"
            />
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="Номер кімнати"
              aria-label="Номер кімнати"
              className="w-full min-w-0 rounded-xl border border-sand-200 bg-white px-3 py-1.5 text-sm text-moss-950 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-100"
            />
          </div>

          <div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setPhoneTouched(true)}
              placeholder="Телефон +380XXXXXXXXX (необов'язково)"
              aria-label="Номер телефону"
              className={`w-full rounded-xl border bg-white px-3 py-1.5 text-sm text-moss-950 outline-none focus:ring-2 ${
                phoneTouched && phone.length > 0 && !phoneValid
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-sand-200 focus:border-moss-500 focus:ring-moss-100"
              }`}
            />
            {phoneTouched && phone.length > 0 && !phoneValid && (
              <span className="mt-0.5 block text-xs text-red-500">
                Формат: +380XXXXXXXXX або 0XXXXXXXXXX
              </span>
            )}
          </div>

          <p className="text-[11px] leading-snug text-sand-500">
            Необов&apos;язково — лише для підтвердження факту ознайомлення з правилами.
          </p>
        </div>

        <label className="mb-2 flex cursor-pointer items-start gap-2 text-sm text-sand-800">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-moss-300 text-moss-600 focus:ring-moss-400"
          />
          <span>
            Я ознайомився(лась) з правилами і погоджуюсь їх дотримуватись
          </span>
        </label>

        <button
          type="button"
          disabled={!canContinue}
          onClick={handleContinue}
          className="w-full rounded-full bg-moss-700 py-3 text-center font-sans text-base font-semibold text-white shadow-lg shadow-moss-900/20 transition-all enabled:hover:bg-moss-800 disabled:cursor-not-allowed disabled:bg-sand-200 disabled:text-sand-600 disabled:shadow-none"
        >
          Продовжити
        </button>
      </div>
    </div>
  );
}
