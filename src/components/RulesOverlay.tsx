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
      className={`fixed inset-0 z-50 flex flex-col bg-white transition-transform duration-300 ease-out ${
        open ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ visibility: open ? "visible" : "hidden" }}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-sky-100 px-5 py-4">
        <h2 className="font-serif text-lg font-bold uppercase tracking-wide text-sky-950">
          Правила проживання
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-lg text-sky-700 transition-colors hover:bg-sky-100"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {/* Тепле привітання перед юридичним текстом — щоб перше враження
            гостя було не суцільним переліком штрафів і застережень. */}
        <p className="mb-4 text-base font-medium text-sky-800">
          Раді вітати Вас у ДіАнна! Ознайомтесь, будь ласка, з короткими
          правилами проживання — це займе лише кілька хвилин.
        </p>
        <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">
          {rulesText}
        </p>
      </div>

      <div className="max-h-[45dvh] shrink-0 overflow-y-auto border-t border-sky-100 bg-white px-5 py-2">
        {/* Журнал погоджень — доказ факту показу правил конкретному гостю */}
        <div className="mb-1.5 flex flex-col gap-1">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ім'я"
              aria-label="Ім'я"
              className="w-full min-w-0 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="Номер кімнати"
              aria-label="Номер кімнати"
              className="w-full min-w-0 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
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
              className={`w-full rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 ${
                phoneTouched && phone.length > 0 && !phoneValid
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-slate-200 focus:border-sky-500 focus:ring-sky-200"
              }`}
            />
            {phoneTouched && phone.length > 0 && !phoneValid && (
              <span className="mt-0.5 block text-xs text-red-500">
                Формат: +380XXXXXXXXX або 0XXXXXXXXXX
              </span>
            )}
          </div>

          <p className="text-[11px] leading-snug text-slate-400">
            Необов&apos;язково — лише для підтвердження факту ознайомлення з правилами.
          </p>
        </div>

        <label className="mb-1.5 flex cursor-pointer items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-sky-300 text-sky-600 focus:ring-sky-500"
          />
          <span>
            Я ознайомився(лась) з правилами і погоджуюсь їх дотримуватись
          </span>
        </label>

        <button
          type="button"
          disabled={!canContinue}
          onClick={handleContinue}
          className="w-full rounded-full bg-sky-700 py-3 text-center font-sans text-base font-semibold text-white shadow-lg shadow-sky-900/20 transition-all enabled:hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600 disabled:shadow-none"
        >
          Продовжити
        </button>
      </div>
    </div>
  );
}
