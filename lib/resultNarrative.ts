/* ============================================================================
 * THAMRA quiz-v2 result page — narrative selector (pure functions).
 * Given the raw answers, assembles the ordered Georgian blocks for the
 * `verified_high_fit` result page. Copy lives in lib/resultContentV2.ts.
 *
 * Every conditional fragment is looked up by id and skipped if absent, so an
 * unexpected answer combination degrades to less copy rather than crashing.
 * ========================================================================== */

import type { RawAnswers } from "@/lib/scoring";
import {
  SUDDEN,
  GRADUAL,
  BOTH,
  PREV_TREATMENT,
  STAGE_LINE,
  type Profile,
  type ProfileCopy,
} from "@/lib/resultContentV2";

export interface Section {
  heading?: string;
  paragraphs: string[];
}

/** A compact ✓ does / ✗ missing verdict for one tried treatment. */
export interface Verdict {
  heading: string;
  does: string;
  missing: string;
}

export interface PrevTreatmentContent {
  title: string;
  intro: string[];
  treatments: Section[];
  verdicts: Verdict[];
  duration: string[];
  outcomes: string[];
  conclusion: string;
}

/** Four labelled rows for the top-of-page summary card. */
export interface SummaryData {
  cause: string;
  stage: string | null;
  tried: string | null; // null ⇒ nothing tried yet
  missing: string;
}

export interface VhfNarrative {
  profile: Profile;
  summary: SummaryData;
  mechanism: Section;
  mechanismTakeaway: string;
  progression: Section;
  progressionTakeaway: string;
  prevTreatment: PrevTreatmentContent;
}

const asArray = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

// Older-than ⇒ larger rank (started further in the past).
const ONSET_RANK: Record<string, number> = {
  months_1_3: 1,
  months_3_6: 2,
  months_6_12: 3,
  years_1_3: 4,
  over_1_year: 4,
};

export function selectProfile(a: RawAnswers): Profile | null {
  switch (a.hair_change_type) {
    case "sudden_shedding":
      return "sudden";
    case "gradual_thinning":
      return "gradual";
    case "both":
      return "both";
    default:
      return null;
  }
}

function symptomConditionals(a: RawAnswers, c: ProfileCopy): string[] {
  const sym = asArray(a.associated_symptoms);
  const out: string[] = [];
  if (sym.includes("hot_flashes")) out.push(c.hotFlash);
  if (sym.includes("worse_sleep") || sym.includes("stress_anxiety")) out.push(c.sleepStress);
  return out;
}

function mechanismSection(a: RawAnswers, c: ProfileCopy): Section {
  return {
    heading: c.mechanismHeading,
    paragraphs: [...c.mechanismBase, ...symptomConditionals(a, c), c.mechanismClosing],
  };
}

function sequenceFragment(a: RawAnswers): string | null {
  const t = a.thinning_onset ? ONSET_RANK[a.thinning_onset] : undefined;
  const s = a.shedding_onset ? ONSET_RANK[a.shedding_onset] : undefined;
  if (t == null || s == null) return null;
  if (t > s) return BOTH.sequence.thinningFirst; // thinning is older → started first
  if (s > t) return BOTH.sequence.sheddingFirst;
  return BOTH.sequence.sameTime;
}

function combinedDuration(a: RawAnswers): string | null {
  if (a.thinning_onset === "years_1_3") return BOTH.combinedDuration.thinning_years;
  const t = a.thinning_onset ? ONSET_RANK[a.thinning_onset] : 0;
  const s = a.shedding_onset ? ONSET_RANK[a.shedding_onset] : 0;
  const max = Math.max(t, s);
  if (max >= 3) return BOTH.combinedDuration.months_6_12;
  if (max === 2) return BOTH.combinedDuration.months_3_6;
  if (max === 1) return BOTH.combinedDuration.months_1_3;
  return null;
}

function progressionSection(a: RawAnswers, profile: Profile): Section {
  if (profile === "sudden") {
    const paragraphs = [...SUDDEN.progressionBase];
    const onset = a.shedding_onset && SUDDEN.onset[a.shedding_onset];
    if (onset) paragraphs.push(onset);
    const hist = a.previous_hair_history && SUDDEN.history[a.previous_hair_history];
    if (hist) paragraphs.push(hist);
    return { heading: SUDDEN.progressionHeading, paragraphs };
  }
  if (profile === "gradual") {
    const paragraphs = [...GRADUAL.progressionBase];
    const onset = a.thinning_onset && GRADUAL.onset[a.thinning_onset];
    if (onset) paragraphs.push(onset);
    const hist = a.previous_hair_history && GRADUAL.history[a.previous_hair_history];
    if (hist) paragraphs.push(hist);
    return { heading: GRADUAL.progressionHeading, paragraphs };
  }
  // both
  const paragraphs = [...BOTH.progressionBase];
  const seq = sequenceFragment(a);
  if (seq) paragraphs.push(seq);
  const cd = combinedDuration(a);
  if (cd) paragraphs.push(cd);
  const hist = a.previous_hair_history && BOTH.history[a.previous_hair_history];
  if (hist) paragraphs.push(hist);
  return { heading: BOTH.progressionHeading, paragraphs };
}

function prevTreatmentSection(a: RawAnswers, profile: Profile): PrevTreatmentContent {
  const P = PREV_TREATMENT;
  const treatments = asArray(a.previous_treatments);
  const results = asArray(a.previous_treatment_results);
  const hasReal = treatments.some((t) => t !== "nothing_specific");

  // Nothing done yet (or only "nothing_specific"): single no-treatment block.
  if (!hasReal) {
    return {
      title: P.titleNothing,
      intro: P.introNothing,
      treatments: [P.nothingBlock],
      verdicts: [],
      duration: [],
      outcomes: [],
      conclusion: P.conclusions.nothing,
    };
  }

  const sym = asArray(a.associated_symptoms);
  const sleepStress = sym.includes("worse_sleep") || sym.includes("stress_anxiety");
  const negative = results.includes("no_result") || results.includes("worsened");

  const intro = [...P.introBase];
  if (sleepStress) intro.push(P.introSleepStressExtra);

  const treatmentBlocks: Section[] = [];
  const verdicts: Verdict[] = [];
  for (const id of P.treatmentOrder) {
    const t = P.treatments[id];
    if (treatments.includes(id) && t) {
      treatmentBlocks.push(t);
      if (t.does && t.missing) verdicts.push({ heading: t.heading, does: t.does, missing: t.missing });
    }
  }

  const duration =
    (a.longest_treatment_duration && P.duration[a.longest_treatment_duration]) || [];

  const outcomes: string[] = [];
  if (results.includes("no_result")) {
    outcomes.push(...P.outcomes.no_result);
  } else if (results.includes("worsened")) {
    outcomes.push(...P.outcomes.worsened);
  } else {
    if (results.includes("less_shedding")) outcomes.push(...P.outcomes.less_shedding);
    if (results.includes("more_fullness")) outcomes.push(...P.outcomes.more_fullness);
    if (results.includes("better_quality")) {
      const includesShedding = profile === "sudden" || profile === "both";
      let ending = "";
      if (profile === "gradual") ending = P.outcomes.betterQualityGradualEnding;
      else if (includesShedding && !results.includes("less_shedding"))
        ending = P.outcomes.betterQualitySheddingEnding;
      const p2 = ending
        ? `${P.outcomes.betterQualityBase} ${ending}`
        : P.outcomes.betterQualityBase;
      outcomes.push(P.outcomes.betterQualityLead, p2);
    }
  }

  const anyPositive =
    results.includes("less_shedding") ||
    results.includes("more_fullness") ||
    results.includes("better_quality");

  let conclusion: string;
  if (results.includes("worsened")) conclusion = P.conclusions.worsened;
  else if (results.includes("no_result"))
    conclusion = sleepStress ? P.conclusions.noResultSleepStress : P.conclusions.noResult;
  else if (anyPositive) conclusion = P.conclusions.positive;
  else conclusion = P.conclusions.noResult;

  // Reference `negative` to keep title selection explicit and lint-clean.
  const title = negative ? P.titleNegative : P.titlePositive;

  return { title, intro, treatments: treatmentBlocks, verdicts, duration, outcomes, conclusion };
}

/** Hair-cycle stage line for the summary card: use the onset that matters for
 *  the profile (shedding for sudden, thinning for gradual, the older of the two
 *  for both). */
function summaryStage(a: RawAnswers, profile: Profile): string | null {
  let onset: string | undefined;
  if (profile === "sudden") onset = a.shedding_onset;
  else if (profile === "gradual") onset = a.thinning_onset;
  else {
    const t = a.thinning_onset ? ONSET_RANK[a.thinning_onset] : 0;
    const s = a.shedding_onset ? ONSET_RANK[a.shedding_onset] : 0;
    onset = t >= s ? a.thinning_onset : a.shedding_onset;
  }
  return (onset && STAGE_LINE[onset]) || null;
}

/** "რაც სცადე" summary value — the tried-treatment headings joined, or null. */
function summaryTried(a: RawAnswers): string | null {
  const tried = asArray(a.previous_treatments).filter((t) => t !== "nothing_specific");
  const headings = tried
    .map((id) => PREV_TREATMENT.treatments[id]?.heading)
    .filter(Boolean) as string[];
  return headings.length ? headings.join(", ") : null;
}

function buildSummary(a: RawAnswers, profile: Profile, c: ProfileCopy): SummaryData {
  return {
    cause: c.summaryCause,
    stage: summaryStage(a, profile),
    tried: summaryTried(a),
    missing: c.whatsMissing,
  };
}

/** Build the full verified_high_fit narrative, or null if the answers do not
 *  resolve to a hair-change profile (should not happen for a VHF result). */
export function buildVhfNarrative(a: RawAnswers): VhfNarrative | null {
  const profile = selectProfile(a);
  if (!profile) return null;
  const c: ProfileCopy = profile === "sudden" ? SUDDEN : profile === "gradual" ? GRADUAL : BOTH;
  return {
    profile,
    summary: buildSummary(a, profile, c),
    mechanism: mechanismSection(a, c),
    mechanismTakeaway: c.mechanismTakeaway,
    progression: progressionSection(a, profile),
    progressionTakeaway: c.progressionTakeaway,
    prevTreatment: prevTreatmentSection(a, profile),
  };
}
