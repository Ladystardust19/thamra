import type { Metadata } from "next";
import ConsultationRequestClient from "./ConsultationRequestClient";

export const metadata: Metadata = {
  title: "ინდივიდუალური კონსულტაცია | Thamra",
  description:
    "დატოვე სახელი და ტელეფონის ნომერი და თამრას თმის ექსპერტი დაგიკავშირდება ინდივიდუალური კონსულტაციისთვის (150 ₾).",
};

export default function ConsultationRequestPage() {
  return <ConsultationRequestClient />;
}
