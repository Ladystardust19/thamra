"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import styles from "./Quiz.module.css";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type PartialAnswers = {
  q1?: string;
  q2?: string;
  q3?: string[];
  q_severity?: string;
  q4?: string[];
  q5?: string;
  q6?: string;
  q7?: string;
};

type Screen =
  | "intro"
  | "q1" | "q2" | "q3" | "q_severity" | "q4" | "q5" | "q6" | "q7"
  | "gate"
  | "result";

const SCREEN_ORDER: Screen[] = [
  "intro", "q1", "q2", "q3", "q_severity", "q4", "q5", "q6", "q7", "gate", "result",
];

const Q_SCREENS = ["q1", "q2", "q3", "q_severity", "q4", "q5", "q6", "q7"];

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
    text: "როდის შეამჩნიე პირველად, რომ თმა შეიცვალა?",
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
      "კუდი გათხელდა",
      "მეტი თმა რჩება სავარცხელზე და სააბაზანოში",
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

// ─── Result helpers ───────────────────────────────────────────────────────────

type CategoryKey = "HairDensity" | "Shedding" | "HairQuality" | "HormonalTransition" | "StressSleep";

const CATEGORY_PRIORITY: CategoryKey[] = [
  "HairDensity", "Shedding", "HormonalTransition", "StressSleep", "HairQuality",
];

const CATEGORY_META: Record<CategoryKey, { title: string; body: string }> = {
  HairDensity: {
    title: "თმის სიმკვრივე და სისავსე",
    body: "შენი პასუხები მიანიშნებს თმის სიმკვრივისა და სისავსის ხილულ ცვლილებებზე.",
  },
  Shedding: {
    title: "თმის ცვენა",
    body: "შენი პასუხები მიანიშნებს ყოველდღიური მოვლისას გაზრდილ თმის ცვენაზე.",
  },
  HairQuality: {
    title: "თმის ხარისხი და სტრუქტურა",
    body: "შენი პასუხები ხაზს უსვამს თმის ტექსტურის, სიძლიერისა და გარეგნობის ცვლილებებს.",
  },
  HormonalTransition: {
    title: "ჰორმონალური გარდამავალი პერიოდი",
    body: "შენი პასუხები გვაჩვენებს, რომ მენოპაუზასთან დაკავშირებული ცვლილებები შეიძლება მნიშვნელოვანი ნაწილი იყოს საერთო სურათის.",
  },
  StressSleep: {
    title: "სტრესი და ძილი",
    body: "შენი პასუხები ხაზს უსვამს სტრესსა და ძილთან დაკავშირებულ ფაქტორებს, რომლებიც გავლენას ახდენს ზოგადი კეთილდღეობისა და თმის ჯანმრთელობაზე.",
  },
};

function calcCategories(a: PartialAnswers): [CategoryKey, CategoryKey] {
  const s: Record<CategoryKey, number> = {
    HairDensity: 0, Shedding: 0, HairQuality: 0, HormonalTransition: 0, StressSleep: 0,
  };

  const q3 = a.q3 ?? [];
  const q4 = a.q4 ?? [];

  if (q3.includes("გაყოფის ხაზი გაფართოვდა"))                    s.HairDensity += 2;
  if (q3.includes("კუდი გათხელდა"))                                s.HairDensity += 2;
  if (q3.includes("თხემზე სკალპი მოჩანს"))                        s.HairDensity += 3;
  if (q3.includes("მეტი თმა რჩება სავარცხელზე და სააბაზანოში"))   s.Shedding    += 3;
  if (q3.includes("თმა ტყდება და დაკარგა ბზინვარება"))            s.HairQuality += 3;

  if (q4.includes("ციკლი არარეგულარული გახდა ან შეწყდა"))         s.HormonalTransition += 3;
  if (q4.includes("სიცხის შემოტევები ან ღამის ოფლიანობა"))        s.HormonalTransition += 2;
  if (q4.includes("მეტი სტრესი ან შფოთვა"))                        s.StressSleep        += 3;

  if (a.q5 === "ხშირად ვიღვიძებ ღამით")     s.StressSleep += 2;
  if (a.q5 === "მიჭირს დაძინება")            s.StressSleep += 2;
  if (a.q5 === "ღამის ოფლიანობა მაღვიძებს") s.StressSleep += 2;

  const sorted = CATEGORY_PRIORITY.slice().sort((x, y) => s[y] - s[x]);
  return [sorted[0], sorted[1]];
}

function getSeveritySummary(qSeverity: string | undefined): string {
  if (!qSeverity) return "";
  if (qSeverity.startsWith("1") || qSeverity.startsWith("2"))
    return "ამ ეტაპზე ცვლილებები შედარებით მსუბუქია, თუმცა ბევრი ქალი ამჯობინებს მათ ადრევე გაიგოს.";
  if (qSeverity.startsWith("3"))
    return "შენი პასუხები გვაჩვენებს, რომ თმის ცვლილება შესამჩნევი გახდა და იწყებს გავლენის მოხდენას შენს განცდებზე.";
  if (qSeverity.startsWith("4"))
    return "შენი პასუხები მიანიშნებს, რომ თმის ცვლილება მნიშვნელოვანი შეშფოთების წყარო გახდა და გავლენას ახდენს შენს თავდაჯერებულობაზე.";
  return "შენი პასუხები მიანიშნებს, რომ ეს ცვლილებები შენზე მნიშვნელოვნად ახდენს გავლენას და გამოსავალს აქტიურად ეძებ.";
}

function getPreviousAttemptText(q6: string | undefined): string {
  if (!q6) return "";
  if (q6.includes("შამპუნები"))
    return "შენ უკვე სცადე გარეგანი მოვლის საშუალებები, თუმცა თმის ცვლილებებზე ხშირად ზედაპირულ მოვლაზე მეტი ფაქტორი ახდენს გავლენას.";
  if (q6.includes("ვიტამინები") || q6.includes("ბიოტინი"))
    return "შენ უკვე სცადე ცალკეული დანამატები, თუმცა თმის ცვლილებებს ხშირად ერთდროულად რამდენიმე ფაქტორი განსაზღვრავს.";
  if (q6.includes("პლაზმათერაპია"))
    return "შენ უკვე გამოიყენე უფრო ინტენსიური მიდგომა, რაც გვიჩვენებს, რამდენად სერიოზულად უდგები ამ საკითხს.";
  if (q6.includes("არაფერი"))
    return "ეს შეიძლება სასარგებლო შესაძლებლობა იყოს უკეთ გაიგო სხვადასხვა ფაქტორები, რომლებიც შეიძლება გავლენას ახდენდნენ თმის ცვლილებებზე.";
  if (q6.includes("რამდენიმე"))
    return "შენი პასუხები გვაჩვენებს, რომ გაუმჯობესების ძიებაში უკვე სცადე სხვადასხვა მიდგომები.";
  return "";
}

function getHeadline(firstName: string, q1: string | undefined): string {
  if (!q1 || q1 === "40-მდე")
    return firstName + ", შენი პასუხები ჰორმონალური ცვლილებების ნიშნებს ავლენს.";
  if (q1 === "40–45")
    return firstName + ", შენი პასუხები ჰორმონალურ ცვლილებებს, სავარაუდოდ პერიმენოპაუზას, მიანიშნებს.";
  return firstName + ", შენი პასუხები მენოპაუზასთან დაკავშირებულ ცვლილებებს მიანიშნებს.";
}


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
            კითხვა {questionIndex + 1} / 8
          </span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((questionIndex + 1) / 8) * 100}%` }}
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
            <ResultScreen name={name} answers={answers} />
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
        {/* Name */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="quiz-name">
            სახელი
          </label>
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

        {/* Phone */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="quiz-phone">
            ტელეფონის ნომერი
          </label>
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

        {/* Email — optional */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="quiz-email">
            ელ.ფოსტა
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

// ─── Result page ──────────────────────────────────────────────────────────────

function ResultScreen({
  name,
  answers,
}: {
  name: string;
  answers: PartialAnswers;
}) {
  const [earlyAccessConfirmed, setEarlyAccessConfirmed] = useState(false);

  const firstName      = name.trim().split(" ")[0];
  const headline       = getHeadline(firstName, answers.q1);
  const severitySummary = getSeveritySummary(answers.q_severity);
  const [cat1, cat2]   = calcCategories(answers);
  const previousText   = getPreviousAttemptText(answers.q6);

  return (
    <div className={styles.resultWrap}>

      {/* Section 1 — Headline + severity summary */}
      <h2 className={styles.resultHeadline}>{headline}</h2>
      <div className={styles.resultDivider} />
      {severitySummary && (
        <p className={styles.resultText}>{severitySummary}</p>
      )}

      <div className={styles.resultDivider} />

      {/* Section 2 — Main areas identified */}
      <span className={styles.driversLabel}>შენი პასუხებიდან გამოვლენილი ძირითადი სფეროები:</span>
      <div className={styles.driverCards} style={{ marginTop: 10 }}>
        <div className={styles.driverCard}>
          <p className={styles.driverTitle}>{CATEGORY_META[cat1].title}</p>
          <p className={styles.driverText}>{CATEGORY_META[cat1].body}</p>
        </div>
        <div className={styles.driverCard}>
          <p className={styles.driverTitle}>{CATEGORY_META[cat2].title}</p>
          <p className={styles.driverText}>{CATEGORY_META[cat2].body}</p>
        </div>
      </div>

      <div className={styles.resultDivider} />

      {/* Section 3 — Previous attempts */}
      {previousText && (
        <>
          <span className={styles.driversLabel}>წინა მიდგომები</span>
          <p className={styles.driverText} style={{ marginTop: 10 }}>{previousText}</p>
          <div className={styles.resultDivider} />
        </>
      )}

      {/* Section 4 — Why THAMRA */}
      <span className={styles.driversLabel}>რატომ THAMRA?</span>
      <p className={styles.driverText} style={{ marginTop: 10 }}>
        THAMRA შეიქმნა იმ იდეაზე, რომ მენოპაუზის პერიოდში თმის ცვლილება იშვიათად არის მხოლოდ ერთი მიზეზის შედეგი. შენი პასუხებიც გვაჩვენებს, რომ ერთდროულად რამდენიმე განსხვავებული ფაქტორი შეიძლება იყოს. სწორედ ამიტომ THAMRA აერთიანებს მრავალ მტკიცებულებებზე დაფუძნებულ მიდგომას ერთ ყოველდღიურ რიტუალში.
      </p>

      <div className={styles.resultDivider} />

      {/* Early access */}
      <span className={styles.driversLabel}>შენ ახლა THAMRA-ს ადრეული წვდომის სიაში ხარ.</span>
      <p className={styles.driverText} style={{ marginTop: 10 }}>
        შენთვის შენარჩუნდება 20%-იანი შეთავაზება პირველ გამოშვებაზე.
      </p>

      {earlyAccessConfirmed ? (
        <div style={{ marginTop: 20 }}>
          <p className={styles.driverTitle}>მზადაა. შენი ადგილი დაცულია.</p>
          <p className={styles.driverText} style={{ marginTop: 8 }}>
            როცა THAMRA-ს პირველი გამოშვება მზად იქნება, პირველებს შორის შეიტყობ.
          </p>
        </div>
      ) : (
        <button
          className={styles.primaryBtn}
          style={{ marginTop: 16 }}
          onClick={() => setEarlyAccessConfirmed(true)}
        >
          მინდა ადრეული წვდომა
        </button>
      )}

      {/* Footer */}
      <p className={styles.footnote}>
        ეს ტესტი საინფორმაციო ხასიათისაა და არ წარმოადგენს სამედიცინო დიაგნოზს.
      </p>

    </div>
  );
}
