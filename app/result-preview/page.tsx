import ResultScreen from "@/components/quiz/ResultScreen";
import type { RawAnswers } from "@/lib/scoring";

// Standalone preview of the verified_high_fit result page. Not linked anywhere;
// for review only. Switch profile with ?profile=sudden|gradual|both.
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

export default function ResultPreviewPage({
  searchParams,
}: {
  searchParams: { profile?: string };
}) {
  const key = searchParams.profile ?? "sudden";
  const answers = SAMPLES[key] ?? SAMPLES.sudden;
  return (
    <main className="bg-cream">
      <ResultScreen answers={answers} />
    </main>
  );
}
