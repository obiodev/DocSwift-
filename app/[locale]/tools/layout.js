const BASE_URL      = "https://getdocswift.com";
const LOCALE_PREFIX = { fr: "", en: "/en", ar: "/ar" };

const META = {
  fr: {
    title:       "Outils PDF en ligne gratuits — Convertir, Compresser, Fusionner | DocSwift",
    description: "10 outils PDF gratuits en un clic : convertir PDF en Word, Excel, PowerPoint, compresser, fusionner, diviser, protéger. Sans installation, sans inscription. Rapide et sécurisé.",
    keywords:    "outils PDF gratuits, convertir PDF en Word, convertisseur PDF, compresser PDF, fusionner PDF, diviser PDF, PDF en ligne, PDF vers Word, PDF vers Excel, PDF vers PowerPoint, protéger PDF, extraire pages PDF",
    og_title:    "10 Outils PDF gratuits en ligne — DocSwift",
    og_desc:     "Convertissez, compressez, fusionnez et divisez vos PDFs gratuitement. Aucune installation requise.",
  },
  en: {
    title:       "Free Online PDF Tools — Convert, Compress, Merge | DocSwift",
    description: "10 free PDF tools in one click: convert PDF to Word, Excel, PowerPoint, compress, merge, split, protect. No install, no sign-up. Fast and secure.",
    keywords:    "free PDF tools, convert PDF to Word, PDF converter, compress PDF, merge PDF, split PDF, online PDF, PDF to Word, PDF to Excel, PDF to PowerPoint, protect PDF, extract PDF pages",
    og_title:    "10 Free Online PDF Tools — DocSwift",
    og_desc:     "Convert, compress, merge and split your PDFs for free. No installation required.",
  },
  ar: {
    title:       "أدوات PDF مجانية عبر الإنترنت — تحويل، ضغط، دمج | DocSwift",
    description: "10 أدوات PDF مجانية بنقرة واحدة: تحويل PDF إلى Word وExcel وPowerPoint، ضغط، دمج، تقسيم، حماية. بدون تثبيت، بدون تسجيل. سريع وآمن.",
    keywords:    "أدوات PDF مجانية، تحويل PDF إلى Word، محول PDF، ضغط PDF، دمج PDF، تقسيم PDF، PDF عبر الإنترنت، PDF إلى Word، PDF إلى Excel، PDF إلى PowerPoint، حماية PDF",
    og_title:    "10 أدوات PDF مجانية عبر الإنترنت — DocSwift",
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
        ? ["تحويل PDF إلى Word", "تحويل PDF إلى Excel", "تحويل PDF إلى PowerPoint", "ضغط PDF", "دمج PDF", "تقسيم PDF", "حماية PDF بكلمة مرور", "فك حماية PDF", "تدوير PDF", "استخراج صفحات PDF"]
        : locale === "en"
          ? ["PDF to Word", "PDF to Excel", "PDF to PowerPoint", "Compress PDF", "Merge PDF", "Split PDF", "Password-protect PDF", "Unlock PDF", "Rotate PDF", "Extract PDF pages"]
          : ["PDF en Word", "PDF en Excel", "PDF en PowerPoint", "Compresser PDF", "Fusionner PDF", "Diviser PDF", "Protéger PDF par mot de passe", "Déverrouiller PDF", "Pivoter PDF", "Extraire pages PDF"],
    },
    {
      "@type": "ItemList",
      "name": locale === "ar" ? "أدوات PDF" : locale === "en" ? "PDF Tools" : "Outils PDF",
      "itemListElement": [
        { "@type": "ListItem", "position": 1,  "name": locale === "ar" ? "تحويل PDF إلى Word"        : locale === "en" ? "PDF to Word"         : "PDF en Word"         },
        { "@type": "ListItem", "position": 2,  "name": locale === "ar" ? "تحويل PDF إلى Excel"       : locale === "en" ? "PDF to Excel"        : "PDF en Excel"        },
        { "@type": "ListItem", "position": 3,  "name": locale === "ar" ? "تحويل PDF إلى PowerPoint"  : locale === "en" ? "PDF to PowerPoint"   : "PDF en PowerPoint"   },
        { "@type": "ListItem", "position": 4,  "name": locale === "ar" ? "ضغط PDF"                  : locale === "en" ? "Compress PDF"        : "Compresser PDF"       },
        { "@type": "ListItem", "position": 5,  "name": locale === "ar" ? "دمج PDF"                   : locale === "en" ? "Merge PDF"           : "Fusionner PDF"        },
        { "@type": "ListItem", "position": 6,  "name": locale === "ar" ? "تقسيم PDF"                 : locale === "en" ? "Split PDF"           : "Diviser PDF"          },
        { "@type": "ListItem", "position": 7,  "name": locale === "ar" ? "حماية PDF"                 : locale === "en" ? "Protect PDF"         : "Protéger PDF"         },
        { "@type": "ListItem", "position": 8,  "name": locale === "ar" ? "فك حماية PDF"              : locale === "en" ? "Unlock PDF"          : "Déverrouiller PDF"    },
        { "@type": "ListItem", "position": 9,  "name": locale === "ar" ? "تدوير PDF"                 : locale === "en" ? "Rotate PDF"          : "Pivoter PDF"          },
        { "@type": "ListItem", "position": 10, "name": locale === "ar" ? "استخراج صفحات PDF"         : locale === "en" ? "Extract PDF pages"   : "Extraire pages PDF"   },
      ],
    },
    {
      "@type": "FAQPage",
      "mainEntity": locale === "en" ? [
        { "@type": "Question", "name": "Are these PDF tools really free?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes, DocSwift offers 5 free conversions per day without registration. For unlimited use, Pro plans start at €9.99/month." } },
        { "@type": "Question", "name": "Are my files secure?",
          "acceptedAnswer": { "@type": "Answer", "text": "Your files are processed on secure servers and deleted immediately after conversion. No data is stored." } },
        { "@type": "Question", "name": "What file size is supported?",
          "acceptedAnswer": { "@type": "Answer", "text": "Free plan supports files up to 10 MB. Pro plan supports up to 100 MB per file." } },
      ] : locale === "ar" ? [
        { "@type": "Question", "name": "هل أدوات PDF هذه مجانية حقاً؟",
          "acceptedAnswer": { "@type": "Answer", "text": "نعم، يوفر DocSwift 5 تحويلات مجانية يومياً بدون تسجيل. للاستخدام غير المحدود، تبدأ خطط Pro من 9.99 يورو شهرياً." } },
        { "@type": "Question", "name": "هل ملفاتي آمنة؟",
          "acceptedAnswer": { "@type": "Answer", "text": "تتم معالجة ملفاتك على خوادم آمنة وتُحذف فوراً بعد التحويل. لا يتم تخزين أي بيانات." } },
        { "@type": "Question", "name": "ما حجم الملف المدعوم؟",
          "acceptedAnswer": { "@type": "Answer", "text": "تدعم الخطة المجانية ملفات حتى 10 ميغابايت. تدعم خطة Pro حتى 100 ميغابايت لكل ملف." } },
      ] : [
        { "@type": "Question", "name": "Ces outils PDF sont-ils vraiment gratuits ?",
          "acceptedAnswer": { "@type": "Answer", "text": "Oui, DocSwift offre 5 conversions gratuites par jour sans inscription. Pour un usage illimité, les plans Pro débutent à 9,99 €/mois." } },
        { "@type": "Question", "name": "Mes fichiers sont-ils sécurisés ?",
          "acceptedAnswer": { "@type": "Answer", "text": "Vos fichiers sont traités sur des serveurs sécurisés et supprimés immédiatement après la conversion. Aucune donnée n'est conservée." } },
        { "@type": "Question", "name": "Quelle taille de fichier est supportée ?",
          "acceptedAnswer": { "@type": "Answer", "text": "Le plan gratuit supporte des fichiers jusqu'à 10 Mo. Le plan Pro supporte jusqu'à 100 Mo par fichier." } },
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
