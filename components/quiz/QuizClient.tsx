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
  OUTCOME_LABEL,
  type Answers,
  type Question,
} from "@/lib/scoring";
import {
  TREATMENT_TRIED,
  TREATMENT_DURATION,
  TREATMENT_RESULT,
  WHY_DIFFERENT_INTRO,
  WHY_DIFFERENT_PILLARS,
  WHAT_IS_THAMRA,
  HOW_CREATED,
  SCIENCE_BOARD,
  TRUST_CARDS,
  GOAL_FOCUS,
  HAIR_EXPERT,
  RESULT_DISCLAIMER,
  HAIR_STRESS_MEANING,
  MENO_MEANING,
  THAMRA_MEANING,
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

    if (!email.trim()) {
      setEmailError("ელ.ფოსტა სავალდებულოა");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("შეიყვანე სწორი ელ.ფოსტა");
      valid = false;
    } else setEmailError("");

    if (!valid) return;

    const fullPhone = `+995${rawPhone}`;
    const eventId = crypto.randomUUID();

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

      <div className={styles.main}>
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
          <label className={styles.fieldLabel} htmlFor="quiz-email">ელ.ფოსტა</label>
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

// ─── Hair-stress gauge (pure SVG, ported from prototype) ──────────────────────

const GAUGE_LABELS = ["დაბალი", "საწყისი", "მომატებული", "მაღალი"];
const SEG_COLORS = ["#9fb08a", "#d9b866", "#cf8a5c", "#7a2337"];

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}
function n(v: number) {
  return Math.round(v * 100) / 100;
}

function Gauge({ activeIndex }: { activeIndex: number }) {
  const cx = 160, cy = 172, R = 122, sw = 26;
  const segs = [];
  for (let i = 0; i < 4; i++) {
    const aStart = 180 - i * 45;
    const aEnd = 180 - (i + 1) * 45;
    const p1 = polar(cx, cy, R, aStart);
    const p2 = polar(cx, cy, R, aEnd);
    const active = i === activeIndex;
    segs.push(
      <path
        key={i}
        d={`M ${n(p1.x)} ${n(p1.y)} A ${R} ${R} 0 0 1 ${n(p2.x)} ${n(p2.y)}`}
        fill="none"
        stroke={SEG_COLORS[i]}
        strokeWidth={active ? sw + 6 : sw}
        strokeLinecap="round"
        opacity={active ? 1 : 0.28}
      />
    );
  }
  const midAngle = 180 - activeIndex * 45 - 22.5;
  const tip = polar(cx, cy, R - 6, midAngle);
  const tail = polar(cx, cy, 16, midAngle + 180);

  return (
    <svg className={styles.gauge} viewBox="0 0 320 200" role="img" aria-label="თმის სტრესის დონე">
      {segs}
      <line x1={n(tail.x)} y1={n(tail.y)} x2={n(tip.x)} y2={n(tip.y)} stroke="#45101d" strokeWidth={4} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={9} fill="#45101d" />
      <circle cx={cx} cy={cy} r={3.6} fill="#faf5ec" />
    </svg>
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
      {heading && <h3 className={styles.sectionHeading}>{heading}</h3>}
      {children}
    </div>
  );
}

// ─── Result page (13-section spec) ────────────────────────────────────────────

function ResultScreen({ answers }: { answers: Answers }) {
  const r = computeResult(answers);
  const [moreOpen, setMoreOpen] = useState(false);

  function onHairExpert() {
    track({ event_type: "hair_expert_click", screen: "result" });
  }

  const triedList = (r.previousTreatments || []).filter((id) => TREATMENT_TRIED[id]);
  const goalFocus = r.desiredOutcome ? GOAL_FOCUS[r.desiredOutcome] : null;

  return (
    <div className={styles.resultWrap} style={{ paddingBottom: 96 }}>
      {/* Header */}
      <span className={styles.driversLabel}>შენი შეფასება</span>
      <h2 className={styles.resultHeadline} style={{ marginTop: 6 }}>შენი თმის პროფილი</h2>

      {/* Mandated notices */}
      {r.messages.map((m, i) => (
        <div
          key={i}
          className={m.type === "redFlag" ? `${styles.notice} ${styles.noticeRed}` : `${styles.notice} ${styles.noticeCompeting}`}
        >
          {m.text}
        </div>
      ))}

      {/* ── PROFILE CARD: the scannable, personalized snapshot ── */}
      <div className={styles.resultCard}>
        <span className={styles.driversLabel}>თმის სტრესის დონე</span>
        <div className={styles.gaugeWrap}>
          <Gauge activeIndex={r.hairStressLevel.index} />
        </div>
        <p className={styles.gaugeValue}>{r.hairStressLevel.label}</p>
        <div className={styles.gaugeLegend}>
          {GAUGE_LABELS.map((l, i) => (
            <span key={l} className={i === r.hairStressLevel.index ? styles.gaugeLegendActive : undefined}>
              {l}
            </span>
          ))}
        </div>
        <p className={styles.gaugeMeaning}>{HAIR_STRESS_MEANING[r.hairStressLevel.index]}</p>

        <div className={styles.levelRows}>
          <div className={styles.levelRow}>
            <div className={styles.levelRowHead}>
              <span className={styles.levelRowLabel}>მენოპაუზასთან კავშირი</span>
              <span className={`${styles.levelPill} ${styles["lvl" + r.menoLevel.index]}`}>{r.menoLevel.label}</span>
            </div>
            <p className={styles.levelMeaning}>{MENO_MEANING[r.menoLevel.index]}</p>
          </div>

          {!r.redFlag && (
            <div className={styles.levelRow}>
              <div className={styles.levelRowHead}>
                <span className={styles.levelRowLabel}>THAMRA-სთან შესაბამისობა</span>
                <span className={`${styles.levelPill} ${styles["lvl" + r.thamraLevel.index]}`}>{r.thamraLevel.label}</span>
              </div>
              <p className={styles.levelMeaning}>{THAMRA_MEANING[r.thamraLevel.index]}</p>
            </div>
          )}
        </div>

        <div className={styles.quickFacts}>
          <div className={styles.quickFact}>
            <span className={styles.qfLabel}>მთავარი საზრუნავი</span>
            <span className={styles.qfValue}>{r.strongestSymptom}</span>
          </div>
          {r.desiredOutcome && OUTCOME_LABEL[r.desiredOutcome] && (
            <div className={styles.quickFact}>
              <span className={styles.qfLabel}>შენი მიზანი</span>
              <span className={styles.qfValue}>{OUTCOME_LABEL[r.desiredOutcome]}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── PERSONALIZED BRIDGE: profile → what THAMRA focuses on ── */}
      {goalFocus && (
        <Section label={BRIDGE.label} heading={BRIDGE.heading}>
          <p className={styles.resultText}>{BRIDGE.lead}</p>
          <BulletList items={goalFocus} />
        </Section>
      )}

      {/* ── PRIMARY CTA: Hair Expert (moved up, reachable fast) ── */}
      <div className={styles.hairExpertBlock}>
        <span className={styles.driversLabel}>შემდეგი ნაბიჯი</span>
        <h3 className={styles.sectionHeading}>{HAIR_EXPERT.heading}</h3>
        <p className={styles.resultText}>{HAIR_EXPERT.introLead}</p>
        <BulletList items={HAIR_EXPERT.assessmentBullets} />
        <p className={styles.resultText} style={{ marginTop: 12 }}>{HAIR_EXPERT.helpLead}</p>
        <BulletList items={HAIR_EXPERT.helpBullets} />
        <a
          href={HAIR_EXPERT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ctaBtn}
          onClick={onHairExpert}
        >
          {HAIR_EXPERT.ctaLabel}
        </a>
        <p className={styles.hairExpertNote}>{HAIR_EXPERT.note}</p>
      </div>

      {/* 5 — რა სცადე აქამდე (treatment history) */}
      {(triedList.length > 0) && (
        <Section label="რა სცადე აქამდე">
          {triedList.map((id, idx) => {
            const b = TREATMENT_TRIED[id];
            return (
              <div key={id} style={idx > 0 ? { marginTop: 18 } : undefined}>
                <h3 className={styles.sectionHeading}>{b.title}</h3>
                <Body text={b.body} />
                {b.bullets && <BulletList items={b.bullets} />}
                {b.outro && <Body text={b.outro} />}
              </div>
            );
          })}
          {r.treatmentDuration && TREATMENT_DURATION[r.treatmentDuration] && (
            <p className={styles.resultText} style={{ marginTop: 14 }}>
              {TREATMENT_DURATION[r.treatmentDuration]}
            </p>
          )}
          {r.previousTreatmentResult && TREATMENT_RESULT[r.previousTreatmentResult] && (
            <p className={styles.resultText} style={{ marginTop: 10 }}>
              {TREATMENT_RESULT[r.previousTreatmentResult]}
            </p>
          )}
        </Section>
      )}

      <div className={styles.resultDivider} />

      {/* ── LEARN MORE: all brand/education copy, collapsed by default ── */}
      <button
        className={styles.accordionToggle}
        onClick={() => setMoreOpen((v) => !v)}
        aria-expanded={moreOpen}
      >
        <span>{MORE_ACCORDION_LABEL}</span>
        <span className={moreOpen ? styles.accordionChevronOpen : styles.accordionChevron} aria-hidden>⌄</span>
      </button>

      {moreOpen && (
        <div className={styles.accordionPanel}>
          {/* რატომ არის THAMRA განსხვავებული */}
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

          {/* რა არის THAMRA */}
          <Section label="რა არის THAMRA" heading={WHAT_IS_THAMRA.heading}>
            <p className={styles.resultText}>{WHAT_IS_THAMRA.intro}</p>
            <BulletList items={WHAT_IS_THAMRA.bullets} />
            <p className={styles.resultText} style={{ marginTop: 10 }}>{WHAT_IS_THAMRA.outro}</p>
          </Section>

          {/* როგორ შეიქმნა THAMRA */}
          <Section label="როგორ შეიქმნა THAMRA" heading={HOW_CREATED.heading}>
            {HOW_CREATED.paragraphs.map((p, i) => (
              <Body key={i} text={p} />
            ))}
          </Section>

          {/* საერთაშორისო სამეცნიერო ხედვა */}
          <Section label="საერთაშორისო სამეცნიერო ხედვა" heading={SCIENCE_BOARD.heading}>
            {SCIENCE_BOARD.paragraphs.map((p, i) => (
              <Body key={i} text={p} />
            ))}
          </Section>

          {/* Trust cards */}
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

      <p className={styles.footnote} style={{ marginTop: 24 }}>{RESULT_DISCLAIMER}</p>
    </div>
  );
}
