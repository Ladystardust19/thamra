"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import styles from "./Quiz.module.css";
import { supabase } from "@/lib/supabase";
import { scoreQuiz } from "@/lib/scoring";
import {
  CAUSE_BLOCKS,
  AGE_FRAMING,
  buildMirrorLine,
} from "@/lib/resultContent";
import {
  track,
  captureAttribution,
  getAttribution,
  getSessionId,
  oncePerSession,
} from "@/lib/analytics";

// ─── Types ────────────────────────────────────────────────────────────────────

type PartialAnswers = {
  q1?: string;
  q2?: string;
  q3?: string[];
  q_severity?: string;
  q4?: string[];
  q5?: string;
  q_stress?: string;
  q6?: string[];
  q7?: string[];
};

type Screen =
  | "intro"
  | "q1" | "q2" | "q3" | "q_severity" | "q4" | "q5" | "q_stress" | "q6" | "q7"
  | "gate"
  | "processing"
  | "result";

const SCREEN_ORDER: Screen[] = [
  "intro", "q1", "q2", "q3", "q_severity", "q4", "q5", "q_stress", "q6", "q7", "gate", "processing", "result",
];

const PROCESSING_MS = 4000;
const PROCESSING_TEXTS = [
  "ვამუშავებ შენს პასუხებს...",
  "ვაანალიზებ თმის ცვლილების ტიპს...",
  "ვადგენ დომინანტ მიზეზს...",
  "ვამზადებ შენს პერსონალურ შედეგს...",
];

// ─── Preorder configuration — edit these two values to update dates ──────────
const PREORDER_DELIVERY_PERIOD = "2026 წლის 10 სექტემბერი";
const PREORDER_CONFIRMATION_DEADLINE = "2025 წლის 1 სექტემბერი";

const Q_SCREENS = ["q1", "q2", "q3", "q_severity", "q4", "q5", "q_stress", "q6", "q7"];

// sessionStorage key holding the visitor's in-progress quiz state (survives refresh)
const STATE_KEY = "thamra_quiz_state";

// ─── Question definitions ─────────────────────────────────────────────────────

type Question = {
  id: string;
  text: string;
  sub?: string;
  type: "single" | "multi";
  options: string[];
};

const QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "რამდენი წლის ხარ?",
    type: "single",
    options: ["40-მდე", "40–45", "46–52", "53–60", "60+"],
  },
  {
    id: "q2",
    text: "როდის შეამჩნიე პირველად თმის ცვლილება?",
    type: "single",
    options: [
      "6 თვეზე ნაკლები ხნის წინ",
      "6–12 თვის წინ",
      "1–3 წლის წინ",
      "3 წელზე მეტი ხნის წინ",
    ],
  },
  {
    id: "q3",
    text: "როგორ გამოიყურება შენი თმის ცვლილება?",
    sub: "მონიშნე ყველა, რაც შეესაბამება",
    type: "multi",
    options: [
      "გაყოფის ხაზი გაფართოვდა",
      "ცხიმიანი სკალპი",
      "მშრალი სკალპი",
      "მეტი თმა რჩება სავარცხელზე",
      "თხემზე სკალპი მოჩანს",
      "თმა ტყდება და დაკარგა ბზინვარება",
    ],
  },
  {
    id: "q_severity",
    text: "რამდენად გაწუხებს თმის სისავსისა და მოცულობის შემცირება?",
    type: "single",
    options: [
      "1 — საერთოდ არ მაწუხებს",
      "2 — ოდნავ მაწუხებს",
      "3 — ზომიერად მაწუხებს",
      "4 — საკმაოდ მაწუხებს",
      "5 — ძალიან მაწუხებს და გამოსავალს აქტიურად ვეძებ",
    ],
  },
  {
    id: "q4",
    text: "თმის ცვლილებასთან ერთად ამჩნევ რომელიმეს?",
    sub: "მონიშნე ყველა, რაც შეესაბამება",
    type: "multi",
    options: [
      "ციკლი არარეგულარული გახდა ან შეწყდა",
      "სიცხის შემოტევები ან ღამის ოფლიანობა",
      "მეტი სტრესი ან შფოთვა",
      "წონის ცვლილება",
      "არცერთი",
    ],
  },
  {
    id: "q5",
    text: "როგორ გძინავს ბოლო პერიოდში?",
    type: "single",
    options: [
      "კარგად, ვისვენებ",
      "ხშირად ვიღვიძებ ღამით",
      "მიჭირს დაძინება",
      "ღამის ოფლიანობა მაღვიძებს",
    ],
  },
  {
    id: "q_stress",
    text: "ბოლო თვეებში როგორ შეაფასებდი შენი სტრესის დონეს?",
    type: "single",
    options: ["დაბალი", "ზომიერი", "მაღალი", "ძალიან მაღალი"],
  },
  {
    id: "q6",
    text: "რა სცადე აქამდე?",
    sub: "მონიშნე ყველა, რაც შეესაბამება",
    type: "multi",
    options: [
      "სპეციალური შამპუნები და სერუმები",
      "ჩვეულებრივი ვიტამინები (ბიოტინი და სხვა)",
      "პლაზმოთერაპია",
      "ჯერ არაფერი",
      "რამდენიმე ერთად",
    ],
  },
  {
    id: "q7",
    text: "რა არის შენთვის ყველაზე მნიშვნელოვანი?",
    sub: "მონიშნე ყველა, რაც შეესაბამება",
    type: "multi",
    options: [
      "თმის ხილული ზრდა",
      "ცვენის შეჩერება",
      "უფრო სქელი და ხშირი თმა",
      "ყველაფერი ერთად, ბუნებრივად",
    ],
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuizClient() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [answers, setAnswers] = useState<PartialAnswers>({});
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

    // Capture the ad / campaign that brought this visitor (fbclid + utm_*)
    captureAttribution();

    // Restore progress on reload so users stay on the same screen instead of
    // being sent back to the start (or the homepage).
    try {
      const saved = sessionStorage.getItem(STATE_KEY);
      if (saved) {
        const st = JSON.parse(saved);
        if (st.answers) setAnswers(st.answers);
        if (st.name) setName(st.name);
        if (st.phone) setPhone(st.phone);
        if (st.email) setEmail(st.email);
        let target: Screen = st.screen ?? "intro";
        if (target === "processing") target = "result"; // don't re-run the loader
        setScreen(target);
      }
    } catch {}

    // Landing — counted once per session so a refresh doesn't inflate it.
    if (oncePerSession("quiz_start")) {
      track({ event_type: "quiz_start", screen: "intro", attribution: getAttribution() });
    }
    enteredAtRef.current = Date.now();
  }, []);

  // Persist progress on every change so a refresh survives. Skips the initial
  // mount run so it can't clobber restored state before it's applied.
  useEffect(() => {
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({ screen, answers, name, phone, email }));
    } catch {}
  }, [screen, answers, name, phone, email]);

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

  function navigate(target: Screen, dir: "forward" | "back") {
    const now = Date.now();
    const qi = Q_SCREENS.indexOf(target);
    track({
      event_type: "screen_view",
      screen: target,
      question_index: qi === -1 ? null : qi,
      prev_screen: screen,
      prev_duration_ms: now - enteredAtRef.current,
    });
    enteredAtRef.current = now;
    setDirection(dir);
    setScreen(target);
  }

  function goNext() {
    const idx = SCREEN_ORDER.indexOf(screen);
    if (idx < SCREEN_ORDER.length - 1) navigate(SCREEN_ORDER[idx + 1], "forward");
  }

  function goBack() {
    if (timerRef.current) clearTimeout(timerRef.current);
    const idx = SCREEN_ORDER.indexOf(screen);
    if (idx > 0) navigate(SCREEN_ORDER[idx - 1], "back");
  }

  function handleSingleSelect(qId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(goNext, 300);
  }

  function toggleMulti(qId: string, value: string) {
    setAnswers((prev) => {
      const key = qId as keyof PartialAnswers;
      const current = (prev[key] as string[] | undefined) ?? [];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  }

  function handleGateSubmit() {
    let valid = true;

    if (!name.trim()) {
      setNameError("სახელი და გვარი სავალდებულოა");
      valid = false;
    } else {
      setNameError("");
    }

    const rawPhone = phone.replace(/\s+/g, "");
    if (!rawPhone || rawPhone.length !== 9 || !rawPhone.startsWith("5")) {
      setPhoneError("შეიყვანე სწორი მობილურის ნომერი");
      valid = false;
    } else {
      setPhoneError("");
    }

    if (!email.trim()) {
      setEmailError("ელ.ფოსტა სავალდებულოა");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("შეიყვანე სწორი ელ.ფოსტა");
      valid = false;
    } else {
      setEmailError("");
    }

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

    // Funnel event — the visitor became a lead (email + phone captured)
    track({ event_type: "lead_submit", screen: "gate", attribution: getAttribution() });

    // Server-side Conversions API — runs even when browser pixel is blocked
    fetch("/api/meta-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), phone: fullPhone, email: email.trim() || null, eventId, fbc: fbcRef.current }),
    }).catch(() => {});

    // Browser pixel — same eventId deduplicates against the CAPI event above
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead", {}, { eventID: eventId });
    }

    navigate("processing", "forward");
  }

  const questionIndex = Q_SCREENS.indexOf(screen);
  const showProgress = questionIndex !== -1;

  return (
    <div className={styles.page}>
      {/* Logo is intentionally NOT a link on any quiz screen so visitors stay
          in the funnel and don't jump back to the homepage. */}
      <span className={styles.logo}>Thamra</span>

      {showProgress && (
        <div className={styles.progressWrap}>
          <span className={styles.progressLabel}>
            კითხვა {questionIndex + 1} / {Q_SCREENS.length}
          </span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((questionIndex + 1) / Q_SCREENS.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className={styles.main}>
        <div
          key={screen}
          className={
            direction === "back"
              ? `${styles.screen} ${styles.back}`
              : styles.screen
          }
        >
          {screen === "intro" && <IntroScreen onStart={goNext} />}

          {Q_SCREENS.includes(screen) &&
            (() => {
              const q = QUESTIONS.find((x) => x.id === screen)!;
              const val = answers[screen as keyof PartialAnswers];
              return (
                <QuestionScreen
                  question={q}
                  value={val}
                  onBack={goBack}
                  onSingleSelect={(v) => handleSingleSelect(q.id, v)}
                  onToggle={(v) => toggleMulti(q.id, v)}
                  onNext={goNext}
                />
              );
            })()}

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
            <ProcessingScreen onDone={() => navigate("result", "forward")} />
          )}

          {screen === "result" && (
            <ResultScreen name={name} phone={phone} email={email} answers={answers} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Back arrow SVG ───────────────────────────────────────────────────────────

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 3L5 8l5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Intro screen ─────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className={styles.introWrap}>
      <h1 className={styles.introHeadline}>
        გაიგე, რა სჭირდება შენს თმას
      </h1>
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
  value,
  onBack,
  onSingleSelect,
  onToggle,
  onNext,
}: {
  question: Question;
  value: string | string[] | undefined;
  onBack: () => void;
  onSingleSelect: (v: string) => void;
  onToggle: (v: string) => void;
  onNext: () => void;
}) {
  const multiValues = Array.isArray(value) ? value : [];

  return (
    <div>
      <button className={styles.backBtn} onClick={onBack} aria-label="უკან">
        <BackArrow />
        უკან
      </button>

      <h2 className={styles.qHeadline}>{question.text}</h2>
      {question.sub && <p className={styles.qSub}>{question.sub}</p>}

      <div className={styles.options} role={question.type === "multi" ? "group" : undefined}>
        {question.options.map((opt) => {
          const isSelected =
            question.type === "single"
              ? value === opt
              : multiValues.includes(opt);

          return (
            <button
              key={opt}
              className={isSelected ? `${styles.option} ${styles.selected}` : styles.option}
              onClick={() =>
                question.type === "single" ? onSingleSelect(opt) : onToggle(opt)
              }
              aria-pressed={isSelected}
            >
              {question.type === "single" ? (
                <span className={styles.indicator} aria-hidden />
              ) : (
                <span className={styles.checkbox} aria-hidden>
                  {isSelected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4l3 3 5-6"
                        stroke="#f7f1e9"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              )}
              {opt}
            </button>
          );
        })}
      </div>

      {question.type === "multi" && (
        <button
          className={styles.nextBtn}
          onClick={onNext}
          disabled={multiValues.length === 0}
        >
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

      {/* Monogram + pulse rings */}
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

      {/* Phase text */}
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

      {/* Non-linear progress bar: fast 0→60%, slow 60→90%, fast 90→100% */}
      <div className={styles.processingBarWrap}>
        <motion.div
          className={styles.processingBar}
          initial={{ width: "0%" }}
          animate={{ width: ["0%", "60%", "90%", "100%"] }}
          transition={{
            duration: PROCESSING_MS / 1000,
            times: [0, 0.30, 0.80, 1.0],
            ease: "easeInOut",
          }}
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

// ─── Pricing data ─────────────────────────────────────────────────────────────

const PRICING = [
  {
    id: "signature",
    icon: null as string | null,
    badge: "რეკომენდებული" as string | null,
    title: "Thamra Signature",
    subtitle: "90-დღიანი პროგრამა",
    price: "399",
    perMonth: "≈133 ₾ / თვეში",
    perDay: "≈4.43 ₾ / დღეში",
    saveBadge: null as string | null,
    desc: "ქალებისთვის, რომელთაც სურთ, თმის ცვენასა და ხარისხის ცვლილებაზე ზრუნვა გააზრებულად და თანმიმდევრულად დაიწყონ.",
    features: [
      "3 თვის Thamra",
      "შენი პასუხების საფუძველზე შექმნილი პერსონალური შეფასება",
      "საწყისი კონსულტაცია Thamra-ს გუნდთან",
      "90-დღიანი ზრუნვის გზამკვლევი",
      "პროგრესის შეფასება 3 თვის შემდეგ",
    ],
    footer: null as string | null,
    featured: true,
  },
  {
    id: "foundation",
    icon: null as string | null,
    badge: null as string | null,
    title: "Thamra Foundation",
    subtitle: "1-თვიანი პროგრამა",
    price: "149",
    perMonth: "149 ₾ / თვეში",
    perDay: "≈4.97 ₾ / დღეში",
    saveBadge: null as string | null,
    desc: "დასაწყისისთვის, ვისაც სურს Thamra გაიცნოს.",
    features: [
      "1 თვის Thamra",
      "პერსონალური შეფასების კითხვარი",
      "თმისა და საერთო ჯანმრთელობის საწყისი შეფასება",
      "ინდივიდუალური 30-დღიანი რეკომენდაციები",
    ],
    footer: null as string | null,
    featured: false,
  },
  {
    id: "longevity",
    icon: null as string | null,
    badge: null as string | null,
    title: "Thamra Hair Longevity",
    subtitle: "6-თვიანი სრული პროგრამა",
    price: "749",
    perMonth: "≈125 ₾ / თვეში",
    perDay: "≈4.16 ₾ / დღეში",
    saveBadge: null as string | null,
    desc: "მიღებული შედეგის შენარჩუნება. თმის ჯანმრთელობაზე გრძელვადიანი ზრუნვა.",
    features: [
      "6 თვის Thamra",
      "სიღრმისეული პერსონალური შეფასება",
      "საწყისი კონსულტაცია",
      "180-დღიანი ინდივიდუალური გეგმა",
    ],
    footer: null as string | null,
    featured: false,
  },
];


// ─── Preorder confirmation step ───────────────────────────────────────────────

function PreorderConfirmScreen({
  plan,
  termsChecked,
  onTermsChange,
  onProceed,
  onChangePlan,
}: {
  plan: typeof PRICING[0];
  termsChecked: boolean;
  onTermsChange: (v: boolean) => void;
  onProceed: () => void;
  onChangePlan: () => void;
}) {
  return (
    <div className={styles.preorderWrap}>
      <span className={styles.preorderLabel}>წინასწარი შეკვეთა</span>
      <h3 className={styles.preorderHeadline}>
        დაადასტურე შენი ადგილი Thamra-ს პირველ ჯგუფში
      </h3>
      <div className={styles.preorderSummary}>
        <div>
          <p className={styles.preorderSummaryName}>{plan.title}</p>
          {plan.subtitle ? (
            <p className={styles.preorderSummaryDetail}>{plan.subtitle}</p>
          ) : null}
        </div>
        <p className={styles.preorderSummaryPrice}>{plan.price} ₾</p>
      </div>

      <div className={styles.preorderInfoBlock}>
        <p className={styles.preorderInfoText}>ეს არის წინასწარი შეკვეთა.</p>
        <p className={styles.preorderInfoText} style={{ marginTop: 8 }}>
          სავარაუდო მიწოდების პერიოდია {PREORDER_DELIVERY_PERIOD}.
        </p>
        <p className={styles.preorderInfoText} style={{ marginTop: 8 }}>
          თუ მიწოდება 10 სექტემბრამდე ვერ დადასტურდება, გადახდილი თანხა სრულად დაგიბრუნდება.
        </p>
      </div>

      <label className={styles.preorderCheckboxRow}>
        <input
          type="checkbox"
          className={styles.preorderCheckboxInput}
          checked={termsChecked}
          onChange={(e) => onTermsChange(e.target.checked)}
        />
        <span className={termsChecked
          ? `${styles.preorderCheckboxBox} ${styles.preorderCheckboxBoxChecked}`
          : styles.preorderCheckboxBox
        }>
          {termsChecked && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4L4 7.5L10 1" stroke="#f2ebe3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className={styles.preorderCheckboxLabel}>
          გავეცანი წინასწარი შეკვეთის, მიწოდებისა და თანხის დაბრუნების პირობებს.
        </span>
      </label>

      <button
        className={styles.preorderProceedBtn}
        disabled={!termsChecked}
        onClick={onProceed}
      >
        გავაგრძელო გადახდაზე
      </button>

      <button
        className={styles.preorderChangePlanBtn}
        onClick={onChangePlan}
      >
        პაკეტის შეცვლა
      </button>
    </div>
  );
}

// ─── Result page ──────────────────────────────────────────────────────────────

function ResultScreen({
  name,
  phone,
  email,
  answers,
}: {
  name: string;
  phone: string;
  email: string;
  answers: PartialAnswers;
}) {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [preorderStep, setPreorderStep] = useState<"none" | "confirm" | "payment">("none");
  const [preorderTermsChecked, setPreorderTermsChecked] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { primaryCause, secondaryCause, ageGroup } = scoreQuiz(answers);

  const framing = AGE_FRAMING[ageGroup];
  const primaryBlock = CAUSE_BLOCKS[primaryCause];
  const secondaryBlock = CAUSE_BLOCKS[secondaryCause];
  const mirrorLine = buildMirrorLine(answers, primaryCause);
  const selectedPlan = PRICING.find((p) => p.id === selectedProgram) ?? null;

  function selectPlan(id: string) {
    setSelectedProgram(id);
    setPreorderStep("confirm");
    setPreorderTermsChecked(false);
    track({ event_type: "plan_selected", screen: "result", meta: { plan: id } });
  }

  function changePlan() {
    setSelectedProgram(null);
    setPreorderStep("none");
    setPreorderTermsChecked(false);
    setTimeout(() => {
      pricingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function handleProceedToPayment() {
    const now = new Date().toISOString();
    supabase
      .from("quiz_leads")
      .update({
        preorder_terms_accepted: true,
        preorder_terms_accepted_at: now,
        selected_plan: selectedProgram,
      })
      .eq("phone", `+995${phone.replace(/\s+/g, "")}`)
      .then(({ error }) => { if (error) console.error(error.message); });
    track({ event_type: "bank_reached", screen: "result", meta: { plan: selectedProgram } });
    setPreorderStep("payment");
  }

  function copyText(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className={styles.resultWrap}>

      {/* 1 — Age profile + headline */}
      <span className={styles.driversLabel}>შენი პროფილი</span>
      <h2 className={styles.resultHeadline} style={{ marginTop: 6 }}>{framing.profileName}</h2>
      <p className={styles.resultText} style={{ marginTop: 10 }}>{framing.headline}</p>

      <div className={styles.resultDivider} />

      {/* 2 — Mirror line */}
      <p className={styles.driverText} style={{ fontStyle: "italic" }}>{mirrorLine}</p>

      <div className={styles.resultDivider} />

      {/* 3 — Primary cause */}
      <span className={styles.driversLabel}>{primaryBlock.title}</span>
      <p className={styles.driverText} style={{ marginTop: 10 }}>{primaryBlock.body}</p>

      <div className={styles.resultDivider} />

      {/* 4 — Secondary cause */}
      <span className={styles.driversLabel} style={{ fontSize: 11, opacity: 0.65 }}>
        ასევე შეიძლება მოქმედებს
      </span>
      <p className={styles.driverTitle} style={{ marginTop: 6 }}>{secondaryBlock.title}</p>
      <p className={styles.driverText} style={{ marginTop: 6, opacity: 0.8 }}>{secondaryBlock.body}</p>

      <div className={styles.resultDivider} />

      {/* 7 — Thamra-ს მიდგომა */}
      <span className={styles.driversLabel}>როგორია Thamra-ს მიდგომა?</span>
      <p className={styles.driverText} style={{ marginTop: 10, marginBottom: 14 }}>
        Thamra-ს ბიოაქტიური კომპლექსი ეხმარება ორგანიზმს შექმნას უკეთესი შიდა გარემო თმის ზრდისთვის რათა:
      </p>
      <ul className={styles.approachList}>
        <li>ნაკლები ფოლიკული გადავიდეს ნაადრევი ცვენის ფაზაში</li>
        <li>მეტი ფოლიკული დარჩეს აქტიური ზრდის ფაზაში</li>
        <li>ახალი თმა გაიზარდოს უფრო ძლიერი და სავსე</li>
        <li>თმის ღერი გახდეს ვიზუალურად უფრო მკვრივი</li>
        <li>ყოველდღიური ცვენა ეტაპობრივად შემცირდეს</li>
      </ul>

      <div className={styles.timeline}>
        {[
          { num: "01", period: "1–3 თვე", desc: "ამჩნევ ნაკლებ ცვენას ჯაგრისზე, ბალიშზე ან შხაპის შემდეგ." },
          { num: "02", period: "3–6 თვე", desc: "თმა ხდება უფრო სავსე, მკვრივი და ჯანსაღი." },
          { num: "03", period: "6+ თვე", desc: "Thamra გეხმარება მიღებული შედეგის შენარჩუნებაში." },
        ].map((item) => (
          <div key={item.num} className={styles.timelineItem}>
            <span className={styles.timelineNum}>{item.num}</span>
            <div>
              <p className={styles.timelinePeriod}>{item.period}</p>
              <p className={styles.timelineDesc}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* A — Pricing Preview */}
      <div ref={pricingRef}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className={styles.pricingIntro}>
            <p className={styles.pricingIntroText}>
              Thamra-ს პირველი, შეზღუდული წარმოება იაპონიაში მზადდება სპეციალურად პირველი 50 ქალისთვის. წინასწარი შეკვეთით შენთვის გამოიყოფა არჩეული პაკეტი პირველი წარმოებიდან და დადასტურდება შენი ადგილი Thamra-ს პირველ ჯგუფში.
            </p>
          </div>

          <div className={styles.pricingGrid}>
            {PRICING.map((plan) => {
              const isSelected = selectedProgram === plan.id;
              const isDark = plan.featured;

              const cardClass = [
                styles.pricingCard,
                isDark ? styles.pricingCardFeatured : "",
                isSelected && !isDark ? styles.pricingCardSelected : "",
                isSelected && isDark ? styles.pricingCardFeaturedSelected : "",
              ].filter(Boolean).join(" ");

              const btnClass = [
                styles.reserveBtn,
                isDark && !isSelected ? styles.reserveBtnDark : "",
                !isDark && isSelected ? styles.reserveBtnSelected : "",
                isDark && isSelected ? styles.reserveBtnDarkSelected : "",
              ].filter(Boolean).join(" ");

              return (
                <motion.div
                  key={plan.id}
                  className={cardClass}
                  onClick={() => selectPlan(plan.id)}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                  style={{ cursor: "pointer" }}
                >
                  {plan.badge && (
                    <span
                      className={styles.pricingBadge}
                      style={isDark ? { background: "#c9a96e", color: "#3d2226" } : undefined}
                    >
                      {plan.badge}
                    </span>
                  )}
                  <p
                    className={styles.pricingTitle}
                    style={isDark ? { color: "#f2ebe3" } : undefined}
                  >
                    {plan.title}
                  </p>
                  <p
                    className={styles.pricingSubtitle}
                    style={isDark ? { color: "rgba(242,235,227,0.58)" } : undefined}
                  >
                    {plan.subtitle}
                  </p>
                  <hr
                    className={styles.pricingDivider}
                    style={isDark ? { background: "rgba(242,235,227,0.14)" } : undefined}
                  />
                  <p
                    className={styles.pricingPrice}
                    style={isDark ? { color: "#c9a96e" } : undefined}
                  >
                    {plan.price} <span className={styles.pricingCurrency}>₾</span>
                  </p>
                  {plan.perMonth && (
                    <p
                      className={styles.perMonth}
                      style={isDark ? { color: "rgba(242,235,227,0.5)" } : undefined}
                    >
                      {plan.perMonth}
                    </p>
                  )}
                  {plan.perDay && (
                    <p
                      className={styles.perMonth}
                      style={isDark ? { color: "rgba(242,235,227,0.5)" } : undefined}
                    >
                      {plan.perDay}
                    </p>
                  )}
                  <p
                    className={styles.pricingDesc}
                    style={isDark ? { color: "rgba(242,235,227,0.78)" } : undefined}
                  >
                    {plan.desc}
                  </p>
                  <ul className={styles.pricingFeatures}>
                    {plan.features.map((f) => (
                      <li key={f} className={isDark ? styles.pricingFeatureDark : styles.pricingFeature}>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    className={btnClass}
                    onClick={(e) => { e.stopPropagation(); selectPlan(plan.id); }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isSelected ? (
                        <motion.span
                          key="sel"
                          initial={{ opacity: 0, y: 7 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -7 }}
                          transition={{ duration: 0.15 }}
                          style={{ display: "block" }}
                        >
                          ✓ არჩეულია
                        </motion.span>
                      ) : (
                        <motion.span
                          key="def"
                          initial={{ opacity: 0, y: 7 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -7 }}
                          transition={{ duration: 0.15 }}
                          style={{ display: "block" }}
                        >
                          არჩევა
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* 8 — Preorder confirmation → Bank details */}
      <AnimatePresence mode="wait">
        {selectedPlan && preorderStep === "confirm" && (
          <motion.div
            key="preorder"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ marginTop: 24 }}
          >
            <PreorderConfirmScreen
              plan={selectedPlan}
              termsChecked={preorderTermsChecked}
              onTermsChange={setPreorderTermsChecked}
              onProceed={handleProceedToPayment}
              onChangePlan={changePlan}
            />
          </motion.div>
        )}
        {selectedPlan && preorderStep === "payment" && (
          <motion.div
            key="bank"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={styles.bankBlock}
            style={{ marginTop: 24 }}
          >
            <p className={styles.bankAmount}>გადასარიცხი: {selectedPlan.price} ₾</p>
            <div className={styles.bankFields}>
              {[
                { label: "ბანკი", value: "თიბისი ბანკი", key: "bank" },
                { label: "ანგარიში (IBAN)", value: "GE80TB0614545060622348", key: "iban" },
                { label: "მიმღები", value: "მარიამ ჯაყელი", key: "owner" },
              ].map(({ label, value, key }) => (
                <div key={key} className={styles.bankField}>
                  <span className={styles.bankFieldLabel}>{label}</span>
                  <div className={styles.bankFieldRow}>
                    <span className={styles.bankFieldValue}>{value}</span>
                    <button
                      className={copied === key ? styles.copyBtnDone : styles.copyBtn}
                      onClick={() => copyText(value, key)}
                    >
                      {copied === key ? "✓" : "კოპირება"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className={styles.bankSendText}>
              გადარიცხვის შემდეგ გამოგვიგზავნე ქვითარი WhatsApp-ზე — დავადასტურებთ ადგილს.
            </p>
            <a
              href="https://wa.me/995598511112"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waBtn}
            >
              ქვითრის გამოგზავნა
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9 — Footnote */}
      <p className={styles.footnote} style={{ marginTop: 24 }}>
        ეს ტესტი საინფორმაციო ხასიათისაა და არ წარმოადგენს სამედიცინო დიაგნოზს.
      </p>

    </div>
  );
}
