import type { Metadata } from "next";
import NanoLanding from "@/components/nano/NanoLanding";
import { getProduct } from "@/lib/products";
import { CATALOG_ID, BUNDLE_3M_ID } from "@/lib/nanoCollagen";

export const metadata: Metadata = {
  title: "THAMRA NANO COLLAGEN HAIR ACTIVE DA-1 — თმის ფორმულა",
  description:
    "გემრიელი კენკრის სასმელი, რომელიც შენს თმას შიგნიდან კვებავს — 8 აქტიური კომპონენტი, ნანო-კოლაგენი და მაქსიმალური შეწოვა. ერთი ჭიქა დღეში.",
};

export default function NanoCollagenPage() {
  // Resolve bundle prices from the catalog so the shown and charged amount match.
  const prices = {
    [CATALOG_ID]: getProduct(CATALOG_ID)?.price ?? null,
    [BUNDLE_3M_ID]: getProduct(BUNDLE_3M_ID)?.price ?? null,
  };
  return <NanoLanding prices={prices} />;
}
