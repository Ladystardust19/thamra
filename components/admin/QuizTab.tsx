"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DateRange,
  QuizEvent,
  fetchEvents,
  computeQuizFunnel,
  fmtDuration,
  fmtPct,
} from "@/lib/adminData";

const cardClass =
  "border border-gold/25 bg-white/40 px-5 py-4 flex flex-col gap-1";
const cardLabel = "font-body text-[11px] uppercase tracking-[0.12em] text-muted";
const cardValue = "font-display text-[34px] italic text-oxblood leading-none";
const thClass = "font-body text-[11px] uppercase tracking-[0.12em] text-muted text-left py-2 pr-4";
const tdClass = "font-body text-[14px] text-ink py-2.5 pr-4 border-t border-gold/10 align-middle";

export default function QuizTab({ range }: { range: DateRange }) {
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

  const funnel = useMemo(() => computeQuizFunnel(events), [events]);
  const maxArrivals = Math.max(1, ...funnel.steps.map((s) => s.arrivals));

  if (loading) {
    return <p className="font-body text-[14px] text-muted py-10">იტვირთება…</p>;
  }

  if (funnel.landings === 0) {
    return (
      <p className="font-body text-[14px] text-muted py-10">
        ამ პერიოდში ქვიზზე შემოსვლა არ დაფიქსირებულა.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Headline stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={cardClass}>
          <span className={cardLabel}>შემოსვლა ქვიზზე</span>
          <span className={cardValue}>{funnel.landings}</span>
        </div>
        <div className={cardClass}>
          <span className={cardLabel}>ლიდი (ელ.ფოსტა)</span>
          <span className={cardValue}>{funnel.leads}</span>
        </div>
        <div className={cardClass}>
          <span className={cardLabel}>დასრულების %</span>
          <span className={cardValue}>{fmtPct(funnel.completionRate)}</span>
        </div>
        <div className={cardClass}>
          <span className={cardLabel}>შედეგის ნახვა (3წმ+)</span>
          <span className={cardValue}>{funnel.resultViews}</span>
        </div>
      </div>

      {/* Drop-off funnel */}
      <section>
        <h3 className="font-display text-[22px] italic text-oxblood mb-4">
          სად ჩამოცვივდებიან
        </h3>
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>ეტაპი</th>
              <th className={`${thClass} w-[34%]`}>მიაღწია</th>
              <th className={thClass}>ჩამოცვივდა</th>
              <th className={thClass}>Drop</th>
              <th className={thClass}>საშ. დრო</th>
            </tr>
          </thead>
          <tbody>
            {funnel.steps.map((s) => (
              <tr key={s.screen}>
                <td className={tdClass}>{s.label}</td>
                <td className={tdClass}>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gold/10 rounded-sm overflow-hidden max-w-[220px]">
                      <div
                        className="h-full bg-oxblood/70"
                        style={{ width: `${(s.arrivals / maxArrivals) * 100}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-ink">{s.arrivals}</span>
                  </div>
                </td>
                <td className={`${tdClass} tabular-nums`}>{s.dropped || "—"}</td>
                <td className={`${tdClass} tabular-nums ${s.dropRate >= 0.25 ? "text-red-600" : "text-muted"}`}>
                  {s.arrivals > 0 && s.dropped > 0 ? fmtPct(s.dropRate) : "—"}
                </td>
                <td className={`${tdClass} tabular-nums text-muted`}>{fmtDuration(s.avgTimeMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="font-body text-[12px] text-muted mt-3">
          „საშ. დრო“ — ვიზიტორების საშუალო დრო თითოეულ ეკრანზე. წითელი Drop = 25%+ ჩამოცვენა.
        </p>
      </section>

      {/* Source breakdown */}
      <section>
        <h3 className="font-display text-[22px] italic text-oxblood mb-4">
          საიდან მოდიან (რეკლამა)
        </h3>
        <table className="w-full">
          <thead>
            <tr>
              <th className={thClass}>წყარო / კამპანია</th>
              <th className={thClass}>შემოსვლა</th>
              <th className={thClass}>ლიდი</th>
              <th className={thClass}>კონვერსია</th>
            </tr>
          </thead>
          <tbody>
            {funnel.bySource.map((s) => (
              <tr key={s.source}>
                <td className={tdClass}>{s.source}</td>
                <td className={`${tdClass} tabular-nums`}>{s.landings}</td>
                <td className={`${tdClass} tabular-nums`}>{s.leads}</td>
                <td className={`${tdClass} tabular-nums text-muted`}>
                  {s.landings > 0 ? fmtPct(s.leads / s.landings) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
