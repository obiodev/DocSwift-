const BASE_URL      = "https://getdocswift.com";
const LOCALE_PREFIX = { fr: "", en: "/en", ar: "/ar" };

const META = {
  fr: {
    title:       "Outils PDF en ligne gratuits — Convertir, Compresser, Fusionner | DocSwift",
    description: "Outils PDF gratuits en un clic : PDF en Word, Word en PDF, compresser, fusionner, diviser, images en PDF. Sans installation, sans inscription.",
    keywords:    "outils PDF gratuits, convertir PDF en Word, convertisseur PDF, compresser PDF, fusionner PDF, diviser PDF, PDF en ligne, PDF vers Word, Word vers PDF, images en PDF",
    og_title:    "Outils PDF gratuits en ligne — DocSwift",
    og_desc:     "Convertissez, compressez, fusionnez et divisez vos PDFs gratuitement. Aucune installation requise.",
  },
  en: {
    title:       "Free Online PDF Tools — Convert, Compress, Merge | DocSwift",
    description: "Free PDF tools in one click: PDF to Word, Word to PDF, compress, merge, split, images to PDF. No install, no sign-up.",
    keywords:    "free PDF tools, convert PDF to Word, PDF converter, compress PDF, merge PDF, split PDF, online PDF, PDF to Word, Word to PDF, images to PDF",
    og_title:    "Free Online PDF Tools — DocSwift",
    og_desc:     "Convert, compress, merge and split your PDFs for free. No installation required.",
  },
  ar: {
    title:       "أدوات PDF مجانية عبر الإنترنت — تحويل، ضغط، دمج | DocSwift",
    description: "أدوات PDF مجانية بنقرة واحدة: تحويل PDF إلى Word وWord إلى PDF، ضغط، دمج، تقسيم، تحويل الصور إلى PDF. بدون تثبيت، بدون تسجيل.",
    keywords:    "أدوات PDF مجانية، تحويل PDF إلى Word، محول PDF، ضغط PDF، دمج PDF، تقسيم PDF، PDF عبر الإنترنت، Word إلى PDF، الصور إلى PDF",
    og_title:    "أدوات PDF مجانية عبر الإنترنت — DocSwift",
    og_desc:     "حوّل، اضغط، ادمج وقسّم ملفات PDF مجاناً. لا يلزم التثبيت.",
  },
};

const jsonLdByLocale = (locale, url) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      "url": url,
      "name": META[locale]?.title ?? META.fr.title,
      "description": META[locale]?.description ?? META.fr.description,
      "inLanguage": locale === "ar" ? "ar-SA" : locale === "en" ? "en-US" : "fr-FR",
      "isPartOf": { "@id": `${BASE_URL}/#website` },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "DocSwift", "item": `${BASE_URL}${LOCALE_PREFIX[locale] ?? ""}` },
          { "@type": "ListItem", "position": 2, "name": locale === "ar" ? "أدوات PDF" : locale === "en" ? "PDF Tools" : "Outils PDF", "item": url },
        ],
      },
    },
    {
      "@type": "SoftwareApplication",
      "name": "DocSwift PDF Tools",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Web",
      "url": url,
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
      "featureList": locale === "ar"
        ? ["تحويل PDF إلى Word", "تحويل Word إلى PDF", "ضغط PDF", "دمج PDF", "تقسيم PDF", "تحويل الصور إلى PDF"]
        : locale === "en"
          ? ["PDF to Word", "Word to PDF", "Compress PDF", "Merge PDF", "Split PDF", "Images to PDF"]
          : ["PDF en Word", "Word en PDF", "Compresser PDF", "Fusionner PDF", "Diviser PDF", "Images en PDF"],
    },
    {
      "@type": "ItemList",
      "name": locale === "ar" ? "أدوات PDF" : locale === "en" ? "PDF Tools" : "Outils PDF",
      "itemListElement": [
        ["PDF en Word", "PDF to Word", "تحويل PDF إلى Word"],
        ["Word en PDF", "Word to PDF", "تحويل Word إلى PDF"],
        ["Compresser PDF", "Compress PDF", "ضغط PDF"],
        ["Fusionner PDF", "Merge PDF", "دمج PDF"],
        ["Diviser PDF", "Split PDF", "تقسيم PDF"],
        ["Images en PDF", "Images to PDF", "تحويل الصور إلى PDF"],
      ].map(([fr, en, ar], i) => ({ "@type": "ListItem", "position": i + 1, "name": locale === "ar" ? ar : locale === "en" ? en : fr })),
    },
    {
      "@type": "FAQPage",
      "mainEntity": locale === "en" ? [
        { "@type": "Question", "name": "Are these PDF tools really free?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes, DocSwift offers 5 free conversions per day without registration. For unlimited use, Pro plans start at €9.99/month." } },
        { "@type": "Question", "name": "Are my files secure?",
          "acceptedAnswer": { "@type": "Answer", "text": "Your files are processed on secure servers and deleted immediately after conversion. No data is stored." } },
        { "@type": "Question", "name": "What file size is supported?",
          "acceptedAnswer": { "@type": "Answer", "text": "Files up to 20 MB each, on every plan." } },
      ] : locale === "ar" ? [
        { "@type": "Question", "name": "هل أدوات PDF هذه مجانية حقاً؟",
          "acceptedAnswer": { "@type": "Answer", "text": "نعم، يوفر DocSwift 5 تحويلات مجانية يومياً بدون تسجيل. للاستخدام غير المحدود، تبدأ خطط Pro من 9.99 يورو شهرياً." } },
        { "@type": "Question", "name": "هل ملفاتي آمنة؟",
          "acceptedAnswer": { "@type": "Answer", "text": "تتم معالجة ملفاتك على خوادم آمنة وتُحذف فوراً بعد التحويل. لا يتم تخزين أي بيانات." } },
        { "@type": "Question", "name": "ما حجم الملف المدعوم؟",
          "acceptedAnswer": { "@type": "Answer", "text": "ملفات حتى 20 ميغابايت لكل ملف، في جميع الخطط." } },
      ] : [
        { "@type": "Question", "name": "Ces outils PDF sont-ils vraiment gratuits ?",
          "acceptedAnswer": { "@type": "Answer", "text": "Oui, DocSwift offre 5 conversions gratuites par jour sans inscription. Pour un usage illimité, les plans Pro débutent à 9,99 €/mois." } },
        { "@type": "Question", "name": "Mes fichiers sont-ils sécurisés ?",
          "acceptedAnswer": { "@type": "Answer", "text": "Vos fichiers sont traités sur des serveurs sécurisés et supprimés immédiatement après la conversion. Aucune donnée n'est conservée." } },
        { "@type": "Question", "name": "Quelle taille de fichier est supportée ?",
          "acceptedAnswer": { "@type": "Answer", "text": "Fichiers jusqu'à 20 Mo chacun, sur tous les plans." } },
      ],
    },
  ],
});

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const m      = META[locale] ?? META.fr;
  const prefix = LOCALE_PREFIX[locale] ?? "";
  const url    = `${BASE_URL}${prefix}/tools`;

  return {
    title:       m.title,
    description: m.description,
    keywords:    m.keywords,
    alternates: {
      canonical: url,
      languages: {
        "fr":    `${BASE_URL}/tools`,
        "en":    `${BASE_URL}/en/tools`,
        "ar":    `${BASE_URL}/ar/tools`,
        "x-default": `${BASE_URL}/tools`,
      },
    },
    openGraph: {
      title:       m.og_title,
      description: m.og_desc,
      url,
      siteName: "DocSwift",
      type:     "website",
      locale:   locale === "ar" ? "ar_SA" : locale === "en" ? "en_US" : "fr_FR",
      images: [{ url: `${BASE_URL}/og-tools.png`, width: 1200, height: 630, alt: m.og_title }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       m.og_title,
      description: m.og_desc,
      images:      [`${BASE_URL}/og-tools.png`],
    },
    other: {
      "application/ld+json": JSON.stringify(jsonLdByLocale(locale, url)),
    },
  };
}

export default function ToolsLayout({ children }) {
  return children;
}
