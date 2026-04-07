import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['fr', 'en', 'ar'];

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
