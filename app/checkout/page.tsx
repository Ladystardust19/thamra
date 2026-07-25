import type { Metadata } from "next";
import { PRODUCTS, getProduct } from "@/lib/products";
import CheckoutForm from "./CheckoutForm";

export const metadata: Metadata = {
  title: "შეკვეთა | Thamra",
  description: "დაასრულე შენი Thamra პროგრამის შეკვეთა.",
};

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const initial = getProduct(searchParams.plan ?? "") ?? PRODUCTS[1];
  return <CheckoutForm products={PRODUCTS} initialPlanId={initial.id} />;
}
