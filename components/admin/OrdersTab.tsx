"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Order,
  Lead,
  ConsultationBooking,
  DateRange,
  fetchOrders,
  fetchLeadsBySession,
  fetchBookingsByOrder,
  fmtDate,
  fmtDateShort,
  fmtGel,
} from "@/lib/adminData";
import { formatSlot } from "@/lib/consultation";

const STATUSES = [
  { key: "completed", label: "გადახდილი", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "pending", label: "მოლოდინში", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "failed", label: "ჩაიშალა", cls: "bg-rose-50 text-rose-700 border-rose-200" },
];
const statusMeta = (k: string | null) =>
  STATUSES.find((s) => s.key === k) ?? { key: k ?? "?", label: k ?? "—", cls: "bg-slate-100 text-slate-600 border-slate-200" };

// Pull the human-readable card summary out of BOG's payment_detail blob.
function cardLine(pd: Record<string, unknown> | null): string | null {
  if (!pd) return null;
  const parts: string[] = [];
  if (pd.card_type) parts.push(String(pd.card_type));
  if (pd.transaction_id) parts.push(`#${pd.transaction_id}`);
  return parts.length ? parts.join(" · ") : null;
}

export default function OrdersTab({ range }: { range: DateRange }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [leadsBySession, setLeadsBySession] = useState<Record<string, Lead>>({});
  const [bookingsByOrder, setBookingsByOrder] = useState<Record<string, ConsultationBooking>>({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const o = await fetchOrders(range);
      if (!alive) return;
      setOrders(o);
      setLoading(false);
      // Resolve the originating quiz lead for orders that carry a session_id.
      const sessionIds = o.map((x) => x.session_id).filter((s): s is string => !!s);
      if (sessionIds.length) {
        const map = await fetchLeadsBySession(sessionIds);
        if (alive) setLeadsBySession(map);
      }
      // Resolve consultation slot times by order id.
      const bookings = await fetchBookingsByOrder(o.map((x) => x.external_order_id));
      if (alive) setBookingsByOrder(bookings);
    })();
    return () => {
      alive = false;
    };
  }, [range]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (q) {
        const hay = `${o.customer_name ?? ""} ${o.customer_phone ?? ""} ${o.customer_email ?? ""} ${o.external_order_id} ${o.program_name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, search, statusFilter]);

  const summary = useMemo(() => {
    let revenue = 0;
    let completed = 0;
    let pending = 0;
    let failed = 0;
    for (const o of orders) {
      if (o.status === "completed") {
        completed += 1;
        revenue += Number(o.amount) || 0;
      } else if (o.status === "pending") pending += 1;
      else if (o.status === "failed") failed += 1;
    }
    return { revenue, completed, pending, failed };
  }, [orders]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function exportCsv() {
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const header = [
      "თარიღი", "სტატუსი", "პროგრამა", "თანხა", "სახელი", "ტელეფონი",
      "ელ.ფოსტა", "ქალაქი", "მისამართი", "შეკვეთის ID", "BOG ID", "ელ.წერილი გაგზ.",
    ];
    const rows = filtered.map((o) =>
      [
        fmtDate(o.created_at),
        statusMeta(o.status).label,
        o.program_name,
        `${o.amount} ${o.currency}`,
        o.customer_name ?? "",
        o.customer_phone ?? "",
        o.customer_email ?? "",
        o.city ?? "",
        o.address ?? "",
        o.external_order_id,
        o.bog_order_id ?? "",
        o.confirmation_email_sent ? "დიახ" : "არა",
      ].map(esc).join(","),
    );
    const csv = "﻿" + [header.map(esc).join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thamra-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <p className="font-body text-[14px] text-muted py-10">იტვირთება…</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="შემოსავალი" value={fmtGel(summary.revenue)} accent />
        <StatCard label="გადახდილი" value={String(summary.completed)} />
        <StatCard label="მოლოდინში" value={String(summary.pending)} />
        <StatCard label="ჩაშლილი" value={String(summary.failed)} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ძებნა სახელით / ნომრით / შეკვეთის ID-ით"
          className="font-body text-[14px] text-ink border border-gold/30 px-3 py-2 bg-cream min-w-[260px] flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="font-body text-[13px] text-ink border border-gold/30 px-2 py-2 bg-cream"
        >
          <option value="all">ყველა სტატუსი</option>
          {STATUSES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <button
          onClick={exportCsv}
          className="font-body text-[12px] uppercase tracking-[0.1em] px-3 py-2 border border-gold/30 text-muted hover:text-ink hover:border-oxblood/50 transition-colors"
        >
          CSV ექსპორტი
        </button>
      </div>

      <div className="flex gap-6 font-body text-[12px] uppercase tracking-[0.1em] text-muted">
        <span>სულ — {orders.length}</span>
        <span>ნაჩვენები — {filtered.length}</span>
      </div>

      {/* Order list */}
      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <p className="font-body text-[14px] text-muted py-6">შეკვეთა არ მოიძებნა.</p>
        )}
        {filtered.map((o) => {
          const isOpen = expanded.has(o.id);
          const meta = statusMeta(o.status);
          const card = cardLine(o.payment_detail);
          return (
            <div key={o.id} className="border border-gold/25 bg-white/40">
              {/* Row header */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <div className="min-w-[150px]">
                  <p className="font-body text-[15px] text-ink font-medium">
                    {o.customer_name || "—"}
                  </p>
                  <p className="font-body text-[13px] text-muted">{fmtDateShort(o.created_at)}</p>
                </div>

                <div className="min-w-[150px]">
                  {o.customer_phone ? (
                    <a href={`tel:${o.customer_phone}`} className="font-body text-[14px] text-oxblood hover:underline block">
                      {o.customer_phone}
                    </a>
                  ) : (
                    <span className="font-body text-[14px] text-muted">—</span>
                  )}
                  {o.customer_email && <p className="font-body text-[13px] text-muted">{o.customer_email}</p>}
                </div>

                <span className="font-body text-[11px] uppercase tracking-[0.08em] px-2 py-1 border border-gold/30 text-muted">
                  {o.program_name}
                </span>

                <span className="font-body text-[15px] text-ink font-medium tabular-nums">
                  {fmtGel(Number(o.amount) || 0)}
                </span>

                <div className="ml-auto flex items-center gap-3">
                  <span className={`font-body text-[12px] uppercase tracking-[0.06em] px-2 py-1 border ${meta.cls}`}>
                    {meta.label}
                  </span>

                  <button
                    onClick={() => toggleExpand(o.id)}
                    className="font-body text-[12px] uppercase tracking-[0.08em] text-muted hover:text-oxblood"
                  >
                    {isOpen ? "დახურვა" : "დეტალები"}
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-gold/15 px-4 py-4 grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2.5">
                    <Field label="მიწოდება">
                      {[o.city, o.address].filter(Boolean).join(", ") || "—"}
                    </Field>
                    <Field label="შეკვეთის ID">
                      <span className="break-all">{o.external_order_id}</span>
                    </Field>
                    <Field label="BOG ID">
                      <span className="break-all">{o.bog_order_id || "—"}</span>
                    </Field>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Field label="გადახდა">{card || "—"}</Field>
                    <Field label="დადასტურების ელ.წერილი">
                      {o.confirmation_email_sent ? "გაგზავნილია" : "არა"}
                    </Field>
                    {bookingsByOrder[o.external_order_id] && (
                      <Field label="კონსულტაციის დრო">
                        {formatSlot(bookingsByOrder[o.external_order_id].slot_start)}
                        <span className="text-muted">
                          {" · "}
                          {bookingsByOrder[o.external_order_id].status}
                        </span>
                      </Field>
                    )}
                    <Field label="ლიდი (ქვიზიდან)">
                      {o.session_id ? (
                        leadsBySession[o.session_id] ? (
                          <>
                            {leadsBySession[o.session_id].name || "—"}
                            <span className="text-muted">
                              {" · "}
                              {fmtDateShort(leadsBySession[o.session_id].submitted_at)}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted">ლიდი ვერ მოიძებნა · {o.session_id}</span>
                        )
                      ) : (
                        "—"
                      )}
                    </Field>
                    <Field label="შექმნა / განახლება">
                      {fmtDate(o.created_at)}
                      {o.updated_at && o.updated_at !== o.created_at && (
                        <> → {fmtDate(o.updated_at)}</>
                      )}
                    </Field>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`border px-4 py-3 ${accent ? "border-oxblood/30 bg-oxblood/[0.04]" : "border-gold/25 bg-white/40"}`}>
      <p className="font-body text-[11px] uppercase tracking-[0.12em] text-muted mb-1">{label}</p>
      <p className={`font-display text-[24px] ${accent ? "text-oxblood" : "text-ink"} tabular-nums`}>{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-body text-[11px] uppercase tracking-[0.12em] text-muted mb-0.5">{label}</p>
      <p className="font-body text-[14px] text-ink">{children}</p>
    </div>
  );
}
