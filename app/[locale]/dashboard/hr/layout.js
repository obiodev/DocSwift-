const BASE_URL      = "https://getdocswift.com";
const LOCALE_PREFIX = { fr: "", en: "/en", ar: "/ar" };

const META = {
  fr: {
    title:       "DocSwift HR — Analyse de CVs par IA pour recruteurs",
    description: "Analysez jusqu'à 100 CVs en 2 minutes grâce à l'IA. Scoring automatique, matching par poste, export des résultats. Pour cabinets RH, PME et recruteurs indépendants.",
    keywords:    "analyse CV IA, tri CV automatique, recrutement IA, scoring CV, matching candidats, logiciel RH PME, analyse CVs en masse, ATS IA, parsing CV, sélection candidats automatique",
    og_title:    "DocSwift HR — Analyse de 100 CVs en 2 minutes par IA",
    og_desc:     "Scoring automatique, matching poste/candidat, export Excel. L'outil RH IA pour les recruteurs modernes.",
  },
  en: {
    title:       "DocSwift HR — AI-Powered CV Analysis for Recruiters",
    description: "Analyze up to 100 resumes in 2 minutes with AI. Automatic scoring, job matching, results export. For HR firms, SMBs and independent recruiters.",
    keywords:    "AI resume analysis, automatic CV screening, AI recruitment, CV scoring, candidate matching, HR software SMB, bulk resume analysis, AI ATS, resume parsing, automatic candidate selection",
    og_title:    "DocSwift HR — Analyze 100 Resumes in 2 Minutes with AI",
    og_desc:     "Automatic scoring, job/candidate matching, Excel export. The AI HR tool for modern recruiters.",
  },
  ar: {
    title:       "DocSwift HR — تحليل السير الذاتية بالذكاء الاصطناعي للمجندين",
    description: "حلّل ما يصل إلى 100 سيرة ذاتية في دقيقتين بالذكاء الاصطناعي. تسجيل تلقائي، مطابقة الوظائف، تصدير النتائج. لشركات التوظيف والشركات الصغيرة والمجندين المستقلين.",
    keywords:    "تحليل السيرة الذاتية بالذكاء الاصطناعي، فرز السير الذاتية تلقائياً، التوظيف بالذكاء الاصطناعي، تسجيل السيرة الذاتية، مطابقة المرشحين، برامج الموارد البشرية",
    og_title:    "DocSwift HR — تحليل 100 سيرة ذاتية في دقيقتين بالذكاء الاصطناعي",
    og_desc:     "تسجيل تلقائي، مطابقة الوظيفة/المرشح، تصدير Excel. أداة الموارد البشرية بالذكاء الاصطناعي للمجندين الحديثين.",
  },
};

const jsonLdByLocale = (locale, url) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "DocSwift HR",
      "applicationCategory": "BusinessApplication",
      "applicationSubCategory": "HumanResourcesApplication",
      "operatingSystem": "Web",
      "url": url,
      "description": META[locale]?.description ?? META.fr.description,
      "offers": [
        { "@type": "Offer", "name": "Pro",      "price": "49",  "priceCurrency": "EUR", "priceSpecification": { "@type": "UnitPriceSpecification", "unitCode": "MON" } },
        { "@type": "Offer", "name": "Business", "price": "149", "priceCurrency": "EUR", "priceSpecification": { "@type": "UnitPriceSpecification", "unitCode": "MON" } },
      ],
      "featureList": locale === "ar"
        ? ["تحليل ما يصل إلى 100 سيرة ذاتية في وقت واحد", "تسجيل وترتيب تلقائي بالذكاء الاصطناعي", "مطابقة السيرة الذاتية بالوظيفة", "تصدير Excel للنتائج", "تحليل متعدد اللغات FR/EN/AR", "تخزين آمن وتشفير"]
        : locale === "en"
          ? ["Analyze up to 100 resumes simultaneously", "Automatic AI scoring and ranking", "Job description matching", "Excel export of results", "Multilingual analysis FR/EN/AR", "Secure storage and encryption"]
          : ["Analyse jusqu'à 100 CVs simultanément", "Scoring et classement automatique par IA", "Matching avec la fiche de poste", "Export Excel des résultats", "Analyse multilingue FR/EN/AR", "Stockage sécurisé et chiffrement"],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "187",
        "bestRating": "5",
      },
    },
    {
      "@type": "FAQPage",
      "mainEntity": locale === "en" ? [
        { "@type": "Question", "name": "How many resumes can DocSwift HR analyze at once?",
          "acceptedAnswer": { "@type": "Answer", "text": "DocSwift HR can analyze up to 100 resumes simultaneously on Pro and Business plans. Each analysis takes less than 2 minutes." } },
        { "@type": "Question", "name": "Is candidate data secure?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. Files are processed and deleted immediately after analysis. No HR data is retained beyond your session. GDPR compliant." } },
        { "@type": "Question", "name": "Does it work with all CV formats?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes, DocSwift HR supports PDF, Word (.docx) and text resumes in French, English and Arabic." } },
      ] : locale === "ar" ? [
        { "@type": "Question", "name": "كم عدد السير الذاتية التي يمكن لـ DocSwift HR تحليلها دفعة واحدة؟",
          "acceptedAnswer": { "@type": "Answer", "text": "يمكن لـ DocSwift HR تحليل ما يصل إلى 100 سيرة ذاتية في وقت واحد على خطط Pro وBusiness. يستغرق كل تحليل أقل من دقيقتين." } },
        { "@type": "Question", "name": "هل بيانات المرشحين آمنة؟",
          "acceptedAnswer": { "@type": "Answer", "text": "نعم. تتم معالجة الملفات وحذفها فوراً بعد التحليل. لا يتم الاحتفاظ بأي بيانات موارد بشرية بعد انتهاء جلستك. متوافق مع اللائحة العامة لحماية البيانات." } },
        { "@type": "Question", "name": "هل يعمل مع جميع تنسيقات السيرة الذاتية؟",
          "acceptedAnswer": { "@type": "Answer", "text": "نعم، يدعم DocSwift HR ملفات PDF وWord وملفات السيرة الذاتية النصية باللغات الفرنسية والإنجليزية والعربية." } },
      ] : [
        { "@type": "Question", "name": "Combien de CVs DocSwift HR peut-il analyser en une fois ?",
          "acceptedAnswer": { "@type": "Answer", "text": "DocSwift HR peut analyser jusqu'à 100 CVs simultanément sur les plans Pro et Business. Chaque analyse prend moins de 2 minutes." } },
        { "@type": "Question", "name": "Les données des candidats sont-elles sécurisées ?",
          "acceptedAnswer": { "@type": "Answer", "text": "Oui. Les fichiers sont traités et supprimés immédiatement après analyse. Aucune donnée RH n'est conservée au-delà de votre session. Conforme RGPD." } },
        { "@type": "Question", "name": "Fonctionne-t-il avec tous les formats de CV ?",
          "acceptedAnswer": { "@type": "Answer", "text": "Oui, DocSwift HR supporte les CVs en PDF, Word (.docx) et texte, en français, anglais et arabe." } },
      ],
    },
  ],
});

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const m      = META[locale] ?? META.fr;
  const prefix = LOCALE_PREFIX[locale] ?? "";
  const url    = `${BASE_URL}${prefix}/dashboard/hr`;

  return {
    title:       m.title,
    description: m.description,
    keywords:    m.keywords,
    // Dashboard is behind login — don't index the page itself
    robots: { index: false, follow: false },
    alternates: {
      canonical: url,
      languages: {
        "fr":        `${BASE_URL}/dashboard/hr`,
        "en":        `${BASE_URL}/en/dashboard/hr`,
        "ar":        `${BASE_URL}/ar/dashboard/hr`,
        "x-default": `${BASE_URL}/dashboard/hr`,
      },
    },
    openGraph: {
      title:       m.og_title,
      description: m.og_desc,
      url,
      siteName: "DocSwift",
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
    other: {
      "application/ld+json": JSON.stringify(jsonLdByLocale(locale, url)),
    },
  };
}

export default function HrLayout({ children }) {
  return children;
}
