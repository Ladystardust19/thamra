"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { computeResult, type Answers } from "@/lib/scoring";
import {
  Lead,
  LeadNote,
  fetchLeads,
  fetchNotesByLead,
  sourceLabel,
  planLabel,
  fmtDate,
  fmtDateShort,
} from "@/lib/adminData";

const STATUSES = [
  { key: "new", label: "ახალი", cls: "bg-slate-100 text-slate-600 border-slate-200" },
  { key: "contacted", label: "დაკავშირდა", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "interested", label: "დაინტერესდა", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "paid", label: "გადაიხადა", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "lost", label: "დაიკარგა", cls: "bg-rose-50 text-rose-700 border-rose-200" },
];
const statusCls = (k: string | null) => STATUSES.find((s) => s.key === k)?.cls ?? STATUSES[0].cls;

function diagnose(answers: Record<string, unknown> | null): string {
  if (!answers) return "—";
  try {
    const r = computeResult(answers as Answers);
    // New model: hair-stress level · menopause-connection level, plus flags.
    const flags: string[] = [];
    if (r.redFlag) flags.push("⚑ სამედ. შემოწმება");
    if (r.competingCause) flags.push("± მრავალფაქტორული");
    const base = `სტრესი: ${r.hairStressLevel.label} · მენოპაუზა: ${r.menoLevel.label}`;
    return flags.length ? `${base} · ${flags.join(" · ")}` : base;
  } catch {
    return "—";
  }
}

export default function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [notes, setNotes] = useState<Record<string, LeadNote[]>>({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [calledFilter, setCalledFilter] = useState<"all" | "called" | "uncalled">("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const l = await fetchLeads();
      if (!alive) return;
      setLeads(l);
      const n = await fetchNotesByLead(l.map((x) => x.id));
      if (!alive) return;
      setNotes(n);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && (l.status ?? "new") !== statusFilter) return false;
      if (calledFilter === "called" && !l.called) return false;
      if (calledFilter === "uncalled" && l.called) return false;
      if (q) {
        const hay = `${l.name} ${l.phone} ${l.email ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, search, statusFilter, calledFilter]);

  const counts = useMemo(() => {
    const called = leads.filter((l) => l.called).length;
    const paid = leads.filter((l) => (l.status ?? "") === "paid").length;
    return { total: leads.length, called, paid };
  }, [leads]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function toggleCalled(lead: Lead) {
    const called = !lead.called;
    const called_at = called ? new Date().toISOString() : null;
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, called, called_at } : l)));
    await supabase.from("quiz_leads").update({ called, called_at }).eq("id", lead.id);
  }

  async function setStatus(lead: Lead, status: string) {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    await supabase.from("quiz_leads").update({ status }).eq("id", lead.id);
  }

  async function addNote(lead: Lead) {
    const body = (drafts[lead.id] ?? "").trim();
    if (!body) return;
    setDrafts((prev) => ({ ...prev, [lead.id]: "" }));
    const { data, error } = await supabase
      .from("lead_notes")
      .insert({ lead_id: lead.id, body })
      .select()
      .single();
    if (error) {
      console.error(error.message);
      return;
    }
    setNotes((prev) => ({ ...prev, [lead.id]: [data as LeadNote, ...(prev[lead.id] ?? [])] }));
  }

  async function deleteNote(leadId: string, noteId: string) {
    setNotes((prev) => ({ ...prev, [leadId]: (prev[leadId] ?? []).filter((n) => n.id !== noteId) }));
    await supabase.from("lead_notes").delete().eq("id", noteId);
  }

  function exportCsv() {
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const header = ["სახელი", "ტელეფონი", "ელ.ფოსტა", "თარიღი", "სტატუსი", "დარეკილი", "პაკეტი", "წყარო", "პროფილი", "კომენტარები"];
    const rows = filtered.map((l) => {
      const leadNotes = (notes[l.id] ?? [])
        .map((n) => `${fmtDateShort(n.created_at)}: ${n.body}`)
        .join(" | ");
      const st = STATUSES.find((s) => s.key === (l.status ?? "new"))?.label ?? "";
      return [
        l.name,
        l.phone,
        l.email ?? "",
        fmtDate(l.submitted_at),
        st,
        l.called ? "დიახ" : "არა",
        planLabel(l.selected_plan),
        sourceLabel(l.attribution),
        diagnose(l.answers),
        leadNotes,
      ].map((v) => esc(v)).join(",");
    });
    const csv = "﻿" + [header.map(esc).join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thamra-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <p className="font-body text-[14px] text-muted py-10">იტვირთება…</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ძებნა სახელით / ნომრით / ელ.ფოსტით"
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
        <select
          value={calledFilter}
          onChange={(e) => setCalledFilter(e.target.value as typeof calledFilter)}
          className="font-body text-[13px] text-ink border border-gold/30 px-2 py-2 bg-cream"
        >
          <option value="all">ყველა</option>
          <option value="called">დარეკილი</option>
          <option value="uncalled">დაურეკავი</option>
        </select>
        <button
          onClick={exportCsv}
          className="font-body text-[12px] uppercase tracking-[0.1em] px-3 py-2 border border-gold/30 text-muted hover:text-ink hover:border-oxblood/50 transition-colors"
        >
          CSV ექსპორტი
        </button>
      </div>

      <div className="flex gap-6 font-body text-[12px] uppercase tracking-[0.1em] text-muted">
        <span>სულ — {counts.total}</span>
        <span>დარეკილი — {counts.called}</span>
        <span>გადაიხადა — {counts.paid}</span>
        <span>ნაჩვენები — {filtered.length}</span>
      </div>

      {/* Lead list */}
      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <p className="font-body text-[14px] text-muted py-6">ლიდები არ მოიძებნა.</p>
        )}
        {filtered.map((lead) => {
          const isOpen = expanded.has(lead.id);
          const leadNotes = notes[lead.id] ?? [];
          return (
            <div key={lead.id} className="border border-gold/25 bg-white/40">
              {/* Row header */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <div className="min-w-[150px]">
                  <p className="font-body text-[15px] text-ink font-medium">{lead.name}</p>
                  <p className="font-body text-[13px] text-muted">{fmtDateShort(lead.submitted_at)}</p>
                </div>

                <div className="min-w-[150px]">
                  <a href={`tel:${lead.phone}`} className="font-body text-[14px] text-oxblood hover:underline block">
                    {lead.phone}
                  </a>
                  {lead.email && <p className="font-body text-[13px] text-muted">{lead.email}</p>}
                </div>

                <span className="font-body text-[11px] uppercase tracking-[0.08em] px-2 py-1 border border-gold/30 text-muted">
                  {sourceLabel(lead.attribution)}
                </span>

                {lead.selected_plan && (
                  <span className="font-body text-[11px] uppercase tracking-[0.08em] px-2 py-1 border bg-emerald-50 text-emerald-700 border-emerald-200">
                    {planLabel(lead.selected_plan)}
                  </span>
                )}

                <div className="ml-auto flex items-center gap-3">
                  {/* Called checkbox */}
                  <button
                    onClick={() => toggleCalled(lead)}
                    className="flex items-center gap-1.5 font-body text-[12px] text-ink"
                    aria-pressed={!!lead.called}
                  >
                    <span
                      className={`w-4 h-4 border flex items-center justify-center ${
                        lead.called ? "bg-oxblood border-oxblood" : "border-gold/50 bg-cream"
                      }`}
                    >
                      {lead.called && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="#f7f1e9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    დარეკილი
                  </button>

                  {/* Status pipeline */}
                  <select
                    value={lead.status ?? "new"}
                    onChange={(e) => setStatus(lead, e.target.value)}
                    className={`font-body text-[12px] uppercase tracking-[0.06em] px-2 py-1 border ${statusCls(lead.status)}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => toggleExpand(lead.id)}
                    className="font-body text-[12px] uppercase tracking-[0.08em] text-muted hover:text-oxblood"
                  >
                    {isOpen ? "დახურვა" : `დეტალები${leadNotes.length ? ` (${leadNotes.length})` : ""}`}
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-gold/15 px-4 py-4 grid md:grid-cols-2 gap-6">
                  {/* Profile + answers */}
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-[0.12em] text-muted mb-1">დიაგნოზი</p>
                    <p className="font-body text-[14px] text-ink mb-4">{diagnose(lead.answers)}</p>

                    <p className="font-body text-[11px] uppercase tracking-[0.12em] text-muted mb-1">პასუხები</p>
                    <AnswersList answers={lead.answers} />
                  </div>

                  {/* Notes / call log */}
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-[0.12em] text-muted mb-2">კომენტარები</p>
                    <div className="flex gap-2 mb-3">
                      <textarea
                        value={drafts[lead.id] ?? ""}
                        onChange={(e) => setDrafts((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                        placeholder="დაამატე კომენტარი ზარის შემდეგ…"
                        rows={2}
                        className="flex-1 font-body text-[14px] text-ink border border-gold/30 px-2.5 py-2 bg-cream resize-none"
                      />
                      <button
                        onClick={() => addNote(lead)}
                        className="font-body text-[12px] uppercase tracking-[0.08em] px-3 border border-oxblood text-oxblood hover:bg-oxblood hover:text-cream transition-colors self-stretch"
                      >
                        დამატება
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {leadNotes.length === 0 && (
                        <p className="font-body text-[13px] text-muted">კომენტარი არ არის.</p>
                      )}
                      {leadNotes.map((n) => (
                        <NoteItem key={n.id} note={n} onDelete={() => deleteNote(lead.id, n.id)} />
                      ))}
                    </div>
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

// ─── Answers list ──────────────────────────────────────────────────────────────

function AnswersList({ answers }: { answers: Record<string, unknown> | null }) {
  if (!answers || Object.keys(answers).length === 0) {
    return <p className="font-body text-[13px] text-muted">—</p>;
  }
  return (
    <ul className="flex flex-col gap-1">
      {Object.entries(answers).map(([k, v]) => (
        <li key={k} className="font-body text-[13px] text-ink">
          <span className="text-muted">{k}:</span> {Array.isArray(v) ? v.join(", ") : String(v)}
        </li>
      ))}
    </ul>
  );
}

// ─── Note item with read more/less ─────────────────────────────────────────────

function NoteItem({ note, onDelete }: { note: LeadNote; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const long = note.body.length > 140;
  const text = long && !open ? note.body.slice(0, 140) + "…" : note.body;
  return (
    <div className="border border-gold/15 bg-cream/60 px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <span className="font-body text-[11px] text-muted">{fmtDate(note.created_at)}</span>
        <button onClick={onDelete} className="font-body text-[11px] text-muted hover:text-red-600">წაშლა</button>
      </div>
      <p className="font-body text-[14px] text-ink whitespace-pre-wrap">{text}</p>
      {long && (
        <button onClick={() => setOpen((o) => !o)} className="font-body text-[12px] text-oxblood hover:underline mt-1">
          {open ? "ნაკლები" : "მეტის ნახვა"}
        </button>
      )}
    </div>
  );
}
