const BASE_URL = "https://getdocswift.com";
const LOCALE_PREFIX = { fr: "", en: "/en", ar: "/ar" };

const META = {
  fr: {
    title: "Créer un CV PDF gratuit — DocSwift",
    description: "Créez votre CV professionnel en PDF en quelques minutes. Formulaire guidé, aperçu en direct, téléchargement instantané. Gratuit et sans inscription.",
  },
  en: {
    title: "Create a Free PDF Resume — DocSwift",
    description: "Build your professional PDF resume in minutes. Guided form, live preview, instant download. Free and no sign-up required.",
  },
  ar: {
    title: "إنشاء سيرة ذاتية PDF مجانية — DocSwift",
    description: "أنشئ سيرتك الذاتية الاحترافية بتنسيق PDF في دقائق. نموذج موجّه، معاينة مباشرة، تحميل فوري. مجاني وبدون تسجيل.",
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const m = META[locale] || META.fr;
  const prefix = LOCALE_PREFIX[locale] ?? "";
  const url = `${BASE_URL}${prefix}/cv`;

  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: url,
      languages: {
        fr: `${BASE_URL}/cv`,
        en: `${BASE_URL}/en/cv`,
        ar: `${BASE_URL}/ar/cv`,
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url,
      siteName: "DocSwift",
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: "DocSwift CV Builder" }],
    },
  };
}

export default function CvLayout({ children }) {
  return children;
}
