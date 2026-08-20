import crypto from "node:crypto";
import {
  kvGet,
  kvSet,
  kvListLength,
  kvListPush,
  kvListRange,
  kvListSet,
  kvListTrim,
} from "@/lib/kv";
import {
  chatBot,
  mainLinks,
  rulesText as defaultRulesText,
  socials as defaultSocials,
  type SocialIcon,
} from "@/config/config";

const BUTTONS_KEY = "buttons:list";
const RULES_KEY = "rules:text";
const SOCIALS_KEY = "socials:list";
const AGREEMENTS_KEY = "agreements:log";
// Захист від необмеженого росту журналу (напр. спам-заповнення форми) —
// зберігаємо тільки останні N записів; CSV-експорт і так віддає все, що є.
const MAX_AGREEMENT_ENTRIES = 5000;
const MAX_FIELD_LENGTH = 200;

// Старий (до об'єднання "Послуг" у загальний список кнопок) окремий ключ.
// Читаємо його лише один раз, під час міграції старих даних — див. getButtons().
const LEGACY_SERVICES_KEY = "services:text";

export type ButtonType = "link" | "text";

export type ManagedButton = {
  id: string;
  label: string;
  type: ButtonType;
  /** Використовується, коли type === "link". */
  url: string;
  /** Використовується, коли type === "text" — текст, що розкривається під кнопкою (по рядку на пункт). */
  content: string;
  /** Акцентна кнопка (стиль типу телеграм-кнопки — градієнт замість білого). */
  accent: boolean;
};

const DEFAULT_SERVICES_LABEL = "Послуги · прокат, корт";
const DEFAULT_SERVICES_CONTENT = [
  "Прокат велосипедів (плейсхолдер)",
  "Тенісний корт (плейсхолдер)",
  "Прокат спортивного інвентарю (плейсхолдер)",
].join("\n");

/** Стартові кнопки, імпортовані з config.ts — використовуються, поки KV порожній. */
function defaultButtons(): ManagedButton[] {
  const linkButtons: ManagedButton[] = mainLinks.map((link) => ({
    id: link.id,
    label: link.label,
    type: "link",
    url: link.url,
    content: "",
    accent: false,
  }));

  const servicesButton: ManagedButton = {
    id: "services",
    label: DEFAULT_SERVICES_LABEL,
    type: "text",
    url: "",
    content: DEFAULT_SERVICES_CONTENT,
    accent: false,
  };

  const chatBotButton: ManagedButton = {
    id: "chatbot",
    label: chatBot.label,
    type: "link",
    url: chatBot.url,
    content: "",
    accent: true,
  };

  // "Послуги" завжди стояли одразу після першої кнопки (SPA) — зберігаємо
  // цей порядок і для стартових даних.
  return [linkButtons[0], servicesButton, ...linkButtons.slice(1), chatBotButton];
}

function normalizeButton(raw: unknown): ManagedButton {
  const b = (raw ?? {}) as Partial<ManagedButton> & Record<string, unknown>;
  return {
    id: typeof b.id === "string" && b.id ? b.id : crypto.randomUUID(),
    label: typeof b.label === "string" ? b.label : "",
    type: b.type === "text" ? "text" : "link",
    url: typeof b.url === "string" ? b.url : "",
    content: typeof b.content === "string" ? b.content : "",
    accent: Boolean(b.accent),
  };
}

/**
 * Список кнопок другого екрану. Порядок масиву — порядок показу.
 * Кнопки типу "text" (напр. "Послуги") розкривають вміст прямо під собою,
 * замість переходу за посиланням.
 */
export async function getButtons(): Promise<ManagedButton[]> {
  const stored = await kvGet<unknown[]>(BUTTONS_KEY);
  if (!Array.isArray(stored) || stored.length === 0) return defaultButtons();

  // Легасі-формат розпізнаємо структурно — жодне зі старих збережень не мало
  // поля "type" взагалі. Якщо воно є хоч у одного елемента (навіть "link"),
  // значить дані вже пройшли через нову систему, і навіть 0 кнопок типу
  // "text" — це свідомий вибір адміна (напр. він видалив "Послуги"), а не
  // привід повторно мігрувати.
  const isLegacyShape = stored.every(
    (raw) => typeof (raw as { type?: unknown } | null)?.type !== "string"
  );
  const normalized = stored.map(normalizeButton);
  if (!isLegacyShape) return normalized;

  // Дані ще в старому форматі (до об'єднання "Послуг" у загальний список) —
  // підхоплюємо legacy-ключ services:text, якщо він є, вставляємо як кнопку
  // типу "text" на друге місце (де раніше завжди стояв акордеон) і одразу
  // зберігаємо мігрований масив, щоб ця гілка більше не спрацьовувала.
  const legacyServicesText = await kvGet<string>(LEGACY_SERVICES_KEY);
  const servicesButton: ManagedButton = {
    id: "services",
    label: DEFAULT_SERVICES_LABEL,
    type: "text",
    url: "",
    content:
      typeof legacyServicesText === "string" && legacyServicesText.trim().length > 0
        ? legacyServicesText
        : DEFAULT_SERVICES_CONTENT,
    accent: false,
  };

  const migrated =
    normalized.length > 0
      ? [normalized[0], servicesButton, ...normalized.slice(1)]
      : [servicesButton];

  await kvSet(BUTTONS_KEY, migrated);
  return migrated;
}

/** Повний текст правил проживання, показуваний на першому екрані. */
export async function getRulesText(): Promise<string> {
  const stored = await kvGet<string>(RULES_KEY);
  if (typeof stored === "string" && stored.trim().length > 0) return stored;
  return defaultRulesText;
}

export type ManagedSocial = {
  icon: SocialIcon;
  url: string;
};

const VALID_SOCIAL_ICONS: readonly SocialIcon[] = [
  "instagram",
  "facebook",
  "phone",
  "telegram",
  "youtube",
];

function normalizeSocial(raw: unknown): ManagedSocial | null {
  const s = (raw ?? {}) as Partial<ManagedSocial> & Record<string, unknown>;
  const icon = VALID_SOCIAL_ICONS.includes(s.icon as SocialIcon) ? (s.icon as SocialIcon) : null;
  if (!icon) return null;
  return { icon, url: typeof s.url === "string" ? s.url : "" };
}

/** Круглі іконки соцмереж унизу другого екрана. Порядок масиву — порядок показу. */
export async function getSocials(): Promise<ManagedSocial[]> {
  const stored = await kvGet<unknown[]>(SOCIALS_KEY);
  if (Array.isArray(stored) && stored.length > 0) {
    const normalized = stored
      .map(normalizeSocial)
      .filter((s): s is ManagedSocial => s !== null);
    if (normalized.length > 0) return normalized;
  }
  return defaultSocials.map((s) => ({ icon: s.icon, url: s.url }));
}

export async function getPublicContent() {
  const [buttons, rulesText, socials] = await Promise.all([
    getButtons(),
    getRulesText(),
    getSocials(),
  ]);
  return { buttons, rulesText, socials };
}

export type SaveContentInput = {
  buttons: ManagedButton[];
  rulesText: string;
  socials: ManagedSocial[];
};

/** Записує весь контент в KV. Повертає false, якщо хоч один запис не вдався. */
export async function saveContent(input: SaveContentInput): Promise<boolean> {
  const results = await Promise.all([
    kvSet(BUTTONS_KEY, input.buttons),
    kvSet(RULES_KEY, input.rulesText),
    kvSet(SOCIALS_KEY, input.socials),
  ]);
  return results.every(Boolean);
}

// ---------------------------------------------------------------------------
// Журнал погоджень з правилами — доказ факту показу/натискання (не
// юридичний підпис). Кожен запис фіксує, коли й хто натиснув "Продовжити".
// ---------------------------------------------------------------------------

export type AgreementLogEntry = {
  /** Стабільний id запису — потрібен, щоб можна було видалити саме цей рядок. */
  id: string;
  timestamp: string;
  name: string;
  roomNumber: string;
  phone: string;
  userAgent: string;
};

export type AgreementLogInput = {
  name: string;
  roomNumber: string;
  phone: string;
  userAgent: string;
};

function clampField(value: unknown, maxLength = MAX_FIELD_LENGTH): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

/** Додає запис у журнал погоджень. Викликається з /api/log-agreement. */
export async function appendAgreementLog(input: AgreementLogInput): Promise<boolean> {
  const entry: AgreementLogEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    name: clampField(input.name),
    roomNumber: clampField(input.roomNumber, 50),
    phone: clampField(input.phone, 30),
    userAgent: clampField(input.userAgent, 500),
  };

  const ok = await kvListPush(AGREEMENTS_KEY, entry);
  if (ok) {
    // Тримаємо тільки останні MAX_AGREEMENT_ENTRIES записів.
    await kvListTrim(AGREEMENTS_KEY, -MAX_AGREEMENT_ENTRIES, -1);
  }
  return ok;
}

/** Останні записи журналу, найновіші перші. За замовчуванням — усі. */
export async function getAgreementLog(limit?: number): Promise<AgreementLogEntry[]> {
  const total = await kvListLength(AGREEMENTS_KEY);
  if (total === 0) return [];
  const startIndex = typeof limit === "number" ? Math.max(0, total - limit) : 0;
  const entries = await kvListRange<AgreementLogEntry>(AGREEMENTS_KEY, startIndex, -1);
  return entries.reverse();
}

export async function getAgreementLogCount(): Promise<number> {
  return kvListLength(AGREEMENTS_KEY);
}

/**
 * Видаляє записи за id (напр. натискання "Видалити" в адмінці). Redis-списки
 * не мають "видалити елемент за id", тож перечитуємо весь список,
 * відфільтровуємо і перезаписуємо. Повертає кількість фактично видалених
 * записів.
 */
export async function deleteAgreementLogEntries(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  const idSet = new Set(ids);
  const all = await kvListRange<AgreementLogEntry>(AGREEMENTS_KEY, 0, -1);
  const remaining = all.filter((entry) => !idSet.has(entry.id));
  const removedCount = all.length - remaining.length;
  if (removedCount === 0) return 0;
  const ok = await kvListSet(AGREEMENTS_KEY, remaining);
  return ok ? removedCount : 0;
}
