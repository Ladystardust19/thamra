"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import styles from "./Quiz.module.css";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type PartialAnswers = {
  q1?: string;
  q2?: string;
  q3?: string[];
  q4?: string[];
  q5?: string;   // sleep (new Q5)
  q6?: string;   // what tried (was Q5)
  q7?: string;   // goal
};

type Screen =
  | "intro"
  | "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7"
  | "gate"
  | "result";

const SCREEN_ORDER: Screen[] = [
  "intro", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "gate", "result",
];

const Q_SCREENS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"];

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
      "სალონის პროცედურები",
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

type Driver = { title: string; text: string };

const DHT_DRIVER: Driver = {
  title: "ესტროგენი ეცემა, DHT თავისუფლდება.",
  text: "ესტროგენი, რომელიც DHT ჰორმონს აკონტროლებდა, მცირდება. DHT ფოლიკულს ავიწროებს, თმა თხელდება ზუსტად იქ, სადაც შენ ამჩნევ.",
};

const CORTISOL_DRIVER: Driver = {
  title: "კორტიზოლი არ ჩერდება.",
  text: "ცუდი ძილი და სტრესი კორტიზოლს ზრდის, ის კი ფოლიკულებს ვადამდე „ძილის რეჟიმში“ აგზავნის. ამიტომ რჩება მეტი თმა სავარცხელზე.",
};

const NUTRIENT_DRIVER: Driver = {
  title: "სხეული ვეღარ კვებავს თმას.",
  text: "ჰორმონალური ცვლილებისას კოლაგენის წარმოება და რკინის შეწოვა მცირდება. შენს ფოლიკულს უბრალოდ აკლია ნედლეული.",
};

const SCALP_DRIVER: Driver = {
  title: "სკალპი კარგავს სიძლიერეს.",
  text: "D ვიტამინისა და სელენის ნაკლებობა ასუსტებს ნიადაგს, რომელშიც თმა იზრდება. სუსტი ფესვები, სუსტი თმა.",
};

function getDrivers(a: PartialAnswers): [Driver, Driver] {
  const pool: Driver[] = [];
  if (a.q3?.includes("გაყოფის ხაზი გაფართოვდა") || a.q3?.includes("თხემზე სკალპი მოჩანს"))
    pool.push(DHT_DRIVER);
  if (
    (a.q5 !== undefined && a.q5 !== "კარგად, ვისვენებ") ||
    a.q4?.includes("მეტი სტრესი ან შფოთვა")
  )
    pool.push(CORTISOL_DRIVER);
  if (a.q3?.includes("თმა ტყდება და დაკარგა ბზინვარება") || a.q3?.includes("კუდი გათხელდა"))
    pool.push(NUTRIENT_DRIVER);
  const result = pool.slice(0, 2);
  while (result.length < 2) result.push(SCALP_DRIVER);
  return result as [Driver, Driver];
}

function getBlock3(q6: string | undefined): Driver {
  if (q6 === "სპეციალური შამპუნები და სერუმები")
    return {
      title: "ამიტომ ვერ გიშველა შამპუნმა.",
      text: "შამპუნი ზედაპირზე მუშაობს. შენი პრობლემა კი შიგნით არის, ჰორმონებში, კვებაში, სტრესში.",
    };
  if (q6 === "ჩვეულებრივი ვიტამინები (ბიოტინი და სხვა)")
    return {
      title: "ამიტომ ვერ გიშველა ჩვეულებრივმა ვიტამინმა.",
      text: "ბიოტინი მხოლოდ ერთ პრობლემას ეხება. DHT-ს, კორტიზოლს და სკალპის შესუსტებას, ვერა.",
    };
  if (q6 === "ჯერ არაფერი")
    return {
      title: "კარგ დროს იწყებ.",
      text: "რაც უფრო ადრე მიეხმარები ფოლიკულებს, მით მეტი მათგანი გადარჩება აქტიურ ფაზაში.",
    };
  return {
    title: "ამიტომ იყო შედეგი დროებითი.",
    text: "პროცედურები გარეგნულ ეფექტს ქმნის, მაგრამ მიზეზს არ აჩერებს.",
  };
}

const Q7_LINES: Record<string, string> = {
  "თმის ხილული ზრდა":
    "შენი მიზანი, თმის ხილული ზრდა, ზუსტად აქ იწყება.",
  "ცვენის შეჩერება":
    "შენი მიზანი, ცვენის შეჩერება, ზუსტად აქ იწყება.",
  "უფრო სქელი და ხშირი თმა":
    "შენი მიზანი, უფრო სქელი და ხშირი თმა, ზუსტად აქ იწყება.",
  "ყველაფერი ერთად, ბუნებრივად":
    "შენი მიზანი, ყველაფერი ერთად და ბუნებრივად, ზუსტად აქ იწყება.",
};

function getResultHeadline(firstName: string, age: string | undefined): string {
  const prefix = firstName ? `${firstName}, ` : "";
  if (age === "46–52" || age === "53–60" || age === "60+")
    return `${prefix}შენი პასუხები მენოპაუზაზე მიუთითებს.`;
  if (age === "40–45")
    return `${prefix}შენი პასუხები ჰორმონალურ ცვლილებაზე, სავარაუდოდ პერიმენოპაუზაზე, მიუთითებს.`;
  return `${prefix}შენი პასუხები ჰორმონალურ დისბალანსზე მიუთითებს.`;
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

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
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
            კითხვა {questionIndex + 1} / 7
          </span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((questionIndex + 1) / 7) * 100}%` }}
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
            <ResultScreen name={name} phone={phone} answers={answers} />
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
      <span className={styles.eyebrow}>THAMRA · ანალიზი</span>
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
            placeholder="ელ.ფოსტა (არასავალდებულო)"
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
  answers,
}: {
  name: string;
  phone: string;
  answers: PartialAnswers;
}) {
  const [d1, d2] = getDrivers(answers);
  const block3 = getBlock3(answers.q6);
  const q7Line =
    answers.q7 !== undefined
      ? (Q7_LINES[answers.q7] ?? Q7_LINES["ყველაფერი ერთად, ბუნებრივად"])
      : Q7_LINES["ყველაფერი ერთად, ბუნებრივად"];
  const firstName = name.trim().split(" ")[0];

  return (
    <div className={styles.resultWrap}>

      {/* ── Block 1 ── */}
      <span className={styles.resultLabel}>შენი ანალიზი</span>
      <h2 className={styles.resultHeadline}>
        {getResultHeadline(firstName, answers.q1)}
      </h2>
      <p className={styles.resultText}>
        შენი თმის ცვლილება ზედაპირული პრობლემა არ არის. ის შიგნიდან იწყება,
        ჰორმონალური ცვლილებით, რომელიც ერთდროულად ოთხ პროცესს უშვებს შენს
        სხეულში.
      </p>

      <div className={styles.resultDivider} />

      {/* ── Block 2 ── */}
      <span className={styles.driversLabel}>შენი ორი მთავარი ფაქტორი:</span>
      <div className={styles.driverCards}>
        {([d1, d2] as Driver[]).map((d, i) => (
          <div key={i} className={styles.driverCard}>
            <p className={styles.driverTitle}>{d.title}</p>
            <p className={styles.driverText}>{d.text}</p>
          </div>
        ))}
      </div>

      <div className={styles.resultDivider} />

      {/* ── Block 3 ── */}
      <div className={styles.insightCard}>
        <p className={styles.insightTitle}>{block3.title}</p>
        <p className={styles.insightText}>{block3.text}</p>
      </div>

      <div className={styles.resultDivider} />

      {/* ── Block 4 — Consultation ── */}
      <div className={styles.thamraBlock}>
        <span className={styles.thamraBlockLabel}>რეკომენდაცია</span>

        <p className={styles.thamraText}>
          თქვენი პასუხებიდან ჩანს, რომ თმის გათხელება და ცვენა შეიძლება მენოპაუზასთან დაკავშირებულ რამდენიმე პროცესს უკავშირდებოდეს. ასეთ დროს ერთი ინგრედიენტი ან შემთხვევით შერჩეული ვიტამინი ხშირად არ არის საკმარისი.
        </p>

        <div className={styles.fields} style={{ marginTop: 24 }}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} style={{ color: "rgba(247,241,233,0.6)" }}>სახელი</label>
            <input type="text" className={styles.fieldInput} defaultValue={name} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} style={{ color: "rgba(247,241,233,0.6)" }}>ტელეფონის ნომერი</label>
            <div className={styles.phoneWrap}>
              <span className={styles.phonePrefix}>+995</span>
              <input type="tel" className={styles.phoneInput} defaultValue={phone} />
            </div>
          </div>
        </div>

        <button className={styles.ctaBtn} style={{ marginTop: 8 }}>
          შედეგის ნახვა →
        </button>

      </div>

      <p className={styles.footnote}>
        ეს ტესტი საინფორმაციო ხასიათისაა და არ წარმოადგენს სამედიცინო დიაგნოზს.
      </p>

    </div>
  );
}
