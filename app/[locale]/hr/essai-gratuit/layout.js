const BASE_URL      = "https://getdocswift.com";
const LOCALE_PREFIX = { fr: "", en: "/en", ar: "/ar" };

const META = {
  fr: {
    title:       "Essai gratuit DocSwift HR — Screening de CV par IA | DocSwift",
    description: "Testez le screening de CV par IA gratuitement, sans compte. Analysez jusqu'à 5 CVs, scoring automatique, matching avec votre fiche de poste.",
    keywords:    "essai gratuit analyse CV, screening CV gratuit, tri CV IA gratuit, tester analyse CV, DocSwift HR essai",
    og_title:    "Essai gratuit DocSwift HR — Screening de CV par IA",
    og_desc:     "Analysez jusqu'à 5 CVs gratuitement, sans compte. Scoring automatique par IA en 2 minutes.",
  },
  en: {
    title:       "Free Trial DocSwift HR — AI Resume Screening | DocSwift",
    description: "Try AI resume screening for free, no account needed. Analyze up to 5 resumes, automatic scoring, job description matching.",
    keywords:    "free resume screening trial, free AI CV screening, try AI resume analysis, DocSwift HR free trial",
    og_title:    "Free Trial DocSwift HR — AI Resume Screening",
    og_desc:     "Analyze up to 5 resumes for free, no account required. Automatic AI scoring in 2 minutes.",
  },
  ar: {
    title:       "تجربة مجانية DocSwift HR — فرز السير الذاتية بالذكاء الاصطناعي",
    description: "جرّب فرز السير الذاتية بالذكاء الاصطناعي مجاناً، بدون حساب. حلّل حتى 5 سير ذاتية، تسجيل تلقائي، مطابقة مع الوظيفة.",
    keywords:    "تجربة مجانية تحليل السيرة الذاتية، فرز CV مجاني، تجربة الذكاء الاصطناعي",
    og_title:    "تجربة مجانية DocSwift HR",
    og_desc:     "حلّل حتى 5 سير ذاتية مجاناً، بدون حساب، بتسجيل تلقائي بالذكاء الاصطناعي.",
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const m      = META[locale] ?? META.fr;
  const prefix = LOCALE_PREFIX[locale] ?? "";
  const url    = `${BASE_URL}${prefix}/hr/essai-gratuit`;

  return {
    title:       m.title,
    description: m.description,
    keywords:    m.keywords,
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: {
        "fr":        `${BASE_URL}/hr/essai-gratuit`,
        "en":        `${BASE_URL}/en/hr/essai-gratuit`,
        "ar":        `${BASE_URL}/ar/hr/essai-gratuit`,
        "x-default": `${BASE_URL}/hr/essai-gratuit`,
      },
    },
    openGraph: {
      title:       m.og_title,
      description: m.og_desc,
      url,
      siteName: "DocSwift HR",
      type:     "website",
      locale:   locale === "ar" ? "ar_SA" : locale === "en" ? "en_US" : "fr_FR",
      images: [{ url: `${BASE_URL}/og-hr.png`, width: 1200, height: 630, alt: m.og_title }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       m.og_title,
      description: m.og_desc,
      images:      [`${BASE_URL}/og-hr.png`],
    },
  };
}

export default function HrTrialLayout({ children }) {
  return children;
}
