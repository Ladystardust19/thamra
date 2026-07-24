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
      "პერსონალური შეფასების კითხვარი",
      "თმისა და საერთო მდგომარეობის საწყისი შეფასება",
      "ინდივიდუალური 30-დღიანი რეკომენდაციები",
    ],
  },
  {
    id: "signature",
    name: "Thamra Signature",
    duration: "90-დღიანი პროგრამა",
    price: 399,
    equivalent: "საორიენტაციო ეკვივალენტი: ≈133 ₾ თვეში / ≈4.43 ₾ დღეში",
    features: [
      "სამი თვისთვის განკუთვნილი Thamra",
      "პასუხების საფუძველზე შექმნილი პერსონალური შეფასება",
      "90-დღიანი ზრუნვის გზამკვლევი",
      "პროგრესის შეფასება სამი თვის შემდეგ",
    ],
    featured: true,
  },
  {
    id: "longevity",
    name: "Thamra Hair Longevity",
    duration: "ექვსთვიანი სრული პროგრამა",
    price: 749,
    equivalent: "საორიენტაციო ეკვივალენტი: ≈125 ₾ თვეში / ≈4.16 ₾ დღეში",
    features: [
      "ექვსი თვისთვის განკუთვნილი Thamra",
      "სიღრმისეული პერსონალური შეფასება",
      "180-დღიანი ინდივიდუალური გზამკვლევი",
    ],
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
