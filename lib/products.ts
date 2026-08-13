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
  // A non-physical product (e.g. a consultation): no delivery address is
  // collected at checkout, and it is not listed on the /programs page.
  service?: boolean;
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
  {
    id: "consultation",
    name: "Thamra კონსულტაცია",
    duration: "ინდივიდუალური თმის კონსულტაცია",
    price: 150,
    service: true,
    features: [
      "ინდივიდუალური კონსულტაცია Thamra-ს ექსპერტთან",
      "გადახდის შემდეგ დაგიკავშირდებით ტელეფონით ან WhatsApp-ით დროის შესათანხმებლად",
    ],
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
