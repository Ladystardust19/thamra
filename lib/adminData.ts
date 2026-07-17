"use client";

import { supabase } from "./supabase";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Attribution {
  fbclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_at?: string;
}

export interface QuizEvent {
  id: string;
  session_id: string;
  event_type: string;
  screen: string | null;
  question_index: number | null;
  prev_screen: string | null;
  prev_duration_ms: number | null;
  meta: Record<string, unknown> | null;
  attribution: Attribution | null;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  answers: Record<string, unknown> | null;
  submitted_at: string;
  selected_plan: string | null;
  preorder_terms_accepted: boolean | null;
  called: boolean | null;
  called_at: string | null;
  status: string | null;
  attribution: Attribution | null;
  session_id: string | null;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  body: string;
  created_at: string;
}

// ─── Quiz screen metadata (order + Georgian labels) ────────────────────────────
// Funnel order: landing → 9 questions → gate → lead → result.

export const QUESTION_SCREENS = [
  "q1", "q2", "q3", "q_severity", "q4", "q5", "q_stress", "q6", "q7",
] as const;

export const SCREEN_LABELS: Record<string, string> = {
  intro: "შესვლა",
  q1: "1. ასაკი",
  q2: "2. როდის შენიშნა",
  q3: "3. სიმპტომები",
  q_severity: "4. რამდენად აწუხებს",
  q4: "5. თანმხლები ნიშნები",
  q5: "6. ძილი",
  q_stress: "7. სტრესი",
  q6: "8. რა სცადა",
  q7: "9. პრიორიტეტი",
  gate: "კონტაქტის შევსება",
  result: "შედეგის გვერდი",
};

// ─── Date ranges ───────────────────────────────────────────────────────────────

export type Preset = "today" | "week" | "month" | "year" | "all" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}

export const PRESET_LABELS: Record<Preset, string> = {
  today: "დღეს",
  week: "ბოლო 7 დღე",
  month: "ბოლო 30 დღე",
  year: "წელს",
  all: "მთელი პერიოდი",
  custom: "არჩეული თარიღები",
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** Compute an absolute [from, to] window for a preset (local / Tbilisi time). */
export function presetRange(
  preset: Preset,
  customFrom?: string,
  customTo?: string,
): DateRange {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: now };
    case "week":
      return { from: startOfDay(new Date(now.getTime() - 6 * 864e5)), to: now };
    case "month":
      return { from: startOfDay(new Date(now.getTime() - 29 * 864e5)), to: now };
    case "year":
      return { from: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0), to: now };
    case "all":
      return { from: new Date(2020, 0, 1), to: now };
    case "custom": {
      const from = customFrom ? startOfDay(new Date(customFrom)) : startOfDay(now);
      const to = customTo ? endOfDay(new Date(customTo)) : now;
      return { from, to };
    }
  }
}

// ─── Attribution / source labelling ────────────────────────────────────────────

export function sourceLabel(a: Attribution | null | undefined): string {
  if (!a) return "პირდაპირი";
  if (a.utm_campaign) return a.utm_campaign;
  if (a.utm_source) return a.utm_source;
  if (a.fbclid) return "Meta (fbclid)";
  return "პირდაპირი";
}

// ─── Fetching (paginated so we never silently cap at 1000 rows) ────────────────

async function fetchAll<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const page = 1000;
  const out: T[] = [];
  for (let i = 0; ; i += page) {
    const { data, error } = await build(i, i + page - 1);
    if (error) {
      console.error("fetch error:", error.message);
      break;
    }
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < page) break;
  }
  return out;
}

export function fetchEvents(range: DateRange): Promise<QuizEvent[]> {
  return fetchAll<QuizEvent>((from, to) =>
    supabase
      .from("quiz_events")
      .select("*")
      .gte("created_at", range.from.toISOString())
      .lte("created_at", range.to.toISOString())
      .order("created_at", { ascending: true })
      .range(from, to),
  );
}

export function fetchLeads(range?: DateRange): Promise<Lead[]> {
  return fetchAll<Lead>((from, to) => {
    let q = supabase
      .from("quiz_leads")
      .select(
        "id,name,phone,email,answers,submitted_at,selected_plan,preorder_terms_accepted,called,called_at,status,attribution,session_id",
      )
      .order("submitted_at", { ascending: false })
      .range(from, to);
    if (range) {
      q = q
        .gte("submitted_at", range.from.toISOString())
        .lte("submitted_at", range.to.toISOString());
    }
    return q;
  });
}

export async function fetchNotesByLead(leadIds: string[]): Promise<Record<string, LeadNote[]>> {
  const map: Record<string, LeadNote[]> = {};
  if (leadIds.length === 0) return map;
  const notes = await fetchAll<LeadNote>((from, to) =>
    supabase
      .from("lead_notes")
      .select("*")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: false })
      .range(from, to),
  );
  for (const n of notes) {
    (map[n.lead_id] ??= []).push(n);
  }
  return map;
}

// ─── Aggregation: quiz funnel ──────────────────────────────────────────────────

const MAX_REASONABLE_MS = 5 * 60 * 1000; // cap per-screen time to exclude idle/AFK

export interface FunnelStep {
  screen: string;
  label: string;
  arrivals: number;      // distinct sessions that reached this screen
  dropped: number;       // arrivals - arrivals(next step)
  dropRate: number;      // dropped / arrivals
  avgTimeMs: number | null; // avg time visitors spent ON this screen
}

export interface QuizFunnel {
  landings: number;
  leads: number;             // completed the gate (email+phone)
  completionRate: number;    // leads / landings
  resultViews: number;       // 3s+ views of the result page
  steps: FunnelStep[];       // intro → questions → gate
  bySource: { source: string; landings: number; leads: number }[];
}

function distinctSessions(events: QuizEvent[], pred: (e: QuizEvent) => boolean): Set<string> {
  const s = new Set<string>();
  for (const e of events) if (pred(e)) s.add(e.session_id);
  return s;
}

export function computeQuizFunnel(events: QuizEvent[]): QuizFunnel {
  const startSessions = distinctSessions(events, (e) => e.event_type === "quiz_start");
  const landings = startSessions.size;

  const leadSessions = distinctSessions(events, (e) => e.event_type === "lead_submit");
  const leads = leadSessions.size;

  const resultViews = events.filter((e) => e.event_type === "result_view").length;

  // Ordered funnel screens: intro, then each question, then gate.
  const order = ["intro", ...QUESTION_SCREENS, "gate"];

  // Arrivals per screen. intro arrivals = landings (quiz_start). Others = sessions
  // with a screen_view for that screen.
  const arrivalsByScreen: Record<string, Set<string>> = {};
  arrivalsByScreen.intro = startSessions;
  for (const scr of order.slice(1)) arrivalsByScreen[scr] = new Set();
  for (const e of events) {
    if (e.event_type === "screen_view" && e.screen && arrivalsByScreen[e.screen]) {
      arrivalsByScreen[e.screen].add(e.session_id);
    }
  }

  // Avg time spent ON a screen = avg of prev_duration_ms reported when leaving it.
  const timeAgg: Record<string, { total: number; n: number }> = {};
  for (const e of events) {
    if (
      e.event_type === "screen_view" &&
      e.prev_screen &&
      e.prev_duration_ms != null &&
      e.prev_duration_ms > 0 &&
      e.prev_duration_ms <= MAX_REASONABLE_MS
    ) {
      const t = (timeAgg[e.prev_screen] ??= { total: 0, n: 0 });
      t.total += e.prev_duration_ms;
      t.n += 1;
    }
  }

  const steps: FunnelStep[] = order.map((scr, i) => {
    const arrivals = arrivalsByScreen[scr]?.size ?? 0;
    const nextArrivals = i + 1 < order.length ? arrivalsByScreen[order[i + 1]]?.size ?? 0 : leads;
    const dropped = Math.max(0, arrivals - nextArrivals);
    const t = timeAgg[scr];
    return {
      screen: scr,
      label: SCREEN_LABELS[scr] ?? scr,
      arrivals,
      dropped,
      dropRate: arrivals > 0 ? dropped / arrivals : 0,
      avgTimeMs: t && t.n > 0 ? Math.round(t.total / t.n) : null,
    };
  });

  // Source breakdown from quiz_start attribution + lead attribution.
  const srcLandings: Record<string, number> = {};
  for (const e of events) {
    if (e.event_type === "quiz_start") {
      const key = sourceLabel(e.attribution);
      srcLandings[key] = (srcLandings[key] ?? 0) + 1;
    }
  }
  const srcLeads: Record<string, number> = {};
  for (const e of events) {
    if (e.event_type === "lead_submit") {
      const key = sourceLabel(e.attribution);
      srcLeads[key] = (srcLeads[key] ?? 0) + 1;
    }
  }
  const bySource = Object.keys({ ...srcLandings, ...srcLeads })
    .map((source) => ({
      source,
      landings: srcLandings[source] ?? 0,
      leads: srcLeads[source] ?? 0,
    }))
    .sort((a, b) => b.landings - a.landings);

  return { landings, leads, completionRate: landings > 0 ? leads / landings : 0, resultViews, steps, bySource };
}

// ─── Aggregation: result page ──────────────────────────────────────────────────

export interface ResultMetrics {
  resultViews: number;
  planSelections: number;   // sessions that picked any plan
  bankReached: number;      // sessions that reached bank transfer
  byPlan: { plan: string; selected: number; bankReached: number }[];
}

const PLAN_LABELS: Record<string, string> = {
  signature: "Signature (399₾)",
  foundation: "Foundation (149₾)",
  longevity: "Longevity (749₾)",
};

export function planLabel(id: string | null | undefined): string {
  if (!id) return "—";
  return PLAN_LABELS[id] ?? id;
}

export function computeResultMetrics(events: QuizEvent[]): ResultMetrics {
  const resultViews = events.filter((e) => e.event_type === "result_view").length;

  const planSel = distinctSessions(events, (e) => e.event_type === "plan_selected");
  const bank = distinctSessions(events, (e) => e.event_type === "bank_reached");

  const byPlanSel: Record<string, Set<string>> = {};
  const byPlanBank: Record<string, Set<string>> = {};
  for (const e of events) {
    const plan = (e.meta?.plan as string) || "unknown";
    if (e.event_type === "plan_selected") (byPlanSel[plan] ??= new Set()).add(e.session_id);
    if (e.event_type === "bank_reached") (byPlanBank[plan] ??= new Set()).add(e.session_id);
  }
  const byPlan = Object.keys({ ...byPlanSel, ...byPlanBank })
    .map((plan) => ({
      plan: planLabel(plan),
      selected: byPlanSel[plan]?.size ?? 0,
      bankReached: byPlanBank[plan]?.size ?? 0,
    }))
    .sort((a, b) => b.selected - a.selected);

  return {
    resultViews,
    planSelections: planSel.size,
    bankReached: bank.size,
    byPlan,
  };
}

// ─── Formatting helpers ────────────────────────────────────────────────────────

export function fmtDuration(ms: number | null): string {
  if (ms == null) return "—";
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(s < 10 ? 1 : 0)}წმ`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return `${m}წთ ${rem}წმ`;
}

export function fmtPct(x: number): string {
  return `${(x * 100).toFixed(x >= 0.1 ? 0 : 1)}%`;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("ka-GE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("ka-GE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
