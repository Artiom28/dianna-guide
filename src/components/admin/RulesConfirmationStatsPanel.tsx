import type { RulesConfirmationStats } from "@/lib/content";

type RulesConfirmationStatsPanelProps = {
  stats: RulesConfirmationStats;
};

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-2xl font-bold text-sky-950">{value.toLocaleString("uk-UA")}</div>
      <div className="mt-0.5 text-xs text-slate-500">{label}</div>
    </div>
  );
}

function percent(part: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function FieldFillRow({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-medium text-slate-900">
          {count.toLocaleString("uk-UA")} · {percent(count, total)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-sky-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/**
 * Статистика підтверджень правил — окремо від "Журналу погоджень" нижче.
 * Джерело даних: rules-confirmations:log, який пише КОЖНЕ натискання
 * "Продовжити" з позначеним чекбоксом (навіть без жодного контактного
 * поля), на відміну від журналу, що пропускає повністю порожні записи.
 */
export function RulesConfirmationStatsPanel({ stats }: RulesConfirmationStatsPanelProps) {
  return (
    <section id="confirmation-stats" className="mb-8 scroll-mt-28">
      <h2 className="mb-1 text-base font-semibold text-slate-900">
        Статистика підтверджень правил
      </h2>
      <p className="mb-3 text-sm text-slate-500">
        Кожне натискання «Продовжити» з позначеним чекбоксом — незалежно від того, чи гість
        лишив контактні дані.
      </p>

      <div className="mb-4 grid grid-cols-3 gap-2.5">
        <StatTile label="Усього" value={stats.total} />
        <StatTile label="Сьогодні" value={stats.today} />
        <StatTile label="За 7 днів" value={stats.last7Days} />
      </div>

      {stats.total === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
          Поки що немає жодного підтвердження.
        </p>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
            Скільки лишили контактні дані
          </p>
          <div className="flex flex-col gap-3">
            <FieldFillRow label="Ім'я" count={stats.withName} total={stats.total} />
            <FieldFillRow label="Номер кімнати" count={stats.withRoom} total={stats.total} />
            <FieldFillRow label="Телефон" count={stats.withPhone} total={stats.total} />
          </div>
        </div>
      )}
    </section>
  );
}
