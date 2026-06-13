"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import styles from "./Quiz.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type PartialAnswers = {
  q1?: string;
  q2?: string;
  q3?: string[];
  q4?: string[];
  q5?: string;
  q6?: string;
  q7?: string;
};

type Screen =
  | "intro"
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "q5"
  | "q6"
  | "q7"
  | "email"
  | "result";

const SCREEN_ORDER: Screen[] = [
  "intro",
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
  "q7",
  "email",
  "result",
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
      "ცუდი ძილი",
      "მეტი სტრესი ან შფოთვა",
      "წონის ცვლილება",
      "არცერთი",
    ],
  },
  {
    id: "q5",
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
    id: "q6",
    text: "როგორ შეაფასებდი შენს ყოველდღიურ სტრესს?",
    type: "single",
    options: ["დაბალი", "საშუალო", "მაღალი", "ნუ მკითხავ 🙂"],
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
  text: "ესტროგენი, რომელიც DHT ჰორმონს აკონტროლებდა, მცირდება. DHT ფოლიკულს ავიწროებს — თმა თხელდება ზუსტად იქ, სადაც შენ ამჩნევ.",
};

const CORTISOL_DRIVER: Driver = {
  title: "კორტიზოლი არ ჩერდება.",
  text: "მაღალი სტრესი ფოლიკულებს ვადამდე „ძილის რეჟიმში“ აგზავნის — ამიტომ რჩება მეტი თმა სავარცხელზე.",
};

const NUTRIENT_DRIVER: Driver = {
  title: "სხეული ვეღარ კვებავს თმას.",
  text: "მენოპაუზის დროს კოლაგენის წარმოება და რკინის შეწოვა მცირდება. შენს ფოლიკულს უბრალოდ აკლია ნედლეული.",
};

const SCALP_DRIVER: Driver = {
  title: "სკალპი კარგავს სიძლიერეს.",
  text: "D ვიტამინისა და სელენის ნაკლებობა ასუსტებს ნიადაგს, რომელშიც თმა იზრდება. სუსტი ფესვები — სუსტი თმა.",
};

function getDrivers(a: PartialAnswers): [Driver, Driver] {
  const pool: Driver[] = [];
  if (a.q3?.includes("გაყოფის ხაზი გაფართოვდა") || a.q3?.includes("თხემზე სკალპი მოჩანს"))
    pool.push(DHT_DRIVER);
  if (
    a.q6 === "მაღალი" ||
    a.q6 === "ნუ მკითხავ 🙂" ||
    a.q4?.includes("მეტი სტრესი ან შფოთვა") ||
    a.q4?.includes("ცუდი ძილი")
  )
    pool.push(CORTISOL_DRIVER);
  if (a.q3?.includes("თმა ტყდება და დაკარგა ბზინვარება") || a.q3?.includes("კუდი გათხელდა"))
    pool.push(NUTRIENT_DRIVER);
  const result = pool.slice(0, 2);
  while (result.length < 2) result.push(SCALP_DRIVER);
  return result as [Driver, Driver];
}

function getBlock3(q5: string | undefined): Driver {
  if (q5 === "სპეციალური შამპუნები და სერუმები")
    return {
      title: "ამიტომ ვერ გიშველა შამპუნმა.",
      text: "შამპუნი ზედაპირზე მუშაობს. შენი პრობლემა კი შიგნით არის — ჰორმონებში, კვებაში, სტრესში.",
    };
  if (q5 === "ჩვეულებრივი ვიტამინები (ბიოტინი და სხვა)")
    return {
      title: "ამიტომ ვერ გიშველა ჩვეულებრივმა ვიტამინმა.",
      text: "ბიოტინი მხოლოდ ერთ პრობლემას ეხება. DHT-ს, კორტიზოლს და სკალპის შესუსტებას — ვერა.",
    };
  if (q5 === "ჯერ არაფერი")
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
  "თმის ხილული ზრდა": "შენი მიზანი — თმის ხილული ზრდა — ზუსტად აქ იწყება.",
  "ცვენის შეჩერება": "შენი მიზანი — ცვენის შეჩერება — ზუსტად აქ იწყება.",
  "უფრო სქელი და ხშირი თმა": "შენი მიზანი — უფრო სქელი და ხშირი თმა — ზუსტად აქ იწყება.",
  "ყველაფერი ერთად, ბუნებრივად":
    "შენი მიზანი — ბუნებრივი, ყოვლისმომცველი შედეგი — ზუსტად აქ იწყება.",
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuizClient() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [answers, setAnswers] = useState<PartialAnswers>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
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

  function handleEmailSubmit() {
    let valid = true;
    if (!name.trim()) {
      setNameError("სახელი სავალდებულოა");
      valid = false;
    } else {
      setNameError("");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("გთხოვთ, შეიყვანეთ სწორი ელ.ფოსტა");
      valid = false;
    } else {
      setEmailError("");
    }
    if (!valid) return;

    // TODO: Replace with Supabase insert
    // await supabase.from("quiz_leads").insert({
    //   name, email, answers, submitted_at: new Date().toISOString()
    // })
    console.log(
      "Thamra quiz submission:",
      JSON.stringify({ name, email, answers }, null, 2)
    );

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

          {screen === "email" && (
            <EmailScreen
              name={name}
              email={email}
              nameError={nameError}
              emailError={emailError}
              onNameChange={setName}
              onEmailChange={setEmail}
              onSubmit={handleEmailSubmit}
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
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
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
        გაიგეთ, რა სჭირდება თქვენს თმას
      </h1>
      <p className={styles.introText}>
        უპასუხეთ რამდენიმე კითხვას და გაიგეთ, როგორ იზრუნოთ თმის სიჯანსაღეზე მენოპაუზის პერიოდში.
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
              className={
                isSelected
                  ? `${styles.option} ${styles.selected}`
                  : styles.option
              }
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

// ─── Email gate ───────────────────────────────────────────────────────────────

function EmailScreen({
  name,
  email,
  nameError,
  emailError,
  onNameChange,
  onEmailChange,
  onSubmit,
  onBack,
}: {
  name: string;
  email: string;
  nameError: string;
  emailError: string;
  onNameChange: (v: string) => void;
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

      <h2 className={styles.emailHeadline}>
        შენი პერსონალური ანალიზი მზადაა
      </h2>
      <p className={styles.emailSubtext}>
        სად გამოგიგზავნოთ შედეგი და შენზე მორგებული რეკომენდაცია?
      </p>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="quiz-name">
            სახელი
          </label>
          <input
            id="quiz-name"
            type="text"
            className={
              nameError
                ? `${styles.fieldInput} ${styles.hasError}`
                : styles.fieldInput
            }
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            autoComplete="given-name"
            placeholder="შენი სახელი"
          />
          {nameError && (
            <span className={styles.fieldError}>{nameError}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="quiz-email">
            ელ.ფოსტა
          </label>
          <input
            id="quiz-email"
            type="email"
            inputMode="email"
            className={
              emailError
                ? `${styles.fieldInput} ${styles.hasError}`
                : styles.fieldInput
            }
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            autoComplete="email"
            placeholder="example@gmail.com"
          />
          {emailError && (
            <span className={styles.fieldError}>{emailError}</span>
          )}
        </div>
      </div>

      <button className={styles.submitBtn} onClick={onSubmit}>
        მაჩვენე ჩემი შედეგი
      </button>
      <p className={styles.disclaimer}>
        სპამს არ გიგზავნით. მხოლოდ ის, რაც შენს თმას ეხება.
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
  const [d1, d2] = getDrivers(answers);
  const block3 = getBlock3(answers.q5);
  const q7Line =
    answers.q7 !== undefined
      ? (Q7_LINES[answers.q7] ??
        Q7_LINES["ყველაფერი ერთად, ბუნებრივად"])
      : Q7_LINES["ყველაფერი ერთად, ბუნებრივად"];
  const firstName = name.trim().split(" ")[0];

  return (
    <div className={styles.resultWrap}>
      {/* ── Block 1 ── */}
      <span className={styles.resultLabel}>შენი ანალიზი</span>
      <h2 className={styles.resultHeadline}>
        {firstName && `${firstName}, `}
        შენი პასუხები ერთ მიზეზზე მიუთითებს: მენოპაუზა.
      </h2>
      <p className={styles.resultText}>
        შენი თმის ცვლილება ზედაპირული პრობლემა არ არის. ის შიგნიდან იწყება —
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

      {/* ── Block 4 ── */}
      <div className={styles.thamraBlock}>
        <span className={styles.thamraBlockLabel}>რეკომენდაცია</span>
        <h3 className={styles.thamraHeadline}>სწორედ ამიტომ შეიქმნა Thamra.</h3>
        <p className={styles.thamraText}>
          Thamra Advanced Hair Biomatrix™ ერთდროულად მუშაობს ოთხივე მიზეზზე,
          რომელსაც მენოპაუზა იწვევს — და არა ერთ სიმპტომზე.
        </p>
        <p className={styles.thamraPersonal}>{q7Line}</p>
        <a href="/#shop" className={styles.ctaBtn}>
          მინდა ჩემი Thamra · −15% ტესტის მონაწილეებისთვის
        </a>
        <p className={styles.urgency}>
          შეთავაზება მოქმედებს 24 საათის განმავლობაში.
        </p>
      </div>

      <p className={styles.footnote}>
        ეს ტესტი საინფორმაციო ხასიათისაა და არ წარმოადგენს სამედიცინო დიაგნოზს.
      </p>
    </div>
  );
}
