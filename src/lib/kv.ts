import fs from "node:fs";
import path from "node:path";
import { kv as vercelKv } from "@vercel/kv";

const isKvConfigured = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

// Локальний фолбек на випадок, коли Vercel KV ще не підключено (наприклад,
// під час локальної розробки без env-змінних). Зберігається у файлі, а НЕ
// в змінній модуля — Next.js компілює сторінки, server actions і Route
// Handlers у ОКРЕМІ серверні бандли, кожен зі своєю копією цього модуля, тож
// проста змінна в пам'яті НЕ ділиться станом між /api/* та рештою застосунку.
// Файл вирішує це для локальної розробки; у реальному деплої з підключеним
// Vercel KV цей код узагалі не використовується.
const FALLBACK_FILE = path.join(process.cwd(), ".data", "kv-fallback.json");
let warned = false;

function warnOnce() {
  if (warned) return;
  warned = true;
  console.warn(
    "[kv] KV_REST_API_URL / KV_REST_API_TOKEN не задані — використовується " +
      `тимчасовий файл ${FALLBACK_FILE} (тільки для локальної розробки, ` +
      "не для продакшену)."
  );
}

function readStore(): Record<string, unknown> {
  try {
    const raw = fs.readFileSync(FALLBACK_FILE, "utf-8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, unknown>): void {
  try {
    fs.mkdirSync(path.dirname(FALLBACK_FILE), { recursive: true });
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(store), "utf-8");
  } catch (error) {
    console.error("[kv] не вдалося записати локальний fallback-файл", error);
  }
}

/** Читає значення за ключем. Повертає null, якщо ключа немає або KV недоступний. */
export async function kvGet<T>(key: string): Promise<T | null> {
  if (!isKvConfigured) {
    warnOnce();
    const store = readStore();
    return key in store ? (store[key] as T) : null;
  }
  try {
    return await vercelKv.get<T>(key);
  } catch (error) {
    console.error(`[kv] get(${key}) не вдався, повертаю null`, error);
    return null;
  }
}

/** Записує значення за ключем. Повертає false, якщо запис не вдався. */
export async function kvSet<T>(key: string, value: T): Promise<boolean> {
  if (!isKvConfigured) {
    warnOnce();
    const store = readStore();
    store[key] = value;
    writeStore(store);
    return true;
  }
  try {
    await vercelKv.set(key, value);
    return true;
  } catch (error) {
    console.error(`[kv] set(${key}) не вдався`, error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Списки (Redis LIST) — для журналів, що постійно доповнюються (напр.
// agreements:log). На відміну від kvGet+kvSet поверх звичайного ключа,
// rpush атомарний на боці Redis — паралельні записи від різних гостей не
// затирають одне одного. (Локальний файловий фолбек цієї атомарності не
// гарантує — прийнятно для одиночної локальної розробки.)
// ---------------------------------------------------------------------------

/** Додає елемент у кінець списку. Повертає false, якщо запис не вдався. */
export async function kvListPush<T>(key: string, value: T): Promise<boolean> {
  if (!isKvConfigured) {
    warnOnce();
    const store = readStore();
    const list = (store[key] as T[]) ?? [];
    list.push(value);
    store[key] = list;
    writeStore(store);
    return true;
  }
  try {
    await vercelKv.rpush(key, value);
    return true;
  } catch (error) {
    console.error(`[kv] rpush(${key}) не вдався`, error);
    return false;
  }
}

/** Читає діапазон списку (як Redis LRANGE — 0-based, кінець включно, -1 = останній елемент). */
export async function kvListRange<T>(key: string, start: number, end: number): Promise<T[]> {
  if (!isKvConfigured) {
    warnOnce();
    const store = readStore();
    const list = (store[key] as T[]) ?? [];
    const normalizedEnd = end < 0 ? list.length + end + 1 : end + 1;
    return list.slice(start, normalizedEnd);
  }
  try {
    return await vercelKv.lrange<T>(key, start, end);
  } catch (error) {
    console.error(`[kv] lrange(${key}) не вдався`, error);
    return [];
  }
}

/** Довжина списку. */
export async function kvListLength(key: string): Promise<number> {
  if (!isKvConfigured) {
    warnOnce();
    const store = readStore();
    const list = (store[key] as unknown[]) ?? [];
    return list.length;
  }
  try {
    return await vercelKv.llen(key);
  } catch (error) {
    console.error(`[kv] llen(${key}) не вдався`, error);
    return 0;
  }
}

/**
 * Повністю перезаписує список наданим масивом (DEL + RPUSH). Використовується
 * для точкового видалення елементів (напр. одного запису журналу погоджень) —
 * Redis-списки не мають операції "видалити елемент за id", тож єдиний спосіб
 * прибрати конкретний запис — перечитати весь список, відфільтрувати і
 * записати назад.
 */
export async function kvListSet<T>(key: string, values: T[]): Promise<boolean> {
  if (!isKvConfigured) {
    warnOnce();
    const store = readStore();
    store[key] = values;
    writeStore(store);
    return true;
  }
  try {
    await vercelKv.del(key);
    if (values.length > 0) {
      await vercelKv.rpush(key, ...values);
    }
    return true;
  } catch (error) {
    console.error(`[kv] перезапис списку(${key}) не вдався`, error);
    return false;
  }
}

/** Обрізає список до діапазону (як Redis LTRIM) — для обмеження необмеженого росту. */
export async function kvListTrim(key: string, start: number, end: number): Promise<void> {
  if (!isKvConfigured) {
    warnOnce();
    const store = readStore();
    const list = (store[key] as unknown[]) ?? [];
    const normalizedEnd = end < 0 ? list.length + end + 1 : end + 1;
    store[key] = list.slice(start, normalizedEnd);
    writeStore(store);
    return;
  }
  try {
    await vercelKv.ltrim(key, start, end);
  } catch (error) {
    console.error(`[kv] ltrim(${key}) не вдався`, error);
  }
}
