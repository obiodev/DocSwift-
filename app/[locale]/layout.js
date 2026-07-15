import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['fr', 'en', 'ar'];
const BASE_URL = process.env.NEXTAUTH_URL ?? "https://getdocswift.com";

const META = {
  fr: {
    title: "DocSwift — Documents intelligents pour professionnels",
    description: "DocSwift regroupe deux produits : DocSwift Academic (conversion PDF, CV Builder, chat IA) et DocSwift HR (analyse de CVs par IA pour recruteurs).",
    locale: "fr_FR",
    canonical: BASE_URL,
  },
  en: {
    title: "DocSwift — Smart documents for professionals",
    description: "DocSwift brings together two products: DocSwift Academic (PDF conversion, resume builder, AI chat) and DocSwift HR (AI resume screening for recruiters).",
    locale: "en_US",
    canonical: `${BASE_URL}/en`,
  },
  ar: {
    title: "DocSwift — مستندات ذكية للمحترفين",
    description: "يجمع DocSwift بين منتجين: DocSwift Academic (تحويل PDF، منشئ السيرة الذاتية، دردشة بالذكاء الاصطناعي) وDocSwift HR (تحليل السير الذاتية بالذكاء الاصطناعي للمجندين).",
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
