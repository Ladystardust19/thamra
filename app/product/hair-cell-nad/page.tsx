import type { Metadata } from "next";
import NadHero from "@/components/nad/NadHero";
import NadTimeline from "@/components/nad/NadTimeline";
import NadMatrix from "@/components/nad/NadMatrix";
import NadIntegrity from "@/components/nad/NadIntegrity";
import { getProduct } from "@/lib/products";
import { CATALOG_ID, NAD } from "@/lib/hairCellNad";

export const metadata: Metadata = {
  title: NAD.name,
  description: NAD.subhead,
};

export default function HairCellNadPage() {
  // Purchase stays off until the product (with its price) is in the catalog.
  const product = getProduct(CATALOG_ID);
  const checkoutHref = product ? `/checkout?plan=${CATALOG_ID}` : null;
  return (
    // Bottom padding keeps the sticky bar from covering the last content.
    <main className="w-full pt-[72px] pb-[calc(64px+env(safe-area-inset-bottom,0px))]">
      <NadHero checkoutHref={checkoutHref} price={product?.price ?? null} />
      <NadTimeline />
      <NadMatrix />
      <NadIntegrity />
    </main>
  );
}
