import { describe, it, expect } from "vitest";
import {
  QUESTIONS,
  QUIZ_VERSION,
  visibleQuestions,
  isQuestionVisible,
  pruneHiddenAnswers,
  toggleMultiValue,
  hasRealTreatment,
  computeMenopauseFitScore,
  computeSymptomFitScore,
  computeMinimumScreeningComplete,
  computeScreeningStatus,
  computeResult,
  computeTriageStatus,
  qualifiesForConsultation,
  humanizeAnswers,
  buildLeadAnswers,
  type RawAnswers,
  type QuizResult,
} from "./scoring";

// ── Fixtures ──────────────────────────────────────────────────────────────

/** Every question visible: change type "both", irregular cycle, tests done,
 *  a real treatment used. */
const FULL: RawAnswers = {
  age_group: "age_51_55",
  menstrual_cycle: "irregular",
  hair_change_type: "both",
  associated_symptoms: ["hot_flashes"],
  perceived_cycle_connection: "direct",
  thinning_onset: "months_1_3",
  shedding_onset: "months_1_3",
  previous_hair_history: "new_problem",
  possible_triggers: ["menopause_changes"],
  bald_patches: "no",
  scalp_warning_signs: "no",
  doctor_visit: "doctor_and_tests",
  tests_completed: ["cbc", "ferritin_iron", "thyroid"],
  test_results: ["all_normal"],
  previous_treatments: ["biotin"],
  longest_treatment_duration: "months_1_3",
  previous_treatment_results: ["less_shedding"],
  concern_level: 7,
  primary_goal: "reduce_shedding",
};

const ids = (a: RawAnswers) => visibleQuestions(a).map((q) => q.id);

// ── Question contract ───────────────────────────────────────────────────────

describe("question contract", () => {
  it("defines all 19 questions with the agreed stable ids in order", () => {
    expect(QUESTIONS.map((q) => q.id)).toEqual([
      "age_group",
      "menstrual_cycle",
      "hair_change_type",
      "associated_symptoms",
      "perceived_cycle_connection",
      "thinning_onset",
      "shedding_onset",
      "previous_hair_history",
      "possible_triggers",
      "bald_patches",
      "scalp_warning_signs",
      "doctor_visit",
      "tests_completed",
      "test_results",
      "previous_treatments",
      "longest_treatment_duration",
      "previous_treatment_results",
      "concern_level",
      "primary_goal",
    ]);
  });

  it("uses the versioned id", () => {
    expect(QUIZ_VERSION).toBe("thamra_quiz_v2_2026_08");
  });

  it("has no leftover q2_surgical / secondary toggle", () => {
    for (const q of QUESTIONS) {
      expect((q as unknown as Record<string, unknown>).secondary).toBeUndefined();
    }
    expect(FULL).not.toHaveProperty("q2_surgical");
  });
});

// ── Visibility ──────────────────────────────────────────────────────────────

describe("visibility", () => {
  it("always shows age, cycle, change-type, concern, goal", () => {
    const minimal: RawAnswers = {};
    for (const id of ["age_group", "menstrual_cycle", "hair_change_type", "concern_level", "primary_goal"]) {
      expect(isQuestionVisible(id, minimal)).toBe(true);
    }
  });

  it("no_change skips Q4–Q17 but keeps concern + goal", () => {
    const a: RawAnswers = { hair_change_type: "no_change" };
    expect(ids(a)).toEqual(["age_group", "menstrual_cycle", "hair_change_type", "concern_level", "primary_goal"]);
  });

  it("shows all 19 when everything applies", () => {
    expect(visibleQuestions(FULL)).toHaveLength(19);
  });

  it("associated_symptoms only when there is a hair change", () => {
    expect(isQuestionVisible("associated_symptoms", { hair_change_type: "both" })).toBe(true);
    expect(isQuestionVisible("associated_symptoms", { hair_change_type: "no_change" })).toBe(false);
  });

  describe("Q5 perceived_cycle_connection depends on Q2 (menstrual_cycle)", () => {
    it("shows for irregular / stopped cycles (and a hair change)", () => {
      for (const cycle of ["irregular", "stopped_under_12_months", "stopped_over_12_months"]) {
        expect(isQuestionVisible("perceived_cycle_connection", { hair_change_type: "both", menstrual_cycle: cycle })).toBe(true);
      }
    });
    it("hidden when cycle is regular", () => {
      expect(isQuestionVisible("perceived_cycle_connection", { hair_change_type: "both", menstrual_cycle: "regular" })).toBe(false);
    });
    it("hidden when there is no hair change even if cycle is irregular", () => {
      expect(isQuestionVisible("perceived_cycle_connection", { hair_change_type: "no_change", menstrual_cycle: "irregular" })).toBe(false);
    });
  });

  describe("Q6 thinning_onset & Q7 shedding_onset depend on Q3 (hair_change_type)", () => {
    it("thinning_onset for gradual_thinning or both only", () => {
      expect(isQuestionVisible("thinning_onset", { hair_change_type: "gradual_thinning" })).toBe(true);
      expect(isQuestionVisible("thinning_onset", { hair_change_type: "both" })).toBe(true);
      expect(isQuestionVisible("thinning_onset", { hair_change_type: "sudden_shedding" })).toBe(false);
    });
    it("shedding_onset for sudden_shedding or both only", () => {
      expect(isQuestionVisible("shedding_onset", { hair_change_type: "sudden_shedding" })).toBe(true);
      expect(isQuestionVisible("shedding_onset", { hair_change_type: "both" })).toBe(true);
      expect(isQuestionVisible("shedding_onset", { hair_change_type: "gradual_thinning" })).toBe(false);
    });
  });

  describe("Q13 tests_completed & Q14 test_results depend on Q12 (doctor_visit)", () => {
    it("shown only for doctor_and_tests", () => {
      expect(isQuestionVisible("tests_completed", { hair_change_type: "both", doctor_visit: "doctor_and_tests" })).toBe(true);
      expect(isQuestionVisible("test_results", { hair_change_type: "both", doctor_visit: "doctor_and_tests" })).toBe(true);
    });
    it("hidden for doctor_no_tests and no_doctor", () => {
      for (const dv of ["doctor_no_tests", "no_doctor"]) {
        expect(isQuestionVisible("tests_completed", { hair_change_type: "both", doctor_visit: dv })).toBe(false);
        expect(isQuestionVisible("test_results", { hair_change_type: "both", doctor_visit: dv })).toBe(false);
      }
    });
  });

  describe("Q16 & Q17 depend on Q15 (previous_treatments)", () => {
    it("shown when a real treatment (not nothing_specific) is present", () => {
      const a: RawAnswers = { hair_change_type: "both", previous_treatments: ["minoxidil"] };
      expect(isQuestionVisible("longest_treatment_duration", a)).toBe(true);
      expect(isQuestionVisible("previous_treatment_results", a)).toBe(true);
    });
    it("hidden for nothing_specific only", () => {
      const a: RawAnswers = { hair_change_type: "both", previous_treatments: ["nothing_specific"] };
      expect(isQuestionVisible("longest_treatment_duration", a)).toBe(false);
      expect(isQuestionVisible("previous_treatment_results", a)).toBe(false);
    });
    it("hasRealTreatment helper", () => {
      expect(hasRealTreatment(["nothing_specific"])).toBe(false);
      expect(hasRealTreatment(["nothing_specific", "biotin"])).toBe(true);
      expect(hasRealTreatment([])).toBe(false);
      expect(hasRealTreatment(undefined)).toBe(false);
    });
  });
});

// ── Hidden-answer cleanup ────────────────────────────────────────────────────

describe("pruneHiddenAnswers", () => {
  it("drops every downstream answer when switching to no_change", () => {
    const pruned = pruneHiddenAnswers({ ...FULL, hair_change_type: "no_change" });
    expect(Object.keys(pruned).sort()).toEqual(
      ["age_group", "concern_level", "hair_change_type", "menstrual_cycle", "primary_goal"].sort(),
    );
  });

  it("drops tests when doctor_visit changes away from doctor_and_tests", () => {
    const pruned = pruneHiddenAnswers({ ...FULL, doctor_visit: "no_doctor" });
    expect(pruned.tests_completed).toBeUndefined();
    expect(pruned.test_results).toBeUndefined();
    expect(pruned.previous_treatments).toBeDefined();
  });

  it("drops duration + results when previous_treatments becomes nothing_specific", () => {
    const pruned = pruneHiddenAnswers({ ...FULL, previous_treatments: ["nothing_specific"] });
    expect(pruned.longest_treatment_duration).toBeUndefined();
    expect(pruned.previous_treatment_results).toBeUndefined();
  });

  it("drops perceived_cycle_connection when cycle becomes regular", () => {
    const pruned = pruneHiddenAnswers({ ...FULL, menstrual_cycle: "regular" });
    expect(pruned.perceived_cycle_connection).toBeUndefined();
  });

  it("drops shedding_onset when hair_change_type narrows to gradual_thinning", () => {
    const pruned = pruneHiddenAnswers({ ...FULL, hair_change_type: "gradual_thinning" });
    expect(pruned.shedding_onset).toBeUndefined();
    expect(pruned.thinning_onset).toBeDefined();
  });
});

// ── Exclusive multi-select handling ──────────────────────────────────────────

describe("toggleMultiValue — exclusive none options (Q4 / Q9 / Q15)", () => {
  it("selecting none clears everything else", () => {
    expect(toggleMultiValue(["hot_flashes", "worse_sleep"], "none", ["none"])).toEqual(["none"]);
  });
  it("selecting a normal option clears none", () => {
    expect(toggleMultiValue(["none"], "hot_flashes", ["none"])).toEqual(["hot_flashes"]);
  });
  it("re-tapping none clears it", () => {
    expect(toggleMultiValue(["none"], "none", ["none"])).toEqual([]);
  });
  it("nothing_specific (Q15) is exclusive", () => {
    expect(toggleMultiValue(["biotin", "minoxidil"], "nothing_specific", ["nothing_specific"])).toEqual(["nothing_specific"]);
    expect(toggleMultiValue(["nothing_specific"], "biotin", ["nothing_specific"])).toEqual(["biotin"]);
  });
});

describe("toggleMultiValue — Q14 test_results exclusivity", () => {
  const EX = ["all_normal", "none_listed"];
  it("all_normal clears abnormal findings", () => {
    expect(toggleMultiValue(["iron_ferritin_deficiency"], "all_normal", EX)).toEqual(["all_normal"]);
  });
  it("an abnormal finding clears all_normal", () => {
    expect(toggleMultiValue(["all_normal"], "iron_ferritin_deficiency", EX)).toEqual(["iron_ferritin_deficiency"]);
  });
  it("none_listed replaces all_normal (exclusive vs exclusive)", () => {
    expect(toggleMultiValue(["all_normal"], "none_listed", EX)).toEqual(["none_listed"]);
  });
  it("multiple abnormal findings combine", () => {
    expect(toggleMultiValue(["iron_ferritin_deficiency"], "vitamin_d_deficiency", EX)).toEqual([
      "iron_ferritin_deficiency",
      "vitamin_d_deficiency",
    ]);
  });
});

describe("toggleMultiValue — Q17 previous_treatment_results exclusivity", () => {
  const EX = ["no_result", "worsened"];
  it("no_result clears positive results", () => {
    expect(toggleMultiValue(["less_shedding"], "no_result", EX)).toEqual(["no_result"]);
  });
  it("a positive result clears no_result", () => {
    expect(toggleMultiValue(["no_result"], "less_shedding", EX)).toEqual(["less_shedding"]);
  });
  it("worsened replaces no_result", () => {
    expect(toggleMultiValue(["no_result"], "worsened", EX)).toEqual(["worsened"]);
  });
  it("positive results may combine", () => {
    expect(toggleMultiValue(["less_shedding"], "more_fullness", EX)).toEqual(["less_shedding", "more_fullness"]);
  });
});

// ── Minimum screening ────────────────────────────────────────────────────────

describe("minimum screening", () => {
  it("requires cbc + ferritin_iron + thyroid", () => {
    expect(computeMinimumScreeningComplete({ tests_completed: ["cbc", "ferritin_iron", "thyroid"] })).toBe(true);
    expect(computeMinimumScreeningComplete({ tests_completed: ["cbc", "ferritin_iron", "thyroid", "zinc"] })).toBe(true);
  });
  it("false when any of the three is missing", () => {
    expect(computeMinimumScreeningComplete({ tests_completed: ["cbc", "ferritin_iron"] })).toBe(false);
    expect(computeMinimumScreeningComplete({ tests_completed: [] })).toBe(false);
    expect(computeMinimumScreeningComplete({})).toBe(false);
  });
});

describe("computeScreeningStatus", () => {
  it("untested for no_doctor / doctor_no_tests", () => {
    expect(computeScreeningStatus({ doctor_visit: "no_doctor" })).toBe("untested");
    expect(computeScreeningStatus({ doctor_visit: "doctor_no_tests" })).toBe("untested");
  });
  it("incomplete when minimum not met", () => {
    expect(
      computeScreeningStatus({ doctor_visit: "doctor_and_tests", tests_completed: ["cbc"], test_results: ["all_normal"] }),
    ).toBe("incomplete");
  });
  it("verified_normal for all_normal + minimum complete", () => {
    expect(
      computeScreeningStatus({
        doctor_visit: "doctor_and_tests",
        tests_completed: ["cbc", "ferritin_iron", "thyroid"],
        test_results: ["all_normal"],
      }),
    ).toBe("verified_normal");
  });
  it("complete for minimum done + non-normal findings", () => {
    expect(
      computeScreeningStatus({
        doctor_visit: "doctor_and_tests",
        tests_completed: ["cbc", "ferritin_iron", "thyroid"],
        test_results: ["iron_ferritin_deficiency"],
      }),
    ).toBe("complete");
  });
});

// ── Score contributions ──────────────────────────────────────────────────────

describe("menopause fit contributions", () => {
  it("age points", () => {
    const age = (g: string) => computeMenopauseFitScore({ age_group: g });
    expect(age("under_40")).toBe(0);
    expect(age("age_40_45")).toBe(1);
    expect(age("age_46_50")).toBe(2);
    expect(age("age_51_55")).toBe(3);
    expect(age("age_56_60")).toBe(2);
    expect(age("over_60")).toBe(1);
  });
  it("cycle points", () => {
    const cyc = (c: string) => computeMenopauseFitScore({ menstrual_cycle: c });
    expect(cyc("regular")).toBe(0);
    expect(cyc("irregular")).toBe(3);
    expect(cyc("stopped_under_12_months")).toBe(3);
    expect(cyc("stopped_over_12_months")).toBe(2);
  });
  it("associated symptoms are capped at 3", () => {
    expect(computeMenopauseFitScore({ associated_symptoms: ["hot_flashes"] })).toBe(2);
    expect(computeMenopauseFitScore({ associated_symptoms: ["hot_flashes", "worse_sleep", "stress_anxiety"] })).toBe(3);
  });
  it("perceived connection points", () => {
    const p = (v: string) => computeMenopauseFitScore({ perceived_cycle_connection: v });
    expect(p("direct")).toBe(2);
    expect(p("partial")).toBe(1);
    expect(p("unsure")).toBe(0);
    expect(p("none")).toBe(0);
  });
  it("triggers are capped at 3", () => {
    expect(computeMenopauseFitScore({ possible_triggers: ["menopause_changes"] })).toBe(2);
    expect(computeMenopauseFitScore({ possible_triggers: ["menopause_changes", "worse_sleep", "major_stress"] })).toBe(3);
    // strong competing triggers add no menopause points
    expect(computeMenopauseFitScore({ possible_triggers: ["surgery", "illness_or_virus"] })).toBe(0);
  });
});

describe("symptom fit contributions", () => {
  it("hair change type points", () => {
    const h = (t: string) => computeSymptomFitScore({ hair_change_type: t });
    expect(h("sudden_shedding")).toBe(3);
    expect(h("both")).toBe(3);
    expect(h("gradual_thinning")).toBe(1);
    expect(h("no_change")).toBe(0);
  });
  it("history points", () => {
    const hi = (v: string) => computeSymptomFitScore({ previous_hair_history: v });
    expect(hi("new_problem")).toBe(3);
    expect(hi("previous_but_worse_now")).toBe(2);
    expect(hi("recurrent")).toBe(1);
    expect(hi("longstanding")).toBe(0);
  });
  it("uses the HIGHER onset score when both Q6 and Q7 are answered (never the sum)", () => {
    // thinning months_1_3 = 2, shedding over_1_year = 0 → onset 2
    expect(
      computeSymptomFitScore({ hair_change_type: "both", thinning_onset: "months_1_3", shedding_onset: "over_1_year" }),
    ).toBe(3 + 2);
    // thinning years_1_3 = 0, shedding months_1_3 = 3 → onset 3
    expect(
      computeSymptomFitScore({ hair_change_type: "both", thinning_onset: "years_1_3", shedding_onset: "months_1_3" }),
    ).toBe(3 + 3);
    // both months_1_3 → max(2,3) = 3, NOT 2+3
    expect(
      computeSymptomFitScore({ hair_change_type: "both", thinning_onset: "months_1_3", shedding_onset: "months_1_3" }),
    ).toBe(3 + 3);
  });
});

// ── Threshold boundaries ─────────────────────────────────────────────────────

describe("fit-level threshold boundaries", () => {
  it("menopause: 5→low, 6→moderate, 9→moderate, 10→high", () => {
    const lvl = (a: RawAnswers) => computeResult(a).menopauseFitLevel;
    // 5
    let a: RawAnswers = { age_group: "over_60", menstrual_cycle: "stopped_over_12_months", perceived_cycle_connection: "direct" };
    expect(computeMenopauseFitScore(a)).toBe(5);
    expect(lvl(a)).toBe("low");
    // 6
    a = { age_group: "age_46_50", menstrual_cycle: "stopped_over_12_months", associated_symptoms: ["hot_flashes"] };
    expect(computeMenopauseFitScore(a)).toBe(6);
    expect(lvl(a)).toBe("moderate");
    // 9
    a = { age_group: "age_51_55", menstrual_cycle: "irregular", associated_symptoms: ["hot_flashes", "worse_sleep", "stress_anxiety"] };
    expect(computeMenopauseFitScore(a)).toBe(9);
    expect(lvl(a)).toBe("moderate");
    // 10
    a = {
      age_group: "age_51_55",
      menstrual_cycle: "irregular",
      associated_symptoms: ["hot_flashes", "worse_sleep", "stress_anxiety"],
      perceived_cycle_connection: "partial",
    };
    expect(computeMenopauseFitScore(a)).toBe(10);
    expect(lvl(a)).toBe("high");
  });

  it("symptom: 3→low, 4→moderate, 6→moderate, 7→high", () => {
    const lvl = (a: RawAnswers) => computeResult(a).symptomFitLevel;
    let a: RawAnswers = { hair_change_type: "gradual_thinning", thinning_onset: "months_1_3", previous_hair_history: "longstanding" };
    expect(computeSymptomFitScore(a)).toBe(3);
    expect(lvl(a)).toBe("low");
    a = { hair_change_type: "gradual_thinning", thinning_onset: "months_1_3", previous_hair_history: "recurrent" };
    expect(computeSymptomFitScore(a)).toBe(4);
    expect(lvl(a)).toBe("moderate");
    a = { hair_change_type: "sudden_shedding", shedding_onset: "months_3_6", previous_hair_history: "recurrent" };
    expect(computeSymptomFitScore(a)).toBe(6);
    expect(lvl(a)).toBe("moderate");
    a = { hair_change_type: "sudden_shedding", shedding_onset: "months_1_3", previous_hair_history: "recurrent" };
    expect(computeSymptomFitScore(a)).toBe(7);
    expect(lvl(a)).toBe("high");
  });
});

describe("buying urgency", () => {
  const u = (n: number) => computeResult({ concern_level: n }).buyingUrgency;
  it("maps concern rating to urgency bands", () => {
    expect(u(1)).toBe("low");
    expect(u(3)).toBe("low");
    expect(u(4)).toBe("moderate");
    expect(u(6)).toBe("moderate");
    expect(u(7)).toBe("high");
    expect(u(8)).toBe("high");
    expect(u(9)).toBe("very_high");
    expect(u(10)).toBe("very_high");
  });
});

// ── fitCategory — every category ────────────────────────────────────────────

/** High symptom (9) + high menopause (13), untested by default. */
function highFit(overrides: RawAnswers = {}): RawAnswers {
  return {
    age_group: "age_51_55",
    menstrual_cycle: "irregular",
    hair_change_type: "sudden_shedding",
    associated_symptoms: ["hot_flashes", "worse_sleep"],
    perceived_cycle_connection: "direct",
    shedding_onset: "months_1_3",
    previous_hair_history: "new_problem",
    possible_triggers: ["menopause_changes"],
    bald_patches: "no",
    scalp_warning_signs: "no",
    doctor_visit: "no_doctor",
    previous_treatments: ["nothing_specific"],
    concern_level: 8,
    primary_goal: "reduce_shedding",
    ...overrides,
  };
}

const verified = (o: RawAnswers = {}): RawAnswers =>
  highFit({ doctor_visit: "doctor_and_tests", tests_completed: ["cbc", "ferritin_iron", "thyroid"], test_results: ["all_normal"], ...o });

describe("fitCategory", () => {
  it("no_current_change", () => {
    const r = computeResult({ hair_change_type: "no_change", age_group: "age_51_55", concern_level: 5 });
    expect(r.fitCategory).toBe("no_current_change");
    expect(r.resultType).toBe("no_change");
  });
  it("medical_referral when a red flag is present", () => {
    const r = computeResult(highFit({ bald_patches: "yes" }));
    expect(r.redFlag).toBe(true);
    expect(r.fitCategory).toBe("medical_referral");
    expect(r.resultType).toBe("medical");
  });
  it("medical_review for thyroid/hormonal abnormality (no red flag)", () => {
    const r = computeResult(verified({ test_results: ["thyroid_abnormality"] }));
    expect(r.medicalReview).toBe(true);
    expect(r.fitCategory).toBe("medical_review");
  });
  it("deficiency_first for a deficiency finding", () => {
    const r = computeResult(verified({ test_results: ["iron_ferritin_deficiency"] }));
    expect(r.deficiencyIdentified).toBe(true);
    expect(r.fitCategory).toBe("deficiency_first");
    expect(r.resultType).toBe("deficiency");
  });
  it("potential_high_fit_unverified: high fits but unscreened", () => {
    const r = computeResult(highFit());
    expect(r.screeningStatus).toBe("untested");
    expect(r.fitCategory).toBe("potential_high_fit_unverified");
    expect(r.resultType).toBe("unverified");
  });
  it("unverified: not-high fits and unscreened", () => {
    const r = computeResult({
      hair_change_type: "gradual_thinning",
      thinning_onset: "years_1_3",
      previous_hair_history: "longstanding",
      age_group: "under_40",
      menstrual_cycle: "regular",
      doctor_visit: "no_doctor",
      concern_level: 5,
    });
    expect(r.fitCategory).toBe("unverified");
  });
  it("verified_high_fit: verified normal + high fits + no strong trigger", () => {
    const r = computeResult(verified());
    expect(r.screeningStatus).toBe("verified_normal");
    expect(r.strongCompetingTrigger).toBe(false);
    expect(r.fitCategory).toBe("verified_high_fit");
    expect(r.resultType).toBe("product");
  });
  it("mixed_fit: verified high fits BUT a strong competing trigger", () => {
    const r = computeResult(verified({ possible_triggers: ["menopause_changes", "surgery"] }));
    expect(r.strongCompetingTrigger).toBe(true);
    expect(r.fitCategory).toBe("mixed_fit");
  });
  it("possible_fit: verified normal + moderate/moderate", () => {
    const r = computeResult({
      age_group: "age_46_50",
      menstrual_cycle: "stopped_over_12_months",
      associated_symptoms: ["hot_flashes"],
      perceived_cycle_connection: "unsure",
      hair_change_type: "gradual_thinning",
      thinning_onset: "months_1_3",
      previous_hair_history: "recurrent",
      possible_triggers: ["none"],
      bald_patches: "no",
      scalp_warning_signs: "no",
      doctor_visit: "doctor_and_tests",
      tests_completed: ["cbc", "ferritin_iron", "thyroid"],
      test_results: ["all_normal"],
      previous_treatments: ["nothing_specific"],
      concern_level: 5,
      primary_goal: "prevent_worsening",
    });
    expect(r.menopauseFitLevel).toBe("moderate");
    expect(r.symptomFitLevel).toBe("moderate");
    expect(r.fitCategory).toBe("possible_fit");
  });
  it("low_fit: verified normal but at least one low fit", () => {
    const r = computeResult({
      age_group: "age_46_50",
      menstrual_cycle: "stopped_over_12_months",
      associated_symptoms: ["hot_flashes"],
      perceived_cycle_connection: "unsure",
      hair_change_type: "gradual_thinning",
      thinning_onset: "months_1_3",
      previous_hair_history: "longstanding", // → symptom = 3 (low)
      possible_triggers: ["none"],
      bald_patches: "no",
      scalp_warning_signs: "no",
      doctor_visit: "doctor_and_tests",
      tests_completed: ["cbc", "ferritin_iron", "thyroid"],
      test_results: ["all_normal"],
      previous_treatments: ["nothing_specific"],
      concern_level: 5,
      primary_goal: "prevent_worsening",
    });
    expect(r.symptomFitLevel).toBe("low");
    expect(r.fitCategory).toBe("low_fit");
  });
});

describe("flags", () => {
  it("expectationFlag on major_regrowth goal", () => {
    expect(computeResult(highFit({ primary_goal: "major_regrowth" })).expectationFlag).toBe(true);
    expect(computeResult(highFit({ primary_goal: "reduce_shedding" })).expectationFlag).toBe(false);
  });
  it("manualReview on unsure red-flag answers and none_listed results", () => {
    expect(computeResult(highFit({ bald_patches: "unsure" })).manualReview).toBe(true);
    expect(computeResult(highFit({ scalp_warning_signs: "unsure" })).manualReview).toBe(true);
    expect(computeResult(verified({ test_results: ["none_listed"] })).manualReview).toBe(true);
  });
  it("strongCompetingTrigger only for illness/surgery/weightloss/medication", () => {
    expect(computeResult(highFit({ possible_triggers: ["worse_sleep", "major_stress"] })).strongCompetingTrigger).toBe(false);
    for (const t of ["illness_or_virus", "surgery", "rapid_weight_loss", "medication_change"]) {
      expect(computeResult(highFit({ possible_triggers: [t] })).strongCompetingTrigger).toBe(true);
    }
  });
});

// ── Triage mapping ───────────────────────────────────────────────────────────

describe("triage_status mapping (preserved db strings)", () => {
  const triage = (a: RawAnswers) => computeTriageStatus(computeResult(a));
  it("refer_out for red flag or medical review", () => {
    expect(triage(highFit({ bald_patches: "yes" }))).toBe("refer_out");
    expect(triage(verified({ test_results: ["hormonal_change"] }))).toBe("refer_out");
  });
  it("needs_labs for deficiency / untested / incomplete / manual review", () => {
    expect(triage(verified({ test_results: ["iron_ferritin_deficiency"] }))).toBe("needs_labs"); // deficiency
    expect(triage(highFit())).toBe("needs_labs"); // untested
    expect(triage(highFit({ doctor_visit: "doctor_and_tests", tests_completed: ["cbc"], test_results: ["all_normal"] }))).toBe("needs_labs"); // incomplete
    expect(triage(verified({ test_results: ["none_listed"] }))).toBe("needs_labs"); // manualReview
  });
  it("qualified for a clean verified-normal case", () => {
    expect(triage(verified())).toBe("qualified");
  });
});

// ── Consultation gating (the dangerous-behavior fix) ─────────────────────────

describe("qualifiesForConsultation", () => {
  it("NEVER qualifies a red-flag respondent", () => {
    expect(qualifiesForConsultation(computeResult(highFit({ bald_patches: "yes" })))).toBe(false);
  });
  it("NEVER qualifies a medical-review respondent", () => {
    expect(qualifiesForConsultation(computeResult(verified({ test_results: ["thyroid_abnormality"] })))).toBe(false);
  });
  it("does NOT qualify merely because of a strong competing trigger (mixed_fit)", () => {
    const r = computeResult(verified({ possible_triggers: ["menopause_changes", "surgery"] }));
    expect(r.fitCategory).toBe("mixed_fit");
    expect(qualifiesForConsultation(r)).toBe(false);
  });
  it("does not qualify deficiency-first", () => {
    expect(qualifiesForConsultation(computeResult(verified({ test_results: ["iron_ferritin_deficiency"] })))).toBe(false);
  });
  it("qualifies verified_high_fit / possible_fit / potential_high_fit_unverified", () => {
    expect(qualifiesForConsultation(computeResult(verified()))).toBe(true); // verified_high_fit
    expect(qualifiesForConsultation(computeResult(highFit()))).toBe(true); // potential_high_fit_unverified
  });
});

// ── Persistence payload ──────────────────────────────────────────────────────

describe("persistence payload", () => {
  it("humanizeAnswers maps codes → Georgian labels, passes numbers and _keys through", () => {
    const h = humanizeAnswers({
      age_group: "age_51_55",
      associated_symptoms: ["hot_flashes"],
      concern_level: 8,
      _raw: { age_group: "age_51_55" },
    });
    expect(h.age_group).toBe("51–55 წლის");
    expect(h.associated_symptoms).toEqual(["ალებს ან ღამის ოფლიანობას"]);
    expect(h.concern_level).toBe(8);
    expect(h._raw).toEqual({ age_group: "age_51_55" });
  });

  it("buildLeadAnswers stores humanized labels + version + raw + result + consent", () => {
    const raw = verified();
    const result = computeResult(raw);
    const consent = { accepted: true, accepted_at: "2026-08-05T00:00:00.000Z", policy_version: "2026-07-23" };
    const payload = buildLeadAnswers(raw, result, consent) as Record<string, unknown>;

    expect(payload._quizVersion).toBe("thamra_quiz_v2_2026_08");
    expect(payload._raw).toEqual(raw);
    expect(payload._result).toEqual(result);
    expect(payload._consent).toEqual(consent);
    // top-level humanized for admin readability
    expect(payload.age_group).toBe("51–55 წლის");
    expect((payload._result as QuizResult).fitCategory).toBe("verified_high_fit");
  });
});
