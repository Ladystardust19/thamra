/* ============================================================================
 * THAMRA menopause hair assessment — scoring + question data (TypeScript)
 * ----------------------------------------------------------------------------
 * Ported from the standalone prototype (thamra-quiz-prototype/scoring.js).
 * SINGLE SOURCE OF TRUTH for:
 *   - the questions and answer labels (Georgian)
 *   - the SCORING_CONFIG object (edit scores here, nothing else)
 *   - computeResult() — pure function, no DOM
 *
 * Treatment-history answers (previousTreatments / treatmentDuration /
 * previousTreatmentResult), emotionalImpact and desiredOutcome are stored for
 * personalization ONLY. They never touch menopauseConnectionScore /
 * hairStressScore / thamraFitScore / redFlag / competingCause.
 * ========================================================================== */

// ─── Types ──────────────────────────────────────────────────────────────────

export type Answers = {
  q1?: string;
  q2?: string;
  q2_surgical?: boolean;
  q3?: string[];
  q4?: string;
  q5?: string;
  q6?: string;
  q7?: string;
  q8?: string;
  q9?: string;
  q_emotion?: string;
  q10?: string;
  q11?: string;
  q12?: string[];
  q13?: string;
  q14?: string;
  q15?: string;
  [key: string]: string | string[] | boolean | undefined;
};

export interface Option {
  id: string;
  label: string;
  flagsRedFlag?: boolean;
  flagsCompeting?: boolean;
}

export interface Question {
  id: string;
  type: "single" | "multi";
  title: string;
  hint?: string;
  group?: string;
  noneOption?: string;
  options: Option[];
  secondary?: Option;
  showIf?: (a: Answers) => boolean;
}

export interface Level {
  index: number;
  label: string;
}

export interface ResultMessage {
  type: "redFlag" | "competingCause";
  text: string;
}

export interface Result {
  menopauseConnectionScore: number;
  hairStressScore: number;
  thamraFitScore: number;
  redFlag: boolean;
  competingCause: boolean;
  menoLevel: Level;
  hairStressLevel: Level;
  thamraLevel: Level;
  thamraContribFromMeno: number;
  previousTreatments: string[];
  treatmentDuration: string | null;
  previousTreatmentResult: string | null;
  desiredOutcome: string | null;
  emotionalImpact: string | null;
  preMenopause: boolean;
  strongestSymptom: string;
  personalization: string;
  treatmentJourney: string;
  messages: ResultMessage[];
  triggeredRules: string[];
}

// ─── Scoring config — the only place scoring numbers live ───────────────────

export const SCORING_CONFIG = {
  menopauseConnection: {
    age: { a1_le44: 0, a1_45_49: 2, a1_50_55: 2, a1_ge56: 1 } as Record<string, number>,
    menstrual: {
      a2_regular: 0,
      a2_irregular: 3,
      a2_stopped_1_5: 3,
      a2_stopped_5plus: 1,
    } as Record<string, number>,
    surgicalMenstrualScore: 3,
    symptoms: { a3_meno: 2, a3_sleep: 1, a3_stress: 1, a3_none: 0 } as Record<string, number>,
    symptomsCap: 2,
    timing: { a4_same: 4, a4_1_3: 2, a4_before: 0, a4_unknown: 1 } as Record<string, number>,
    preMenopauseHairPenalty: 2,
    levels: [
      { max: 3, label: "სუსტი კავშირი" },
      { max: 6, label: "შესაძლო კავშირი" },
      { max: 8, label: "მაღალი შესაბამისობა" },
      { max: 11, label: "ძალიან მაღალი შესაბამისობა" },
    ],
  },

  hairStress: {
    mainChange: { a5_shedding: 3, a5_volume: 3, a5_partcrown: 3, a5_finedry: 2 } as Record<string, number>,
    development: { a7_3_12: 2, a7_1_3: 3, a7_sudden: 3, a7_over3: 3 } as Record<string, number>,
    severity: { a8_selfonly: 1, a8_wider: 2, a8_scalp: 3, a8_bald: 4 } as Record<string, number>,
    fibre: { a9_finer: 2, a9_drier: 1, a9_breaks: 1, a9_several: 2 } as Record<string, number>,
    levels: [
      { max: 3, label: "დაბალი" },
      { max: 6, label: "საწყისი" },
      { max: 10, label: "მომატებული" },
      { max: 14, label: "მაღალი" },
    ],
  },

  thamraFit: {
    menoContribution: [
      { max: 3, pts: 0 },
      { max: 6, pts: 1 },
      { max: 8, pts: 3 },
      { max: 11, pts: 4 },
    ],
    hairChangeType: { a5_shedding: 3, a5_volume: 3, a5_partcrown: 3, a5_finedry: 2 } as Record<string, number>,
    stage: { a8_selfonly: 2, a8_wider: 2, a8_scalp: 1, a8_bald: 0 } as Record<string, number>,
    duration: { a7_3_12: 2, a7_1_3: 2, a7_sudden: 0, a7_over3: 0 } as Record<string, number>,
    safetyNoRedFlag: 1,
    levels: [
      { max: 3, label: "დაბალი შესაბამისობა" },
      { max: 6, label: "ნაწილობრივი შესაბამისობა" },
      { max: 9, label: "მაღალი შესაბამისობა" },
      { max: 12, label: "ძალიან მაღალი შესაბამისობა" },
    ],
  },

  redFlagOptions: ["a10_patches", "a10_scalp", "a10_recession"],
  competingCauseOptions: ["a11_iron", "a11_illness", "a11_weightloss"],
};

// ─── Questions — user-facing Georgian text ──────────────────────────────────

export const NONE_TRIED = "a12_none";

export function hasTriedTreatment(q12: unknown): boolean {
  if (!Array.isArray(q12)) return false;
  return q12.some((v) => v !== NONE_TRIED);
}

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    type: "single",
    title: "რამდენი წლის ხარ?",
    options: [
      { id: "a1_le44", label: "44 წლის ან ნაკლების" },
      { id: "a1_45_49", label: "45–49 წლის" },
      { id: "a1_50_55", label: "50–55 წლის" },
      { id: "a1_ge56", label: "56 წლის ან მეტის" },
    ],
  },
  {
    id: "q2",
    type: "single",
    title: "როგორ შეიცვალა შენი მენსტრუალური ციკლი?",
    options: [
      { id: "a2_regular", label: "ციკლი ისევ რეგულარულია" },
      { id: "a2_irregular", label: "ციკლი გახდა არარეგულარული" },
      { id: "a2_stopped_1_5", label: "მენსტრუაცია ბოლო 1–5 წლის განმავლობაში შეწყდა" },
      { id: "a2_stopped_5plus", label: "მენსტრუაცია 5 წელზე მეტი ხნის წინ შეწყდა ან ზუსტად არ ვიცი" },
    ],
  },
  {
    id: "q3",
    type: "multi",
    title: "თმის ცვლილებასთან ერთად რას ამჩნევ?",
    hint: "შესაძლებელია რამდენიმე პასუხის არჩევა.",
    noneOption: "a3_none",
    options: [
      { id: "a3_meno", label: "ალებს ან ღამის ოფლიანობას" },
      { id: "a3_sleep", label: "ძილის გაუარესებას" },
      { id: "a3_stress", label: "სტრესს, შფოთვას ან გაღიზიანებას" },
      { id: "a3_none", label: "არცერთ ჩამოთვლილს" },
    ],
  },
  {
    id: "q4",
    type: "single",
    title: "როდის დაიწყო შენი თმის ცვლილება?",
    options: [
      { id: "a4_same", label: "მენოპაუზის ნიშნებთან დაახლოებით ერთ პერიოდში" },
      { id: "a4_1_3", label: "მენოპაუზის ნიშნებიდან 1–3 წლის შემდეგ" },
      { id: "a4_before", label: "თმის პრობლემა მენოპაუზამდე მქონდა" },
      { id: "a4_unknown", label: "ზუსტად არ ვიცი" },
    ],
  },
  {
    id: "q5",
    type: "single",
    title: "რომელ ცვლილებას ამჩნევ ყველაზე მეტად?",
    options: [
      { id: "a5_shedding", label: "უფრო მეტი თმა მრჩება სავარცხელზე ან შხაპში" },
      { id: "a5_volume", label: "თმის საერთო ან კუდის მოცულობა შემცირდა" },
      { id: "a5_partcrown", label: "გაყოფის ხაზი ან გვირგვინი უფრო შესამჩნევი გახდა" },
      { id: "a5_finedry", label: "თმა გახდა უფრო თხელი, მშრალი ან მტვრევადი" },
    ],
  },
  {
    id: "q6",
    type: "single",
    title: "სად არის ცვლილება ყველაზე მეტად შესამჩნევი?",
    options: [
      { id: "a6_even", label: "მთელ თავზე თანაბრად" },
      { id: "a6_part", label: "შუა გაყოფის ხაზთან" },
      { id: "a6_crown", label: "გვირგვინის არეში" },
      { id: "a6_fibre", label: "ძირითადად თმის ღერის ხარისხში" },
    ],
  },
  {
    id: "q7",
    type: "single",
    title: "როგორ განვითარდა ცვლილება?",
    options: [
      { id: "a7_3_12", label: "თანდათანობით, ბოლო 3–12 თვეში" },
      { id: "a7_1_3", label: "თანდათანობით, ბოლო 1–3 წელში" },
      { id: "a7_sudden", label: "ძალიან მოულოდნელად და ძლიერად" },
      { id: "a7_over3", label: "უკვე 3 წელზე მეტია პროგრესირებს" },
    ],
  },
  {
    id: "q8",
    type: "single",
    title: "რამდენად შესამჩნევია გათხელება?",
    options: [
      { id: "a8_selfonly", label: "თმის საერთო მოცულობა ოდნავ შემცირდა, თუმცა გათხელება ჯერ მკაფიოდ არ ჩანს" },
      { id: "a8_wider", label: "გაყოფის ხაზი ოდნავ გაფართოვდა" },
      { id: "a8_scalp", label: "კანი ჩანს, თუმცა უბანზე თმა ჯერ კიდევ არის" },
      { id: "a8_bald", label: "მაქვს თითქმის მთლიანად ცარიელი უბანი" },
    ],
  },
  {
    id: "q9",
    type: "single",
    title: "როგორ შეიცვალა თმის ღერი?",
    options: [
      { id: "a9_finer", label: "უფრო თხელი და მოცულობის გარეშე გახდა" },
      { id: "a9_drier", label: "უფრო მშრალი ან უხეში გახდა" },
      { id: "a9_breaks", label: "უფრო ადვილად ტყდება" },
      { id: "a9_several", label: "რამდენიმე ცვლილებას ერთად ვამჩნევ" },
    ],
  },
  {
    // Emotional impact — how strongly she experiences the problem.
    // NOT scored; stored as emotionalImpact for personalization / segmentation.
    id: "q_emotion",
    type: "single",
    title: "როგორ მოქმედებს თმის ცვლილება შენზე?",
    options: [
      { id: "e_check", label: "ხშირად ვამოწმებ, რამდენი თმა დამრჩა სავარცხელზე ან შხაპში" },
      { id: "e_restyle", label: "ვცვლი გაყოფის ხაზს ან ვარცხნილობას გათხელების დასაფარად" },
      { id: "e_confidence", label: "თმის ცვლილება ჩემს თავდაჯერებასა და გარეგნობის აღქმაზე მოქმედებს" },
      { id: "e_mild", label: "მაწუხებს, მაგრამ ყოველდღიურ არჩევანზე ჯერ არ მოქმედებს" },
    ],
  },
  {
    id: "q10",
    type: "single",
    title: "ჩამოთვლილთაგან რომელიმე ხომ არ გეხება?",
    options: [
      { id: "a10_patches", label: "მაქვს მრგვალი ან სრულიად ცარიელი უბანი", flagsRedFlag: true },
      { id: "a10_scalp", label: "თავის კანი მტკივა, მეწვის ან ძალიან გაღიზიანებულია", flagsRedFlag: true },
      { id: "a10_recession", label: "თმის წინა ხაზი სწრაფად შეიცვალა ან წარბებიც შემცირდა", flagsRedFlag: true },
      { id: "a10_none", label: "არცერთი ჩამოთვლილი" },
    ],
  },
  {
    id: "q11",
    type: "single",
    title: "თმის ცვლილებასთან ერთად ხომ არ გაქვს რომელიმე ეს ფაქტორი?",
    options: [
      { id: "a11_iron", label: "რკინის დეფიციტი, ანემია ან ფარისებრი ჯირკვლის პრობლემა", flagsCompeting: true },
      { id: "a11_illness", label: "ბოლო თვეებში მძიმე ავადმყოფობა ან ოპერაცია", flagsCompeting: true },
      { id: "a11_weightloss", label: "სწრაფი წონის კლება, მკაცრი დიეტა ან ახალი მედიკამენტი", flagsCompeting: true },
      { id: "a11_none", label: "არცერთი ჩამოთვლილი ან ზუსტად არ ვიცი" },
    ],
  },

  /* ---- treatment history (personalization / analytics ONLY — no scoring) ---- */
  {
    id: "q12",
    type: "multi",
    group: "treatment",
    title: "აქამდე რა გიცდია თმის ცვენის ან გათხელებისთვის?",
    hint: "შესაძლებელია რამდენიმე პასუხის არჩევა.",
    noneOption: NONE_TRIED,
    options: [
      { id: "a12_supp", label: "ვიტამინები, საკვები დანამატები ან სპეციალური შამპუნები" },
      { id: "a12_minox", label: "მინოქსიდილი ან სხვა სპეციალური საშუალებები" },
      { id: "a12_proc", label: "PRP, მეზოთერაპია ან სხვა პროცედურები" },
      { id: NONE_TRIED, label: "სპეციალურად არაფერი მიცდია" },
    ],
  },
  {
    id: "q13",
    type: "single",
    group: "treatment",
    title: "ყველაზე ხანგრძლივად რამდენ ხანს იყენებდი რომელიმე ამ მიდგომას?",
    showIf: (a) => hasTriedTreatment(a.q12),
    options: [
      { id: "d_lt1", label: "1 თვეზე ნაკლების" },
      { id: "d_1_3", label: "დაახლოებით 1–3 თვე" },
      { id: "d_3_6", label: "დაახლოებით 3–6 თვე" },
      { id: "d_6plus", label: "6 თვეზე მეტი" },
    ],
  },
  {
    id: "q14",
    type: "single",
    group: "treatment",
    title: "რა ცვლილება შენიშნე გამოყენების პერიოდში?",
    showIf: (a) => hasTriedTreatment(a.q12),
    options: [
      { id: "r_none", label: "შესამჩნევი ცვლილება არ მქონია" },
      { id: "r_briefshed", label: "ცვენა მცირე დროით შემცირდა" },
      { id: "r_mild", label: "თმის ხარისხი ან მოცულობა მცირედ გაუმჯობესდა" },
      { id: "r_temporary", label: "შედეგი მქონდა, მაგრამ შემდეგ კვლავ გაუარესდა" },
    ],
  },

  /* ---- final desired outcome (personalization ONLY — no scoring) ---- */
  {
    id: "q15",
    type: "single",
    title: "თმის რომელი ცვლილება იქნებოდა შენთვის ყველაზე მნიშვნელოვანი?",
    options: [
      { id: "g_shedding", label: "ყოველდღიური ჭარბი ცვენის შემცირება" },
      { id: "g_fuller", label: "თმის უფრო სქელი და მოცულობითი იერი" },
      { id: "g_density", label: "გათხელებულ უბნებში სიმკვრივისა და ახალი ზრდის მხარდაჭერა" },
      { id: "g_stronger", label: "უფრო ძლიერი და ნაკლებად მტვრევადი თმა" },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function levelFor(value: number, levels: { max: number; label: string }[]): Level {
  for (let i = 0; i < levels.length; i++) {
    if (value <= levels[i].max) return { index: i, label: levels[i].label };
  }
  const last = levels.length - 1;
  return { index: last, label: levels[last].label };
}

function bandPts(value: number, bands: { max: number; pts: number }[]): number {
  for (let i = 0; i < bands.length; i++) {
    if (value <= bands[i].max) return bands[i].pts;
  }
  return bands[bands.length - 1].pts;
}

/** Questions relevant to the current answers (conditional questions folded in). */
export function visibleQuestions(answers: Answers): Question[] {
  return QUESTIONS.filter((q) => typeof q.showIf !== "function" || q.showIf(answers));
}

// ─── Text builders ──────────────────────────────────────────────────────────

export const STRONGEST_SYMPTOM: Record<string, string> = {
  a5_shedding: "ჭარბი ცვენა",
  a5_volume: "მოცულობის დაკარგვა",
  a5_partcrown: "გაყოფის ხაზისა და გვირგვინის გათხელება",
  a5_finedry: "თმის ღერის გათხელება და სიმშრალე",
};

export const OUTCOME_LABEL: Record<string, string> = {
  g_shedding: "ყოველდღიური ჭარბი ცვენის შემცირება",
  g_fuller: "თმის უფრო სქელი და მოცულობითი იერი",
  g_density: "გათხელებულ უბნებში სიმკვრივისა და ახალი ზრდის მხარდაჭერა",
  g_stronger: "უფრო ძლიერი და ნაკლებად მტვრევადი თმა",
};

const DISCLAIMER = "ეს შეფასება არ არის სამედიცინო დიაგნოზი და არ იძლევა თმის ზრდის გარანტიას.";

function buildPersonalization(x: {
  q5?: string;
  menoLevel: Level;
  hairStressLevel: Level;
  thamraLevel: Level;
  desiredOutcome: string | null;
  redFlag: boolean;
  competingCause: boolean;
  preMenopause: boolean;
}): string {
  const symptom = (x.q5 && STRONGEST_SYMPTOM[x.q5]) || "თმის ცვლილება";
  const parts: string[] = [];

  if (x.redFlag) {
    parts.push(
      symptom + " შენთვის ყველაზე შესამჩნევია და თმის სტრესის დონე შეფასდა, როგორც „" + x.hairStressLevel.label + "“."
    );
    parts.push(
      "ზოგიერთი ნიშანი, რომელიც აღნიშნე, ჯერ ექიმის დამატებით შეფასებას საჭიროებს, ამიტომ THAMRA-ს რეკომენდაციას ამ ეტაპზე არ ვაძლევთ."
    );
    parts.push(DISCLAIMER);
    return parts.join(" ");
  }

  parts.push(
    symptom + " შენი თმის მთავარი ცვლილებაა და თმის სტრესის დონე შეფასდა, როგორც „" + x.hairStressLevel.label + "“."
  );

  if (x.preMenopause) {
    parts.push("რადგან თმის ცვლილება მენოპაუზამდე დაიწყო, მას პირდაპირ მენოპაუზას არ ვუკავშირებთ.");
  } else {
    parts.push(
      "მენოპაუზასთან კავშირი შეფასდა, როგორც „" + x.menoLevel.label + "“, რაც მიუთითებს, თუ რამდენად შესაძლებელია ცვლილება ჰორმონულ ფონს უკავშირდებოდეს."
    );
  }

  let fit = "შენი მიზნის";
  if (x.desiredOutcome && OUTCOME_LABEL[x.desiredOutcome]) {
    fit += " — „" + OUTCOME_LABEL[x.desiredOutcome] + "“ —";
  }
  fit += " გათვალისწინებით, THAMRA-სთან შესაბამისობა შეფასდა, როგორც „" + x.thamraLevel.label + "“.";
  if (x.competingCause) {
    fit += " თუმცა შენს თმის ცვლილებაზე შესაძლოა ერთზე მეტი ფაქტორი მოქმედებდეს, ამიტომ დასკვნა სიფრთხილით უნდა შეფასდეს.";
  }
  parts.push(fit);
  parts.push(DISCLAIMER);
  return parts.join(" ");
}

function buildTreatmentJourney(x: {
  triedSomething: boolean;
  treatmentDuration: string | null;
  previousTreatmentResult: string | null;
}): string {
  if (!x.triedSomething) {
    return "თმის ცვლილებისთვის აქამდე სპეციალური მიდგომა არ გამოგიყენებია. ეს შეიძლება იყოს პირველი შემთხვევა, როდესაც პრობლემას უფრო სტრუქტურირებულად და თანმიმდევრულად უდგები.";
  }
  let base: string;
  switch (x.treatmentDuration) {
    case "d_lt1":
      base = "აქამდე გამოყენებული მიდგომა ძალიან მოკლე პერიოდის განმავლობაში სცადე. თმის ზრდის ციკლის გამო რამდენიმე კვირა ხშირად საკმარისი არ არის ცვლილების სრულფასოვნად შესაფასებლად.";
      break;
    case "d_1_3":
      base = "უკვე სცადე თმის ცვლილებაზე ზრუნვა, თუმცა ზოგიერთი შედეგის, განსაკუთრებით სიმკვრივისა და ახალი ზრდის ნიშნების შესაფასებლად, უფრო ხანგრძლივი დაკვირვება შეიძლება იყოს საჭირო.";
      break;
    case "d_3_6":
    case "d_6plus":
      base = "თმის ცვლილებაზე უკვე თანმიმდევრულად ზრუნავდი. შენი წინა გამოცდილება დაგვეხმარება, რომ შეფასება და შემდგომი რეკომენდაცია უფრო პერსონალიზებული იყოს.";
      break;
    default:
      base = "აქამდე უკვე სცადე თმის ცვლილებაზე ზრუნვა.";
  }
  if (x.previousTreatmentResult === "r_temporary") {
    base +=
      " შენიშნული გაუმჯობესება დროებითი აღმოჩნდა, ამიტომ მნიშვნელოვანია გავითვალისწინოთ არა მხოლოდ თმის ღერი, არამედ მენოპაუზური ცვლილებები, ფოლიკულის გარემო, სკალპი და საერთო კეთილდღეობა.";
  }
  return base;
}

function buildMessages(redFlag: boolean, competingCause: boolean): ResultMessage[] {
  const m: ResultMessage[] = [];
  if (redFlag) m.push({ type: "redFlag", text: "შენი პასუხები დამატებით შეფასებას საჭიროებს." });
  if (competingCause) m.push({ type: "competingCause", text: "შენს თმის ცვლილებაზე შესაძლოა ერთზე მეტი ფაქტორი მოქმედებდეს." });
  return m;
}

// ─── computeResult — pure ───────────────────────────────────────────────────

export function computeResult(answers: Answers): Result {
  const C = SCORING_CONFIG;
  const triggered: string[] = [];

  const q1 = answers.q1;
  const q2 = answers.q2;
  const surgical = !!answers.q2_surgical;
  const q3 = Array.isArray(answers.q3) ? answers.q3 : [];
  const q4 = answers.q4;
  const q5 = answers.q5;
  const q7 = answers.q7;
  const q8 = answers.q8;
  const q9 = answers.q9;
  const q10 = answers.q10;
  const q11 = answers.q11;

  /* ---- flags ---- */
  const redFlag = !!q10 && C.redFlagOptions.indexOf(q10) !== -1;
  const competingCause = !!q11 && C.competingCauseOptions.indexOf(q11) !== -1;
  if (redFlag) triggered.push("redFlag = true → ძლიერი THAMRA რეკომენდაცია არ ჩანს; დამატებითი შეფასების შეტყობინება");
  if (competingCause) triggered.push("competingCause = true → ნდობა შემცირდა; მრავალფაქტორული შეტყობინება");

  /* ---- menopause connection score ---- */
  let meno = 0;
  meno += (q1 && C.menopauseConnection.age[q1]) || 0;

  const menstrualPts = surgical
    ? C.menopauseConnection.surgicalMenstrualScore
    : (q2 && C.menopauseConnection.menstrual[q2]) || 0;
  if (surgical) triggered.push("ქირურგიული/სამედიცინო მენოპაუზა → მენსტრუალური ეტაპი = " + C.menopauseConnection.surgicalMenstrualScore);
  meno += menstrualPts;

  let symptomRaw = 0;
  q3.forEach((id) => {
    symptomRaw += C.menopauseConnection.symptoms[id] || 0;
  });
  const symptomPts = Math.min(symptomRaw, C.menopauseConnection.symptomsCap);
  if (symptomRaw > C.menopauseConnection.symptomsCap)
    triggered.push("სიმპტომების ქულა შეიზღუდა (" + symptomRaw + " → " + symptomPts + ")");
  meno += symptomPts;

  meno += (q4 && C.menopauseConnection.timing[q4]) || 0;

  const preMenopause = q4 === "a4_before";
  if (preMenopause) {
    meno -= C.menopauseConnection.preMenopauseHairPenalty;
    triggered.push("Q4 = მენოპაუზამდე → მენოპაუზის კავშირი შემცირდა (−" + C.menopauseConnection.preMenopauseHairPenalty + "); ცვლილება არ აღიწერება ცალსახად მენოპაუზურად");
  }
  if (meno < 0) meno = 0;

  const menoLevel = levelFor(meno, C.menopauseConnection.levels);

  /* ---- hair stress score ---- */
  let hairStress = 0;
  hairStress += (q5 && C.hairStress.mainChange[q5]) || 0;
  hairStress += (q7 && C.hairStress.development[q7]) || 0;
  hairStress += (q8 && C.hairStress.severity[q8]) || 0;
  hairStress += (q9 && C.hairStress.fibre[q9]) || 0;
  const hairStressLevel = levelFor(hairStress, C.hairStress.levels);

  /* ---- THAMRA fit score ---- */
  let thamra = 0;
  const menoContrib = bandPts(meno, C.thamraFit.menoContribution);
  thamra += menoContrib;
  thamra += (q5 && C.thamraFit.hairChangeType[q5]) || 0;
  thamra += (q8 && C.thamraFit.stage[q8]) || 0;
  thamra += (q7 && C.thamraFit.duration[q7]) || 0;
  thamra += redFlag ? 0 : C.thamraFit.safetyNoRedFlag;
  const thamraLevel = levelFor(thamra, C.thamraFit.levels);

  /* ---- treatment history (separate; never affects scores) ---- */
  const previousTreatments = Array.isArray(answers.q12) ? answers.q12.slice() : [];
  const triedSomething = hasTriedTreatment(previousTreatments);
  const treatmentDuration = triedSomething ? answers.q13 || null : null;
  const previousTreatmentResult = triedSomething ? answers.q14 || null : null;
  const desiredOutcome = answers.q15 || null;
  const emotionalImpact = answers.q_emotion || null;

  /* ---- personalization ---- */
  const personalization = buildPersonalization({
    q5,
    menoLevel,
    hairStressLevel,
    thamraLevel,
    desiredOutcome,
    redFlag,
    competingCause,
    preMenopause,
  });

  const treatmentJourney = buildTreatmentJourney({
    triedSomething,
    treatmentDuration,
    previousTreatmentResult,
  });

  return {
    menopauseConnectionScore: meno,
    hairStressScore: hairStress,
    thamraFitScore: thamra,
    redFlag,
    competingCause,
    menoLevel,
    hairStressLevel,
    thamraLevel,
    thamraContribFromMeno: menoContrib,
    previousTreatments,
    treatmentDuration,
    previousTreatmentResult,
    desiredOutcome,
    emotionalImpact,
    preMenopause,
    strongestSymptom: (q5 && STRONGEST_SYMPTOM[q5]) || "თმის ცვლილება",
    personalization,
    treatmentJourney,
    messages: buildMessages(redFlag, competingCause),
    triggeredRules: triggered,
  };
}
