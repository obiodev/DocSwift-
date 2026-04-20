const BASE_URL = "https://getdocswift.com";
const LOCALE_PREFIX = { fr: "", en: "/en", ar: "/ar" };

const META = {
  fr: {
    title: "Outils PDF gratuits — DocSwift",
    description: "10 outils PDF en ligne : convertir PDF en Word, compresser, fusionner, diviser, protéger. Gratuit, sans installation, sans inscription.",
  },
  en: {
    title: "Free PDF Tools — DocSwift",
    description: "10 online PDF tools: convert PDF to Word, compress, merge, split, protect. Free, no install, no sign-up.",
  },
  ar: {
    title: "أدوات PDF مجانية — DocSwift",
    description: "10 أدوات PDF عبر الإنترنت: تحويل PDF إلى Word، ضغط، دمج، تقسيم، حماية. مجاني، بدون تثبيت، بدون تسجيل.",
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const m = META[locale] || META.fr;
  const prefix = LOCALE_PREFIX[locale] ?? "";
  const url = `${BASE_URL}${prefix}/tools`;

  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: url,
      languages: {
        fr: `${BASE_URL}/tools`,
        en: `${BASE_URL}/en/tools`,
        ar: `${BASE_URL}/ar/tools`,
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url,
      siteName: "DocSwift",
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: "DocSwift Tools" }],
    },
  };
}

export default function ToolsLayout({ children }) {
  return children;
}
