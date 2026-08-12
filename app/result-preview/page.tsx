import ResultScreen from "@/components/quiz/ResultScreen";
import LegacyResultScreen from "@/components/quiz/LegacyResultScreen";
import type { RawAnswers } from "@/lib/scoring";
import type { Answers as LegacyAnswers } from "@/lib/legacyScoring";

// Standalone preview of the result pages. Not linked anywhere; for review only.
//   ?profile=sudden|gradual|both   → new verified_high_fit page
//   ?profile=legacy                → re-skinned legacy page (with paid CTA)
//   ?profile=legacy-nocta          → re-skinned legacy page (expert-review close)
const SAMPLES: Record<string, RawAnswers> = {
  sudden: {
    hair_change_type: "sudden_shedding",
    associated_symptoms: ["hot_flashes", "worse_sleep"],
    shedding_onset: "months_3_6",
    previous_hair_history: "new_problem",
    previous_treatments: ["biotin", "minoxidil"],
    longest_treatment_duration: "months_3_6",
    previous_treatment_results: ["less_shedding"],
  },
  gradual: {
    hair_change_type: "gradual_thinning",
    associated_symptoms: ["stress_anxiety"],
    thinning_onset: "months_6_12",
    previous_hair_history: "previous_but_worse_now",
    previous_treatments: ["general_hair_vitamins", "topical_products"],
    longest_treatment_duration: "months_1_3",
    previous_treatment_results: ["no_result"],
  },
  both: {
    hair_change_type: "both",
    associated_symptoms: ["hot_flashes", "stress_anxiety"],
    thinning_onset: "years_1_3",
    shedding_onset: "months_3_6",
    previous_hair_history: "recurrent",
    previous_treatments: ["nothing_specific"],
  },
};

// Sample legacy answers — exercises every content branch (5 hair-change rows,
// a tried-treatment comparison category, sleep/stress signals).
const LEGACY_SAMPLE: LegacyAnswers = {
  q3: ["a3_sleep", "a3_stress"],
  q4: "a4_same",
  q5: ["a5_shedding", "a5_volume", "a5_partcrown"],
  q6: "a6_crown",
  q8: "a8_wider",
  q9: "a9_drier",
  q_emotion: "e_confidence",
  q12: ["a12_supp"],
  q13: "d_1_3",
  q14: "r_none",
  q15: "g_density",
};

export default function ResultPreviewPage({
  searchParams,
}: {
  searchParams: { profile?: string };
}) {
  const key = searchParams.profile ?? "sudden";

  if (key.startsWith("legacy")) {
    return (
      <main className="bg-cream">
        <LegacyResultScreen answers={LEGACY_SAMPLE} allowConsultationCta={key !== "legacy-nocta"} />
      </main>
    );
  }

  const answers = SAMPLES[key] ?? SAMPLES.sudden;
  return (
    <main className="bg-cream">
      <ResultScreen answers={answers} />
    </main>
  );
}
