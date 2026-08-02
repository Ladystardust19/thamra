import type { Metadata } from "next";
import ConsultationClient from "./ConsultationClient";

export const metadata: Metadata = {
  title: "ინდივიდუალური კონსულტაცია — Thamra",
  description: "დაჯავშნე ინდივიდუალური კონსულტაცია Thamra-ს თმის ექსპერტთან.",
  robots: { index: false, follow: false },
};

export default function ConsultationPage() {
  return <ConsultationClient />;
}
