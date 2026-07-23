"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import styles from "./Quiz.module.css";
import ConsultationBooking from "./ConsultationBooking";
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
  ABOUT_THAMRA,
  ABOUT_WHO,
  ABOUT_BENEFITS,
  ABOUT_TRUST,
  ABOUT_ORIGIN,
  type BenefitTile,
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

// ─── WhatsApp glyph ───────────────────────────────────────────────────────────

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.83c2.16 0 4.19.84 5.72 2.37a8.06 8.06 0 0 1 2.37 5.72c0 4.54-3.7 8.24-8.24 8.24-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24Zm-4.6 4.4c-.22 0-.57.08-.87.4-.3.33-1.15 1.12-1.15 2.73s1.18 3.17 1.34 3.39c.16.22 2.32 3.54 5.62 4.96.78.34 1.4.54 1.87.69.79.25 1.5.22 2.07.13.63-.09 1.94-.79 2.21-1.56.27-.77.27-1.43.19-1.56-.08-.14-.3-.22-.63-.38-.33-.16-1.94-.96-2.24-1.07-.3-.11-.52-.16-.74.16-.22.33-.85 1.07-1.04 1.29-.19.22-.38.24-.71.08-.33-.16-1.39-.51-2.65-1.63-.98-.87-1.64-1.95-1.83-2.28-.19-.33-.02-.5.14-.67.15-.15.33-.38.49-.58.16-.19.22-.33.33-.55.11-.22.06-.41-.03-.58-.08-.16-.72-1.78-1.02-2.44-.24-.53-.49-.53-.71-.54-.18-.01-.39-.01-.6-.01Z" />
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

/** Independently collapsible "learn more" card with a teaser header (large tap
 *  target) that expands to reveal its content. */
function InfoCard({
  label,
  teaser,
  defaultOpen = false,
  children,
}: {
  label: string;
  teaser: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`${styles.infoCard} ${open ? styles.infoCardOpen : ""}`}>
      <button
        type="button"
        className={styles.infoCardHeader}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.infoCardHeaderText}>
          <span className={styles.infoCardLabel}>{label}</span>
          {teaser && <span className={styles.infoCardTeaser}>{teaser}</span>}
        </span>
        <span className={open ? styles.infoCardChevronOpen : styles.infoCardChevron} aria-hidden>
          ⌄
        </span>
      </button>
      {open && <div className={styles.infoCardPanel}>{children}</div>}
    </div>
  );
}

/** Simple line icons for the 5 formula-benefit tiles (stroke = currentColor). */
function BenefitIcon({ name }: { name: BenefitTile["icon"] }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "shed": // fuller strands
      return (
        <svg {...common}>
          <path d="M7 21c0-5 1-9 3-13" />
          <path d="M12 21c0-6 1.5-11 4-15" />
          <path d="M17 21c0-4 .5-7 1.5-10" />
        </svg>
      );
    case "strand": // strong, resilient strands
      return (
        <svg {...common}>
          <path d="M7 3c4 3 4 6 0 9s-4 6 0 9" />
          <path d="M15 3c4 3 4 6 0 9s-4 6 0 9" />
        </svg>
      );
    case "calm": // moon / restful sleep
      return (
        <svg {...common}>
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        </svg>
      );
    case "scalp": // sprout from follicle
      return (
        <svg {...common}>
          <path d="M12 21v-8" />
          <path d="M12 13c0-3-2-5-5-5 0 3 2 5 5 5z" />
          <path d="M12 11c0-3 2-5 5-5 0 3-2 5-5 5z" />
        </svg>
      );
    case "hydrate": // droplet
      return (
        <svg {...common}>
          <path d="M12 3s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10z" />
        </svg>
      );
  }
}

// ─── Result editorial content helpers ─────────────────────────────────────────

const HAIR_CHANGE_ORDER = ["shedding", "volume", "partcrown", "quality", "stresssleep"] as const;
type HairChangeKey = (typeof HAIR_CHANGE_ORDER)[number];
type HairSymptomKey = Exclude<HairChangeKey, "stresssleep">;

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
  "",
  "შენს პასუხებში თმის ცვენა, გათხელება ან ხარისხის ცვლილება მკვეთრად არის გამოხატული.",
];

const GEO_COUNT = ["ერთ", "ორ", "სამ", "ოთხ", "ხუთ"];

// ─── Hair-spectrum visualization — organic overlapping-strand band ─────────────
// Deterministic (no random) so SSR and client render identically.
const fmtN = (n: number) => Math.round(n * 10) / 10;

function buildStrandPath(baseY: number, amp: number, phase: number): string {
  const W = 400;
  const N = 8;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= N; i++) {
    const x = (W * i) / N;
    const y = baseY + amp * Math.sin(phase + (i / N) * Math.PI * 2.4);
    pts.push([x, y]);
  }
  let d = `M ${fmtN(pts[0][0])} ${fmtN(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${fmtN(c1x)} ${fmtN(c1y)}, ${fmtN(c2x)} ${fmtN(c2y)}, ${fmtN(p2[0])} ${fmtN(p2[1])}`;
  }
  return d;
}

// 13 semi-transparent curved strands: warm-burgundy ones read on the light
// left, ivory ones read on the deep right — layered like overlapping hair.
const HAIR_STRANDS = Array.from({ length: 13 }, (_, i) => {
  const t = i / 12;
  const baseY = 7 + t * 50;
  const amp = 3 + (i % 4) * 1.6;
  const phase = i * 0.7;
  const stroke = i % 3 === 0 ? "rgba(120,30,42,0.16)" : "rgba(255,248,240,0.34)";
  const width = i % 2 === 0 ? 1 : 1.4;
  return { d: buildStrandPath(baseY, amp, phase), stroke, width };
});

// Maps the level index (0–3) to the glowing orb's position along the band.
function orbPosition(idx: number): number {
  const clamped = Math.max(0, Math.min(3, idx));
  return 12 + clamped * (76 / 3); // 12% · 37.3% · 62.7% · 88%
}

/** Derive the meaningful hair-change categories from the raw answers. */
function getSelectedHairChangeKeys(a: Answers): HairChangeKey[] {
  const set = new Set<HairChangeKey>();
  const q3 = Array.isArray(a.q3) ? a.q3 : [];
  const q5 = Array.isArray(a.q5) ? a.q5 : [];
  if (q5.includes("a5_shedding")) set.add("shedding");
  if (q5.includes("a5_volume") || a.q9 === "a9_finer" || a.q8 === "a8_selfonly") set.add("volume");
  if (
    q5.includes("a5_partcrown") ||
    a.q6 === "a6_part" ||
    a.q6 === "a6_crown" ||
    a.q8 === "a8_wider" ||
    a.q8 === "a8_scalp" ||
    a.q8 === "a8_bald"
  )
    set.add("partcrown");
  if (q5.includes("a5_finedry") || a.q9 === "a9_drier" || a.q9 === "a9_breaks" || a.q9 === "a9_several") set.add("quality");
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
      : "";

  let timing: string | null = null;
  if (bucket !== "low") {
    timing =
      a.q4 === "a4_same"
        ? "ისიც, რომ ეს ცვლილებები მენოპაუზის ნიშნებთან ახლოს დაიწყო, ამ კავშირს კიდევ უფრო აძლიერებს."
        : "ამ პერიოდში თმაზე ერთდროულად რამდენიმე ცვლილების გამოჩენა ხშირია.";
  }
  return { headline, timing };
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
}: {
  r: Result;
  answers: Answers;
}) {
  const c = getMenopauseConnectionContent(r, answers);
  return (
    <RevealSection id="result-menopause-connection" className={`${styles.mSection} ${styles.mHero}`}>
      <span className={styles.mEyebrow}>შენი შეფასება</span>
      {c.headline && <h1 className={styles.mHeadline}>{c.headline}</h1>}
      {c.timing && (
        <p className={styles.mBody}>{c.timing}</p>
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
    </RevealSection>
  );
}

function HairStressSection({
  r,
}: {
  r: Result;
}) {
  const idx = Math.max(0, Math.min(3, r.hairStressLevel.index));
  return (
    <RevealSection id="result-hair-stress" className={styles.mSection}>
      <span className={styles.mEyebrow}>თმის სტრესის დონე</span>
      <p className={styles.mBigWord}>{r.hairStressLevel.label}</p>

      <div className={styles.spectrumWrap}>
        <div
          className={styles.spectrumStage}
          role="meter"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={idx + 1}
          aria-label={`თმის სტრესის დონე: ${r.hairStressLevel.label}`}
        >
          <div className={styles.spectrumBand}>
            <svg
              className={styles.spectrumStrands}
              viewBox="0 0 400 64"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {HAIR_STRANDS.map((s, i) => (
                <path
                  key={i}
                  d={s.d}
                  fill="none"
                  stroke={s.stroke}
                  strokeWidth={s.width}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          </div>
          <span
            className={styles.spectrumOrb}
            style={{ left: `${orbPosition(idx)}%` }}
            aria-hidden="true"
          />
        </div>
        <div className={styles.spectrumEnds}>
          <span>მსუბუქი ცვლილება</span>
          <span>მკვეთრად გამოხატული</span>
        </div>
      </div>

      {HAIR_STRESS_EXPLAIN[idx] && <p className={styles.mBody}>{HAIR_STRESS_EXPLAIN[idx]}</p>}

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
  "მართავს გათხელების ჰორმონალურ მიზეზს",
  "ითვალისწინებს სტრესისა და ძილის გავლენას თმაზე",
  "ერთდროულად მოქმედებს ცვენაზე, გათხელებასა და თმის სტრუქტურაზე",
];

const COMPARATOR_LEVELS: Record<TreatmentCategory, ComparisonLevel[]> = {
  general_supplements: ["not_primary", "not_primary", "partial"],
  topical_treatments: ["not_primary", "not_primary", "partial"],
  procedures: ["not_primary", "not_primary", "partial"],
  none: ["not_primary", "not_primary", "partial"],
};

const COMPARATOR_LABEL: Record<TreatmentCategory, string> = {
  general_supplements: "ბიოტინი და მულტივიტამინები",
  topical_treatments: "შამპუნები, სერუმები და სხვა საშუალებები",
  procedures: "პროცედურები",
  none: "გავრცელებული თმის მიდგომები",
};

const COMPARISON_INTRO: Record<TreatmentCategory, string> = {
  general_supplements:
    "შენ აქამდე ზოგადი თმის დანამატები სცადე. THAMRA განსხვავებულია იმით, რომ თავიდანვე მენოპაუზის პერიოდში შეცვლილი თმის რამდენიმე საჭიროებისთვის შეიქმნა.",
  topical_treatments: "",
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

// On phones the two comparator columns (which carry identical marker patterns)
// collapse into a single "others" column to cut visual clutter.
const OTHERS_LABEL = "სხვა მიდგომები";
const OTHERS_LEVELS = COMPARATOR_LEVELS[MATRIX_COMPARATORS[0]];

function ComparisonMatrix() {
  const lastRow = COMPARISON_ROW_LABELS.length - 1;
  return (
    <div className={styles.matrix} role="table" aria-label="შედარება THAMRA-სთან">
      <div className={styles.matrixHead} role="row">
        <span className={`${styles.cellLabel} ${styles.cellHeadLabel}`} role="columnheader" aria-hidden />
        <span className={`${styles.cellHeadThamra} ${styles.cellThamra} ${styles.cellThamraTop}`} role="columnheader">
          <span className={styles.brandWord}>THAMRA</span>
        </span>
        {MATRIX_COMPARATORS.map((c) => (
          <span key={c} className={styles.cellHeadComp} role="columnheader">
            {COMPARATOR_LABEL[c]}
          </span>
        ))}
        {/* Merged comparator — rendered only on phones (CSS-toggled) */}
        <span className={`${styles.cellHeadOthers} ${styles.cellOthers}`} role="columnheader">
          {OTHERS_LABEL}
        </span>
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
          {/* Merged comparator — rendered only on phones (CSS-toggled) */}
          <span className={`${styles.cellMarker} ${styles.cellOthers}`} role="cell">
            <ComparisonMarker level={OTHERS_LEVELS[i]} columnLabel={OTHERS_LABEL} />
          </span>
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
      <h2 className={styles.compareHeadline}>
        რით განსხვავდება <span className={styles.brandWord}>THAMRA</span>?
      </h2>
      {intro && <p className={styles.compareIntro}>{intro}</p>}
      <div className={styles.compareTableWrap}>
        <ComparisonMatrix />
      </div>
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
    </RevealSection>
  );
}

// ─── Result page ──────────────────────────────────────────────────────────────

function ResultScreen({ answers }: { answers: Answers }) {
  const r = computeResult(answers);
  const reduce = useReducedMotion();

  // The Cal.com calendar is heavy and only relevant once the user wants to
  // book, so it stays hidden (and its script unloaded) until this is true.
  const [showBooking, setShowBooking] = useState(false);

  function scrollTo(id: string) {
    if (typeof document === "undefined") return;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function onOpenBooking() {
    setShowBooking(true);
    track({ event_type: "booking_open", screen: "result" });
    // Wait a tick for the calendar to mount, then bring it into view.
    setTimeout(() => scrollTo("result-booking"), 60);
  }

  return (
    <div className={styles.resultWrap}>
      {/* SECTION 1 — menopause connection (no product compatibility here) */}
      <MenopauseConnectionSection r={r} answers={answers} />

      {/* SECTION 2 — hair stress level */}
      <HairStressSection r={r} />

      {/* SECTION 3 — personalized hair changes */}
      <HairChangesSection answers={answers} onNext={() => scrollTo("result-treatment")} />

      {/* Treatment comparison — how THAMRA differs from what she previously tried */}
      <TreatmentComparisonSection answers={answers} />

      {/* გაიგე მეტი THAMRA-ზე — independent progressive-disclosure cards */}
      <RevealSection id="result-about" className={styles.mSection}>
        <div className={styles.aboutIntro}>
          <span className={styles.mEyebrow}>{ABOUT_THAMRA.eyebrow}</span>
          <h2 className={styles.aboutHeading}>
            რა არის <span className={styles.brandWord}>THAMRA</span>
          </h2>
          <p className={styles.aboutDefinition}>{ABOUT_THAMRA.definition}</p>
        </div>

        <div className={styles.infoCards}>
          {/* 1 — Is it right for me? (open by default) */}
          <InfoCard label={ABOUT_WHO.cardLabel} teaser={ABOUT_WHO.teaser} defaultOpen>
            <ul className={styles.whoList}>
              {ABOUT_WHO.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </InfoCard>

          {/* 2 — What the formula does (5 benefit tiles) */}
          <InfoCard label={ABOUT_BENEFITS.cardLabel} teaser={ABOUT_BENEFITS.teaser}>
            <div className={styles.benefitGrid}>
              {ABOUT_BENEFITS.tiles.map((t) => (
                <div key={t.icon} className={styles.benefitTile}>
                  <span className={styles.benefitIcon} aria-hidden>
                    <BenefitIcon name={t.icon} />
                  </span>
                  <div className={styles.benefitText}>
                    <p className={styles.benefitTitle}>{t.benefit}</p>
                    <p className={styles.benefitMech}>{t.mechanism}</p>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>

          {/* 3 — Can I trust it? (expert cards) */}
          <InfoCard label={ABOUT_TRUST.cardLabel} teaser={ABOUT_TRUST.teaser}>
            <p className={styles.aboutBody}>{ABOUT_TRUST.intro}</p>
            <div className={styles.expertGrid}>
              {ABOUT_TRUST.experts.map((e) => (
                <div key={e.name} className={styles.expertCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.expertPhoto}
                    src={e.photo}
                    alt={e.name}
                    width={56}
                    height={56}
                    loading="lazy"
                  />
                  <div className={styles.expertMeta}>
                    <p className={styles.expertName}>{e.name}</p>
                    <p className={styles.expertRole}>{e.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>

          {/* 4 — How it started (origin, last) */}
          <InfoCard label={ABOUT_ORIGIN.cardLabel} teaser={ABOUT_ORIGIN.teaser}>
            {ABOUT_ORIGIN.paragraphs.map((p, i) => (
              <p
                key={i}
                className={styles.aboutBody}
                style={i > 0 ? { marginTop: 12 } : undefined}
              >
                {p}
              </p>
            ))}
          </InfoCard>
        </div>
      </RevealSection>

      {/* Cal.com consultation booking — placed at the very end of the result page */}
      <RevealSection id="result-booking" className={`${styles.mSection} ${styles.bookingSection}`}>
        <span className={styles.mEyebrow}>დაჯავშნე დრო</span>
        <div className={styles.bookingActions}>
          {showBooking ? (
            <ConsultationBooking />
          ) : (
            <button
              type="button"
              className={styles.bookingRevealBtn}
              onClick={onOpenBooking}
            >
              დაჯავშნე დრო კონსულტაციისთვის
            </button>
          )}
          <a
            href={HAIR_EXPERT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.bookingWhatsappBtn}
            onClick={() => track({ event_type: "whatsapp_click", screen: "result" })}
          >
            <WhatsAppIcon />
            WhatsApp-ზე მოგვწერე
          </a>
        </div>
      </RevealSection>
    </div>
  );
}
