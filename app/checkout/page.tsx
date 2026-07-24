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
  // Include the initial product in the selector even if it's not a public
  // program (e.g. the temporary "test" product reached via ?plan=test).
  const selectable = PRODUCTS.some((p) => p.id === initial.id)
    ? PRODUCTS
    : [initial, ...PRODUCTS];
  return <CheckoutForm products={selectable} initialPlanId={initial.id} />;
}
