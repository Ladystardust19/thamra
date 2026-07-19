"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import styles from "./Quiz.module.css";
import { supabase } from "@/lib/supabase";
import {
  QUESTIONS,
  visibleQuestions,
  hasTriedTreatment,
  computeResult,
  type Answers,
  type Question,
  type Result,
} from "@/lib/scoring";
import {
  WHY_DIFFERENT_INTRO,
  WHY_DIFFERENT_PILLARS,
  WHAT_IS_THAMRA,
  HOW_CREATED,
  SCIENCE_BOARD,
  TRUST_CARDS,
  GOAL_FOCUS,
  HAIR_EXPERT,
  BRIDGE,
  MORE_ACCORDION_LABEL,
} from "@/lib/resultContent";
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

// sessionStorage key holding the visitor's in-progress quiz state (survives refresh)
const STATE_KEY = "thamra_quiz_state_v2";

// THAMRA Hair Expert destination. PLACEHOLDER — points at the existing WhatsApp
// line used elsewhere in the funnel. Swap this for the real Hair Expert chat /
// consultation link when it exists.
const HAIR_EXPERT_LINK =
  "https://wa.me/995598511112?text=" +
  encodeURIComponent("გამარჯობა, მინდა ჩემი THAMRA შედეგის განხილვა.");

// A single-select question needs an explicit "next" only when it also carries a
// secondary toggle (Q2); all other single-selects auto-advance.
function needsManualNext(q: Question): boolean {
  return q.type === "multi" || !!q.secondary;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuizClient() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [qid, setQid] = useState<string>(QUESTIONS[0].id);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [answers, setAnswers] = useState<Answers>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
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

  function goNext() {
    const list = visibleQuestions(answers);
    const idx = list.findIndex((q) => q.id === qid);
    if (idx === -1 || idx === list.length - 1) {
      goToPhase("gate", "forward");
    } else {
      goToQuestion(list[idx + 1].id, "forward");
    }
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
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    if (needsManualNext(q)) return; // Q2 etc. — wait for explicit "next"
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(goNext, 280);
  }

  function toggleSecondary() {
    setAnswers((prev) => ({ ...prev, q2_surgical: !prev.q2_surgical }));
  }

  function toggleMulti(q: Question, value: string) {
    setAnswers((prev) => {
      const none = q.noneOption;
      let arr = Array.isArray(prev[q.id]) ? (prev[q.id] as string[]).slice() : [];

      if (none && value === none) {
        arr = arr.indexOf(none) !== -1 ? [] : [none];
      } else {
        if (none) arr = arr.filter((x) => x !== none);
        arr = arr.indexOf(value) !== -1 ? arr.filter((x) => x !== value) : [...arr, value];
      }

      const next: Answers = { ...prev, [q.id]: arr };
      // Treatment-history conditional cleanup: if nothing tried, drop follow-ups.
      if (q.id === "q12" && !hasTriedTreatment(arr)) {
        delete next.q13;
        delete next.q14;
      }
      return next;
    });
  }

  function isAnswered(q: Question): boolean {
    if (q.type === "multi") {
      const v = answers[q.id];
      return Array.isArray(v) && v.length > 0;
    }
    if (q.secondary) {
      return !!answers[q.id] || !!answers.q2_surgical;
    }
    return !!answers[q.id];
  }

  function handleGateSubmit() {
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

    // Skip lead persistence + Meta conversion tracking outside production so the
    // funnel can be tested locally without polluting the CRM or firing real
    // Lead conversions.
    const isProd = process.env.NODE_ENV === "production";

    if (isProd) {
      supabase.from("quiz_leads").insert({
        name: name.trim(),
        phone: fullPhone,
        email: email.trim() || null,
        answers,
        submitted_at: new Date().toISOString(),
        attribution: getAttribution(),
        session_id: getSessionId(),
      }).then(({ error }) => {
        if (error) console.error("Supabase insert error:", error.message);
      });

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
      console.info("[dev] gate submit — Supabase insert + Meta Lead tracking skipped");
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
          {screen === "intro" && <IntroScreen onStart={goNext} />}

          {screen === "quiz" && currentQuestion && (
            <QuestionScreen
              question={currentQuestion}
              answers={answers}
              isFirst={currentIndex === 0}
              onBack={goBack}
              onSingleSelect={(v) => handleSingleSelect(currentQuestion, v)}
              onToggleMulti={(v) => toggleMulti(currentQuestion, v)}
              onToggleSecondary={toggleSecondary}
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
              onNameChange={setName}
              onPhoneChange={setPhone}
              onEmailChange={setEmail}
              onSubmit={handleGateSubmit}
              onBack={goBack}
            />
          )}

          {screen === "processing" && (
            <ProcessingScreen onDone={() => goToPhase("result", "forward")} />
          )}

          {screen === "result" && <ResultScreen answers={answers} />}
        </div>
      </div>

      {/* Persistent CTA — rendered at page level so position:fixed isn't
          trapped by the transformed screen-transition wrapper. */}
      {screen === "result" && (
        <div className={`${styles.stickyBar} ${styles.stickyBarVisible}`}>
          <div className={styles.stickyBarInner}>
            <div className={styles.stickyBarLeft}>
              <span className={styles.stickyBarTitle}>შენი შედეგი მზადაა</span>
            </div>
            <a
              href={HAIR_EXPERT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.stickyBarBtn}
              onClick={() => track({ event_type: "hair_expert_click", screen: "result" })}
            >
              განიხილე შედეგი
            </a>
          </div>
        </div>
      )}
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

// ─── Question screen ──────────────────────────────────────────────────────────

function QuestionScreen({
  question,
  answers,
  isFirst,
  onBack,
  onSingleSelect,
  onToggleMulti,
  onToggleSecondary,
  onNext,
  answered,
}: {
  question: Question;
  answers: Answers;
  isFirst: boolean;
  onBack: () => void;
  onSingleSelect: (v: string) => void;
  onToggleMulti: (v: string) => void;
  onToggleSecondary: () => void;
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
      {question.hint && <p className={styles.qSub}>{question.hint}</p>}

      <div className={styles.options} role={question.type === "multi" ? "group" : undefined}>
        {question.options.map((opt) => {
          const isSelected =
            question.type === "single" ? answers[question.id] === opt.id : multiValues.includes(opt.id);

          return (
            <button
              key={opt.id}
              className={isSelected ? `${styles.option} ${styles.selected}` : styles.option}
              onClick={() =>
                question.type === "single" ? onSingleSelect(opt.id) : onToggleMulti(opt.id)
              }
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

      {question.secondary && (
        <div className={styles.secondaryToggle}>
          <button
            className={
              answers.q2_surgical
                ? `${styles.option} ${styles.selected}`
                : styles.option
            }
            onClick={onToggleSecondary}
            aria-pressed={!!answers.q2_surgical}
          >
            {answers.q2_surgical && (
              <span className={styles.optionCheck} aria-hidden>
                <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                  <path d="M1 5l3.5 3.5L12 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
            {question.secondary.label}
          </button>
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
    return () => { clearInterval(interval); clearTimeout(timer); };
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
  name, phone, email,
  nameError, phoneError, emailError,
  onNameChange, onPhoneChange, onEmailChange,
  onSubmit, onBack,
}: {
  name: string; phone: string; email: string;
  nameError: string; phoneError: string; emailError: string;
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

      <button className={styles.submitBtn} onClick={onSubmit}>
        მაჩვენე ჩემი შედეგი
      </button>
      <p className={styles.disclaimer}>
        შენს ნომერს მხოლოდ შენი შედეგისა და შეთავაზებისთვის გამოვიყენებთ.
      </p>
    </div>
  );
}

// ─── Reusable result bits ─────────────────────────────────────────────────────

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className={styles.bulletList}>
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

/** Renders body copy that may contain \n\n paragraph breaks. */
function Body({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((p, i) => (
        <p key={i} className={styles.resultText} style={i > 0 ? { marginTop: 10 } : undefined}>
          {p.split("\n").map((line, j) => (
            <React.Fragment key={j}>
              {j > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </p>
      ))}
    </>
  );
}

function Section({ label, heading, children }: { label?: string; heading?: string; children: React.ReactNode }) {
  return (
    <div className={styles.resultSection}>
      {label && <span className={styles.driversLabel}>{label}</span>}
      {heading && <h2 className={styles.sectionHeading}>{heading}</h2>}
      {children}
    </div>
  );
}

// ─── Result editorial content helpers ─────────────────────────────────────────

const HAIR_CHANGE_ORDER = ["shedding", "volume", "partcrown", "quality", "stresssleep"] as const;
type HairChangeKey = (typeof HAIR_CHANGE_ORDER)[number];
type HairSymptomKey = Exclude<HairChangeKey, "stresssleep">;

// Section 1 — short symptom phrases (hair symptoms only, no stress/sleep).
const HAIR_CHANGE_S1: Record<HairSymptomKey, string> = {
  shedding: "მომატებული ცვენა",
  volume: "შემცირებული მოცულობა",
  partcrown: "გაყოფის ხაზისა და გვირგვინის გათხელება",
  quality: "უფრო მშრალი და მტვრევადი თმა",
};

// Section 3 — editorial rows.
const HAIR_CHANGE_ROWS: Record<HairChangeKey, { title: string; text: string }> = {
  shedding: { title: "ცვენა", text: "დაბანის ან დავარცხნის შემდეგ უფრო მეტი თმა გრჩება, ვიდრე ადრე." },
  volume: { title: "მოცულობა", text: "თმის საერთო სისქე ან კუდის მოცულობა შენთვის შესამჩნევად შემცირდა." },
  partcrown: { title: "გაყოფის ხაზი და გვირგვინი", text: "გაყოფის ხაზი ან გვირგვინის არე უფრო გამოკვეთილი გახდა." },
  quality: { title: "თმის ხარისხი", text: "თმა გახდა უფრო მშრალი, თხელი, მტვრევადი ან დაკარგა ბზინვარება." },
  stresssleep: { title: "ძილი და სტრესი", text: "თმის ცვლილებასთან ერთად ძილის ან სტრესის ცვლილებაც გამოიკვეთა." },
};

// Section 2 — hair-stress explanations (indexed by level).
const HAIR_STRESS_EXPLAIN = [
  "შენს პასუხებში თმის ცვლილება ჯერ მსუბუქად იკვეთება.",
  "შენს პასუხებში ცვლილების პირველი ნიშნები ჩანს, თუმცა ისინი ჯერ რამდენიმე მიმართულებით არ არის გამოხატული.",
  "ცვლილება უკვე ერთზე მეტ მიმართულებაში ჩანს — ცვენაში, მოცულობასა და თმის ხარისხში.",
  "შენს პასუხებში თმის ცვენა, გათხელება ან ხარისხის ცვლილება მკვეთრად არის გამოხატული.",
];

const PRIMARY_CONCERN: Record<string, string> = {
  a5_shedding: "ჭარბი ცვენა",
  a5_volume: "თმის მოცულობის შემცირება",
  a5_partcrown: "გაყოფის ხაზისა და გვირგვინის გათხელება",
  a5_finedry: "მშრალი და მტვრევადი თმა",
};

const DESIRED_OUTCOME: Record<string, string> = {
  g_shedding: "ნაკლები ყოველდღიური ცვენა",
  g_fuller: "უფრო სქელი და მოცულობითი თმის იერი",
  g_density: "მეტი სიმკვრივე გაყოფის ხაზსა და გვირგვინთან",
  g_stronger: "უფრო ძლიერი და ნაკლებად მტვრევადი თმა",
};

const GEO_COUNT = ["ერთ", "ორ", "სამ", "ოთხ", "ხუთ"];

function joinGeorgianList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} და ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} და ${items[items.length - 1]}`;
}

/** Derive the meaningful hair-change categories from the raw answers. */
function getSelectedHairChangeKeys(a: Answers): HairChangeKey[] {
  const set = new Set<HairChangeKey>();
  const q3 = Array.isArray(a.q3) ? a.q3 : [];
  if (a.q5 === "a5_shedding") set.add("shedding");
  if (a.q5 === "a5_volume" || a.q9 === "a9_finer" || a.q8 === "a8_selfonly") set.add("volume");
  if (
    a.q5 === "a5_partcrown" ||
    a.q6 === "a6_part" ||
    a.q6 === "a6_crown" ||
    a.q8 === "a8_wider" ||
    a.q8 === "a8_scalp" ||
    a.q8 === "a8_bald"
  )
    set.add("partcrown");
  if (a.q5 === "a5_finedry" || a.q9 === "a9_drier" || a.q9 === "a9_breaks" || a.q9 === "a9_several") set.add("quality");
  if (q3.indexOf("a3_sleep") !== -1 || q3.indexOf("a3_stress") !== -1) set.add("stresssleep");
  return HAIR_CHANGE_ORDER.filter((k) => set.has(k));
}

type MenoBucket = "strong" | "moderate" | "low";

function menoBucket(r: Result): MenoBucket {
  if (r.preMenopause) return "low";
  if (r.menoLevel.index >= 3) return "strong";
  if (r.menoLevel.index >= 1) return "moderate";
  return "low";
}

function getMenopauseConnectionContent(r: Result, a: Answers) {
  const bucket = menoBucket(r);
  const headline =
    bucket === "strong"
      ? "შენი თმის ცვლილება მენოპაუზის პერიოდთან ძლიერად იკვეთება"
      : bucket === "moderate"
      ? "შენი თმის ცვლილება შესაძლოა მენოპაუზის პერიოდთან იყოს დაკავშირებული"
      : "შენი პასუხები მენოპაუზასთან მკაფიო კავშირს არ აჩვენებს";

  const phrases = getSelectedHairChangeKeys(a)
    .filter((k): k is HairSymptomKey => k !== "stresssleep")
    .map((k) => HAIR_CHANGE_S1[k]);
  const symptomLead = phrases.length ? `შენს პასუხებში გამოიკვეთა ${joinGeorgianList(phrases)}.` : "";

  let timing: string | null = null;
  if (bucket !== "low") {
    timing =
      a.q4 === "a4_same"
        ? "ისიც, რომ ეს ცვლილებები მენოპაუზის ნიშნებთან ახლოს დაიწყო, ამ კავშირს კიდევ უფრო აძლიერებს."
        : "ამ პერიოდში თმაზე ერთდროულად რამდენიმე ცვლილების გამოჩენა ხშირია.";
  }
  return { headline, symptomLead, timing };
}

function getPrimaryConcernLabel(a: Answers, r: Result): string {
  return (a.q5 && PRIMARY_CONCERN[a.q5]) || r.strongestSymptom;
}

function getDesiredOutcomeLabel(g: string | null): string | null {
  return g ? DESIRED_OUTCOME[g] ?? null : null;
}

// ─── Editorial reveal wrapper (fade + translateY, reduced-motion safe) ─────────

function RevealSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

// ─── Result sections ──────────────────────────────────────────────────────────

function MenopauseConnectionSection({
  r,
  answers,
  onNext,
}: {
  r: Result;
  answers: Answers;
  onNext: () => void;
}) {
  const c = getMenopauseConnectionContent(r, answers);
  return (
    <RevealSection id="result-menopause-connection" className={`${styles.mSection} ${styles.mHero}`}>
      <span className={styles.mEyebrow}>შენი შეფასება</span>
      <h1 className={styles.mHeadline}>{c.headline}</h1>
      {(c.symptomLead || c.timing) && (
        <p className={styles.mBody}>
          {c.symptomLead}
          {c.symptomLead && c.timing ? " " : ""}
          {c.timing}
        </p>
      )}
      {r.messages.length > 0 && (
        <div className={styles.mNotices}>
          {r.messages.map((m, i) => (
            <p key={i} className={styles.mNotice}>
              {m.text}
            </p>
          ))}
        </div>
      )}
      <button type="button" className={styles.mBtn} onClick={onNext}>
        ნახე შენი თმის სტრესის დონე
      </button>
    </RevealSection>
  );
}

function HairStressSection({
  r,
  answers,
  onNext,
}: {
  r: Result;
  answers: Answers;
  onNext: () => void;
}) {
  const idx = r.hairStressLevel.index;
  const concern = getPrimaryConcernLabel(answers, r);
  const outcome = getDesiredOutcomeLabel(r.desiredOutcome);
  return (
    <RevealSection id="result-hair-stress" className={styles.mSection}>
      <span className={styles.mEyebrow}>თმის სტრესის დონე</span>
      <p className={styles.mBigWord}>{r.hairStressLevel.label}</p>
      <div
        className={styles.meter}
        role="meter"
        aria-valuemin={1}
        aria-valuemax={4}
        aria-valuenow={idx + 1}
        aria-label="თმის სტრესის დონე"
      >
        <div className={styles.meterTrack}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={i === idx ? styles.meterDotActive : styles.meterDot} />
          ))}
        </div>
        <div className={styles.meterEnds}>
          <span>დაბალი</span>
          <span>მაღალი</span>
        </div>
      </div>
      <p className={styles.mBody}>{HAIR_STRESS_EXPLAIN[idx]}</p>
      <div className={styles.insightRows}>
        <div className={styles.insightRow}>
          <span className={styles.insightLabel}>ყველაზე შესამჩნევი ცვლილება</span>
          <span className={styles.insightValue}>{concern}</span>
        </div>
        {outcome && (
          <div className={styles.insightRow}>
            <span className={styles.insightLabel}>შენთვის ყველაზე მნიშვნელოვანი შედეგი</span>
            <span className={styles.insightValue}>{outcome}</span>
          </div>
        )}
      </div>
      <button type="button" className={styles.mBtn} onClick={onNext}>
        ნახე, რა გამოიკვეთა შენს პასუხებში
      </button>
    </RevealSection>
  );
}

function HairChangesSection({ answers, onNext }: { answers: Answers; onNext: () => void }) {
  const keys = getSelectedHairChangeKeys(answers);
  const countWord = GEO_COUNT[keys.length - 1] ?? String(keys.length);
  return (
    <RevealSection id="result-hair-changes" className={styles.mSection}>
      <span className={styles.mEyebrow}>შენი პასუხების მიხედვით</span>
      <h2 className={styles.mHeadline}>{`შენს შემთხვევაში ცვლილება ${countWord} მიმართულებაში იკვეთება`}</h2>
      <div className={styles.changeRows}>
        {keys.map((k, i) => (
          <div key={k} className={styles.changeRow}>
            <span className={styles.changeNum} aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className={styles.changeBody}>
              <h3 className={styles.changeTitle}>{HAIR_CHANGE_ROWS[k].title}</h3>
              <p className={styles.changeText}>{HAIR_CHANGE_ROWS[k].text}</p>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className={styles.mBtn} onClick={onNext}>
        გავაგრძელოთ
      </button>
    </RevealSection>
  );
}

// ─── Treatment comparison ─────────────────────────────────────────────────────

type ComparisonLevel = "full" | "partial" | "not_primary";
type TreatmentCategory = "general_supplements" | "topical_treatments" | "procedures" | "none";

const COMPARISON_ROW_LABELS = [
  "შექმნილია მენოპაუზის პერიოდში შეცვლილი თმისთვის",
  "ერთდროულად ზრუნავს ცვენაზე, გათხელებასა და თმის ხარისხზე",
  "ითვალისწინებს სტრესისა და ძილის ცვლილებებს",
  "ზრუნავს უფრო ძლიერ და ნაკლებად მტვრევად თმაზე",
  "ყოველდღიური, შინაგანი ზრუნვა",
];

const COMPARATOR_LEVELS: Record<TreatmentCategory, ComparisonLevel[]> = {
  general_supplements: ["not_primary", "partial", "not_primary", "partial", "full"],
  topical_treatments: ["not_primary", "partial", "not_primary", "partial", "not_primary"],
  procedures: ["not_primary", "partial", "not_primary", "partial", "not_primary"],
  none: ["not_primary", "partial", "not_primary", "partial", "partial"],
};

const COMPARATOR_LABEL: Record<TreatmentCategory, string> = {
  general_supplements: "ბიოტინი და მულტივიტამინები",
  topical_treatments: "შამპუნები, სერუმები და ადგილობრივი საშუალები",
  procedures: "პროცედურები",
  none: "გავრცელებული თმის მიდგომები",
};

const COMPARISON_INTRO: Record<TreatmentCategory, string> = {
  general_supplements:
    "შენ აქამდე ზოგადი თმის დანამატები სცადე. THAMRA განსხვავებულია იმით, რომ თავიდანვე მენოპაუზის პერიოდში შეცვლილი თმის რამდენიმე საჭიროებისთვის შეიქმნა.",
  topical_treatments:
    "შენ აქამდე ძირითადად ადგილობრივი საშუალებები სცადე. THAMRA ყოველდღიური ბიოაქტიური კომპლექსია, რომელიც მენოპაუზის პერიოდში თმის ცვლილებას ორგანიზმის შიგნიდან უდგება.",
  procedures:
    "შენ უკვე სცადე თმისთვის განკუთვნილი პროცედურები. THAMRA მათგან განსხვავებით ყოველდღიური, თანმიმდევრული ზრუნვისთვის შექმნილი 6-თვიანი პროგრამაა.",
  none:
    "ეს შეიძლება იყოს შენი პირველი მიზანმიმართული ნაბიჯი. THAMRA თავიდანვე მენოპაუზის პერიოდში შეცვლილი თმის მრავალმხრივი ზრუნვისთვის შეიქმნა.",
};

const LEVEL_SR: Record<ComparisonLevel, string> = {
  full: "სრულად ითვალისწინებს",
  partial: "ნაწილობრივ ითვალისწინებს",
  not_primary: "არ არის ძირითადი მიმართულება",
};

/** Map the previous-treatment answer (q12, multi-select) into comparison categories. */
function getSelectedTreatmentCategories(a: Answers): TreatmentCategory[] {
  const q12 = Array.isArray(a.q12) ? a.q12 : [];
  const cats: TreatmentCategory[] = [];
  if (q12.indexOf("a12_supp") !== -1) cats.push("general_supplements");
  if (q12.indexOf("a12_minox") !== -1) cats.push("topical_treatments");
  if (q12.indexOf("a12_proc") !== -1) cats.push("procedures");
  return cats.length > 0 ? cats : ["none"];
}

function getPersonalizedComparisonIntro(c: TreatmentCategory): string {
  return COMPARISON_INTRO[c];
}

function ComparisonMarker({ level, columnLabel }: { level: ComparisonLevel; columnLabel: string }) {
  return (
    <span className={styles.markerWrap}>
      <span className={`${styles.marker} ${styles["marker_" + level]}`} aria-hidden />
      <span className={styles.srOnly}>{`${columnLabel} — ${LEVEL_SR[level]}`}</span>
    </span>
  );
}

// The comparison shows THAMRA against the two most common prior approaches.
const MATRIX_COMPARATORS: TreatmentCategory[] = ["general_supplements", "topical_treatments"];

function ComparisonMatrix() {
  const lastRow = COMPARISON_ROW_LABELS.length - 1;
  return (
    <div className={styles.matrix} role="table" aria-label="შედარება THAMRA-სთან">
      <div className={styles.matrixHead} role="row">
        <span className={`${styles.cellLabel} ${styles.cellHeadLabel}`} role="columnheader" aria-hidden />
        <span className={`${styles.cellHeadThamra} ${styles.cellThamra} ${styles.cellThamraTop}`} role="columnheader">
          THAMRA
        </span>
        {MATRIX_COMPARATORS.map((c) => (
          <span key={c} className={styles.cellHeadComp} role="columnheader">
            {COMPARATOR_LABEL[c]}
          </span>
        ))}
      </div>
      {COMPARISON_ROW_LABELS.map((label, i) => (
        <div className={styles.matrixRow} role="row" key={i}>
          <span className={styles.cellLabel} role="cell">
            {label}
          </span>
          <span
            className={`${styles.cellMarker} ${styles.cellThamra} ${i === lastRow ? styles.cellThamraBottom : ""}`}
            role="cell"
          >
            <ComparisonMarker level="full" columnLabel="THAMRA" />
          </span>
          {MATRIX_COMPARATORS.map((c) => (
            <span key={c} className={`${styles.cellMarker} ${styles.cellComp}`} role="cell">
              <ComparisonMarker level={COMPARATOR_LEVELS[c][i]} columnLabel={COMPARATOR_LABEL[c]} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function TreatmentComparisonSection({ answers }: { answers: Answers }) {
  const categories = getSelectedTreatmentCategories(answers);
  const intro = getPersonalizedComparisonIntro(categories[0]);

  return (
    <RevealSection id="result-treatment" className={`${styles.mSection} ${styles.compareSection}`}>
      <div className={styles.compareInner}>
        <div className={styles.compareLeft}>
          <span className={`${styles.mEyebrow} ${styles.compareEyebrow}`}>შენი გამოცდილების მიხედვით</span>
          <h2 className={styles.compareHeadline}>როგორ განსხვავდება THAMRA</h2>
          <p className={styles.compareIntro}>{intro}</p>
        </div>
        <div className={styles.compareRight}>
          <ComparisonMatrix />
          <p className={styles.compareLegend}>
            <span>
              <span className={`${styles.legendMarker} ${styles.marker_full}`} aria-hidden /> სრულად ითვალისწინებს
            </span>
            <span>
              <span className={`${styles.legendMarker} ${styles.marker_partial}`} aria-hidden /> ნაწილობრივ
            </span>
            <span>
              <span className={`${styles.legendMarker} ${styles.marker_not_primary}`} aria-hidden /> არ არის ძირითადი მიმართულება
            </span>
          </p>
          <p className={styles.compareClarify}>
            თითოეულ მიდგომას განსხვავებული დანიშნულება აქვს. შედარება აჩვენებს მათ ძირითად მიმართულებებს; კონკრეტული
            პროდუქტები და პროცედურები შეიძლება განსხვავდებოდეს.
          </p>
        </div>
      </div>
    </RevealSection>
  );
}

// ─── Result page ──────────────────────────────────────────────────────────────

function ResultScreen({ answers }: { answers: Answers }) {
  const r = computeResult(answers);
  const [moreOpen, setMoreOpen] = useState(false);
  const reduce = useReducedMotion();

  function scrollTo(id: string) {
    if (typeof document === "undefined") return;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function onHairExpert() {
    track({ event_type: "hair_expert_click", screen: "result" });
  }

  const goalFocus = r.desiredOutcome ? GOAL_FOCUS[r.desiredOutcome] : null;

  return (
    <div className={styles.resultWrap}>
      {/* SECTION 1 — menopause connection (no product compatibility here) */}
      <MenopauseConnectionSection r={r} answers={answers} onNext={() => scrollTo("result-hair-stress")} />

      {/* SECTION 2 — hair stress level */}
      <HairStressSection r={r} answers={answers} onNext={() => scrollTo("result-hair-changes")} />

      {/* SECTION 3 — personalized hair changes */}
      <HairChangesSection answers={answers} onNext={() => scrollTo("result-treatment")} />

      {/* Treatment comparison — how THAMRA differs from what she previously tried */}
      <TreatmentComparisonSection answers={answers} />

      {/* Trust / education — collapsed by default */}
      <RevealSection className={styles.mSection}>
        <button
          className={styles.accordionToggle}
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
        >
          <span>{MORE_ACCORDION_LABEL}</span>
          <span className={moreOpen ? styles.accordionChevronOpen : styles.accordionChevron} aria-hidden>
            ⌄
          </span>
        </button>

        {moreOpen && (
          <div className={styles.accordionPanel}>
            <Section label="რატომ არის THAMRA განსხვავებული" heading={WHY_DIFFERENT_INTRO.heading}>
              <Body text={WHY_DIFFERENT_INTRO.body} />
              <div className={styles.pillars}>
                {WHY_DIFFERENT_PILLARS.map((p) => (
                  <div key={p.title} className={styles.pillarItem}>
                    <p className={styles.pillarTitle}>{p.title}</p>
                    <p className={styles.pillarBody}>{p.body}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section label="რა არის THAMRA" heading={WHAT_IS_THAMRA.heading}>
              <p className={styles.resultText}>{WHAT_IS_THAMRA.intro}</p>
              <BulletList items={WHAT_IS_THAMRA.bullets} />
              <p className={styles.resultText} style={{ marginTop: 10 }}>{WHAT_IS_THAMRA.outro}</p>
            </Section>

            <Section label="როგორ შეიქმნა THAMRA" heading={HOW_CREATED.heading}>
              {HOW_CREATED.paragraphs.map((p, i) => (
                <Body key={i} text={p} />
              ))}
            </Section>

            <Section label="საერთაშორისო სამეცნიერო ხედვა" heading={SCIENCE_BOARD.heading}>
              {SCIENCE_BOARD.paragraphs.map((p, i) => (
                <Body key={i} text={p} />
              ))}
            </Section>

            <Section label="რატომ შეგიძლია ენდო THAMRA-ს">
              <div className={styles.trustGrid}>
                {TRUST_CARDS.map((c) => (
                  <div key={c.title} className={styles.trustCard}>
                    <p className={styles.trustCardTitle}>{c.title}</p>
                    <p className={styles.trustCardBody}>{c.body}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </RevealSection>

      {/* Recommendation — softer compatibility wording, shown only after the
          woman has seen connection → stress → changes → treatment. */}
      <RevealSection className={styles.mSection}>
        <span className={styles.mEyebrow}>{BRIDGE.label}</span>
        <h2 className={styles.mHeadline}>{BRIDGE.heading}</h2>
        {!r.redFlag && (
          <p className={styles.mBody}>შენი საჭიროებები კარგად ემთხვევა THAMRA-ს მრავალმხრივ მიდგომას.</p>
        )}
        {goalFocus && (
          <>
            <p className={styles.resultText}>{BRIDGE.lead}</p>
            <BulletList items={goalFocus} />
          </>
        )}
      </RevealSection>

      {/* Hair Expert CTA block (sticky bottom bar remains the primary action) */}
      <div className={styles.hairExpertBlock}>
        <span className={styles.driversLabel}>შემდეგი ნაბიჯი</span>
        <h2 className={styles.sectionHeading}>{HAIR_EXPERT.heading}</h2>
        <p className={styles.resultText}>{HAIR_EXPERT.helpLead}</p>
        <BulletList items={HAIR_EXPERT.helpBullets} />
        <a
          href={HAIR_EXPERT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.ctaBtn} ${styles.ctaBtnGhost}`}
          onClick={onHairExpert}
        >
          {HAIR_EXPERT.ctaLabel}
        </a>
        <p className={styles.hairExpertNote}>{HAIR_EXPERT.note}</p>
      </div>
    </div>
  );
}
