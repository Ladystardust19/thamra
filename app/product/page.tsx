import type { Metadata } from "next";
import ProductPageClient from "./ProductPageClient";

export const metadata: Metadata = {
  title: "THAMRA VENICE HAIR ELIXIR",
  description:
    "14 კლინიკურად შესწავლილი ინგრედიენტი. ერთი კოვზი დღეში. თმის ფორმულა მენოპაუზის პერიოდის ქალებისთვის.",
};

export default function ProductPage() {
  return <ProductPageClient />;
}
