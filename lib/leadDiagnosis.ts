/* ============================================================================
 * Admin lead diagnosis — resolve a quiz_leads.answers blob to a v2 result
 * snapshot, with a strict, testable precedence:
 *   1. Prefer the stored `_result` snapshot (v2 leads).
 *   2. Otherwise recompute from `_raw` codes (v2 leads without a snapshot).
 *   3. Otherwise the row is legacy (v1, humanized labels only) → do NOT attempt
 *      to score it (that would produce a false all-zero diagnosis). Mark legacy.
 * Pure — imports only the v2 scoring module.
 * ========================================================================== */

import { computeResult, type QuizResult, type RawAnswers } from "./scoring";

export type DiagnosisSource = "result" | "raw" | "legacy";

export interface LeadDiagnosis {
  source: DiagnosisSource;
  result: QuizResult | null;
}

/** Resolve a lead's answers blob into a result snapshot + where it came from. */
export function diagnoseLead(answers: Record<string, unknown> | null | undefined): LeadDiagnosis {
  if (answers && typeof answers === "object") {
    const stored = (answers as Record<string, unknown>)._result;
    if (stored && typeof stored === "object") {
      return { source: "result", result: stored as QuizResult };
    }
    const raw = (answers as Record<string, unknown>)._raw;
    if (raw && typeof raw === "object") {
      return { source: "raw", result: computeResult(raw as RawAnswers) };
    }
  }
  // Legacy v1 row (humanized labels only, or empty) — unscorable by the v2 model.
  return { source: "legacy", result: null };
}

// ─── Display formatting (Georgian) ──────────────────────────────────────────

export const FIT_CATEGORY_LABEL: Record<string, string> = {
  no_current_change: "ცვლილება არ არის",
  medical_referral: "სამედიცინო რეფერალი",
  medical_review: "სამედიცინო განხილვა",
  deficiency_first: "ჯერ დეფიციტი",
  potential_high_fit_unverified: "შესაძლო მაღალი ფიტი (დაუდასტურებელი)",
  unverified: "დაუდასტურებელი",
  verified_high_fit: "დადასტურებული მაღალი ფიტი",
  mixed_fit: "შერეული ფიტი",
  possible_fit: "შესაძლო ფიტი",
  low_fit: "დაბალი ფიტი",
};

const SCREENING_LABEL: Record<string, string> = {
  untested: "არ ჩატარებულა",
  incomplete: "არასრული",
  complete: "ჩატარდა",
  verified_normal: "დადასტურებულად ნორმა",
};

/** Compact one-line diagnosis string for the admin leads list/detail. */
export function formatDiagnosis(diag: LeadDiagnosis): string {
  if (diag.source === "legacy" || !diag.result) {
    return "ლეგასი (v1) — ავტომატური დიაგნოზი მიუწვდომელია";
  }
  const r = diag.result;
  const flags: string[] = [];
  if (r.redFlag) flags.push("⚑ სამედ. რეფერალი");
  if (r.medicalReview) flags.push("⚕ სამედ. განხილვა");
  if (r.deficiencyIdentified) flags.push("Fe/D დეფიციტი");
  if (r.manualReview) flags.push("👁 ხელით შემოწმება");
  if (r.strongCompetingTrigger) flags.push("± კონკ. ფაქტორი");
  const base = `${FIT_CATEGORY_LABEL[r.fitCategory] ?? r.fitCategory} · სქრინინგი: ${
    SCREENING_LABEL[r.screeningStatus] ?? r.screeningStatus
  }`;
  return flags.length ? `${base} · ${flags.join(" · ")}` : base;
}
