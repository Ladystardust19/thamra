/* ============================================================================
 * THAMRA quiz-v2 result page — page-path policy.
 * Decides which result experience to show. Only `verified_high_fit` has fully
 * approved copy, so it is the only category routed to the new dynamic page;
 * everything else falls back to the legacy result screen until its copy ships.
 * ========================================================================== */

import type { QuizResult } from "@/lib/scoring";

export type ResultPage = "vhf" | "legacy";

export function resultPage(result: QuizResult): ResultPage {
  // Safety gates always win, even over a high-fit score.
  if (result.redFlag || result.medicalReview || result.manualReview) return "legacy";
  if (result.fitCategory === "verified_high_fit") return "vhf";
  return "legacy";
}

/** The paid consultation is exclusive to the verified_high_fit page. */
export function showsConsultation(result: QuizResult): boolean {
  return resultPage(result) === "vhf";
}
