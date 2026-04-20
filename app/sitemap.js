const BASE_URL      = "https://getdocswift.com";
const LOCALES       = ["fr", "en", "ar"];
const LOCALE_PREFIX = { fr: "", en: "/en", ar: "/ar" };

// Pages publiques indexées
const PUBLIC_PAGES = [
  { path: "",       changeFrequency: "weekly",  priority: 1.0  },
  { path: "/tools", changeFrequency: "weekly",  priority: 0.9  },
  { path: "/cv",    changeFrequency: "monthly", priority: 0.85 },
  { path: "/terms", changeFrequency: "yearly",  priority: 0.2  },
];

export default function sitemap() {
  const entries = [];

  for (const page of PUBLIC_PAGES) {
    for (const locale of LOCALES) {
      const prefix = LOCALE_PREFIX[locale];
      const url    = `${BASE_URL}${prefix}${page.path}`;

      const languages = {};
      for (const l of LOCALES) {
        languages[l] = `${BASE_URL}${LOCALE_PREFIX[l]}${page.path}`;
      }
      languages["x-default"] = `${BASE_URL}${page.path}`;

      entries.push({
        url,
        lastModified:    new Date(),
        changeFrequency: page.changeFrequency,
        priority:        page.priority,
        alternates:      { languages },
      });
    }
  }

  return entries;
}
