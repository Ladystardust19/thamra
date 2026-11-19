// THAMRA — NANO COLLAGEN HAIR ACTIVE DA-1 landing-page content.
// Georgian copy is supplied verbatim by the brand — do not rewrite.
//
// Prices come from lib/products.ts (getProduct). The 1-month bundle maps to the
// existing "nano-collagen" catalog entry (90 ₾). The 3-month bundle maps to the
// hidden "nano-collagen-3m" entry — its price is a PLACEHOLDER pending the brand's
// confirmed discounted price; update it in lib/products.ts before launch.

export const CATALOG_ID = "nano-collagen";
export const BUNDLE_3M_ID = "nano-collagen-3m";

// ---------------------------------------------------------------- 1. Hero
export const HERO = {
  eyebrow: "სილამაზის ყოველდღიური რიტუალი",
  title: "THAMRA — NANO COLLAGEN HAIR ACTIVE DA-1",
  subhead:
    "გემრიელი კენკრის სასმელი, რომელიც შენს თმას შიგნიდან კვებავს და უფრო სავსეს, ძლიერსა და ბზინვარეს ხდის.",
  benefits: [
    {
      icon: "absorption",
      title: "მაქსიმალური შეწოვა",
      text: "მიკროსკოპული ნაწილაკები სწრაფად აღწევს თმის ძირებამდე.",
    },
    {
      icon: "nutrition",
      title: "სრულფასოვანი კვება",
      text: "9 აქტიური კომპონენტი თმის სიჯანსაღისთვის.",
    },
    {
      icon: "taste",
      title: "სასიამოვნო გემო",
      text: "არანაირი აბები — მხოლოდ ერთი ჭიქა გემრიელი სასმელი.",
    },
  ],
  cta: "შეუკვეთე ახლავე",
  note: {
    label: "ლიმიტირებული გამოშვება",
    text: "პერსონალური, უფასო მიტანა მთელ საქართველოში",
  },
} as const;

// Purchase bundles. `id` is the checkout plan id; price/duration resolve from
// the catalog so the displayed number and the charged amount never drift.
export const BUNDLES = [
  {
    id: CATALOG_ID,
    badge: null as string | null,
    title: "1 თვის მარაგი",
    servings: "30 პორცია",
    note: "იდეალურია დასაწყებად",
  },
  {
    id: BUNDLE_3M_ID,
    badge: "ყველაზე პოპულარული" as string | null,
    title: "3 თვის სრული კურსი",
    servings: "90 პორცია",
    note: "მაქსიმალური შედეგისთვის + სპეციალური ფასდაკლება",
  },
];

// ------------------------------------------------- 4. Product comparison
export const COMPARE = {
  title: "რით გამოირჩევა THAMRA?",
  featureHeading: "რას იღებს შენი თმა",
  columns: [
    { id: "thamra", label: "THAMRA DA-1", featured: true },
    { id: "vitamins", label: "სტანდარტული ვიტამინები", featured: false },
    { id: "topicals", label: "გარეგანი საშუალებები", featured: false },
  ],
  rows: [
    {
      feature: "მყარი შედეგი შეწყვეტის შემდეგაც",
      includes: { thamra: true, vitamins: false, topicals: false },
    },
    {
      feature: "მიკროსკოპული ნანო-შეწოვა",
      includes: { thamra: true, vitamins: false, topicals: false },
    },
    {
      feature: "სტრესის გავლენის შემცირება",
      includes: { thamra: true, vitamins: false, topicals: true },
    },
    {
      feature: "უსაფრთხოება (არასასურველი თმის გარეშე)",
      includes: { thamra: true, vitamins: true, topicals: false },
    },
    {
      feature: "9 აქტიური კომპონენტის სინერგია ერთ კოვზში",
      includes: { thamra: true, vitamins: false, topicals: false },
    },
    {
      feature: "თმის ძირების ყოველდღიური კვება",
      includes: { thamra: true, vitamins: true, topicals: true },
    },
    {
      feature: "1-წუთიანი გემრიელი დილის რიტუალი",
      includes: { thamra: true, vitamins: false, topicals: false },
    },
  ],
} as const;

// --------------------------------------------- 2. What's in each spoonful
export const INGREDIENTS = {
  title: ["თმის აღმდგენი", "9-ელემენტიანი", "კოდი"] as const,
  subhead:
    "9 აქტიური კომპონენტი, რომლებიც ერთმანეთს აძლიერებენ — თითოეული მათგანი პასუხისმგებელია თმის სიმტკიცეზე, სიხშირესა და ბზინვარებაზე.",
  overview: "/nano-collagen/formula/formula-berry-powder.webp",
  chooseBundle: "შეარჩიე შენი კურსი",
  items: [
    {
      image: "/nano-collagen/formula/nano-collagen.webp",
      name: "ნანო-კოლაგენი",
      text: "ანიჭებს თმის ღერს სიმკვრივეს, ახალი თმის ზრდის აქტივატორი",
    },
    {
      image: "/nano-collagen/formula/hydrolyzed-keratin.webp",
      name: "ჰიდროლიზებული კერატინი",
      text: "ავსებს და აღადგენს თმის ბუნებრივ სტრუქტურას, ხდის მას გლუვს.",
    },
    {
      image: "/nano-collagen/formula/biotin.webp",
      name: "D-ბიოტინი",
      text: "ეხმარება თმას ჯანსაღ ზრდაში და ანიჭებს ბუნებრივ ბზინვარებას.",
    },
    {
      image: null,
      symbol: "Zn",
      name: "თუთია (Zinc Picolinate)",
      text: "ამაგრებს თმის ძირებს და იცავს თმას გარემო ფაქტორებისგან.",
    },
    {
      image: "/nano-collagen/formula/l-theanine.webp",
      name: "L-თიანინი",
      text: "გეხმარება სიმშვიდის შენარჩუნებაში და იცავს თმას სტრესისგან გამოწვეული ცვენისგან.",
    },
    {
      image: "/nano-collagen/formula/vitamin-c.webp",
      name: "ვიტამინი C",
      text: "ეხმარება ორგანიზმს ნანო-კოლაგენის სრულად ათვისებაში და მატებს თმას სიცოცხლეს.",
    },
    {
      image: "/nano-collagen/formula/vitamin-d3.webp",
      name: "ვიტამინი D3",
      text: "კვებავს თმის ბოლქვებს, აძლიერებს თმის ძირებს და ხელს უწყობს ახალი თმის ზრდას.",
    },
    {
      image: "/nano-collagen/formula/hyaluronic-acid.webp",
      name: "ჰიალურონის მჟავა",
      text: "ღრმად ატენიანებს თავის კანსა და თმის ღერს, აქრობს სიმშრალეს.",
    },
    {
      image: "/nano-collagen/formula/vitamin-b5.webp",
      name: "ვიტამინი B5",
      text: "თმას ხდის უფრო რბილს, დამყოლს და მატებს ბუნებრივ მოცულობას.",
    },
  ],
};

// ---------------------------------------------- 3. Results timeline (90 days)
export const TIMELINE = {
  title: "რას იგრძნობ და დაინახავ 90 დღის განმავლობაში?",
  descriptions: [
    "თავის კანი ხდება უფრო დატენიანებული, თმა კი ბევრად რბილია შეხებისას. სავარცხელზე სულ უფრო ნაკლებ თმას ამჩნევ.",
    "თმის ძირები ძლიერდება. თმას უბრუნდება ბუნებრივი ბზინვარება და ჯანსაღი იერი.",
    "სარკეში ხედავ შესამჩნევად უფრო სავსე, ხშირ და ცოცხალ თმას, რომელიც მარტივად იღებს სასურველ ფორმას.",
  ],
};

// ----------------------------------------------------- 5. How to use (ritual)
export const RITUAL = {
  title: "მხოლოდ 1 წუთი დღეში სრულყოფილი თმისთვის",
  images: [
    {
      src: "/nano-collagen/ritual-berry-powder.webp",
      alt: "წითელი ფხვნილი თასსა და ხის კოვზში, ჟოლოსა და მაყვალთან ერთად",
    },
    {
      src: "/nano-collagen/ritual-stirring-berry-drink.webp",
      alt: "ჭიქაში კენკრის სასმელს ხის ჩხირით ურევენ",
    },
  ],
  steps: [
    {
      n: "01",
      title: "შეაერთე",
      text: "ერთი საზომი კოვზი NANO COLLAGEN HAIR ACTIVE გახსენი 200 მლ ოთახის ტემპერატურის წყალში.",
    },
    {
      n: "02",
      title: "გააცოცხლე",
      text: "მსუბუქად მოურიე და მიეცი რამდენიმე წამი, სანამ ფხვნილი სრულად არ შეერწყმება წყალს.",
    },
    {
      n: "03",
      title: "რიტუალი",
      text: "მიირთვი ყოველ დღე და დატკბი შენს თმაზე ზრუნვით.",
    },
  ],
};

// ------------------------------------------------ 6. Expert perspectives
export const EXPERTS = {
  title: "ექსპერტების სიტყვა",
  productName: "NANO COLLAGEN HAIR ACTIVE DA-1",
  items: [
    {
      name: "Andries Van Riezen",
      role: "Biochemist · Nutraceutical Formulation Expert · Acenzia Bio-Science R&D (Ontario, Canada)",
      quote: {
        beforeProduct: "",
        afterProduct:
          "-ის მთავარი ძალა მის სწრაფ შეწოვასა და 9 კომპონენტის ზუსტ ბალანსშია. ნანო-კოლაგენი და აქტიური ვიტამინები პირდაპირ აღწევს თმის ძირებამდე, შესამჩნევად ამცირებს თმის ცვენას, ამკვრივებს თმის ღერს და ააქტიურებს ახალი, ძლიერი თმის ზრდას.",
      },
      image: "/andries-van-riezen.webp",
      imagePosition: "50% 22%",
    },
    {
      name: "Lasha Jakeli",
      role: "MD · Neurologist · Stress Physiology Expert · პლატფორმა „Mindor“-ის დამფუძნებელი",
      quote: {
        beforeProduct: "ყოველდღიური სტრესი და გადაღლა თმის ცვენისა და გათხელების ერთ-ერთი მთავარი მიზეზია. ",
        afterProduct:
          "-ში შემავალი L-თიანინი და მკვებავი კომპლექსი ეხმარება ორგანიზმს სიმშვიდის შენარჩუნებაში, რაც აჩერებს სტრესით გამოწვეულ თმის ცვენას და თმას ბუნებრივ სიხშირეს უბრუნებს.",
      },
      image: "/lasha-jakeli.webp",
      imagePosition: "50% 37%",
    },
    {
      name: "Maia Sidamonishvili",
      role: "MD · Founder · Gynecologist · THAMRA-ს მთავარი მრჩეველი",
      quote: {
        beforeProduct: "ქალებისთვის თმის გათხელება და ცვენა ძალიან მტკივნეული თემაა. ",
        afterProduct:
          " შევქმენით იმისთვის, რომ ქალებმა სარკეში კვლავ დაინახონ ხშირი, სავსე და ბზინვარე თმა. ეს ფორმულა შიგნიდან აძლიერებს თმის ძირებს, ამცირებს თმის ცვენას და ხელს უწყობს ახალი თმის ამოსვლას.",
      },
      image: "/maia-sidamonishvili-jakeli.webp",
      imagePosition: "50% 17%",
    },
    {
      name: "Tomoyuki Amano",
      role: "PhD Neuroscientist · Biomedical Researcher · Georgia Institute of Technology, USA",
      quote: {
        beforeProduct: "თანამედროვე ბიომედიცინის მიდგომებზე დაყრდნობით, ",
        afterProduct:
          " ერთდროულად რამდენიმე მიმართულებით მოქმედებს: აჩერებს თმის ცვენას, ატენიანებს თავის კანს და ააქტიურებს ახალი თმის ზრდის პროცესს, რის შედეგადაც თმა ბევრად უფრო ხშირი და მოცულობითი ხდება.",
      },
      image: "/tomoyuki-amano.webp",
      imagePosition: "50% 22%",
    },
  ],
};

// --------------------------------------------------------------- 7. FAQ
type FaqText = string | { emphasis: "strong" | "em"; text: string };

export const FAQ = {
  title: "ხშირად დასმული კითხვები",
  items: [
    {
      question: "განსხვავება THAMRA-სა და ჩვეულებრივ კოლაგენს შორის და რატომ იძლევა THAMRA უფრო სწრაფ შედეგს?",
      paragraphs: [
        ["ჩვეულებრივი კოლაგენის ნაწილაკები დიდია და ორგანიზმს უჭირს მათი სრულად გადამუშავება, რის გამოც სასარგებლო ნივთიერებები თმის ძირებამდე სრულად ვერ აღწევს."],
        [
          { emphasis: "strong", text: "THAMRA" },
          "-ში გამოყენებული ნანო-კოლაგენი მიკროსკოპულ ზომამდეა დაშლილი, რის გამოც ორგანიზმი მას მომენტალურად ითვისებს. ამას ემატება 8 აქტიური ვიტამინისა და მინერალის სინერგია, რომელიც პირდაპირ თმის ბოლქვის კვებაზე მუშაობს.",
        ],
      ],
    },
    {
      question: "როდის დავინახავ პირველ რეალურ შედეგს თმაზე?",
      paragraphs: [
        ["პირველ სასიამოვნო ცვლილებებს — თმის სირბილეს, ელასტიურობასა და ბუნებრივ ბზინვარებას — ქალების უმეტესობა პირველივე თვის (30 დღის) ბოლოს ამჩნევს, სავარცხელზე კი სულ უფრო ნაკლები თმა რჩება."],
        ["იმისათვის, რომ თმის ძირები ბოლომდე გაძლიერდეს და ახალი თმის ზრდის პროცესი მყარად დაფიქსირდეს, რეკომენდებულია 3-თვიანი სრული კურსის გავლა."],
      ],
    },
    {
      question: "როგორი გემო აქვს სასმელს? დალევა ხომ არ გამიჭირდება?",
      paragraphs: [
        [
          "სრულიად არა — სწორედ სასიამოვნო გემოა მიზეზი, რის გამოც ",
          { emphasis: "strong", text: "THAMRA" },
          " ქალების საყვარელ დილის რიტუალად იქცა. მას არ აქვს არანაირი უსიამოვნო სუნი ან გემო.",
        ],
        ["გრილ წყალში გახსნისას იღებ მსუბუქ, გამაგრილებელ კენკრის ელექსირს, რომლის დალევაც ყოველ დილით სიამოვნებას მოგანიჭებს."],
      ],
    },
    {
      question: "წონაში ხომ არ მომამატებინებს ან სხეულის სხვა ნაწილებზე თმას ხომ არ ამომიყვანს?",
      paragraphs: [
        [
          "არა. ",
          { emphasis: "strong", text: "THAMRA" },
          "-ს ფორმულა არ შეიცავს ზედმეტ კალორიებს და არ მოქმედებს წონაზე.",
        ],
        ["რაც შეეხება თმის ზრდას — აქტიური კომპონენტები კვებავს და აძლიერებს მხოლოდ თავის თმის ფოლიკულებს და არ ასტიმულირებს არასასურველი თმის ზრდას სახეზე ან სხეულზე."],
      ],
    },
    {
      question: "რამდენ ხანს მყოფნის ერთი შეფუთვა და როგორია მიწოდების პირობები?",
      paragraphs: [
        ["ერთი შეფუთვა გათვლილია ზუსტად 1 თვეზე (30 ყოველდღიური პორცია)."],
        [
          "შეკვეთის გაფორმება შეგიძლია პირდაპირ ამ გვერდზე, ერთი ღილაკით — ",
          { emphasis: "strong", text: "მიწოდება სრულიად უფასოა" },
          " მთელი საქართველოს მასშტაბით და კურიერი შეკვეთას სწრაფად მოგიტანს სასურველ მისამართზე.",
        ],
        [{ emphasis: "em", text: "(მიმდინარე პარტიის რაოდენობა შეზღუდულია)." }],
      ],
    },
  ] satisfies { question: string; paragraphs: FaqText[][] }[],
};

// --------------------------------------------------------- 8. Final CTA
export const FINAL_CTA = {
  title: "აჩუქე შენს თმას ის ზრუნვა, რომელსაც იმსახურებს",
  subhead: "დაიწყე შენი თმის სილამაზის მთავარი რიტუალი დღესვე.",
  cta: "შეუკვეთე THAMRA ახლავე",
};

// Sticky mobile bar
export const STICKY_CTA = "შეუკვეთე ახლავე";
