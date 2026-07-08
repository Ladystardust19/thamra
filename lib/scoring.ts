export type Cause = "hormonal" | "follicle" | "stress" | "nutrient" | "aging";
export type AgeGroup = "menopause" | "perimenopause" | "hormonal_early";

export interface ScoreResult {
  primaryCause: Cause;
  secondaryCause: Cause;
  ageGroup: AgeGroup;
  rawScores: Record<Cause, number>;
}

const TIE_ORDER: Cause[] = ["hormonal", "follicle", "nutrient", "stress", "aging"];

export function scoreQuiz(answers: {
  q1?: string;
  q2?: string;
  q3?: string[];
  q_stress?: string;
  q4?: string[];
  q5?: string;
}): ScoreResult {
  const s: Record<Cause, number> = { hormonal: 0, follicle: 0, stress: 0, nutrient: 0, aging: 0 };

  // Q1 — age
  switch (answers.q1) {
    case "40-მდე": s.hormonal += 2; break;
    case "40–45":  s.hormonal += 2; s.follicle += 1; break;
    case "46–52":  s.hormonal += 2; s.follicle += 2; break;
    case "53–60":  s.aging += 2; s.hormonal += 1; break;
    case "60+":    s.aging += 3; s.nutrient += 1; break;
  }

  // Q2 — when noticed
  switch (answers.q2) {
    case "6–12 თვის წინ":         s.nutrient += 1; break;
    case "1–3 წლის წინ":          s.nutrient += 2; break;
    case "3 წელზე მეტი ხნის წინ": s.nutrient += 3; s.aging += 1; break;
  }

  // Q3 — symptoms (multi-select)
  for (const opt of answers.q3 ?? []) {
    switch (opt) {
      case "გაყოფის ხაზი გაფართოვდა":        s.follicle += 3; break;
      case "ცხიმიანი სკალპი":                 s.follicle += 1; break;
      case "მშრალი სკალპი":                   s.aging += 2; break;
      case "მეტი თმა რჩება სავარცხელზე":      s.stress += 2; s.hormonal += 1; break;
      case "თხემზე სკალპი მოჩანს":            s.follicle += 3; break;
      case "თმა ტყდება და დაკარგა ბზინვარება": s.nutrient += 3; break;
    }
  }

  // Q_stress — stress level (new question)
  switch (answers.q_stress) {
    case "ზომიერი":       s.stress += 1; break;
    case "მაღალი":        s.stress += 2; break;
    case "ძალიან მაღალი": s.stress += 3; break;
  }

  // Q4 — what else noticed (multi-select)
  for (const opt of answers.q4 ?? []) {
    switch (opt) {
      case "ციკლი არარეგულარული გახდა ან შეწყდა":  s.hormonal += 3; break;
      case "სიცხის შემოტევები ან ღამის ოფლიანობა":  s.hormonal += 2; break;
      case "მეტი სტრესი ან შფოთვა":                 s.stress += 2; break;
      case "წონის ცვლილება":                         s.hormonal += 1; break;
    }
  }

  // Q5 — sleep
  switch (answers.q5) {
    case "ხშირად ვიღვიძებ ღამით":     s.stress += 1; break;
    case "მიჭირს დაძინება":            s.stress += 2; break;
    case "ღამის ოფლიანობა მაღვიძებს": s.hormonal += 1; s.stress += 1; break;
  }

  // Age group from Q1
  let ageGroup: AgeGroup = "hormonal_early";
  if (answers.q1 === "46–52" || answers.q1 === "53–60" || answers.q1 === "60+") {
    ageGroup = "menopause";
  } else if (answers.q1 === "40–45") {
    ageGroup = "perimenopause";
  }

  // Rank by score; tie-break by TIE_ORDER
  const ranked = (Object.keys(s) as Cause[]).sort((a, b) =>
    s[b] !== s[a] ? s[b] - s[a] : TIE_ORDER.indexOf(a) - TIE_ORDER.indexOf(b)
  );

  return { primaryCause: ranked[0], secondaryCause: ranked[1], ageGroup, rawScores: s };
}
