import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getAgreementLog } from "@/lib/content";

const UTF8_BOM = String.fromCharCode(0xfeff);

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** CSV-експорт усього журналу погоджень (без ліміту в 200, на відміну від таблиці в адмінці). */
export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await getAgreementLog();
  const header = "timestamp,name,room_number,phone";
  const rows = entries.map((e) =>
    [e.timestamp, e.name, e.roomNumber, e.phone].map(csvEscape).join(",")
  );
  // BOM на початку — щоб Excel коректно відкривав кирилицю в UTF-8.
  const csv = UTF8_BOM + [header, ...rows].join("\r\n");

  const filename = `agreements-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
