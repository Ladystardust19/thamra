import type { RawAnswers } from "@/lib/scoring";
import type { Answers as LegacyAnswers } from "@/lib/legacyScoring";

/**
 * Bridge v2 quiz answers onto the legacy result screen's answer shape.
 *
 * The legacy screen + legacyScoring read old-quiz keys (q1–q12) that the v2
 * quiz never produces, so without this map every non-VHF result renders the
 * same default (no personalization). The mapping is deliberately APPROXIMATE —
 * the two quizzes ask different questions — but enough to drive personalized
 * menopause-connection, hair-stress, hair-change and comparison sections.
 *
 * TODO: replace with proper v2 non-VHF result pages once their copy ships.
 */
const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const pick = (map: Record<string, string>, key: unknown): string | undefined =>
  typeof key === "string" ? map[key] : undefined;

const AGE: Record<string, string> = {
  under_40: "a1_le44",
  age_40_45: "a1_le44",
  age_46_50: "a1_45_49",
  age_51_55: "a1_50_55",
  age_56_60: "a1_ge56",
  over_60: "a1_ge56",
};

const CYCLE: Record<string, string> = {
  regular: "a2_regular",
  irregular: "a2_irregular",
  stopped_under_12_months: "a2_stopped_1_5",
  stopped_over_12_months: "a2_stopped_1_5",
};

export function v2ToLegacyAnswers(v2: RawAnswers): LegacyAnswers {
  const symptoms = arr(v2.associated_symptoms);
  const triggers = arr(v2.possible_triggers);
  const treatments = arr(v2.previous_treatments);
  const ct = v2.hair_change_type;
  const a: LegacyAnswers = {};

  // q1 — age band
  a.q1 = pick(AGE, v2.age_group);

  // q2 — menstrual stage
  a.q2 = pick(CYCLE, v2.menstrual_cycle);

  // q3 — accompanying symptoms (multi)
  const q3: string[] = [];
  if (symptoms.includes("hot_flashes")) q3.push("a3_meno");
  if (symptoms.includes("worse_sleep")) q3.push("a3_sleep");
  if (symptoms.includes("stress_anxiety")) q3.push("a3_stress");
  a.q3 = q3.length ? q3 : ["a3_none"];

  // q4 — timing vs menopause, approximated from the cycle-connection answer
  a.q4 =
    v2.perceived_cycle_connection === "yes"
      ? "a4_same"
      : v2.perceived_cycle_connection === "no"
      ? "a4_1_3"
      : "a4_unknown";

  // q5 — visual change (multi), from the coarse v2 change type
  const q5: string[] = [];
  if (ct === "sudden_shedding" || ct === "both") q5.push("a5_shedding");
  if (ct === "gradual_thinning" || ct === "both") q5.push("a5_volume");
  a.q5 = q5.length ? q5 : ["a5_shedding"];

  // q7 — development / onset
  a.q7 = ct === "sudden_shedding" ? "a7_sudden" : "a7_1_3";

  // q8 — visible severity (bald patch is the strongest v2 signal)
  a.q8 = v2.bald_patches === "yes" ? "a8_bald" : "a8_wider";

  // q9 — fibre quality (thinning ⇒ finer)
  if (ct === "gradual_thinning" || ct === "both") a.q9 = "a9_finer";

  // q10 — red-flag signs (keeps legacy redFlag aligned with the v2 model)
  a.q10 =
    v2.bald_patches === "yes"
      ? "a10_patches"
      : v2.scalp_warning_signs === "yes"
      ? "a10_scalp"
      : undefined;

  // q11 — competing cause
  a.q11 =
    triggers.includes("illness_or_virus") || triggers.includes("surgery")
      ? "a11_illness"
      : triggers.includes("rapid_weight_loss")
      ? "a11_weightloss"
      : undefined;

  // q12 — treatments tried (multi → legacy categories)
  const q12 = new Set<string>();
  for (const t of treatments) {
    if (t === "nothing_specific") continue;
    if (t === "minoxidil" || t === "topical_products") q12.add("a12_minox");
    else if (t === "plasma_therapy" || t === "mesotherapy") q12.add("a12_proc");
    else q12.add("a12_supp"); // vitamins / biotin / individual nutrients
  }
  a.q12 = q12.size ? Array.from(q12) : ["a12_none"];

  return a;
}
