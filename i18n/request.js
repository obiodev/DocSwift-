import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const validLocales = ['fr', 'en', 'ar'];
  const resolvedLocale = validLocales.includes(locale) ? locale : 'fr';

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default
  };
});
