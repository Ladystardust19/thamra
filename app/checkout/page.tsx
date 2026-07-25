import type { Metadata } from "next";
import { PRODUCTS, TEST_PRODUCT, getProduct } from "@/lib/products";
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
  // Only surface the hidden test product in the dropdown/summary when the user
  // arrived via ?plan=test — normal visitors never see it.
  const products =
    initial.id === TEST_PRODUCT.id ? [...PRODUCTS, TEST_PRODUCT] : PRODUCTS;
  return <CheckoutForm products={products} initialPlanId={initial.id} />;
}
