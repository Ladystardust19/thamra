// THAMRA HAIR CELL NAD+ product page content. Georgian copy is supplied
// verbatim by the brand — do not rewrite.
//
// Purchasing is enabled only once a catalog entry with id CATALOG_ID exists in
// lib/products.ts (price is not defined yet). Until then the CTAs render
// disabled rather than sending people to checkout with the wrong product.

export const CATALOG_ID = "hair-cell-nad";

export const NAD = {
  name: "THAMRA HAIR CELL NAD+",
  subhead: "თმის ანტი-ასაკობრივი უჯრედული აქტივატორი.",
  micro:
    "სისტემური მიდგომა, რომელიც უარყოფს ზედაპირულ გადაწყვეტილებებს. ერთიანი, კომპლექსური ფორმულა ფოლიკულების ახალგაზრდული ენერგიის, თმის სტრუქტურული მთლიანობისა და სიცოცხლისუნარიანობის აღსადგენად.",
  stickyCta: "დაამატე კალათაში",
};

export const PURCHASE_OPTIONS = [
  { id: "routine", label: "ყოველთვიური ბიო-სისტემა" },
  { id: "once", label: "ერთჯერადი შეძენა" },
] as const;

export type PurchaseOptionId = (typeof PURCHASE_OPTIONS)[number]["id"];

export const TIMELINE = {
  heading: "ბიოლოგიური დროის მართვა",
  body: "ჩვენ არ ვმალავთ სიმპტომებს. THAMRA HAIR CELL NAD+ მიზანმიმართულად მუშაობს უშუალოდ თმის დაბერების მთავარ წყაროსთან. ფოლიკულური ენერგიის მოლეკულური აღდგენით ფორმულა აბრუნებს თმის ბუნებრივ სიმკვრივეს, ელასტიურობასა და რეალურ, ხაზგასმულ სისავსეს.",
};

export const MATRIX = [
  {
    title: "უჯრედული ენერგია",
    items: [
      { name: "NAD+", desc: "მუხტავს მიკროსკოპულ ფოლიკულებს ენერგიით." },
      { name: "ვიტამინი D3", desc: "ხელს უწყობს ახალი ფოლიკულების ფორმირებას." },
    ],
  },
  {
    title: "სტრუქტურული არქიტექტურა",
    items: [
      { name: "ნანო კოლაგენი (Nano Collagen)", desc: "მომენტალურად აღწევს სტრუქტურაში თმის სისავსისთვის." },
      { name: "ჰიდროლიზებული კერატინი (Hydrolyzed Keratin)", desc: "აღადგენს დაზიანებულ ბოჭკოებს შიგნიდან." },
      { name: "ბიოტინი & თუთია", desc: "პირდაპირ ააქტიურებენ თმის ბუნებრივ ზრდას." },
      { name: "ჰიალურონის მჟავა", desc: "უზრუნველყოფს თავის კანის ღრმა ჰიდრატაციას." },
    ],
  },
  {
    title: "უჯრედული დაცვა",
    items: [
      { name: "L-თეანინი (L-Theanine)", desc: "მიზანმიმართულად იცავს თმის ძირებს ყოველდღიური სტრესისგან." },
      { name: "ვიტამინი C", desc: "კოლაგენის ათვისების აუცილებელი კოფაქტორია." },
      { name: "ვიტამინი B5", desc: "კვებავს და აძლიერებს თმის ბოლქვს." },
    ],
  },
];

export const INTEGRITY = {
  body: "თმის სრული ტრანსფორმაცია უჯრედული დონიდან იწყება. THAMRA HAIR CELL NAD+-ის ერთი პაკეტი მყისიერად ქმნის სუფთა, თხევად ბიო-სისტემას, რომელიც შენი დღის ფუნდამენტურ რიტუალად იქცევა.",
  slogan: "THAMRA HAIR CELL NAD+. შენი თმის ევოლუცია.",
  sub: "სუფთა ბიოლოგიური მთლიანობა — უშუალოდ ფოლიკულებისკენ მიმართული ფორმულა, თავისუფალი ხელოვნური საღებავებისა და ზედმეტი დანამატებისგან.",
};
