import crypto from "node:crypto";
import { agreementEntryKey } from "@/lib/agreementLogKey";
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

const CONFIRMATIONS_KEY = "rules-confirmations:log";
// Записи тут крихітні (лише дата + три булеві прапорці), тож ліміт значно
// більший, ніж у agreements:log — щоб "загальна кількість за весь час"
// лишалась точною якнайдовше, а не обрізалась передчасно.
const MAX_CONFIRMATION_ENTRIES = 50000;

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
// Стартовий (фолбек) текст акордеона — без слова "(плейсхолдер)": воно
// потрапляло гостю на очі буквально, поки адмін не відредагує вміст.
const DEFAULT_SERVICES_CONTENT = [
  "Прокат велосипедів",
  "Тенісний корт",
  "Прокат спортивного інвентарю",
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
 * Видаляє записи за ключем (напр. натискання "Видалити" в адмінці) —
 * agreementEntryKey(), той самий id, або фолбек-комбінація полів для
 * записів, зроблених до появи id. Redis-списки не мають "видалити елемент
 * за id", тож перечитуємо весь список, відфільтровуємо і перезаписуємо.
 * Повертає кількість фактично видалених записів.
 */
export async function deleteAgreementLogEntries(keys: string[]): Promise<number> {
  if (keys.length === 0) return 0;
  const keySet = new Set(keys);
  const all = await kvListRange<AgreementLogEntry>(AGREEMENTS_KEY, 0, -1);
  const remaining = all.filter((entry) => !keySet.has(agreementEntryKey(entry)));
  const removedCount = all.length - remaining.length;
  if (removedCount === 0) return 0;
  const ok = await kvListSet(AGREEMENTS_KEY, remaining);
  return ok ? removedCount : 0;
}

// ---------------------------------------------------------------------------
// Лічильник підтверджень правил — окремо від журналу погоджень вище. Пишеться
// ЩОРАЗУ, коли гість тисне "Продовжити" з позначеним чекбоксом, незалежно
// від того, чи заповнив він ім'я/кімнату/телефон (вони необов'язкові) — на
// відміну від agreements:log, який пропускає повністю порожні записи, щоб не
// засмічувати доказовий журнал. Тут навпаки: саме повна картина "скільки
// людей підтвердили і скільки з них лишили контакти" і є метою.
// ---------------------------------------------------------------------------

export type RulesConfirmationEvent = {
  timestamp: string;
  hasName: boolean;
  hasRoom: boolean;
  hasPhone: boolean;
};

export type RulesConfirmationInput = {
  hasName: boolean;
  hasRoom: boolean;
  hasPhone: boolean;
};

/** Фіксує факт підтвердження правил. Викликається з /api/log-agreement. */
export async function logRulesConfirmation(input: RulesConfirmationInput): Promise<boolean> {
  const entry: RulesConfirmationEvent = {
    timestamp: new Date().toISOString(),
    hasName: Boolean(input.hasName),
    hasRoom: Boolean(input.hasRoom),
    hasPhone: Boolean(input.hasPhone),
  };

  const ok = await kvListPush(CONFIRMATIONS_KEY, entry);
  if (ok) {
    await kvListTrim(CONFIRMATIONS_KEY, -MAX_CONFIRMATION_ENTRIES, -1);
  }
  return ok;
}

export type RulesConfirmationStats = {
  total: number;
  today: number;
  last7Days: number;
  withName: number;
  withRoom: number;
  withPhone: number;
};

/** Календарна дата (YYYY-MM-DD) у часовому поясі Europe/Kyiv — готель в Україні. */
function kyivDateString(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Europe/Kyiv" });
}

/**
 * Агреговані показники для розділу "Статистика підтверджень правил" в
 * адмінці: загальна кількість, за сьогодні (календарний день у Europe/Kyiv),
 * за останні 7 днів (плаваюче вікно 7×24г) і скільки лишили кожне з
 * контактних полів.
 */
export async function getRulesConfirmationStats(): Promise<RulesConfirmationStats> {
  const entries = await kvListRange<RulesConfirmationEvent>(CONFIRMATIONS_KEY, 0, -1);

  const stats: RulesConfirmationStats = {
    total: entries.length,
    today: 0,
    last7Days: 0,
    withName: 0,
    withRoom: 0,
    withPhone: 0,
  };
  if (entries.length === 0) return stats;

  const now = Date.now();
  const todayKyiv = kyivDateString(new Date());
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  for (const entry of entries) {
    const entryDate = new Date(entry.timestamp);
    const entryTime = entryDate.getTime();
    if (!Number.isNaN(entryTime)) {
      if (now - entryTime >= 0 && now - entryTime <= sevenDaysMs) stats.last7Days++;
      if (kyivDateString(entryDate) === todayKyiv) stats.today++;
    }
    if (entry.hasName) stats.withName++;
    if (entry.hasRoom) stats.withRoom++;
    if (entry.hasPhone) stats.withPhone++;
  }

  return stats;
}
