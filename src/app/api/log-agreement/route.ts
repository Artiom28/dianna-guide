import { NextResponse, type NextRequest } from "next/server";
import { appendAgreementLog, logRulesConfirmation } from "@/lib/content";

/**
 * Фіксує факт погодження з правилами проживання — викликається асинхронно
 * при кожному натисканні "Продовжити" з позначеним чекбоксом, без очікування
 * відповіді на клієнті (жодна помилка тут не повинна заважати гостю
 * продовжити). Пише у два місця з різною логікою:
 *
 * 1. Лічильник підтверджень (rules-confirmations:log) — ЗАВЖДИ, незалежно
 *    від того, чи заповнені контактні поля (вони необов'язкові). Живить
 *    розділ "Статистика підтверджень правил" в адмінці.
 * 2. Детальний журнал погоджень (agreements:log, доказ факту показу/
 *    натискання) — тільки якщо гість лишив хоч одне контактне поле, щоб не
 *    засмічувати його повністю порожніми записами.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некоректний JSON" }, { status: 400 });
  }

  const { name, roomNumber, phone, userAgent } = (body ?? {}) as Record<string, unknown>;

  // Поля необов'язкові — тут перевіряємо лише тип, а не наявність значення.
  if (
    typeof name !== "string" ||
    typeof roomNumber !== "string" ||
    typeof phone !== "string"
  ) {
    return NextResponse.json(
      { ok: false, error: "Некоректний формат полів" },
      { status: 400 }
    );
  }

  const hasName = name.trim().length > 0;
  const hasRoom = roomNumber.trim().length > 0;
  const hasPhone = phone.trim().length > 0;

  const statsOk = await logRulesConfirmation({ hasName, hasRoom, hasPhone });

  let journalOk = true;
  if (hasName || hasRoom || hasPhone) {
    journalOk = await appendAgreementLog({
      name,
      roomNumber,
      phone,
      userAgent: typeof userAgent === "string" ? userAgent : "",
    });
  }

  const ok = statsOk && journalOk;
  return NextResponse.json({ ok }, { status: ok ? 200 : 500 });
}
