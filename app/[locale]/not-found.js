"use client";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';

export default function NotFound() {
  const router = useRouter();
  const t = useTranslations('notFound');
  const locale = useLocale();
  const localePrefix = locale === 'fr' ? '' : `/${locale}`;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07090F",
      color: "#F0F4FF",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
      textAlign: "center",
      padding: 24,
    }}>
      <div style={{ fontSize: 80, lineHeight: 1 }}>📄</div>
      <div style={{ fontSize: "clamp(64px,10vw,120px)", fontWeight: 900, color: "#1E2733", letterSpacing: -4, lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, letterSpacing: -0.5, margin: "0 0 8px" }}>
        {t('title')}
      </h1>
      <p style={{ color: "#6B7A99", fontSize: 15, maxWidth: 380, lineHeight: 1.6, margin: 0 }}>
        {t('desc')}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
        <button
          onClick={() => router.push(`${localePrefix}/`)}
          style={{ background: "#3B82F6", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
        >
          {t('homeBtn')}
        </button>
        <button
          onClick={() => router.push(`${localePrefix}/tools`)}
          style={{ background: "none", color: "#8892AA", border: "1px solid #1E2733", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
        >
          {t('toolsBtn')}
        </button>
      </div>
    </div>
  );
}
