// THAMRA formula — 14 ingredients across 5 aspects of menopause-related hair change.
// Georgian copy is user-approved (2026-08-10). The section shows 7 FEATURED cards;
// the full 14-ingredient list lives in the drawer, grouped by the 5 aspects.

export type Ingredient = {
  /** Ingredient name shown as card / row title (Georgian). */
  name: string;
  /** Plain-language explanation for the woman reading (verbatim approved copy). */
  description: string;
  /** Marks an ingredient with direct human clinical data (Tocotrienols). */
  clinical?: boolean;
  /** Card/row photo under /public/ingredients. Optional — items without one show a
   *  neutral placeholder (Saw Palmetto / Maca await imagery). */
  image?: string;
  /** Featured on the main section's selector cards (7 of the 14). All 14 still
   *  appear in the full-formula drawer. */
  featured?: boolean;
};

export type FormulaGroup = {
  id: string;
  /** Short header for the drawer group. */
  title: string;
  /** Aspect intro shown as a subtitle in the drawer. */
  intro: string;
  ingredients: Ingredient[];
};

export const FORMULA_INTRO = {
  heading: "14 ინგრედიენტი მენოპაუზასთან დაკავშირებული თმის ცვენის 5 მიზეზისთვის",
} as const;

export const CLINICAL_BADGE = "კლინიკურად შესწავლილი";

// The 5 aspects, in presentation order. Ingredients carry the approved Georgian
// copy verbatim; `featured` marks the 7 shown on the main section cards.
export const FORMULA_GROUPS: FormulaGroup[] = [
  {
    id: "hormonal",
    title: "ფოლიკულის ჰორმონალური დაცვა",
    intro:
      "მენოპაუზის დროს შეცვლილი ჰორმონალური გარემო ზოგიერთ ფოლიკულს უფრო მგრძნობიარეს ხდის.",
    ingredients: [
      {
        name: "ჯუჯა პალმა (სო პალმეტო)",
        description:
          "მენოპაუზის დროს, თმისთვის მუშაობს როგორც ბუნებრივი „ფარი“, რომელიც ბლოკავს თმის ცვენის მთავარ ჰორმონს და განაპირობებს სავსე თმის ზრდას.",
        image: "/ingredients/saw-palmetto.webp",
        featured: true,
      },
      {
        name: "მაკა",
        description:
          "სხეულს ეხმარება მენოპაუზასთან ადაპტაციაში ჰორმონების დასტაბილურებით. ასევე აწვდის თმას, თმისთვის ყველაზე საჭირო ამინომჟავებს, მინერალებს და ვიტამინებს, რომლებიც აძლიერებენ თმის ღერებს.",
        image: "/ingredients/maca.webp",
        featured: true,
      },
    ],
  },
  {
    id: "structure",
    title: "ძლიერი ღერის სტრუქტურა",
    intro:
      "თმის სიმკვრივე დამოკიდებულია არა მხოლოდ ფოლიკულზე, არამედ იმ სამშენებლო მასალებზეც, საიდანაც თავად თმის ღერი იქმნება.",
    ingredients: [
      {
        name: "ზღვის პეპტიდების კომპლექსი",
        description:
          "ველური ორაგულის კოლაგენი ამცირებს მენოპაუზურ თმის ცვენას და აცოცხლებს მიძინებულ თმის ფოლიკულის უჯრედებს. აძლიერებს თმის ძირებს და თმას ხდის უფრო ბზინვარეს.",
        image: "/ingredients/marine-collagen.webp",
        featured: true,
      },
      {
        name: "ვიტამინი C",
        description:
          "ეხმარება სხეულს თმის ზრდაში, ყველა საჭირო ნუტრიენტის ათვისებით და იცავს თმის ღერებს დაბერებისგან.",
        image: "/ingredients/vitamin-c.webp",
      },
      {
        name: "L-ცისტეინი",
        description: "აშენებს კერატინს, რომელიც თმას ხდის უფრო ძლიერს.",
        image: "/ingredients/l-cysteine.webp",
      },
    ],
  },
  {
    id: "stress-sleep",
    title: "სტრესი და ძილი",
    intro:
      "მენოპაუზის პერიოდში ბევრ ქალს აწუხებს სტრესი, ძილის დარღვევა და გადაღლა, რაც შეიძლება აისახოს საერთო კეთილდღეობასა და თმის ჯანმრთელობაზე.",
    ingredients: [
      {
        name: "მაგნეზიუმ ბისგლიცინატი",
        description:
          "ეხმარება ქალის ორგანიზმს სტრესის ჰორმონის შემცირებაში და აუმჯობესებს ღრმა ძილის ფაზას, რომელიც აუცილებელია თმის ძირების გაჯანსაღებისთვის. მონაწილეობს თმის ღერების ზრდაში სკალპის სისხლის მიმოქცევის გაძლიერებით, რომელიც მენოპაუზის დროს მცირდება.",
        image: "/ingredients/magnesium-bisglycinate.webp",
      },
      {
        name: "L-თიანინი",
        description:
          "ამცირებს ანთებას სხეულში და ეხმარება სხეულს ღრმა მოსვენებაში, რომელიც აუცილებელია დასტრესილი თმისთვის.",
        image: "/ingredients/l-theanine.webp",
      },
      {
        name: "ზაფრანას ექსტრაქტი",
        description:
          "აუმჯობესებს განწყობასა და ემოციურ კეთილდღეობას, რომელიც მენოპაუზამ გააუარესა. არის ძლიერი ანტიოქსიდანტი, რომელიც იცავს თმის ფოლიკულებს უჯრედული დაბერებისგან.",
        image: "/ingredients/saffron.webp",
      },
    ],
  },
  {
    id: "environment",
    title: "ფოლიკულის გარემოს დაცვა",
    intro: "ჯანსაღი თმა იწყება იმ გარემოდან, რომელშიც ფოლიკული ფუნქციონირებს.",
    ingredients: [
      {
        name: "ტოკოტრიენოლის კომპლექსი",
        description:
          "ვიტამინი E-ს სუპერ-ძლიერი ფორმა. კლინიკურად დამტკიცებულია, რომ თმის რაოდენობას ზრდის საშუალოდ 34.5%-ით. იცავს თმის ძირებს დაზიანებისგან, ანელებს გაჭაღარავების პროცესს.",
        clinical: true,
        image: "/ingredients/tocotrienols.webp",
        featured: true,
      },
      {
        name: "თერაკურმინი",
        description:
          "კურკუმინის 27-ჯერ უფრო უკეთ შეწოვადი ფორმა. აუმჯობესებს სისხლის მიმოქცევას სკალპში და ამცირებს ანთებით პროცესებს, რაც ხელს უწყობს ჯანსაღი და ძლიერი თმის ზრდას.",
        image: "/ingredients/theracurmin.webp",
        featured: true,
      },
      {
        name: "ასტაქსანტინი",
        description:
          "იცავს თმას დაზიანებისგან, რომელსაც იწვევს მენოპაუზისგან გამოწვეული ჰორმონების მკვეთრი ცვალებადობა.",
        image: "/ingredients/astaxanthin.webp",
      },
      {
        name: "შვიტას ექსტრაქტი",
        description: "მდიდარია პოლიფენოლებით, რომელიც აჩქარებს თმის ზრდას.",
        image: "/ingredients/horsetail.webp",
      },
    ],
  },
  {
    id: "hydration",
    title: "ჰიდრატაცია და ქსოვილები",
    intro:
      "ასაკთან ერთად იცვლება კანის, შემაერთებელი ქსოვილებისა და ჰიდრატაციის ბუნებრივი ბალანსი, რომლებიც ფოლიკულის გარშემო გარემოს ქმნიან.",
    ingredients: [
      {
        name: "ჰიალურონი",
        description:
          "ღრმად ატენიანებს გამომშრალ სკალპს. იცავს თმას მტვრევისგან და უნარჩუნებს უფრო სქელ, ჯანსაღ იერს.",
        image: "/ingredients/hyaluronic-acid.webp",
        featured: true,
      },
      {
        name: "ფუკოიდანი",
        description:
          "ოკინავას (იაპონია) მოზუკუს წყალმცენარისგან მიღებული ბუნებრივი შაქარი, რომელიც გამოიყენება კანისა და ქსოვილების გაჯანსაღების მიმართულებით. ასტაბილურებს ჰორმონალურ თმის ცვენას და ასტიმულირებს თმის ზრდას.",
        image: "/ingredients/fucoidan.webp",
        featured: true,
      },
    ],
  },
];

// ─── Derived views ──────────────────────────────────────────────────────────

const ALL_INGREDIENTS: Ingredient[] = FORMULA_GROUPS.flatMap((g) => g.ingredients);

/** The 7 cards shown on the main section, in the user's specified card order. */
const FEATURED_ORDER = [
  "ჯუჯა პალმა (სო პალმეტო)",
  "მაკა",
  "ზღვის პეპტიდების კომპლექსი",
  "ჰიალურონი",
  "ფუკოიდანი",
  "ტოკოტრიენოლის კომპლექსი",
  "თერაკურმინი",
];

export const PRINCIPAL_INGREDIENTS: Ingredient[] = FEATURED_ORDER.map(
  (n) => ALL_INGREDIENTS.find((i) => i.name === n)!,
);

/** Drawer groups: all 5 aspects, every ingredient. */
export const DRAWER_GROUPS = FORMULA_GROUPS;

export const DRAWER_TITLE = "რა შედის THAMRA-ს ფორმულაში";
export const FULL_LIST_CTA = "სრული შემადგენლობის ნახვა";
