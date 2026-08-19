import { NextResponse, type NextRequest } from "next/server";
import { appendAgreementLog } from "@/lib/content";

/**
 * Фіксує факт погодження з правилами проживання — журнал (не юридичний
 * підпис), на який гість погоджується натисканням "Продовжити" на екрані
 * правил. Викликається асинхронно, без очікування відповіді на клієнті —
 * жодна помилка тут не повинна заважати гостю продовжити.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некоректний JSON" }, { status: 400 });
  }

  const { name, roomNumber, phone, userAgent } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof roomNumber !== "string" ||
    !roomNumber.trim() ||
    typeof phone !== "string" ||
    !phone.trim()
  ) {
    return NextResponse.json(
      { ok: false, error: "Відсутні обов'язкові поля" },
      { status: 400 }
    );
  }

  const ok = await appendAgreementLog({
    name,
    roomNumber,
    phone,
    userAgent: typeof userAgent === "string" ? userAgent : "",
  });

  return NextResponse.json({ ok }, { status: ok ? 200 : 500 });
}
