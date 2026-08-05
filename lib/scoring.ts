/* ============================================================================
 * THAMRA hair assessment — QUIZ v2 (thamra_quiz_v2_2026_08)
 * ----------------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH for the live quiz:
 *   - QUESTIONS        — the 19 questions, stable ids, Georgian labels
 *   - SCORING_CONFIG   — every point table + threshold (edit numbers here only)
 *   - computeResult()  — pure: raw answers → result snapshot (scores + flags)
 *   - computeTriageStatus() — pure: result → operational triage_status
 *   - visibleQuestions / pruneHiddenAnswers — branching + hidden-answer cleanup
 *   - humanizeAnswers  — option codes → Georgian labels (for admin readability)
 *
 * IMPORTANT: logic keys off stable option ids, NEVER visible question numbers or
 * display labels. All functions are pure (no DOM, no imports) so they are unit
 * testable and safe to run on the server.
 * ========================================================================== */

export const QUIZ_VERSION = "thamra_quiz_v2_2026_08";

// ─── Types ──────────────────────────────────────────────────────────────────

export type QuestionType = "single" | "multi" | "rating";

export interface Option {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  /** Sub-line under the title (e.g. "მონიშნე ყველა შესაბამისი პასუხი."). */
  helper?: string;
  /** Leading phrase rendered before the options (Q19: "მსურს:"). */
  prefix?: string;
  /** single / multi only. */
  options?: Option[];
  /** multi only — ids that clear all other selections when picked (and are
   *  themselves cleared when any non-exclusive option is picked). */
  exclusiveOptions?: string[];
  /** rating only. */
  min?: number;
  max?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  /** Return false to hide this question for the given answers. */
  showIf?: (a: RawAnswers) => boolean;
}

/** Raw answers keyed by stable question id. single → string, multi → string[],
 *  rating → number. */
export type RawAnswers = {
  age_group?: string;
  menstrual_cycle?: string;
  hair_change_type?: string;
  associated_symptoms?: string[];
  perceived_cycle_connection?: string;
  thinning_onset?: string;
  shedding_onset?: string;
  previous_hair_history?: string;
  possible_triggers?: string[];
  bald_patches?: string;
  scalp_warning_signs?: string;
  doctor_visit?: string;
  tests_completed?: string[];
  test_results?: string[];
  previous_treatments?: string[];
  longest_treatment_duration?: string;
  previous_treatment_results?: string[];
  concern_level?: number;
  primary_goal?: string;
  [key: string]: string | string[] | number | undefined;
};

/** Back-compat alias — some callers/imports still reference `Answers`. */
export type Answers = RawAnswers;

export type FitLevel = "low" | "moderate" | "high";
export type ScreeningStatus = "untested" | "incomplete" | "complete" | "verified_normal";
export type BuyingUrgency = "low" | "moderate" | "high" | "very_high";
export type TriageStatus = "refer_out" | "needs_labs" | "qualified";

export type FitCategory =
  | "no_current_change"
  | "medical_referral"
  | "medical_review"
  | "deficiency_first"
  | "potential_high_fit_unverified"
  | "unverified"
  | "verified_high_fit"
  | "mixed_fit"
  | "possible_fit"
  | "low_fit";

/** Coarse grouping over fitCategory — useful for the (future) result page. */
export type ResultType = "medical" | "deficiency" | "unverified" | "product" | "no_change";

export interface QuizResult {
  symptomFitScore: number;
  menopauseFitScore: number;
  symptomFitLevel: FitLevel;
  menopauseFitLevel: FitLevel;
  screeningStatus: ScreeningStatus;
  minimumScreeningComplete: boolean;
  redFlag: boolean;
  manualReview: boolean;
  medicalReview: boolean;
  deficiencyIdentified: boolean;
  strongCompetingTrigger: boolean;
  expectationFlag: boolean;
  noCurrentHairChange: boolean;
  buyingUrgency: BuyingUrgency;
  fitCategory: FitCategory;
  resultType: ResultType;
}

// ─── Scoring config — the only place numbers/thresholds live ─────────────────

export const SCORING_CONFIG = {
  menopauseFit: {
    age: {
      under_40: 0,
      age_40_45: 1,
      age_46_50: 2,
      age_51_55: 3,
      age_56_60: 2,
      over_60: 1,
    } as Record<string, number>,
    cycle: {
      regular: 0,
      irregular: 3,
      stopped_under_12_months: 3,
      stopped_over_12_months: 2,
    } as Record<string, number>,
    associatedSymptoms: {
      hot_flashes: 2,
      worse_sleep: 1,
      stress_anxiety: 1,
    } as Record<string, number>,
    associatedSymptomsCap: 3,
    perceivedConnection: {
      direct: 2,
      partial: 1,
      unsure: 0,
      none: 0,
    } as Record<string, number>,
    triggers: {
      menopause_changes: 2,
      worse_sleep: 1,
      major_stress: 1,
    } as Record<string, number>,
    triggersCap: 3,
  },

  symptomFit: {
    hairChangeType: {
      sudden_shedding: 3,
      both: 3,
      gradual_thinning: 1,
      no_change: 0,
    } as Record<string, number>,
    thinningOnset: {
      months_1_3: 2,
      months_3_6: 2,
      months_6_12: 1,
      years_1_3: 0,
    } as Record<string, number>,
    sheddingOnset: {
      months_1_3: 3,
      months_3_6: 2,
      months_6_12: 1,
      over_1_year: 0,
    } as Record<string, number>,
    history: {
      new_problem: 3,
      previous_but_worse_now: 2,
      recurrent: 1,
      longstanding: 0,
    } as Record<string, number>,
  },

  // Fit-level thresholds (inclusive lower bounds).
  levels: {
    menopause: { high: 10, moderate: 6 }, // high ≥10, moderate 6–9, low 0–5
    symptom: { high: 7, moderate: 4 }, //     high ≥7,  moderate 4–6, low 0–3
  },

  // Buying urgency from the 1–10 concern rating.
  urgency: { moderate: 4, high: 7, veryHigh: 9 },

  // Flag-driving option sets.
  strongCompetingTriggers: ["illness_or_virus", "surgery", "rapid_weight_loss", "medication_change"],
  minimumScreeningTests: ["cbc", "ferritin_iron", "thyroid"],
  deficiencyResults: ["iron_ferritin_deficiency", "vitamin_d_deficiency", "zinc_deficiency"],
  medicalReviewResults: ["thyroid_abnormality", "hormonal_change"],
};

// ─── Questions — stable ids + Georgian text ─────────────────────────────────

/** Treatments in Q15 other than "nothing_specific". */
export function hasRealTreatment(list: unknown): boolean {
  return Array.isArray(list) && list.some((v) => v !== "nothing_specific");
}

const notNoChange = (a: RawAnswers) => a.hair_change_type !== "no_change";

export const QUESTIONS: Question[] = [
  {
    id: "age_group",
    type: "single",
    title: "რამდენი წლის ხარ?",
    options: [
      { id: "under_40", label: "40 წლამდე" },
      { id: "age_40_45", label: "40–45 წლის" },
      { id: "age_46_50", label: "46–50 წლის" },
      { id: "age_51_55", label: "51–55 წლის" },
      { id: "age_56_60", label: "56–60 წლის" },
      { id: "over_60", label: "60 წელზე მეტი" },
    ],
  },
  {
    id: "menstrual_cycle",
    type: "single",
    title: "როგორ შეიცვალა შენი მენსტრუალური ციკლი?",
    options: [
      { id: "regular", label: "ციკლი ისევ რეგულარულია" },
      { id: "irregular", label: "ციკლი გახდა არარეგულარული" },
      { id: "stopped_under_12_months", label: "შემიწყდა 12 თვეზე ნაკლები ხნის წინ" },
      { id: "stopped_over_12_months", label: "შემიწყდა 12 თვეზე მეტი ხნის წინ" },
    ],
  },
  {
    id: "hair_change_type",
    type: "single",
    title: "რომელი აღწერს ყველაზე ზუსტად შენი თმის ამჟამინდელ ცვლილებას?",
    options: [
      { id: "sudden_shedding", label: "უეცრად დამეწყო თმის ცვენა" },
      { id: "gradual_thinning", label: "თმა თანდათან უფრო შეთხელებული გახდა" },
      { id: "both", label: "ორივე" },
      { id: "no_change", label: "არ შეცვლილა" },
    ],
  },
  {
    id: "associated_symptoms",
    type: "multi",
    title: "თმის ცვლილებასთან ერთად რას ამჩნევ?",
    helper: "მონიშნე ყველა შესაბამისი პასუხი.",
    exclusiveOptions: ["none"],
    showIf: notNoChange,
    options: [
      { id: "hot_flashes", label: "ალებს ან ღამის ოფლიანობას" },
      { id: "worse_sleep", label: "ძილის გაუარესებას" },
      { id: "stress_anxiety", label: "სტრესს, შფოთვას ან გაღიზიანებას" },
      { id: "none", label: "არცერთ ჩამოთვლილს" },
    ],
  },
  {
    id: "perceived_cycle_connection",
    type: "single",
    title: "უკავშირებ თუ არა შენი თმის ცვლილებას მენსტრუალური ციკლის ცვლილებას?",
    showIf: (a) =>
      notNoChange(a) &&
      (a.menstrual_cycle === "irregular" ||
        a.menstrual_cycle === "stopped_under_12_months" ||
        a.menstrual_cycle === "stopped_over_12_months"),
    options: [
      { id: "direct", label: "პირდაპირ ვუკავშირებ მენსტრუალური ციკლის ცვლილებას" },
      { id: "partial", label: "ნაწილობრივ ვუკავშირებ მენსტრუალური ციკლის ცვლილებას და სხვა ფაქტორებს" },
      { id: "unsure", label: "არ ვარ დარწმუნებული" },
      { id: "none", label: "მენსტრუალური ციკლის ცვლილებას საერთოდ არ ვუკავშირებ" },
    ],
  },
  {
    id: "thinning_onset",
    type: "single",
    title: "როდის დაგეწყო პირველად თმის შეთხელება?",
    showIf: (a) => a.hair_change_type === "gradual_thinning" || a.hair_change_type === "both",
    options: [
      { id: "months_1_3", label: "1–3 თვის წინ" },
      { id: "months_3_6", label: "3–6 თვის წინ" },
      { id: "months_6_12", label: "6–12 თვის წინ" },
      { id: "years_1_3", label: "1–3 წლის წინ" },
    ],
  },
  {
    id: "shedding_onset",
    type: "single",
    title: "როდის დაგეწყო პირველად თმის ცვენა?",
    showIf: (a) => a.hair_change_type === "sudden_shedding" || a.hair_change_type === "both",
    options: [
      { id: "months_1_3", label: "1–3 თვის წინ" },
      { id: "months_3_6", label: "3–6 თვის წინ" },
      { id: "months_6_12", label: "6–12 თვის წინ" },
      { id: "over_1_year", label: "1 წელზე მეტი ხნის წინ" },
    ],
  },
  {
    id: "previous_hair_history",
    type: "single",
    title: "თმის ცვენა ან შეთხელება წარსულშიც გქონია?",
    showIf: notNoChange,
    options: [
      { id: "new_problem", label: "ახლად დაიწყო — მანამდე მსგავსი პრობლემა არ მქონია" },
      { id: "previous_but_worse_now", label: "წარსულშიც მქონია, მაგრამ ახლა უფრო შესამჩნევი გახდა" },
      { id: "recurrent", label: "წარსულშიც პერიოდულად მქონდა და შემდეგ უმჯობესდებოდა" },
      { id: "longstanding", label: "დიდი ხანია მუდმივად მაწუხებს" },
    ],
  },
  {
    id: "possible_triggers",
    type: "multi",
    title: "დაემთხვა თუ არა თმის ცვლილების დაწყება რომელიმე ჩამოთვლილ მოვლენას?",
    helper: "მონიშნე ყველა შესაბამისი პასუხი.",
    exclusiveOptions: ["none"],
    showIf: notNoChange,
    options: [
      { id: "menopause_changes", label: "მენსტრუალური ციკლის ცვლილებას ან მენოპაუზის სიმპტომებს" },
      { id: "worse_sleep", label: "ძილის გაუარესებას" },
      { id: "major_stress", label: "ძლიერ ან ხანგრძლივ სტრესს" },
      { id: "illness_or_virus", label: "ავადმყოფობას ან ვირუსს" },
      { id: "surgery", label: "ოპერაციას" },
      { id: "rapid_weight_loss", label: "სწრაფ წონაში კლებას ან მკაცრ დიეტას" },
      { id: "medication_change", label: "ახალი მედიკამენტის დაწყებას ან შეწყვეტას" },
      { id: "none", label: "არცერთს" },
    ],
  },
  {
    id: "bald_patches",
    type: "single",
    title: "გაქვს თუ არა ერთი ან რამდენიმე სრულიად გამელოტებული უბანი?",
    showIf: notNoChange,
    options: [
      { id: "yes", label: "დიახ" },
      { id: "no", label: "არა" },
      { id: "unsure", label: "ზუსტად ვერ ვაფასებ" },
    ],
  },
  {
    id: "scalp_warning_signs",
    type: "single",
    title: "გაქვს თუ არა თავის კანის ტკივილი, ძლიერი სიწითლე ან ნაწიბურის მსგავსი უბნები?",
    showIf: notNoChange,
    options: [
      { id: "yes", label: "დიახ" },
      { id: "no", label: "არა" },
      { id: "unsure", label: "ზუსტად ვერ ვაფასებ" },
    ],
  },
  {
    id: "doctor_visit",
    type: "single",
    title: "მიგიმართავს თუ არა ექიმისთვის თმის ცვენის ან შეთხელების გამო?",
    showIf: notNoChange,
    options: [
      { id: "doctor_and_tests", label: "დიახ, ექიმთან ვიყავი და კვლევებიც ჩავიტარე" },
      { id: "doctor_no_tests", label: "დიახ, ექიმთან ვიყავი, მაგრამ კვლევები არ ჩამიტარებია" },
      { id: "no_doctor", label: "არა, ექიმთან ჯერ არ ვყოფილვარ" },
    ],
  },
  {
    id: "tests_completed",
    type: "multi",
    title: "რომელი კვლევები ჩაიტარე?",
    helper: "მონიშნე ყველა შესაბამისი პასუხი.",
    showIf: (a) => a.doctor_visit === "doctor_and_tests",
    options: [
      { id: "cbc", label: "სისხლის საერთო ანალიზი" },
      { id: "ferritin_iron", label: "ფერიტინი და რკინის მაჩვენებლები" },
      { id: "thyroid", label: "ფარისებრი ჯირკვლის ფუნქცია — TSH/FT4" },
      { id: "vitamin_d", label: "D ვიტამინი" },
      { id: "b12_folate", label: "B12 ვიტამინი ან ფოლატი" },
      { id: "zinc", label: "თუთია" },
      { id: "hormonal_tests", label: "ჰორმონალური კვლევები" },
      { id: "other_test", label: "სხვა კვლევა" },
    ],
  },
  {
    id: "test_results",
    type: "multi",
    title: "რა აჩვენა კვლევის პასუხებმა?",
    helper: "მონიშნე ყველა შესაბამისი პასუხი.",
    exclusiveOptions: ["all_normal", "none_listed"],
    showIf: (a) => a.doctor_visit === "doctor_and_tests",
    options: [
      { id: "all_normal", label: "ყველა შემოწმებული მაჩვენებელი ნორმაში იყო" },
      { id: "iron_ferritin_deficiency", label: "რკინის ან ფერიტინის დეფიციტი გამოვლინდა" },
      { id: "vitamin_d_deficiency", label: "D ვიტამინის დეფიციტი გამოვლინდა" },
      { id: "zinc_deficiency", label: "თუთიის დეფიციტი გამოვლინდა" },
      { id: "thyroid_abnormality", label: "ფარისებრი ჯირკვლის დარღვევა გამოვლინდა" },
      { id: "hormonal_change", label: "ჰორმონალური ცვლილება გამოვლინდა" },
      { id: "none_listed", label: "არცერთი ჩამოთვლილი ცვლილება" },
    ],
  },
  {
    id: "previous_treatments",
    type: "multi",
    title: "კონკრეტულად რა გამოგიყენებია?",
    helper: "მონიშნე ყველა შესაბამისი პასუხი.",
    exclusiveOptions: ["nothing_specific"],
    showIf: notNoChange,
    options: [
      { id: "general_hair_vitamins", label: "თმის, კანისა და ფრჩხილის ვიტამინები" },
      { id: "biotin", label: "ბიოტინი" },
      { id: "individual_nutrients", label: "რკინა, D ვიტამინი, თუთია ან სხვა ცალკეული დანამატი" },
      { id: "minoxidil", label: "მინოქსიდილი" },
      { id: "plasma_therapy", label: "პლაზმოთერაპია" },
      { id: "mesotherapy", label: "მეზოთერაპია" },
      { id: "topical_products", label: "სამკურნალო შამპუნი, შრატი ან ლოსიონი" },
      { id: "nothing_specific", label: "სპეციალურად არაფერი გამომიყენებია" },
    ],
  },
  {
    id: "longest_treatment_duration",
    type: "single",
    title: "რამდენ ხანს იყენებდი ყველაზე ხანგრძლივად გამოყენებულ საშუალებას?",
    showIf: (a) => hasRealTreatment(a.previous_treatments),
    options: [
      { id: "under_1_month", label: "ერთ თვეზე ნაკლები" },
      { id: "months_1_3", label: "1–3 თვე" },
      { id: "months_3_6", label: "3–6 თვე" },
      { id: "months_6_12", label: "6–12 თვე" },
    ],
  },
  {
    id: "previous_treatment_results",
    type: "multi",
    title: "რა შედეგი მიიღე ყველაზე ხანგრძლივად გამოყენებული საშუალებით?",
    helper: "მონიშნე ყველა შესაბამისი პასუხი.",
    exclusiveOptions: ["no_result", "worsened"],
    showIf: (a) => hasRealTreatment(a.previous_treatments),
    options: [
      { id: "less_shedding", label: "თმის ცვენა აშკარად შემცირდა" },
      { id: "more_fullness", label: "თმა უფრო სავსე ან მოცულობითი გახდა" },
      { id: "better_quality", label: "თმის ხარისხი ან სიმტკიცე გაუმჯობესდა" },
      { id: "no_result", label: "შედეგი ვერ შევამჩნიე" },
      { id: "worsened", label: "მდგომარეობა გაუარესდა" },
    ],
  },
  {
    id: "concern_level",
    type: "rating",
    title: "რამდენად გაწუხებს შენი თმის ამჟამინდელი მდგომარეობა?",
    helper: "შეაფასე 1-დან 10-მდე.",
    min: 1,
    max: 10,
    step: 1,
    minLabel: "თითქმის არ მაწუხებს",
    maxLabel: "ძალიან მაწუხებს და მსურს დროულად ვიმოქმედო",
  },
  {
    id: "primary_goal",
    type: "single",
    title: "რომელი შედეგია შენთვის ახლა ყველაზე მნიშვნელოვანი?",
    prefix: "მსურს:",
    options: [
      { id: "reduce_shedding", label: "ყოველდღიური თმის ცვენა შემცირდეს" },
      { id: "prevent_worsening", label: "თმის მდგომარეობა აღარ გაუარესდეს" },
      { id: "more_fullness", label: "თმა უფრო სავსე და მოცულობითი გახდეს" },
      { id: "major_regrowth", label: "დაკარგული თმის დიდი ნაწილი თავიდან ამომივიდეს" },
    ],
  },
];

// ─── Branching / hidden-answer cleanup ──────────────────────────────────────

/** Questions relevant to the current answers (conditional questions folded in). */
export function visibleQuestions(answers: RawAnswers): Question[] {
  return QUESTIONS.filter((q) => typeof q.showIf !== "function" || q.showIf(answers));
}

export function isQuestionVisible(id: string, answers: RawAnswers): boolean {
  const q = QUESTIONS.find((x) => x.id === id);
  if (!q) return false;
  return typeof q.showIf !== "function" || q.showIf(answers);
}

/**
 * Remove answers for questions that are no longer visible. Question dependencies
 * only ever point at earlier questions, so a single forward pass (mutating the
 * working copy as it goes) fully settles the cleanup — e.g. switching
 * hair_change_type to no_change drops every downstream answer.
 */
export function pruneHiddenAnswers(answers: RawAnswers): RawAnswers {
  const out: RawAnswers = { ...answers };
  for (const q of QUESTIONS) {
    if (typeof q.showIf === "function" && !q.showIf(out)) {
      delete out[q.id];
    }
  }
  return out;
}

/** Apply a multi-select toggle honouring the question's exclusive options. */
export function toggleMultiValue(current: string[], value: string, exclusive: string[] = []): string[] {
  const isExclusive = exclusive.includes(value);
  if (isExclusive) {
    return current.includes(value) ? [] : [value];
  }
  let next = current.filter((x) => !exclusive.includes(x)); // picking a normal option clears exclusives
  next = next.includes(value) ? next.filter((x) => x !== value) : [...next, value];
  return next;
}

// ─── Scoring helpers ────────────────────────────────────────────────────────

function asArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}

function sumCapped(ids: string[], table: Record<string, number>, cap: number): number {
  const raw = ids.reduce((acc, id) => acc + (table[id] || 0), 0);
  return Math.min(raw, cap);
}

function menopauseFitLevel(score: number): FitLevel {
  const t = SCORING_CONFIG.levels.menopause;
  if (score >= t.high) return "high";
  if (score >= t.moderate) return "moderate";
  return "low";
}

function symptomFitLevel(score: number): FitLevel {
  const t = SCORING_CONFIG.levels.symptom;
  if (score >= t.high) return "high";
  if (score >= t.moderate) return "moderate";
  return "low";
}

function buyingUrgencyFor(concern: number | undefined): BuyingUrgency {
  const c = typeof concern === "number" ? concern : 0;
  const u = SCORING_CONFIG.urgency;
  if (c >= u.veryHigh) return "very_high";
  if (c >= u.high) return "high";
  if (c >= u.moderate) return "moderate";
  return "low";
}

export function computeMenopauseFitScore(a: RawAnswers): number {
  const C = SCORING_CONFIG.menopauseFit;
  let s = 0;
  s += (a.age_group && C.age[a.age_group]) || 0;
  s += (a.menstrual_cycle && C.cycle[a.menstrual_cycle]) || 0;
  s += sumCapped(asArray(a.associated_symptoms), C.associatedSymptoms, C.associatedSymptomsCap);
  s += (a.perceived_cycle_connection && C.perceivedConnection[a.perceived_cycle_connection]) || 0;
  s += sumCapped(asArray(a.possible_triggers), C.triggers, C.triggersCap);
  return s;
}

export function computeSymptomFitScore(a: RawAnswers): number {
  const C = SCORING_CONFIG.symptomFit;
  let s = 0;
  s += (a.hair_change_type && C.hairChangeType[a.hair_change_type]) || 0;
  // Onset: use the HIGHER of thinning / shedding onset (never add both).
  const thinning = (a.thinning_onset && C.thinningOnset[a.thinning_onset]) || 0;
  const shedding = (a.shedding_onset && C.sheddingOnset[a.shedding_onset]) || 0;
  s += Math.max(thinning, shedding);
  s += (a.previous_hair_history && C.history[a.previous_hair_history]) || 0;
  return s;
}

export function computeMinimumScreeningComplete(a: RawAnswers): boolean {
  const tests = asArray(a.tests_completed);
  return SCORING_CONFIG.minimumScreeningTests.every((t) => tests.includes(t));
}

export function computeScreeningStatus(a: RawAnswers): ScreeningStatus {
  if (a.doctor_visit !== "doctor_and_tests") return "untested";
  const minimumComplete = computeMinimumScreeningComplete(a);
  const results = asArray(a.test_results);
  if (results.includes("all_normal")) {
    return minimumComplete ? "verified_normal" : "incomplete";
  }
  if (!minimumComplete) return "incomplete";
  // Minimum screening done but findings are not "all normal" (deficiency /
  // medical abnormality / none-listed). Those are surfaced via flags; the status
  // itself is simply "complete".
  return "complete";
}

// ─── Fit category (priority-ordered, total) ─────────────────────────────────

export function computeFitCategory(r: {
  noCurrentHairChange: boolean;
  redFlag: boolean;
  medicalReview: boolean;
  deficiencyIdentified: boolean;
  strongCompetingTrigger: boolean;
  screeningStatus: ScreeningStatus;
  symptomFitLevel: FitLevel;
  menopauseFitLevel: FitLevel;
}): FitCategory {
  if (r.noCurrentHairChange) return "no_current_change";
  if (r.redFlag) return "medical_referral";
  if (r.medicalReview) return "medical_review";
  if (r.deficiencyIdentified) return "deficiency_first";

  const bothHigh = r.symptomFitLevel === "high" && r.menopauseFitLevel === "high";
  const bothModeratePlus =
    r.symptomFitLevel !== "low" && r.menopauseFitLevel !== "low";

  if (r.screeningStatus === "untested" || r.screeningStatus === "incomplete") {
    return bothHigh ? "potential_high_fit_unverified" : "unverified";
  }

  if (r.screeningStatus === "verified_normal") {
    if (bothHigh) return r.strongCompetingTrigger ? "mixed_fit" : "verified_high_fit";
    if (bothModeratePlus) return "possible_fit";
    return "low_fit";
  }

  // screeningStatus === "complete" (findings present but not deficiency/medical,
  // e.g. none_listed → manualReview). Treated as unverified for fit purposes;
  // triage still routes it to needs_labs via manualReview.
  return bothHigh ? "potential_high_fit_unverified" : "unverified";
}

function resultTypeFor(fit: FitCategory): ResultType {
  switch (fit) {
    case "no_current_change":
      return "no_change";
    case "medical_referral":
    case "medical_review":
      return "medical";
    case "deficiency_first":
      return "deficiency";
    case "potential_high_fit_unverified":
    case "unverified":
      return "unverified";
    default:
      return "product";
  }
}

// ─── computeResult — pure ───────────────────────────────────────────────────

export function computeResult(answers: RawAnswers): QuizResult {
  const a = answers || {};

  const noCurrentHairChange = a.hair_change_type === "no_change";

  const symptomFitScore = computeSymptomFitScore(a);
  const menopauseFitScore = computeMenopauseFitScore(a);
  const symLevel = symptomFitLevel(symptomFitScore);
  const menoLevel = menopauseFitLevel(menopauseFitScore);

  const testResults = asArray(a.test_results);
  const triggers = asArray(a.possible_triggers);

  const redFlag = a.bald_patches === "yes" || a.scalp_warning_signs === "yes";
  const manualReview =
    a.bald_patches === "unsure" ||
    a.scalp_warning_signs === "unsure" ||
    testResults.includes("none_listed");
  const medicalReview = SCORING_CONFIG.medicalReviewResults.some((id) => testResults.includes(id));
  const deficiencyIdentified = SCORING_CONFIG.deficiencyResults.some((id) => testResults.includes(id));
  const strongCompetingTrigger = SCORING_CONFIG.strongCompetingTriggers.some((id) => triggers.includes(id));
  const expectationFlag = a.primary_goal === "major_regrowth";

  const minimumScreeningComplete = computeMinimumScreeningComplete(a);
  const screeningStatus = computeScreeningStatus(a);
  const buyingUrgency = buyingUrgencyFor(a.concern_level);

  const fitCategory = computeFitCategory({
    noCurrentHairChange,
    redFlag,
    medicalReview,
    deficiencyIdentified,
    strongCompetingTrigger,
    screeningStatus,
    symptomFitLevel: symLevel,
    menopauseFitLevel: menoLevel,
  });

  return {
    symptomFitScore,
    menopauseFitScore,
    symptomFitLevel: symLevel,
    menopauseFitLevel: menoLevel,
    screeningStatus,
    minimumScreeningComplete,
    redFlag,
    manualReview,
    medicalReview,
    deficiencyIdentified,
    strongCompetingTrigger,
    expectationFlag,
    noCurrentHairChange,
    buyingUrgency,
    fitCategory,
    resultType: resultTypeFor(fitCategory),
  };
}

// ─── Operational triage (persisted to quiz_leads.triage_status) ─────────────
// Keeps the EXISTING db strings (refer_out / needs_labs / qualified) so the
// admin CRM + Telegram alert pipeline keep working unchanged. This is a separate
// dimension from the customer-facing fitCategory — do not conflate them.

export function computeTriageStatus(result: QuizResult): TriageStatus {
  if (result.redFlag || result.medicalReview) return "refer_out";
  if (
    result.deficiencyIdentified ||
    result.screeningStatus === "untested" ||
    result.screeningStatus === "incomplete" ||
    result.manualReview
  ) {
    return "needs_labs";
  }
  return "qualified";
}

// ─── Consultation eligibility (safety gate for the temporary result screen) ──
// A red-flag or medical-review respondent must NEVER see the paid consultation
// CTA, and strongCompetingTrigger alone must not qualify anyone. The final
// customer-facing gating will be defined with the new result page.

export function qualifiesForConsultation(result: QuizResult): boolean {
  if (result.redFlag || result.medicalReview) return false;
  return (
    result.fitCategory === "verified_high_fit" ||
    result.fitCategory === "possible_fit" ||
    result.fitCategory === "potential_high_fit_unverified"
  );
}

// ─── Human-readable answers (for admin readability) ─────────────────────────
// The quiz stores option codes so scoring/branching key off stable ids. For
// anything a human reads back (the raw Supabase answers blob, the admin detail)
// convert each code to its Georgian label at save time. Ratings pass through as
// their numeric value.

const OPTION_LABEL: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const q of QUESTIONS) {
    for (const opt of q.options ?? []) map[opt.id] = opt.label;
  }
  return map;
})();

export const QUESTION_TITLE: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const q of QUESTIONS) map[q.id] = q.title;
  return map;
})();

export function optionLabel(code: string): string {
  return OPTION_LABEL[code] ?? code;
}

/**
 * Turn a raw answers blob (option codes) into the same shape but with Georgian
 * labels as values. Keys are preserved; unknown codes fall back to themselves;
 * numbers (ratings) pass through; non-answer metadata keys (prefixed with "_")
 * pass through untouched.
 */
export function humanizeAnswers(answers: Record<string, unknown>): Record<string, unknown> {
  const label = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map((x) => OPTION_LABEL[String(x)] ?? x);
    if (typeof v === "string") return OPTION_LABEL[v] ?? v;
    return v; // numbers (rating), booleans, etc.
  };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(answers)) {
    out[k] = k.startsWith("_") ? v : label(v);
  }
  return out;
}

// ─── Persistence payload (quiz_leads.answers) ───────────────────────────────
// Schema is unchanged: we keep storing human-readable Georgian labels at the top
// level for admin readability, and carry the version + raw codes + computed
// result snapshot + consent inside the same JSON under "_"-prefixed keys.

export interface ConsentSnapshot {
  accepted: boolean;
  accepted_at: string | null;
  policy_version: string;
}

export function buildLeadAnswers(
  raw: RawAnswers,
  result: QuizResult,
  consent: ConsentSnapshot,
): Record<string, unknown> {
  return {
    ...humanizeAnswers(raw),
    _quizVersion: QUIZ_VERSION,
    _raw: raw,
    _result: result,
    _consent: consent,
  };
}
