import ResultScreen from "@/components/quiz/ResultScreen";
import LegacyResultScreen from "@/components/quiz/LegacyResultScreen";
import type { RawAnswers } from "@/lib/scoring";
import { v2ToLegacyAnswers } from "@/lib/legacyAdapter";

// Standalone preview of the result pages. Not linked anywhere; for review only.
//   ?profile=sudden|gradual|both   → new verified_high_fit page
//   ?profile=legacy                → non-VHF page (v2 answers → legacy adapter)
//   ?profile=legacy2               → a different non-VHF respondent (varies)
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

// v2 non-VHF respondents, routed through the adapter — proves the legacy screen
// now personalizes (these two produce visibly different results).
const LEGACY_V2: Record<string, RawAnswers> = {
  legacy: {
    age_group: "age_56_60",
    menstrual_cycle: "stopped_over_12_months",
    hair_change_type: "gradual_thinning",
    associated_symptoms: ["hot_flashes", "worse_sleep"],
    perceived_cycle_connection: "yes",
    previous_treatments: ["plasma_therapy"],
    bald_patches: "no",
    scalp_warning_signs: "no",
  },
  legacy2: {
    age_group: "age_46_50",
    menstrual_cycle: "irregular",
    hair_change_type: "sudden_shedding",
    associated_symptoms: ["stress_anxiety"],
    perceived_cycle_connection: "no",
    possible_triggers: ["major_stress"],
    previous_treatments: ["biotin"],
    bald_patches: "no",
    scalp_warning_signs: "no",
  },
};

export default function ResultPreviewPage({
  searchParams,
}: {
  searchParams: { profile?: string };
}) {
  const key = searchParams.profile ?? "sudden";

  if (key.startsWith("legacy")) {
    const v2 = LEGACY_V2[key] ?? LEGACY_V2.legacy;
    return (
      <main className="bg-cream">
        <LegacyResultScreen answers={v2ToLegacyAnswers(v2)} allowConsultationCta={false} />
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
