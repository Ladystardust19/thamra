// Single source of truth for the THAMRA programs (catalog + prices).
// Prices are integers in GEL and represent the full payable amount.

export interface Product {
  id: string;
  name: string;
  duration: string;
  price: number;
  equivalent?: string;
  features: string[];
  featured?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "foundation",
    name: "Thamra Foundation",
    duration: "ერთთვიანი პროგრამა",
    price: 149,
    features: [
      "ერთი თვისთვის განკუთვნილი Thamra",
    ],
  },
  {
    id: "signature",
    name: "Thamra Signature",
    duration: "90-დღიანი პროგრამა",
    price: 399,
    equivalent: "საორიენტაციო ეკვივალენტი: ≈133 ₾ თვეში / ≈4.43 ₾ დღეში",
    features: [],
    featured: true,
  },
  {
    id: "longevity",
    name: "Thamra Hair Longevity",
    duration: "ექვსთვიანი სრული პროგრამა",
    price: 749,
    equivalent: "საორიენტაციო ეკვივალენტი: ≈125 ₾ თვეში / ≈4.16 ₾ დღეში",
    features: [],
  },
];

// TEMPORARY hidden test product for verifying the full order → BOG payment →
// confirmation-email loop while BOG's 100 GEL test cap is still in place.
// Deliberately NOT in PRODUCTS, so it never appears on /programs or the default
// checkout dropdown. Reachable only via /checkout?plan=test. REMOVE after test.
export const TEST_PRODUCT: Product = {
  id: "test",
  name: "Thamra სატესტო (1 ₾)",
  duration: "სატესტო შეკვეთა",
  price: 1,
  features: [],
};

export function getProduct(id: string): Product | undefined {
  if (id === TEST_PRODUCT.id) return TEST_PRODUCT;
  return PRODUCTS.find((p) => p.id === id);
}
