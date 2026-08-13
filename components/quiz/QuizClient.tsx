"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import styles from "./Quiz.module.css";
import { supabase } from "@/lib/supabase";
import {
  QUESTIONS,
  QUIZ_VERSION,
  visibleQuestions,
  pruneHiddenAnswers,
  toggleMultiValue,
  computeResult,
  computeTriageStatus,
  qualifiesForConsultation,
  buildLeadAnswers,
  type RawAnswers,
  type Question,
  type QuizResult,
} from "@/lib/scoring";
import { v2ToLegacyAnswers } from "@/lib/legacyAdapter";
import { resultPage } from "@/lib/resultPolicy";
import LegacyResultScreen from "./LegacyResultScreen";
import ResultScreen from "./ResultScreen";
import {
  track,
  captureAttribution,
  getAttribution,
  getSessionId,
  oncePerSession,
} from "@/lib/analytics";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "intro" | "quiz" | "gate" | "processing" | "result";

const PROCESSING_MS = 4000;
const PROCESSING_TEXTS = [
  "ვამუშავებ შენს პასუხებს...",
  "ვაანალიზებ თმის ცვლილების ტიპს...",
  "ვადგენ მენოპაუზასთან კავშირს...",
  "ვამზადებ შენს პერსონალურ შედეგს...",
];

// sessionStorage key holding the visitor's in-progress quiz state (survives
// refresh). Bumped to v3 for the v2 quiz — the answer shape changed, so any
// stale v1/v2-prototype state must be ignored rather than restored.
const STATE_KEY = "thamra_quiz_state_v3";

// Multi-selects and the rating scale need an explicit "next"; single-selects
// auto-advance once tapped.
function needsManualNext(q: Question): boolean {
  return q.type === "multi" || q.type === "rating";
}

// Fire a Meta Pixel event from the browser. No-ops when the pixel isn't loaded
// (it only loads on production — see layout.tsx), and deliberately carries NO
// quiz answer content (no hair / menopause / health data ever goes to Meta).
function fbPixel(name: string, params: Record<string, unknown> = {}, custom = false) {
  const fbq = typeof window !== "undefined"
    ? (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq
    : undefined;
  if (!fbq) return;
  fbq(custom ? "trackCustom" : "track", name, params);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuizClient() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [qid, setQid] = useState<string>(QUESTIONS[0].id);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [answers, setAnswers] = useState<RawAnswers>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fbcRef = useRef<string | null>(null);
  const enteredAtRef = useRef<number>(Date.now());
  const skipPersist = useRef(true);

  useEffect(() => {
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid) {
      fbcRef.current = `fb.1.${Date.now()}.${fbclid}`;
    }

    captureAttribution();

    // Restore progress on reload so users stay on the same screen.
    try {
      const saved = sessionStorage.getItem(STATE_KEY);
      if (saved) {
        const st = JSON.parse(saved);
        if (st.answers) setAnswers(st.answers);
        if (st.name) setName(st.name);
        if (st.phone) setPhone(st.phone);
        if (st.email) setEmail(st.email);
        if (st.qid) setQid(st.qid);
        let target: Screen = st.screen ?? "intro";
        if (target === "processing") target = "result"; // don't re-run the loader
        setScreen(target);
      }
    } catch {}

    if (oncePerSession("quiz_start")) {
      track({ event_type: "quiz_start", screen: "intro", attribution: getAttribution() });
    }
    enteredAtRef.current = Date.now();
  }, []);

  // Persist progress on every change so a refresh survives.
  useEffect(() => {
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({ screen, qid, answers, name, phone, email }));
    } catch {}
  }, [screen, qid, answers, name, phone, email]);

  // Result page view — only counts if they stay 3+ seconds, once per session.
  useEffect(() => {
    if (screen !== "result") return;
    const t = setTimeout(() => {
      if (oncePerSession("result_view")) {
        track({ event_type: "result_view", screen: "result" });
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [screen]);

  const qList = visibleQuestions(answers);
  const currentIndex = qList.findIndex((q) => q.id === qid);
  const currentQuestion = qList[currentIndex] ?? qList[0];

  function trackScreen(target: Screen, targetQid: string | null) {
    const now = Date.now();
    const qi = targetQid ? visibleQuestions(answers).findIndex((q) => q.id === targetQid) : -1;
    track({
      event_type: "screen_view",
      screen: target === "quiz" ? targetQid ?? "quiz" : target,
      question_index: qi === -1 ? null : qi,
      prev_screen: screen === "quiz" ? qid : screen,
      prev_duration_ms: now - enteredAtRef.current,
    });
    enteredAtRef.current = now;
  }

  function goToQuestion(nextQid: string, dir: "forward" | "back") {
    trackScreen("quiz", nextQid);
    setDirection(dir);
    setScreen("quiz");
    setQid(nextQid);
  }

  function goToPhase(target: Screen, dir: "forward" | "back") {
    trackScreen(target, null);
    setDirection(dir);
    setScreen(target);
  }

  /** Advance from `fromQid` using an explicit answers snapshot, so branching
   *  decisions always see the just-applied answer (never stale state). */
  function advanceFrom(fromQid: string, snapshot: RawAnswers) {
    const list = visibleQuestions(snapshot);
    const idx = list.findIndex((q) => q.id === fromQid);
    if (idx === -1 || idx === list.length - 1) {
      // Reached the end of the questions = "completed the quiz" (the number
      // that was missing in Meta). Fires once per session, no answer content.
      if (oncePerSession("fb_quiz_complete")) {
        fbPixel("CompleteRegistration", { content_name: "quiz" });
      }
      goToPhase("gate", "forward");
    } else {
      goToQuestion(list[idx + 1].id, "forward");
    }
  }

  function goNext() {
    advanceFrom(qid, answers);
  }

  function startQuiz() {
    if (oncePerSession("fb_quiz_start")) fbPixel("QuizStart", {}, true);
    const list = visibleQuestions(answers);
    goToQuestion(list[0].id, "forward");
  }

  function goBack() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (screen === "gate") {
      const list = visibleQuestions(answers);
      goToQuestion(list[list.length - 1].id, "back");
      return;
    }
    const list = visibleQuestions(answers);
    const idx = list.findIndex((q) => q.id === qid);
    if (idx > 0) goToQuestion(list[idx - 1].id, "back");
  }

  function handleSingleSelect(q: Question, value: string) {
    const next = pruneHiddenAnswers({ ...answers, [q.id]: value });
    setAnswers(next);
    if (needsManualNext(q)) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => advanceFrom(q.id, next), 280);
  }

  function toggleMulti(q: Question, value: string) {
    const current = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
    const arr = toggleMultiValue(current, value, q.exclusiveOptions ?? []);
    setAnswers(pruneHiddenAnswers({ ...answers, [q.id]: arr }));
  }

  function handleRating(q: Question, value: number) {
    setAnswers(pruneHiddenAnswers({ ...answers, [q.id]: value }));
  }

  function isAnswered(q: Question): boolean {
    const v = answers[q.id];
    if (q.type === "multi") return Array.isArray(v) && v.length > 0;
    if (q.type === "rating") return typeof v === "number";
    return !!v;
  }

  async function handleGateSubmit() {
    if (submitting) return;
    let valid = true;

    if (!name.trim()) {
      setNameError("სახელი და გვარი სავალდებულოა");
      valid = false;
    } else setNameError("");

    const rawPhone = phone.replace(/\s+/g, "");
    if (!rawPhone || rawPhone.length !== 9 || !rawPhone.startsWith("5")) {
      setPhoneError("შეიყვანე სწორი მობილურის ნომერი");
      valid = false;
    } else setPhoneError("");

    // Email is optional — only validate the format when something was entered.
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("შეიყვანე სწორი ელ.ფოსტა");
      valid = false;
    } else setEmailError("");

    if (!valid) return;

    const fullPhone = `+995${rawPhone}`;
    const eventId = crypto.randomUUID();

    const result = computeResult(answers);

    // Only the REAL production domain persists leads + fires Meta conversions.
    // NODE_ENV is "production" on Vercel preview builds too, so gating on the
    // hostname is what actually keeps test runs (localhost + *.vercel.app
    // previews) from writing real rows or firing real Leads into your data.
    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const isProd = host === "thamra.ge" || host.endsWith(".thamra.ge");

    if (isProd) {
      // The insert is the gate: a lead that isn't persisted is worse than a
      // slightly slower submit. Await it, and on failure keep the user here.
      setSubmitting(true);
      setSubmitError("");

      const { error } = await supabase.from("quiz_leads").insert({
        name: name.trim(),
        phone: fullPhone,
        email: email.trim() || null,
        // Human-readable Georgian labels at the top level (admin readability),
        // with the version + raw codes + computed result snapshot carried inside
        // the same JSON. Schema unchanged.
        answers: buildLeadAnswers(answers, result),
        // Medical triage tag (refer_out / needs_labs / qualified) — distinct
        // from the sales-pipeline `status` column the admin manages.
        triage_status: computeTriageStatus(result),
        submitted_at: new Date().toISOString(),
        attribution: getAttribution(),
        session_id: getSessionId(),
      });

      if (error) {
        console.error("Supabase insert error:", error.message);
        setSubmitting(false);
        setSubmitError("დაფიქსირდა შეცდომა. გთხოვ, სცადე ხელახლა.");
        return; // stay on the gate — no advance, no Lead tracking
      }

      setSubmitting(false);

      track({ event_type: "lead_submit", screen: "gate", attribution: getAttribution() });

      fetch("/api/meta-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: fullPhone, email: email.trim() || null, eventId, fbc: fbcRef.current }),
      }).catch(() => {});

      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", {}, { eventID: eventId });
      }
    } else {
      console.info("[dev] gate submit — Supabase insert + Meta Lead tracking skipped", {
        quizVersion: QUIZ_VERSION,
        triage: computeTriageStatus(result),
        fitCategory: result.fitCategory,
      });
    }

    goToPhase("processing", "forward");
  }

  const showProgress = screen === "quiz";

  return (
    <div className={styles.page}>
      {/* Logo is intentionally NOT a link on any quiz screen so visitors stay
          in the funnel. */}
      <span className={styles.logo}>Thamra</span>

      {showProgress && (
        <div className={styles.progressWrap}>
          <span className={styles.progressLabel}>
            კითხვა {currentIndex + 1} / {qList.length}
          </span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((currentIndex + 1) / qList.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className={screen === "result" ? `${styles.main} ${styles.mainResult}` : styles.main}>
        <div
          key={screen === "quiz" ? qid : screen}
          className={direction === "back" ? `${styles.screen} ${styles.back}` : styles.screen}
        >
          {screen === "intro" && (
            <IntroScreen onStart={startQuiz} />
          )}

          {screen === "quiz" && currentQuestion && (
            <QuestionScreen
              question={currentQuestion}
              answers={answers}
              isFirst={currentIndex === 0}
              onBack={goBack}
              onSingleSelect={(v) => handleSingleSelect(currentQuestion, v)}
              onToggleMulti={(v) => toggleMulti(currentQuestion, v)}
              onRating={(v) => handleRating(currentQuestion, v)}
              onNext={goNext}
              answered={isAnswered(currentQuestion)}
            />
          )}

          {screen === "gate" && (
            <GateScreen
              name={name}
              phone={phone}
              email={email}
              nameError={nameError}
              phoneError={phoneError}
              emailError={emailError}
              submitting={submitting}
              submitError={submitError}
              onNameChange={setName}
              onPhoneChange={setPhone}
              onEmailChange={setEmail}
              onSubmit={handleGateSubmit}
              onBack={goBack}
            />
          )}

          {screen === "processing" && <ProcessingScreen onDone={() => goToPhase("result", "forward")} />}

          {screen === "result" && <ResultRouter answers={answers} />}
        </div>
      </div>
    </div>
  );
}

// ─── Result routing ─────────────────────────────────────────────────────────
// Production keeps the existing (legacy) result screen until the new dynamic
// result page ships. Non-production renders a dev-only debug summary of the v2
// model. The paid-consultation CTA is gated by the v2 result in BOTH cases.

function ResultRouter({ answers }: { answers: RawAnswers }) {
  const result = computeResult(answers);
  // verified_high_fit gets the new dynamic result page (dev + production).
  if (resultPage(result) === "vhf") {
    return <ResultScreen answers={answers} />;
  }
  // Every other category keeps the legacy screen in production; dev shows the
  // debug summary of the v2 model.
  if (process.env.NODE_ENV === "production") {
    return (
      <LegacyResultScreen answers={v2ToLegacyAnswers(answers)} />
    );
  }
  return <DevResultSummary result={result} />;
}

// ─── Dev-only result summary (never shown in production) ─────────────────────

function DevResultSummary({ result }: { result: QuizResult }) {
  const activeFlags = (
    [
      ["redFlag", result.redFlag],
      ["manualReview", result.manualReview],
      ["medicalReview", result.medicalReview],
      ["deficiencyIdentified", result.deficiencyIdentified],
      ["strongCompetingTrigger", result.strongCompetingTrigger],
      ["expectationFlag", result.expectationFlag],
      ["noCurrentHairChange", result.noCurrentHairChange],
    ] as const
  )
    .filter(([, v]) => v)
    .map(([k]) => k);

  const rows: Array<[string, string]> = [
    ["fitCategory", result.fitCategory],
    ["resultType", result.resultType],
    ["screeningStatus", result.screeningStatus],
    ["symptomFitScore", `${result.symptomFitScore} (${result.symptomFitLevel})`],
    ["menopauseFitScore", `${result.menopauseFitScore} (${result.menopauseFitLevel})`],
    ["buyingUrgency", result.buyingUrgency],
    ["consultationCta", String(qualifiesForConsultation(result))],
  ];

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: 24,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 14,
        lineHeight: 1.6,
        color: "#2b2b2b",
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 4 }}>DEV result summary</p>
      <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 16 }}>
        {QUIZ_VERSION} — not shown in production
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 16px" }}>
        {rows.map(([k, v]) => (
          <React.Fragment key={k}>
            <span style={{ opacity: 0.6 }}>{k}</span>
            <span style={{ fontWeight: 600 }}>{v}</span>
          </React.Fragment>
        ))}
      </div>
      <p style={{ marginTop: 16, opacity: 0.6 }}>flags</p>
      <p style={{ fontWeight: 600 }}>{activeFlags.length ? activeFlags.join(", ") : "—"}</p>
    </div>
  );
}

// ─── Back arrow SVG ───────────────────────────────────────────────────────────

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Intro screen ─────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className={styles.introWrap}>
      <h1 className={styles.introHeadline}>გაიგე, რა სჭირდება შენს თმას</h1>
      <p className={styles.introText}>
        უპასუხე რამდენიმე კითხვას და გაიგე, როგორ იზრუნო თმის სიჯანსაღეზე მენოპაუზის პერიოდში.
      </p>

      <button className={styles.primaryBtn} onClick={onStart}>
        დაიწყე ტესტი
      </button>
    </div>
  );
}

// ─── Rating scale (1–10) ───────────────────────────────────────────────────────

function RatingScale({
  question,
  value,
  onSelect,
}: {
  question: Question;
  value: number | undefined;
  onSelect: (v: number) => void;
}) {
  const min = question.min ?? 1;
  const max = question.max ?? 10;
  const step = question.step ?? 1;
  const scale: number[] = [];
  for (let n = min; n <= max; n += step) scale.push(n);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {scale.map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              className={selected ? `${styles.option} ${styles.selected}` : styles.option}
              style={{ flex: "0 0 auto", minWidth: 46, textAlign: "center", justifyContent: "center" }}
              aria-pressed={selected}
              onClick={() => onSelect(n)}
            >
              {n}
            </button>
          );
        })}
      </div>
      {(question.minLabel || question.midLabel || question.maxLabel) && (
        <div className={styles.spectrumEnds} style={{ marginTop: 12 }}>
          <span style={{ flex: 1, textAlign: "left" }}>{question.minLabel}</span>
          <span style={{ flex: 1, textAlign: "center" }}>{question.midLabel}</span>
          <span style={{ flex: 1, textAlign: "right" }}>{question.maxLabel}</span>
        </div>
      )}
    </div>
  );
}

// ─── Question screen ──────────────────────────────────────────────────────────

function QuestionScreen({
  question,
  answers,
  isFirst,
  onBack,
  onSingleSelect,
  onToggleMulti,
  onRating,
  onNext,
  answered,
}: {
  question: Question;
  answers: RawAnswers;
  isFirst: boolean;
  onBack: () => void;
  onSingleSelect: (v: string) => void;
  onToggleMulti: (v: string) => void;
  onRating: (v: number) => void;
  onNext: () => void;
  answered: boolean;
}) {
  const multiValues = Array.isArray(answers[question.id]) ? (answers[question.id] as string[]) : [];

  return (
    <div>
      {!isFirst && (
        <button className={styles.backBtn} onClick={onBack} aria-label="უკან">
          <BackArrow />
          უკან
        </button>
      )}

      <h2 className={styles.qHeadline}>{question.title}</h2>
      {question.helper && <p className={styles.qSub}>{question.helper}</p>}
      {question.prefix && <p className={styles.qSub}>{question.prefix}</p>}

      {question.type === "rating" ? (
        <RatingScale question={question} value={answers[question.id] as number | undefined} onSelect={onRating} />
      ) : (
        <div className={styles.options} role={question.type === "multi" ? "group" : undefined}>
          {(question.options ?? []).map((opt) => {
            const isSelected =
              question.type === "single" ? answers[question.id] === opt.id : multiValues.includes(opt.id);

            return (
              <button
                key={opt.id}
                className={isSelected ? `${styles.option} ${styles.selected}` : styles.option}
                onClick={() => (question.type === "single" ? onSingleSelect(opt.id) : onToggleMulti(opt.id))}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <span className={styles.optionCheck} aria-hidden>
                    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                      <path d="M1 5l3.5 3.5L12 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {needsManualNext(question) && (
        <button className={styles.nextBtn} onClick={onNext} disabled={!answered}>
          შემდეგი
        </button>
      )}
    </div>
  );
}

// ─── Processing screen ────────────────────────────────────────────────────────

function ProcessingScreen({ onDone }: { onDone: () => void }) {
  const [textIndex, setTextIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const step = Math.floor(PROCESSING_MS / PROCESSING_TEXTS.length);
    const interval = setInterval(() => {
      setTextIndex((i) => (i + 1 < PROCESSING_TEXTS.length ? i + 1 : i));
    }, step);
    const timer = setTimeout(() => onDoneRef.current(), PROCESSING_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={styles.processingWrap}>
      <div className={styles.processingLogoWrap}>
        {!prefersReducedMotion && (
          <>
            <motion.div
              className={styles.processingPulse}
              animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 0 }}
            />
            <motion.div
              className={styles.processingPulse}
              animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 1.0 }}
            />
          </>
        )}
        <div className={styles.processingLogoInner}>
          <span className={styles.processingMonogram}>T</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={textIndex}
          initial={{ opacity: 0, y: 9 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -9 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={styles.processingText}
        >
          {PROCESSING_TEXTS[textIndex]}
        </motion.p>
      </AnimatePresence>

      <div className={styles.processingBarWrap}>
        <motion.div
          className={styles.processingBar}
          initial={{ width: "0%" }}
          animate={{ width: ["0%", "60%", "90%", "100%"] }}
          transition={{ duration: PROCESSING_MS / 1000, times: [0, 0.3, 0.8, 1.0], ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

// ─── Gate (contact collection) ────────────────────────────────────────────────

function GateScreen({
  name,
  phone,
  email,
  nameError,
  phoneError,
  emailError,
  submitting,
  submitError,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onSubmit,
  onBack,
}: {
  name: string;
  phone: string;
  email: string;
  nameError: string;
  phoneError: string;
  emailError: string;
  submitting: boolean;
  submitError: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div className={styles.emailWrap}>
      <button className={styles.backBtn} onClick={onBack} aria-label="უკან">
        <BackArrow />
        უკან
      </button>

      <h2 className={styles.emailHeadline}>შენი შეფასება</h2>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="quiz-name">სახელი და გვარი</label>
          <input
            id="quiz-name"
            type="text"
            className={nameError ? `${styles.fieldInput} ${styles.hasError}` : styles.fieldInput}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            autoComplete="name"
            placeholder="შენი სახელი და გვარი"
          />
          {nameError && <span className={styles.fieldError}>{nameError}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="quiz-phone">ტელეფონის ნომერი</label>
          <div className={`${styles.phoneWrap} ${phoneError ? styles.phoneError : ""}`}>
            <span className={styles.phonePrefix}>+995</span>
            <input
              id="quiz-phone"
              type="tel"
              inputMode="numeric"
              className={styles.phoneInput}
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              autoComplete="tel-national"
              placeholder="5XX XXX XXX"
            />
          </div>
          {phoneError && <span className={styles.fieldError}>{phoneError}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="quiz-email">
            ელ.ფოსტა <span className={styles.optionalTag}>(არასავალდებულო)</span>
          </label>
          <input
            id="quiz-email"
            type="email"
            inputMode="email"
            className={emailError ? `${styles.fieldInput} ${styles.hasError}` : styles.fieldInput}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            autoComplete="email"
            placeholder="ელ.ფოსტა"
          />
          {emailError && <span className={styles.fieldError}>{emailError}</span>}
        </div>
      </div>

      <button className={styles.submitBtn} onClick={onSubmit} disabled={submitting}>
        {submitting ? "იტვირთება…" : "მაჩვენე ჩემი შედეგი"}
      </button>
      {submitError && (
        <p className={styles.fieldError} role="alert" style={{ textAlign: "center", marginTop: 10 }}>
          {submitError}
        </p>
      )}
      <p className={styles.disclaimer}>
        შენს ნომერს მხოლოდ შენი შედეგისა და შეთავაზებისთვის გამოვიყენებთ.
      </p>
    </div>
  );
}
