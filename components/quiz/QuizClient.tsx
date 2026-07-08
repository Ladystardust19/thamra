"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import styles from "./Quiz.module.css";
import { supabase } from "@/lib/supabase";
import { scoreQuiz } from "@/lib/scoring";
import {
  CAUSE_BLOCKS,
  AGE_FRAMING,
  DRIVER_CARDS,
  buildMirrorLine,
} from "@/lib/resultContent";

// ─── Types ────────────────────────────────────────────────────────────────────

type PartialAnswers = {
  q1?: string;
  q2?: string;
  q3?: string[];
  q_severity?: string;
  q4?: string[];
  q5?: string;
  q_stress?: string;
  q6?: string;
  q7?: string;
};

type Screen =
  | "intro"
  | "q1" | "q2" | "q3" | "q_severity" | "q4" | "q5" | "q_stress" | "q6" | "q7"
  | "gate"
  | "result";

const SCREEN_ORDER: Screen[] = [
  "intro", "q1", "q2", "q3", "q_severity", "q4", "q5", "q_stress", "q6", "q7", "gate", "result",
];

const Q_SCREENS = ["q1", "q2", "q3", "q_severity", "q4", "q5", "q_stress", "q6", "q7"];

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
    text: "ბოლო თვეებში როგორ შეაფასებდი შენს სტრესის დონეს?",
    type: "single",
    options: ["დაბალი", "ზომიერი", "მაღალი", "ძალიან მაღალი"],
  },
  {
    id: "q6",
    text: "რა სცადე აქამდე?",
    type: "single",
    options: [
      "სპეციალური შამპუნები და სერუმები",
      "ჩვეულებრივი ვიტამინები (ბიოტინი და სხვა)",
      "პლაზმათერაპია",
      "ჯერ არაფერი",
      "რამდენიმე ერთად",
    ],
  },
  {
    id: "q7",
    text: "რა არის შენთვის ყველაზე მნიშვნელოვანი?",
    type: "single",
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

  function navigate(target: Screen, dir: "forward" | "back") {
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
      setNameError("სახელი სავალდებულოა");
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

    supabase.from("quiz_leads").insert({
      name: name.trim(),
      phone: `+995${rawPhone}`,
      email: email.trim() || null,
      answers,
      submitted_at: new Date().toISOString(),
    }).then(({ error }) => {
      if (error) console.error("Supabase insert error:", error.message);
    });

    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead");
    }

    navigate("result", "forward");
  }

  const questionIndex = Q_SCREENS.indexOf(screen);
  const showProgress = questionIndex !== -1;

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.logo}>
        THAMRA
      </Link>

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

      <h2 className={styles.emailHeadline}>შენი ანალიზი მზადაა</h2>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="quiz-name">სახელი</label>
          <input
            id="quiz-name"
            type="text"
            className={nameError ? `${styles.fieldInput} ${styles.hasError}` : styles.fieldInput}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            autoComplete="given-name"
            placeholder="შენი სახელი"
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
  const [waitlisted, setWaitlisted] = useState(false);

  const { primaryCause, secondaryCause, ageGroup } = scoreQuiz(answers);
  const framing = AGE_FRAMING[ageGroup];
  const primaryBlock = CAUSE_BLOCKS[primaryCause];
  const secondaryBlock = CAUSE_BLOCKS[secondaryCause];
  const mirrorLine = buildMirrorLine(answers, primaryCause);

  function isHighlighted(causes: string[]) {
    return causes.includes(primaryCause) || causes.includes(secondaryCause);
  }

  function handleWaitlist() {
    supabase.from("quiz_leads")
      .update({ waitlisted: true })
      .eq("phone", `+995${phone.replace(/\s+/g, "")}`)
      .then(({ error }) => { if (error) console.error(error.message); });
    setWaitlisted(true);
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
        ასევე შეიძლება მოქმედებდეს
      </span>
      <p className={styles.driverTitle} style={{ marginTop: 6 }}>{secondaryBlock.title}</p>
      <p className={styles.driverText} style={{ marginTop: 6, opacity: 0.8 }}>{secondaryBlock.body}</p>

      <div className={styles.resultDivider} />

      {/* 5 — Driver cards */}
      <span className={styles.driversLabel}>რა სჭირდება შენს თმას</span>
      <div className={styles.driverCards} style={{ marginTop: 12 }}>
        {DRIVER_CARDS.map((card) => {
          const highlighted = isHighlighted(card.causes);
          return (
            <div
              key={card.key}
              className={styles.driverCard}
              style={highlighted
                ? { border: "1.5px solid #8B2F3A" }
                : { opacity: 0.65 }
              }
            >
              {!highlighted && (
                <span className={styles.driversLabel} style={{ fontSize: 9, display: "block", marginBottom: 4 }}>
                  სრული მიდგომა
                </span>
              )}
              <p className={styles.driverTitle}>{card.title}</p>
              <p className={styles.driverText} style={{ marginTop: 4 }}>{card.body}</p>
            </div>
          );
        })}
      </div>

      <div className={styles.resultDivider} />

      {/* 6 — CTA / waitlist */}
      <span className={styles.driversLabel}>შენ ახლა THAMRA-ს ადრეული წვდომის სიაში ხარ.</span>
      <p className={styles.driverText} style={{ marginTop: 10 }}>
        ეს 20% მხოლოდ იმ ქალებისთვისაა, ვინც ტესტი უკვე დაასრულა. ჩვეულებრივ ფასში ის აღარ იქნება.
      </p>

      {waitlisted ? (
        <div style={{ marginTop: 8 }}>
          <p className={styles.driverTitle}>მზადაა. შენი ადგილი დაცულია.</p>
          <p className={styles.driverText} style={{ marginTop: 8 }}>
            როცა შემდეგი გამოშვება მზად იქნება, პირველი შენ შეიტყობ.
          </p>
        </div>
      ) : (
        <>
          <button className={styles.primaryBtn} style={{ marginTop: 8 }} onClick={handleWaitlist}>
            დამიმაგრე ჩემი 20% ფასდაკლება
          </button>
          <p className={styles.driverText} style={{ marginTop: 12 }}>
            შეუერთდი ლისტს და შემდეგი გამოშვება პირველმა შენ მიიღე.
          </p>
        </>
      )}

      <div className={styles.resultDivider} />

      {/* 7 — რატომ THAMRA */}
      <span className={styles.driversLabel}>რატომ THAMRA</span>
      <p className={styles.driverText} style={{ marginTop: 10 }}>
        THAMRA-ს ბიოაქტიური კომპლექსი დაეხმარება შენს ორგანიზმს შექმნას უკეთესი შიდა გარემო თმის ზრდისთვის, რათა:
      </p>
      <ul style={{ marginTop: 10, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          "ნაკლები ფოლიკული გადავიდეს ნაადრევი ცვენის ფაზაში",
          "მეტი ფოლიკული დარჩეს აქტიური ზრდის ფაზაში",
          "ახალი თმა გაიზარდოს უფრო ძლიერი და სავსე",
          "თმის ღერი გახდეს ვიზუალურად მკვრივი",
          "ყოველდღიური ცვენა ეტაპობრივად შემცირდეს",
        ].map((item) => (
          <li key={item} className={styles.driverText} style={{ listStyle: "disc" }}>{item}</li>
        ))}
      </ul>
      <p className={styles.driverText} style={{ marginTop: 16 }}>
        თმის ზრდა ნელი ბიოლოგიური პროცესია, ამიტომ შედეგებიც ეტაპობრივად ვითარდება.
      </p>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <p className={styles.driverText}><strong>1–3 თვე</strong> — შეამჩნევ ნაკლებ ცვენას: ჯაგრისზე, ბალიშზე ან შხაპის შემდეგ.</p>
        <p className={styles.driverText}><strong>3–6 თვე</strong> — თმა გახდება უფრო სავსე, მკვრივი და ჯანსაღი.</p>
        <p className={styles.driverText}><strong>6+ თვე</strong> — THAMRA გეხმარება დაგროვილი შედეგის შენარჩუნებასა და თმის ცვენის გამომწვევი მიზეზების გრძელვადიან მართვაში.</p>
      </div>

      {/* 8 — Footnote */}
      <p className={styles.footnote} style={{ marginTop: 24 }}>
        ეს ტესტი საინფორმაციო ხასიათისაა და არ წარმოადგენს სამედიცინო დიაგნოზს.
      </p>

    </div>
  );
}
