"use client";
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

const langs = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const switchLocale = (newLocale) => {
    if (newLocale === locale) return;
    const segments = pathname.split('/');
    // segments[1] is the locale prefix (or a page segment if no prefix)
    if (['fr', 'en', 'ar'].includes(segments[1])) {
      if (newLocale === 'fr') {
        segments.splice(1, 1); // remove locale prefix → French at /
      } else {
        segments[1] = newLocale;
      }
    } else {
      if (newLocale !== 'fr') {
        segments.splice(1, 0, newLocale);
      }
    }
    const newPath = segments.join('/').replace(/\/\//g, '/') || '/';
    // Update locale cookie so middleware doesn't redirect back to the old locale
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax; Secure`;
    window.location.href = newPath;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      background: '#0D1117',
      border: '1px solid #1E2733',
      borderRadius: 8,
      padding: '4px 8px',
      flexShrink: 0,
    }}>
      {langs.map((lang, i) => (
        <span key={lang.code}>
          <button
            onClick={() => switchLocale(lang.code)}
            style={{
              background: locale === lang.code ? 'rgba(59,130,246,.1)' : 'none',
              border: 'none',
              padding: '2px 6px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              color: locale === lang.code ? '#3B82F6' : '#6B7A99',
            }}
          >
            {lang.label}
          </button>
          {i < langs.length - 1 && (
            <span style={{ color: '#1E2733', userSelect: 'none' }}>|</span>
          )}
        </span>
      ))}
    </div>
  );
}
