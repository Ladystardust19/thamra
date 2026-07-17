"use client";

import { supabase } from "./supabase";

// ─── Quiz funnel analytics ─────────────────────────────────────────────────────
// Client-side event tracking. Every visitor gets a per-tab session id; events are
// inserted into the `quiz_events` table (anon-insertable via RLS). The admin panel
// aggregates these into landings, per-question timing, drop-off and result views.

const SESSION_KEY = "thamra_session_id";
const ATTR_KEY = "thamra_attribution";

export interface Attribution {
  fbclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_at?: string;
}

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/** Stable id for this browser tab's quiz session. Survives refresh, not new tabs. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Read fbclid / utm_* from the landing URL once and remember it for the session. */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const existing = getAttribution();
  if (Object.keys(existing).length) return existing;

  const p = new URLSearchParams(window.location.search);
  const attr: Attribution = {};
  const fbclid = p.get("fbclid");
  if (fbclid) attr.fbclid = fbclid;
  for (const k of UTM_KEYS) {
    const v = p.get(k);
    if (v) attr[k] = v;
  }
  attr.landing_at = new Date().toISOString();

  try {
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(attr));
  } catch {}
  return attr;
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(ATTR_KEY);
    if (raw) return JSON.parse(raw) as Attribution;
  } catch {}
  return {};
}

interface TrackArgs {
  event_type: string;
  screen?: string | null;
  question_index?: number | null;
  prev_screen?: string | null;
  prev_duration_ms?: number | null;
  meta?: Record<string, unknown>;
  attribution?: Attribution | null;
}

/** Fire-and-forget insert of a single funnel event. Never throws. */
export function track(args: TrackArgs): void {
  if (typeof window === "undefined") return;
  const session_id = getSessionId();
  supabase
    .from("quiz_events")
    .insert({
      session_id,
      event_type: args.event_type,
      screen: args.screen ?? null,
      question_index: args.question_index ?? null,
      prev_screen: args.prev_screen ?? null,
      prev_duration_ms: args.prev_duration_ms ?? null,
      meta: args.meta ?? {},
      attribution: args.attribution ?? null,
    })
    .then(({ error }) => {
      if (error) console.error("analytics track error:", error.message);
    });
}

/**
 * Guard a one-off-per-session event (e.g. quiz_start, result_view). Returns true
 * the first time it's called for `key` in this session, false afterwards — so a
 * refresh doesn't inflate landings or result views.
 */
export function oncePerSession(key: string): boolean {
  if (typeof window === "undefined") return false;
  const k = `thamra_once_${key}`;
  if (sessionStorage.getItem(k)) return false;
  try {
    sessionStorage.setItem(k, "1");
  } catch {}
  return true;
}
