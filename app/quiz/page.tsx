import type { Metadata } from "next";
import QuizClient from "@/components/quiz/QuizClient";

export const metadata: Metadata = {
  title: "თმის ანალიზი | THAMRA",
  description: "8 კითხვა, 2 წუთი. მიიღე შენი პერსონალური თმის ანალიზი.",
};

export default function QuizPage() {
  return <QuizClient />;
}
