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
      "კუდი გათხელდა",
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

type DriverKey = "DHT" | "Cortisol" | "Nutrient" | "Scalp";

const DRIVER_META: Record<DriverKey, { title: string; body: string }> = {
  DHT: {
    title: "ჰორმონი DHT აქტიურდება.",
    body: "მენოპაუზისას მატულობს ჰორმონი DHT, რომელიც თმის ფესვს ასუსტებს. ადრე ესტროგენი აკავებდა, ახლა კი აღარ. ამიტომ თხელდება თმა ზუსტად იქ, სადაც შენ ამჩნევ.",
  },
  Cortisol: {
    title: "სტრესის ჰორმონი კორტიზოლი მაღლა რჩება.",
    body: "ცუდი ძილი და სტრესი ზრდის კორტიზოლს, სტრესის ჰორმონს. ის თმის ფესვებს ვადამდე ასვენებს. ამიტომ რჩება მეტი თმა სავარცხელზე.",
  },
  Nutrient: {
    title: "სხეული თმას საკვებ ნივთიერებებს აკლებს.",
    body: "ჰორმონალური ცვლილებისას მცირდება ის მასალა, რისგანაც თმა შენდება. სხეული ჯერ სასიცოცხლო ორგანოებს კვებავს, თმა ბოლო რიგში რჩება.",
  },
  Scalp: {
    title: "თმის ფესვის ნიადაგი სუსტდება.",
    body: "სკალპი, სადაც თმა იზრდება, კარგავს სიმტკიცეს. სუსტ ნიადაგზე ძლიერი თმა ვერ დგება. სუსტი ფესვი, სუსტი თმა.",
  },
};

function calcDrivers(a: PartialAnswers): [DriverKey, DriverKey] {
  const q3 = a.q3 ?? [];
  const q4 = a.q4 ?? [];
  const q5 = a.q5;
  const matches: DriverKey[] = [];

  if (q3.includes("გაყოფის ხაზი გაფართოვდა") || q3.includes("თხემზე სკალპი მოჩანს"))
    matches.push("DHT");
  if ((q5 !== undefined && q5 !== "კარგად, ვისვენებ") || q4.includes("მეტი სტრესი ან შფოთვა"))
    matches.push("Cortisol");
  if (q3.includes("თმა ტყდება და დაკარგა ბზინვარება") || q3.includes("კუდი გათხელდა"))
    matches.push("Nutrient");

  const d1: DriverKey = matches[0] ?? "Scalp";
  const d2: DriverKey = matches[1] ?? "Scalp";
  return [d1, d2];
}

function getHeadline(firstName: string, q1: string | undefined): string {
  if (q1 === "46–52" || q1 === "53–60" || q1 === "60+")
    return `${firstName}, შენი პასუხები მენოპაუზაზე მიუთითებს.`;
  if (q1 === "40–45")
    return `${firstName}, შენი პასუხები ჰორმონალურ ცვლილებაზე, სავარაუდოდ პერიმენოპაუზაზე, მიუთითებს.`;
  return `${firstName}, შენი პასუხები ჰორმონალურ დისბალანსზე მიუთითებს.`;
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

  const firstName = name.trim().split(" ")[0];
  const headline  = getHeadline(firstName, answers.q1);
  const [d1, d2]  = calcDrivers(answers);

  function handleWaitlist() {
    const lead = {
      name: name.trim(),
      phone,
      email: email || null,
      answers,
      waitlisted: true,
    };
    console.log(lead);
    // TODO: supabase.from("quiz_leads").update({ waitlisted: true }).eq("phone", lead.phone)
    setWaitlisted(true);
  }

  return (
    <div className={styles.resultWrap}>

      {/* Section 1 — Headline */}
      <h2 className={styles.resultHeadline}>{headline}</h2>
      <p className={styles.resultText} style={{ marginTop: 12 }}>
        შენი თმის ცვლილება ზედაპირული პრობლემა არ არის. ის შიგნიდან იწყება და ერთდროულად რამდენიმე პროცესზე აისახება.
      </p>

      <div className={styles.resultDivider} />

      {/* Section 2 — Two primary drivers */}
      <span className={styles.driversLabel}>შენი ორი მთავარი ფაქტორი:</span>
      <div className={styles.driverCards} style={{ marginTop: 10 }}>
        <div className={styles.driverCard}>
          <p className={styles.driverTitle}>{DRIVER_META[d1].title}</p>
          <p className={styles.driverText}>{DRIVER_META[d1].body}</p>
        </div>
        <div className={styles.driverCard}>
          <p className={styles.driverTitle}>{DRIVER_META[d2].title}</p>
          <p className={styles.driverText}>{DRIVER_META[d2].body}</p>
        </div>
      </div>
      <p className={styles.resultText} style={{ marginTop: 16 }}>
        ეს ფაქტორები ერთმანეთს კვებავს. ამიტომ ერთი ვიტამინი ან ერთი შამპუნი ვერ აგვარებს პრობლემას. THAMRA ერთდროულად რამდენიმე მიმართულებაზე მუშაობს, სწორედ ამიტომ.
      </p>

      <div className={styles.resultDivider} />

      {/* Section 3 — Early access framing */}
      <span className={styles.driversLabel}>შენ ახლა THAMRA-ს ადრეული წვდომის სიაში ხარ.</span>
      <p className={styles.driverText} style={{ marginTop: 10 }}>
        ეს 20% მხოლოდ იმ ქალებისთვისაა, ვინც ტესტი უკვე დაასრულა. ჩვეულებრივ ფასში ის აღარ იქნება.
      </p>

      <div className={styles.resultDivider} />

      {/* Section 4 — Single action */}
      {waitlisted ? (
        <div style={{ marginTop: 8 }}>
          <p className={styles.driverTitle}>მზადაა. შენი ადგილი დაცულია.</p>
          <p className={styles.driverText} style={{ marginTop: 8 }}>
            როცა შემდეგი გამოშვება მზად იქნება, პირველი შენ შეიტყობ.
          </p>
        </div>
      ) : (
        <>
          <button
            className={styles.primaryBtn}
            style={{ marginTop: 8 }}
            onClick={handleWaitlist}
          >
            დამიმაგრე ჩემი 20% ფასდაკლება
          </button>
          <p className={styles.driverText} style={{ marginTop: 12 }}>
            შეუერთდი ლისტს და შემდეგი გამოშვება პირველმა შენ მიიღე.
          </p>
        </>
      )}

      {/* Footer */}
      <p className={styles.footnote} style={{ marginTop: 24 }}>
        ეს ტესტი საინფორმაციო ხასიათისაა და არ წარმოადგენს სამედიცინო დიაგნოზს.
      </p>

    </div>
  );
}
