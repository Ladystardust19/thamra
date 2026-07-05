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

type Profile = “volume” | “thinning” | “stress” | “mixed”;
type StressLevel = “დაბალი” | “საშუალო” | “მაღალი”;

function calcProfile(a: PartialAnswers): Profile {
  const s = { volume: 0, thinning: 0, stress: 0 };

  // Q1 — age
  if (a.q1 === “46–52” || a.q1 === “53–60” || a.q1 === “60+”) { s.volume += 2; s.thinning += 1; }
  else if (a.q1 === “40–45”) { s.stress += 1; s.thinning += 1; }
  else { s.stress += 2; }

  // Q2 — onset
  if (a.q2 === “6 თვეზე ნაკლები ხნის წინ”) s.stress += 2;
  else if (a.q2 === “6–12 თვის წინ”) { s.stress += 1; s.volume += 1; }
  else if (a.q2 === “1–3 წლის წინ”) s.thinning += 2;
  else if (a.q2 === “3 წელზე მეტი ხნის წინ”) { s.thinning += 2; s.volume += 1; }

  // Q3 — visual symptoms
  const q3 = a.q3 ?? [];
  if (q3.includes(“გაყოფის ხაზი გაფართოვდა”)) s.volume += 2;
  if (q3.includes(“კუდი გათხელდა”)) s.thinning += 2;
  if (q3.includes(“მეტი თმა რჩება სავარცხელზე და სააბაზანოში”)) { s.stress += 1; s.thinning += 1; }
  if (q3.includes(“თხემზე სკალპი მოჩანს”)) { s.volume += 2; s.thinning += 1; }
  if (q3.includes(“თმა ტყდება და დაკარგა ბზინვარება”)) { s.thinning += 2; s.stress += 1; }

  // Q4 — accompanying symptoms
  const q4 = a.q4 ?? [];
  if (q4.includes(“ციკლი არარეგულარული გახდა ან შეწყდა”)) s.volume += 2;
  if (q4.includes(“სიცხის შემოტევები ან ღამის ოფლიანობა”)) { s.volume += 2; s.stress += 1; }
  if (q4.includes(“მეტი სტრესი ან შფოთვა”)) s.stress += 3;
  if (q4.includes(“წონის ცვლილება”)) { s.volume += 1; s.thinning += 1; }

  // Q5 — sleep
  if (a.q5 === “ხშირად ვიღვიძებ ღამით” || a.q5 === “მიჭირს დაძინება”) s.stress += 2;
  else if (a.q5 === “ღამის ოფლიანობა მაღვიძებს”) { s.stress += 2; s.volume += 1; }

  const sorted = (Object.entries(s) as [string, number][]).sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] - sorted[1][1] <= 2) return “mixed”;
  return sorted[0][0] as Profile;
}

function calcStressLevel(a: PartialAnswers): StressLevel {
  let n = 0;
  if (a.q2 === “3 წელზე მეტი ხნის წინ”) n += 3;
  else if (a.q2 === “1–3 წლის წინ”) n += 2;
  else n += 1;
  n += (a.q3 ?? []).length;
  n += (a.q4 ?? []).filter((x) => x !== “არცერთი”).length;
  if (a.q5 && a.q5 !== “კარგად, ვისვენებ”) n += 2;
  if (n <= 3) return “დაბალი”;
  if (n <= 6) return “საშუალო”;
  return “მაღალი”;
}

const PROFILE_META: Record<Profile, { label: string; title: string }> = {
  volume:   { label: “მოცულობის პროფილი”,    title: “შენი თმა მოცულობასა და სიმჭიდროვეს კარგავს” },
  thinning: { label: “გათხელების პროფილი”,   title: “შენი თმა თანდათან თხელდება” },
  stress:   { label: “სტრეს-პროფილი”,         title: “სტრესი და ძილი შენს თმის ციკლს ამოკლებს” },
  mixed:    { label: “კომბინირებული პროფილი”, title: “რამდენიმე ფაქტორი ერთდროულად მოქმედებს შენს თმაზე” },
};

const STRESS_COLORS: Record<StressLevel, string> = {
  “დაბალი”:  “#5C8A6B”,
  “საშუალო”: “#C9A96E”,
  “მაღალი”:  “#8B2F3A”,
};

const PROFILE_SENTENCES: Record<Profile, Record<StressLevel, [string, string]>> = {
  volume: {
    “დაბალი”: [
      “შენი ფოლიკულები ჯერ კიდევ აქტიურია — ადრეული ეტაპი ყველაზე მგრძნობიარეა სწორი მხარდაჭერის მიმართ.”,
      “ესტროგენის შემცირება DHT-ს ათავისუფლებს, ის კი ფოლიკულს ავიწროებს. ეს პროცესი შეჩერებადია.”,
    ],
    “საშუალო”: [
      “ფოლიკულები ნელ-ნელა ვიწროვდება — ჩვეულებრივი ჰორმონალური პროცესია, მაგრამ ყოველი თვე ითვლის.”,
      “შენი სიმპტომები ჰორმონალურ ცვლილებაზე მიუთითებს — THAMRA ზუსტად ამ მიზეზს მიმართავს.”,
    ],
    “მაღალი”: [
      “გრძელვადიანი ჰორმონალური ცვლილება ფოლიკულებს ამოაწყვეტს — სისტემური, კომპლექსური მიდგომაა საჭირო.”,
      “THAMRA-ს ფორმულა ყველა იმ ბიოლოგიურ პროცესზე მოქმედებს, რომელიც შენს სიმპტომებს იწვევს.”,
    ],
  },
  thinning: {
    “დაბალი”: [
      “გათხელება ნელია, მაგრამ პროგრესული — ადრეული ჩარევა ფოლიკულის სრულ გამოღვიძებას ნიშნავს.”,
      “შენი ფოლიკულები კვებასა და ჰორმონალურ მხარდაჭერას ელოდება — ეს ზუსტად ის, რასაც THAMRA აწოდებს.”,
    ],
    “საშუალო”: [
      “თმა სიმჭიდროვეს კარგავს — ეს ნიშნავს, რომ ფოლიკული ჯერ ცოცხალია, მაგრამ ეხმარება.”,
      “კომპლექსური კვება ფოლიკულის დონეზე ზუსტად ის გადაწყვეტაა, რისთვისაც THAMRA შეიქმნა.”,
    ],
    “მაღალი”: [
      “გრძელვადიანი გათხელება ფოლიკულის გამოღვიძებას მოითხოვს — ეს THAMRA-ს სპეციალობაა.”,
      “შენი სიმპტომები გვიჩვენებს, რომ ერთი ინგრედიენტი საკმარისი ვერ იქნება — კომბინირებული ფორმულა გჭირდება.”,
    ],
  },
  stress: {
    “დაბალი”: [
      “სტრესი და ძილის ხარისხი კორტიზოლს ზრდის — ის ფოლიკულებს ვადამდე „ძილის რეჟიმში” აგზავნის.”,
      “კარგი ამბავია: სტრეს-ინდუცირებული ცვენა ყველაზე ადვილად სამართავია სწორი, დროული მხარდაჭერით.”,
    ],
    “საშუალო”: [
      “კორტიზოლის მომატება ფოლიკულის ციკლს ამოკლებს — ამიტომ მეტი თმა ხვდება სავარცხელზე.”,
      “THAMRA-ს ადაპტოგენური კომპონენტები ნერვულ სისტემასა და ფოლიკულის ციკლს ერთდროულად მხარს უჭერს.”,
    ],
    “მაღალი”: [
      “გრძელვადიანი სტრესი ჰორმონალურ ბალანსსაც ანარღვევს — ამ ორ ფაქტორს ერთდროული გადაწყვეტა სჭირდება.”,
      “THAMRA-ს ფორმულა სტრესსა და ჰორმონალურ ცვლილებას ერთდროულად მიმართავს — სწორედ შენი სიტუაციისთვის.”,
    ],
  },
  mixed: {
    “დაბალი”: [
      “რამდენიმე ფაქტორი ერთდროულად მოქმედებს — ეს ყველაზე გავრცელებული სიტუაციაა მენოპაუზის პერიოდში.”,
      “THAMRA შეიქმნა ზუსტად ასეთი შემთხვევებისთვის — ერთი ფორმულა, ყველა ძირეული მიზეზი.”,
    ],
    “საშუალო”: [
      “ჰორმონები, კვება და სტრესი ერთდროულად მოქმედებს — ეს ყველაზე გავრცელებული, მაგრამ მართვადი კომბინაციაა.”,
      “THAMRA-ს ფორმულა სწორედ ასეთი მრავალფაქტორული სიტუაციისთვის შეიქმნა.”,
    ],
    “მაღალი”: [
      “ჰორმონალური, კვებითი და სტრეს-ფაქტორები ერთდროულად საჭიროებს ყურადღებას — ეს ის სიტუაციაა, სადაც ერთი ინგრედიენტი ვერ გიშველის.”,
      “THAMRA-ს კომპლექსური ფორმულა სწორედ შენი კომბინირებული პროფილისთვის შეიქმნა.”,
    ],
  },
};

const PROFILE_CTA: Record<Profile, string> = {
  volume:   “THAMRA-ს ფორმულა ჰორმონალური ცვლილებით გამოწვეულ ფოლიკულის შეჭმუხვნას პირდაპირ მიმართავს. შენი ადგილი სიაში დაჯავშნულია — გამოშვებისთანავე შეგატყობინებ.”,
  thinning: “THAMRA-ს კომპლექსი ფოლიკულის კვებასა და ზრდის ციკლის გამოღვიძებაზეა ორიენტირებული. შენი ადგილი სიაში დაჯავშნულია — პირველი გამოშვება მალე.”,
  stress:   “THAMRA-ს ადაპტოგენური კომპლექსი კორტიზოლის დონეს ანაწესებს და ფოლიკულის ციკლს აღადგენს. შენი ადგილი სიაში დაჯავშნულია.”,
  mixed:    “THAMRA შეიქმნა კომბინირებული ფაქტორების სამართავად. შენი ადგილი სიაში დაჯავშნულია — პირველი გამოშვება მალე.”,
};

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
  if (q6 === "პლაზმათერაპია")
    return {
      title: "ამიტომ იყო შედეგი დროებითი.",
      text: "პლაზმათერაპია გარეგნულ ეფექტს ქმნის, მაგრამ ჰორმონალურ და კვებით მიზეზს ვერ აჩერებს.",
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
  answers,
}: {
  name: string;
  answers: PartialAnswers;
}) {
  const profile = calcProfile(answers);
  const stressLevel = calcStressLevel(answers);
  const [sent1, sent2] = PROFILE_SENTENCES[profile][stressLevel];
  const block3 = getBlock3(answers.q6);
  const firstName = name.trim().split(" ")[0];
  const { label, title } = PROFILE_META[profile];
  const stressColor = STRESS_COLORS[stressLevel];

  return (
    <div className={styles.resultWrap}>

      {/* ── Block 1: Profile + stress level ── */}
      <span className={styles.resultLabel}>{label}</span>
      <h2 className={styles.resultHeadline}>
        {firstName ? `${firstName}, ` : ""}{title}
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
        <span style={{
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(247,241,233,0.5)",
          fontFamily: "var(--font-jost, sans-serif)",
        }}>
          თმის სტრესის დონე
        </span>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.06em",
          color: stressColor,
          border: `1px solid ${stressColor}`,
          borderRadius: 20,
          padding: "2px 12px",
          fontFamily: "var(--font-jost, sans-serif)",
        }}>
          {stressLevel}
        </span>
      </div>

      <div className={styles.resultDivider} />

      {/* ── Block 2: Personalized sentences ── */}
      <span className={styles.driversLabel}>რატომ ხდება ეს:</span>
      <div className={styles.driverCards}>
        <div className={styles.driverCard}>
          <p className={styles.driverText}>{sent1}</p>
        </div>
        <div className={styles.driverCard}>
          <p className={styles.driverText}>{sent2}</p>
        </div>
      </div>

      <div className={styles.resultDivider} />

      {/* ── Block 3: Why previous attempts failed ── */}
      <div className={styles.insightCard}>
        <p className={styles.insightTitle}>{block3.title}</p>
        <p className={styles.insightText}>{block3.text}</p>
      </div>

      <div className={styles.resultDivider} />

      {/* ── Block 4: THAMRA CTA ── */}
      <div className={styles.thamraBlock}>
        <span className={styles.thamraBlockLabel}>THAMRA</span>

        <p className={styles.thamraText}>
          {PROFILE_CTA[profile]}
        </p>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 20,
          padding: "14px 18px",
          background: "rgba(201,169,110,0.10)",
          border: "1px solid rgba(201,169,110,0.28)",
          borderRadius: 8,
        }}>
          <span style={{ color: "#C9A96E", fontSize: 16 }}>✓</span>
          <p style={{ margin: 0, fontSize: 13, color: "#C9A96E", fontFamily: "var(--font-jost, sans-serif)", lineHeight: 1.5 }}>
            შენი ადგილი სიაში დაჯავშნულია. THAMRA გამოშვებისთანავე შეგატყობინებ.
          </p>
        </div>

        <a href="/" className={styles.ctaBtn} style={{ marginTop: 16, display: "inline-block", textDecoration: "none" }}>
          THAMRA-ს შესახებ →
        </a>
      </div>

      <p className={styles.footnote}>
        ეს ტესტი საინფორმაციო ხასიათისაა და არ წარმოადგენს სამედიცინო დიაგნოზს.
      </p>

    </div>
  );
}
