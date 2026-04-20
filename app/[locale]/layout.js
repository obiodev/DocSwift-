import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['fr', 'en', 'ar'];
const BASE_URL = "https://getdocswift.com";

const META = {
  fr: {
    title: "DocSwift — L'assistant PDF intelligent pour les professionnels",
    description: "DocSwift analyse 100 CVs en 2 minutes, extrait les clauses de vos contrats et traite tous vos PDFs. Pour PME, cabinets RH et avocats.",
    locale: "fr_FR",
    canonical: BASE_URL,
  },
  en: {
    title: "DocSwift — The intelligent PDF assistant for professionals",
    description: "DocSwift analyzes 100 CVs in 2 minutes, extracts contract clauses and handles all your PDFs. For SMBs, HR firms and law offices.",
    locale: "en_US",
    canonical: `${BASE_URL}/en`,
  },
  ar: {
    title: "DocSwift — المساعد الذكي لـ PDF للمحترفين",
    description: "يحلل DocSwift 100 سيرة ذاتية في دقيقتين ويستخرج بنود العقود ويعالج جميع ملفات PDF. للشركات الصغيرة ومكاتب التوظيف والمحامين.",
    locale: "ar_SA",
    canonical: `${BASE_URL}/ar`,
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const m = META[locale] || META.fr;
  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: m.canonical,
      languages: { fr: BASE_URL, en: `${BASE_URL}/en`, ar: `${BASE_URL}/ar` },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: m.canonical,
      locale: m.locale,
      siteName: "DocSwift",
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: "DocSwift" }],
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}
        style={locale === 'ar' ? { fontFamily: "'Noto Sans Arabic', Arial, sans-serif" } : {}}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
