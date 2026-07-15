const BASE_URL      = "https://getdocswift.com";
const LOCALE_PREFIX = { fr: "", en: "/en", ar: "/ar" };

const META = {
  fr: {
    title:       "DocSwift — Convertisseur PDF & CV Builder en ligne",
    description: "Convertissez, compressez, fusionnez vos PDFs. Chattez avec vos documents par IA. Créez votre CV professionnel. Gratuit, rapide, sans installation.",
    keywords:    "convertisseur PDF, PDF vers Word, compresser PDF, fusionner PDF, créateur de CV, chat PDF IA, outils PDF gratuits",
    og_title:    "DocSwift — Convertisseur PDF & CV Builder",
    og_desc:     "Tous vos outils PDF et votre CV professionnel, gratuits et en ligne.",
  },
  en: {
    title:       "DocSwift — Online PDF Converter & Resume Builder",
    description: "Convert, compress, merge your PDFs. Chat with your documents using AI. Build your professional resume. Free, fast, no install.",
    keywords:    "PDF converter, PDF to Word, compress PDF, merge PDF, resume builder, AI PDF chat, free PDF tools",
    og_title:    "DocSwift — PDF Converter & Resume Builder",
    og_desc:     "All your PDF tools and your professional resume, free and online.",
  },
  ar: {
    title:       "DocSwift — محول PDF ومنشئ السيرة الذاتية",
    description: "حوّل واضغط وادمج ملفات PDF. تحدث مع مستنداتك بالذكاء الاصطناعي. أنشئ سيرتك الذاتية الاحترافية.",
    keywords:    "محول PDF، ضغط PDF، دمج PDF، منشئ السيرة الذاتية",
    og_title:    "DocSwift — محول PDF ومنشئ السيرة الذاتية",
    og_desc:     "جميع أدوات PDF وسيرتك الذاتية الاحترافية، مجاناً وعبر الإنترنت.",
  },
};

const jsonLd = (locale, url) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DocSwift",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "ProductivityApplication",
  "operatingSystem": "Web",
  "url": url,
  "description": (META[locale] ?? META.fr).description,
  "offers": [
    { "@type": "Offer", "name": "Gratuit", "price": "0", "priceCurrency": "EUR" },
    { "@type": "Offer", "name": "Pro",      "priceCurrency": "EUR", "priceSpecification": { "@type": "UnitPriceSpecification", "unitCode": "MON" } },
  ],
});

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const m      = META[locale] ?? META.fr;
  const prefix = LOCALE_PREFIX[locale] ?? "";
  const url    = `${BASE_URL}${prefix}/academic`;

  return {
    title:       m.title,
    description: m.description,
    keywords:    m.keywords,
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: {
        "fr":        `${BASE_URL}/academic`,
        "en":        `${BASE_URL}/en/academic`,
        "ar":        `${BASE_URL}/ar/academic`,
        "x-default": `${BASE_URL}/academic`,
      },
    },
    openGraph: {
      title:       m.og_title,
      description: m.og_desc,
      url,
      siteName: "DocSwift",
      type:     "website",
      locale:   locale === "ar" ? "ar_SA" : locale === "en" ? "en_US" : "fr_FR",
    },
    twitter: {
      card:        "summary_large_image",
      title:       m.og_title,
      description: m.og_desc,
    },
    other: {
      "application/ld+json": JSON.stringify(jsonLd(locale, url)),
    },
  };
}

export default function AcademicLayout({ children }) {
  return children;
}
