const BASE_URL      = "https://getdocswift.com";
const LOCALE_PREFIX = { fr: "", en: "/en", ar: "/ar" };

const META = {
  fr: {
    title:       "DocSwift HR — Analysez 100 CVs en 2 minutes par IA",
    description: "DocSwift HR analyse automatiquement vos candidatures et vous donne un score de matching avec votre fiche de poste. Pour cabinets RH, PME et recruteurs indépendants.",
    keywords:    "analyse CV IA, tri CV automatique, recrutement IA, scoring CV, matching candidats, logiciel RH PME, ATS IA",
    og_title:    "DocSwift HR — Analyse de 100 CVs en 2 minutes par IA",
    og_desc:     "Scoring automatique, matching poste/candidat, export Excel. L'outil RH IA pour les recruteurs modernes.",
  },
  en: {
    title:       "DocSwift HR — Analyze 100 Resumes in 2 Minutes with AI",
    description: "DocSwift HR automatically screens your applications and gives you a matching score against your job description. For HR firms, SMBs and independent recruiters.",
    keywords:    "AI resume analysis, automatic CV screening, AI recruitment, CV scoring, candidate matching, HR software SMB, AI ATS",
    og_title:    "DocSwift HR — Analyze 100 Resumes in 2 Minutes with AI",
    og_desc:     "Automatic scoring, job/candidate matching, Excel export. The AI HR tool for modern recruiters.",
  },
  ar: {
    title:       "DocSwift HR — تحليل 100 سيرة ذاتية في دقيقتين بالذكاء الاصطناعي",
    description: "يحلل DocSwift HR طلبات الترشح تلقائياً ويمنحك درجة مطابقة مع وصف الوظيفة. لشركات التوظيف والشركات الصغيرة.",
    keywords:    "تحليل السيرة الذاتية بالذكاء الاصطناعي، فرز السير الذاتية تلقائياً، التوظيف بالذكاء الاصطناعي",
    og_title:    "DocSwift HR — تحليل السير الذاتية بالذكاء الاصطناعي",
    og_desc:     "تسجيل تلقائي، مطابقة الوظيفة/المرشح، تصدير Excel.",
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const m      = META[locale] ?? META.fr;
  const prefix = LOCALE_PREFIX[locale] ?? "";
  const url    = `${BASE_URL}${prefix}/hr`;

  return {
    title:       m.title,
    description: m.description,
    keywords:    m.keywords,
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: {
        "fr":        `${BASE_URL}/hr`,
        "en":        `${BASE_URL}/en/hr`,
        "ar":        `${BASE_URL}/ar/hr`,
        "x-default": `${BASE_URL}/hr`,
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

export default function HrRootLayout({ children }) {
  return children;
}
