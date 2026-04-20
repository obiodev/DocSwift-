const BASE_URL = "https://getdocswift.com";

const LOCALES = ["fr", "en", "ar"];
const LOCALE_PREFIX = { fr: "", en: "/en", ar: "/ar" };

const PAGES = [
  { path: "",          changeFrequency: "weekly",  priority: 1.0  },
  { path: "/tools",    changeFrequency: "monthly", priority: 0.85 },
  { path: "/cv",       changeFrequency: "monthly", priority: 0.75 },
  { path: "/terms",    changeFrequency: "yearly",  priority: 0.3  },
];

export default function sitemap() {
  const entries = [];

  for (const page of PAGES) {
    for (const locale of LOCALES) {
      const prefix = LOCALE_PREFIX[locale];
      const url    = `${BASE_URL}${prefix}${page.path}`;

      // alternates for hreflang
      const alternates = {};
      for (const l of LOCALES) {
        alternates[l] = `${BASE_URL}${LOCALE_PREFIX[l]}${page.path}`;
      }

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
