import { kv as vercelKv } from "@vercel/kv";

const isKvConfigured = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

// Локальний фолбек на випадок, коли Vercel KV ще не підключено (наприклад,
// під час локальної розробки без env-змінних). НЕ персистентний між
// перезапусками процесу і не синхронізується між інстансами — лише щоб
// адмінку й публічну сторінку можна було перевірити локально без падінь.
// У реальному деплої з підключеним Vercel KV цей код не використовується.
const memoryStore = new Map<string, unknown>();
let warned = false;

function warnOnce() {
  if (warned) return;
  warned = true;
  console.warn(
    "[kv] KV_REST_API_URL / KV_REST_API_TOKEN не задані — використовується " +
      "тимчасове сховище в пам'яті процесу (тільки для локальної розробки, " +
      "зміни НЕ зберігаються між перезапусками)."
  );
}

/** Читає значення за ключем. Повертає null, якщо ключа немає або KV недоступний. */
export async function kvGet<T>(key: string): Promise<T | null> {
  if (!isKvConfigured) {
    warnOnce();
    return (memoryStore.has(key) ? (memoryStore.get(key) as T) : null);
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
    memoryStore.set(key, value);
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
