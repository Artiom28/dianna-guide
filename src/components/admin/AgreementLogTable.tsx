import { agreementEntryKey } from "@/lib/agreementLogKey";
import type { AgreementLogEntry } from "@/lib/content";

type AgreementLogTableProps = {
  entries: AgreementLogEntry[];
  totalCount: number;
  onDelete: (key: string) => void;
  /** ключ запису, що зараз видаляється — блокує саме його кнопку на час запиту. */
  deletingKey: string | null;
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AgreementLogTable({
  entries,
  totalCount,
  onDelete,
  deletingKey,
}: AgreementLogTableProps) {
  return (
    <section id="agreement-log" className="mb-8 scroll-mt-28">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="shrink-0 text-base font-semibold text-slate-900">Журнал погоджень</h2>
        <a
          href="/api/admin/export-agreements"
          className="shrink-0 rounded-lg border border-sky-200 px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-50"
        >
          Завантажити CSV
        </a>
      </div>
      <p className="mb-3 text-sm text-slate-500">
        Усього записів: {totalCount}
        {totalCount > entries.length
          ? ` (показано останні ${entries.length})`
          : ""}
        .
      </p>

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
          Поки що немає жодного запису.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 font-medium">Дата й час</th>
                <th className="px-3 py-2 font-medium">Ім&apos;я</th>
                <th className="px-3 py-2 font-medium">Кімната</th>
                <th className="px-3 py-2 font-medium">Телефон</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const key = agreementEntryKey(entry);
                return (
                  <tr
                    key={key}
                    className="border-b border-slate-100 last:border-0 even:bg-slate-50/60"
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                      {formatTimestamp(entry.timestamp)}
                    </td>
                    <td className="px-3 py-2 text-slate-900">{entry.name}</td>
                    <td className="px-3 py-2 text-slate-900">{entry.roomNumber}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-900">{entry.phone}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(key)}
                        disabled={deletingKey === key}
                        aria-label={`Видалити запис погодження${entry.name ? `: ${entry.name}` : ""}`}
                        className="text-xs font-medium text-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:text-slate-300"
                      >
                        {deletingKey === key ? "..." : "Видалити"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-400">
        Це часова мітка факту показу правил, не юридично засвідчений підпис.
      </p>
    </section>
  );
}
