const BASE_URL      = "https://getdocswift.com";
const LOCALE_PREFIX = { fr: "", en: "/en", ar: "/ar" };

const META = {
  fr: {
    title:       "Créer un CV PDF gratuit en ligne — Modèle professionnel | DocSwift",
    description: "Créez votre CV professionnel en PDF en quelques minutes. Formulaire guidé étape par étape, aperçu en direct, 3 modèles modernes. Téléchargement instantané, gratuit, sans inscription.",
    keywords:    "créer CV PDF, CV gratuit en ligne, modèle CV, générateur de CV, CV professionnel gratuit, CV PDF télécharger, faire un CV, exemple CV, CV moderne, CV Word gratuit, créateur de CV, CV en ligne",
    og_title:    "Créer un CV PDF gratuit — DocSwift",
    og_desc:     "Générateur de CV professionnel gratuit. Aperçu en direct, 3 modèles, téléchargement PDF instantané.",
  },
  en: {
    title:       "Create a Free PDF Resume Online — Professional Template | DocSwift",
    description: "Build your professional PDF resume in minutes. Step-by-step guided form, live preview, 3 modern templates. Instant download, free, no sign-up required.",
    keywords:    "create PDF resume, free resume builder online, resume template, CV generator, free professional resume, download PDF resume, make a resume, resume example, modern resume, free Word resume, resume creator, online CV",
    og_title:    "Create a Free PDF Resume — DocSwift",
    og_desc:     "Free professional resume builder. Live preview, 3 templates, instant PDF download.",
  },
  ar: {
    title:       "إنشاء سيرة ذاتية PDF مجانية — نموذج احترافي | DocSwift",
    description: "أنشئ سيرتك الذاتية الاحترافية بتنسيق PDF في دقائق. نموذج موجّه خطوة بخطوة، معاينة مباشرة، 3 قوالب حديثة. تحميل فوري، مجاني، بدون تسجيل.",
    keywords:    "إنشاء سيرة ذاتية PDF، منشئ السيرة الذاتية المجاني، نموذج CV، مولد السيرة الذاتية، سيرة ذاتية احترافية مجانية، تحميل سيرة ذاتية PDF، عمل سيرة ذاتية، مثال سيرة ذاتية، سيرة ذاتية حديثة",
    og_title:    "إنشاء سيرة ذاتية PDF مجانية — DocSwift",
    og_desc:     "منشئ سيرة ذاتية احترافية مجاني. معاينة مباشرة، 3 قوالب، تحميل PDF فوري.",
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
          { "@type": "ListItem", "position": 2, "name": locale === "ar" ? "إنشاء سيرة ذاتية" : locale === "en" ? "CV Builder" : "Créer un CV", "item": url },
        ],
      },
    },
    {
      "@type": "SoftwareApplication",
      "name": locale === "ar" ? "منشئ السيرة الذاتية DocSwift" : locale === "en" ? "DocSwift CV Builder" : "DocSwift — Créateur de CV",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Web",
      "url": url,
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
      "featureList": locale === "ar"
        ? ["نموذج موجّه خطوة بخطوة", "معاينة PDF مباشرة", "3 قوالب احترافية", "إضافة صورة شخصية", "إدارة الخبرات والمهارات", "تحميل PDF فوري"]
        : locale === "en"
          ? ["Step-by-step guided form", "Live PDF preview", "3 professional templates", "Profile photo upload", "Experience & skills management", "Instant PDF download"]
          : ["Formulaire guidé étape par étape", "Aperçu PDF en direct", "3 modèles professionnels", "Ajout de photo de profil", "Gestion des expériences et compétences", "Téléchargement PDF instantané"],
    },
    {
      "@type": "HowTo",
      "name": locale === "ar" ? "كيفية إنشاء سيرة ذاتية PDF"
            : locale === "en" ? "How to create a PDF resume"
            : "Comment créer un CV en PDF",
      "step": locale === "en" ? [
        { "@type": "HowToStep", "position": 1, "name": "Fill in your information",  "text": "Enter your personal details, experience, education and skills in the guided form." },
        { "@type": "HowToStep", "position": 2, "name": "Choose a template",         "text": "Select from 3 modern and professional CV templates." },
        { "@type": "HowToStep", "position": 3, "name": "Preview in real time",       "text": "See your CV update instantly as you type." },
        { "@type": "HowToStep", "position": 4, "name": "Download as PDF",            "text": "Click 'Download PDF' to get your resume instantly, ready to send." },
      ] : locale === "ar" ? [
        { "@type": "HowToStep", "position": 1, "name": "أدخل معلوماتك",    "text": "أدخل بياناتك الشخصية وخبراتك وتعليمك ومهاراتك في النموذج الموجّه." },
        { "@type": "HowToStep", "position": 2, "name": "اختر قالباً",       "text": "اختر من بين 3 قوالب سيرة ذاتية حديثة واحترافية." },
        { "@type": "HowToStep", "position": 3, "name": "معاينة فورية",      "text": "شاهد سيرتك الذاتية تتحدث فوراً أثناء الكتابة." },
        { "@type": "HowToStep", "position": 4, "name": "تحميل PDF",        "text": "انقر فوق 'تحميل PDF' للحصول على سيرتك الذاتية جاهزة للإرسال." },
      ] : [
        { "@type": "HowToStep", "position": 1, "name": "Remplissez vos informations", "text": "Saisissez vos données personnelles, expériences, formations et compétences dans le formulaire guidé." },
        { "@type": "HowToStep", "position": 2, "name": "Choisissez un modèle",        "text": "Sélectionnez parmi 3 modèles de CV modernes et professionnels." },
        { "@type": "HowToStep", "position": 3, "name": "Aperçu en temps réel",        "text": "Visualisez votre CV se mettre à jour instantanément pendant la saisie." },
        { "@type": "HowToStep", "position": 4, "name": "Téléchargez en PDF",          "text": "Cliquez sur 'Télécharger PDF' pour obtenir votre CV prêt à envoyer." },
      ],
    },
    {
      "@type": "FAQPage",
      "mainEntity": locale === "en" ? [
        { "@type": "Question", "name": "Is the CV builder really free?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes, DocSwift's CV builder is completely free. You can create and download up to 3 CVs per day without registration." } },
        { "@type": "Question", "name": "Can I add a photo to my CV?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes, you can upload a professional photo that will be included in your PDF resume." } },
        { "@type": "Question", "name": "In what languages can I create my CV?",
          "acceptedAnswer": { "@type": "Answer", "text": "You can create your CV in French, English or Arabic. The interface adapts to RTL for Arabic." } },
      ] : locale === "ar" ? [
        { "@type": "Question", "name": "هل منشئ السيرة الذاتية مجاني حقاً؟",
          "acceptedAnswer": { "@type": "Answer", "text": "نعم، منشئ السيرة الذاتية في DocSwift مجاني تمامًا. يمكنك إنشاء وتحميل ما يصل إلى 3 سير ذاتية يومياً بدون تسجيل." } },
        { "@type": "Question", "name": "هل يمكنني إضافة صورة لسيرتي الذاتية؟",
          "acceptedAnswer": { "@type": "Answer", "text": "نعم، يمكنك تحميل صورة احترافية سيتم تضمينها في سيرتك الذاتية PDF." } },
        { "@type": "Question", "name": "بأي لغات يمكنني إنشاء سيرتي الذاتية؟",
          "acceptedAnswer": { "@type": "Answer", "text": "يمكنك إنشاء سيرتك الذاتية باللغات الفرنسية والإنجليزية والعربية. تتكيف الواجهة مع الاتجاه من اليمين لليسار للعربية." } },
      ] : [
        { "@type": "Question", "name": "Le créateur de CV est-il vraiment gratuit ?",
          "acceptedAnswer": { "@type": "Answer", "text": "Oui, le créateur de CV DocSwift est entièrement gratuit. Vous pouvez créer et télécharger jusqu'à 3 CVs par jour sans inscription." } },
        { "@type": "Question", "name": "Puis-je ajouter une photo à mon CV ?",
          "acceptedAnswer": { "@type": "Answer", "text": "Oui, vous pouvez uploader une photo professionnelle qui sera intégrée dans votre CV en PDF." } },
        { "@type": "Question", "name": "En quelles langues puis-je créer mon CV ?",
          "acceptedAnswer": { "@type": "Answer", "text": "Vous pouvez créer votre CV en français, en anglais ou en arabe. L'interface s'adapte au mode RTL pour l'arabe." } },
      ],
    },
  ],
});

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const m      = META[locale] ?? META.fr;
  const prefix = LOCALE_PREFIX[locale] ?? "";
  const url    = `${BASE_URL}${prefix}/cv`;

  return {
    title:       m.title,
    description: m.description,
    keywords:    m.keywords,
    alternates: {
      canonical: url,
      languages: {
        "fr":        `${BASE_URL}/cv`,
        "en":        `${BASE_URL}/en/cv`,
        "ar":        `${BASE_URL}/ar/cv`,
        "x-default": `${BASE_URL}/cv`,
      },
    },
    openGraph: {
      title:       m.og_title,
      description: m.og_desc,
      url,
      siteName: "DocSwift",
      type:     "website",
      locale:   locale === "ar" ? "ar_SA" : locale === "en" ? "en_US" : "fr_FR",
      images: [{ url: `${BASE_URL}/og-cv.png`, width: 1200, height: 630, alt: m.og_title }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       m.og_title,
      description: m.og_desc,
      images:      [`${BASE_URL}/og-cv.png`],
    },
    other: {
      "application/ld+json": JSON.stringify(jsonLdByLocale(locale, url)),
    },
  };
}

export default function CvLayout({ children }) {
  return children;
}
