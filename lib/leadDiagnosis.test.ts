import { describe, it, expect } from "vitest";
import { diagnoseLead, formatDiagnosis } from "./leadDiagnosis";
import { computeResult, buildLeadAnswers, type RawAnswers } from "./scoring";

const rawVerified: RawAnswers = {
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
  doctor_visit: "doctor_and_tests",
  tests_completed: ["cbc", "ferritin_iron", "thyroid"],
  test_results: ["all_normal"],
  previous_treatments: ["nothing_specific"],
  concern_level: 8,
  primary_goal: "reduce_shedding",
};

describe("diagnoseLead precedence", () => {
  it("prefers the stored _result snapshot over recomputing from _raw", () => {
    // A snapshot that deliberately disagrees with what _raw would compute.
    const stored = { ...computeResult(rawVerified), fitCategory: "possible_fit" as const };
    const answers = { _result: stored, _raw: rawVerified };
    const diag = diagnoseLead(answers);
    expect(diag.source).toBe("result");
    expect(diag.result?.fitCategory).toBe("possible_fit");
  });

  it("falls back to computing from _raw when no snapshot is stored", () => {
    const answers = { _raw: rawVerified };
    const diag = diagnoseLead(answers);
    expect(diag.source).toBe("raw");
    expect(diag.result?.fitCategory).toBe("verified_high_fit");
  });

  it("reads a real buildLeadAnswers payload as a snapshot", () => {
    const payload = buildLeadAnswers(rawVerified, computeResult(rawVerified), {
      accepted: true,
      accepted_at: null,
      policy_version: "2026-07-23",
    });
    const diag = diagnoseLead(payload);
    expect(diag.source).toBe("result");
    expect(diag.result?.fitCategory).toBe("verified_high_fit");
  });

  it("treats legacy humanized-only rows as unscorable legacy (no false zero)", () => {
    const legacyRow = { q1: "45–49 წლის", q5: ["ჭარბი ცვენა"], _consent: { accepted: true } };
    const diag = diagnoseLead(legacyRow);
    expect(diag.source).toBe("legacy");
    expect(diag.result).toBeNull();
  });

  it("handles null / empty answers as legacy", () => {
    expect(diagnoseLead(null).source).toBe("legacy");
    expect(diagnoseLead(undefined).source).toBe("legacy");
    expect(diagnoseLead({}).source).toBe("legacy");
  });
});

describe("formatDiagnosis", () => {
  it("labels legacy rows explicitly (not a zero diagnosis)", () => {
    expect(formatDiagnosis({ source: "legacy", result: null })).toContain("ლეგასი");
  });
  it("summarises a v2 result with its fit category", () => {
    const text = formatDiagnosis(diagnoseLead({ _raw: rawVerified }));
    expect(text).toContain("დადასტურებული მაღალი ფიტი");
  });
});
