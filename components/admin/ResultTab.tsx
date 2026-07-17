"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DateRange,
  QuizEvent,
  fetchEvents,
  computeResultMetrics,
  fmtPct,
} from "@/lib/adminData";

const cardClass = "border border-gold/25 bg-white/40 px-5 py-4 flex flex-col gap-1";
const cardLabel = "font-body text-[11px] uppercase tracking-[0.12em] text-muted";
const cardValue = "font-display text-[34px] italic text-oxblood leading-none";
const thClass = "font-body text-[11px] uppercase tracking-[0.12em] text-muted text-left py-2 pr-4";
const tdClass = "font-body text-[14px] text-ink py-2.5 pr-4 border-t border-gold/10 align-middle";

export default function ResultTab({ range }: { range: DateRange }) {
  const [events, setEvents] = useState<QuizEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchEvents(range).then((ev) => {
      if (!alive) return;
      setEvents(ev);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [range]);

  const m = useMemo(() => computeResultMetrics(events), [events]);

  if (loading) {
    return <p className="font-body text-[14px] text-muted py-10">იტვირთება…</p>;
  }

  if (m.resultViews === 0 && m.planSelections === 0) {
    return (
      <p className="font-body text-[14px] text-muted py-10">
        ამ პერიოდში შედეგის გვერდის ნახვა არ დაფიქსირებულა.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-3 gap-3">
        <div className={cardClass}>
          <span className={cardLabel}>შედეგის ნახვა (3წმ+)</span>
          <span className={cardValue}>{m.resultViews}</span>
        </div>
        <div className={cardClass}>
          <span className={cardLabel}>აირჩია პაკეტი</span>
          <span className={cardValue}>{m.planSelections}</span>
        </div>
        <div className={cardClass}>
          <span className={cardLabel}>მიაღწია გადახდას</span>
          <span className={cardValue}>{m.bankReached}</span>
        </div>
      </div>

      {/* View → plan → bank funnel */}
      <section>
        <h3 className="font-display text-[22px] italic text-oxblood mb-4">
          შედეგიდან გადახდამდე
        </h3>
        <div className="flex flex-col gap-2 max-w-[520px]">
          <FunnelBar label="ნახა შედეგი" value={m.resultViews} base={m.resultViews} />
          <FunnelBar label="აირჩია პაკეტი" value={m.planSelections} base={m.resultViews} />
          <FunnelBar label="მიაღწია გადახდას" value={m.bankReached} base={m.resultViews} />
        </div>
      </section>

      {/* Per-plan breakdown */}
      {m.byPlan.length > 0 && (
        <section>
          <h3 className="font-display text-[22px] italic text-oxblood mb-4">პაკეტების მიხედვით</h3>
          <table className="w-full max-w-[560px]">
            <thead>
              <tr>
                <th className={thClass}>პაკეტი</th>
                <th className={thClass}>აირჩია</th>
                <th className={thClass}>გადახდამდე</th>
              </tr>
            </thead>
            <tbody>
              {m.byPlan.map((p) => (
                <tr key={p.plan}>
                  <td className={tdClass}>{p.plan}</td>
                  <td className={`${tdClass} tabular-nums`}>{p.selected}</td>
                  <td className={`${tdClass} tabular-nums`}>{p.bankReached}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

function FunnelBar({ label, value, base }: { label: string; value: number; base: number }) {
  const pct = base > 0 ? value / base : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="font-body text-[13px] text-ink w-[130px] shrink-0">{label}</span>
      <div className="flex-1 h-6 bg-gold/10 rounded-sm overflow-hidden">
        <div className="h-full bg-oxblood/70 flex items-center" style={{ width: `${Math.max(pct * 100, 4)}%` }} />
      </div>
      <span className="font-body text-[13px] tabular-nums text-ink w-[74px] text-right">
        {value} {base > 0 && <span className="text-muted">({fmtPct(pct)})</span>}
      </span>
    </div>
  );
}
