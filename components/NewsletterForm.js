"use client";
import { useState } from "react";
import { useLocale } from "next-intl";

const COPY = {
  fr: {
    label: "Adresse email", placeholder: "vous@entreprise.com", submit: "S'inscrire",
    consent: "J'accepte de recevoir la newsletter DocSwift (2 emails/mois max). Désinscription en un clic dans chaque email.",
    done: "Vérifiez votre boîte mail pour confirmer votre inscription.",
    errors: { CONSENT_REQUIRED: "Merci de cocher la case de consentement.", INVALID_EMAIL: "Adresse email invalide.", RATE_LIMITED: "Trop de tentatives, réessayez demain.", default: "Inscription impossible, réessayez.", network: "Erreur réseau, réessayez." },
  },
  en: {
    label: "Email address", placeholder: "you@company.com", submit: "Subscribe",
    consent: "I agree to receive the DocSwift newsletter (2 emails/month max). One-click unsubscribe in every email.",
    done: "Check your inbox to confirm your subscription.",
    errors: { CONSENT_REQUIRED: "Please tick the consent box.", INVALID_EMAIL: "Invalid email address.", RATE_LIMITED: "Too many attempts, please try again tomorrow.", default: "Subscription failed, please try again.", network: "Network error, please try again." },
  },
  ar: {
    label: "البريد الإلكتروني", placeholder: "you@company.com", submit: "اشترك",
    consent: "أوافق على تلقي النشرة الإخبارية لـ DocSwift (رسالتان في الشهر كحد أقصى). إلغاء الاشتراك بنقرة واحدة في كل رسالة.",
    done: "تحقق من بريدك الإلكتروني لتأكيد اشتراكك.",
    errors: { CONSENT_REQUIRED: "يرجى تحديد خانة الموافقة.", INVALID_EMAIL: "عنوان بريد إلكتروني غير صالح.", RATE_LIMITED: "محاولات كثيرة، حاول مجددًا غدًا.", default: "تعذّر الاشتراك، حاول مجددًا.", network: "خطأ في الشبكة، حاول مجددًا." },
  },
};

/** Newsletter sign-up with explicit GDPR consent and double opt-in. */
export default function NewsletterForm({ source = "site", accent = "#F97316" }) {
  const locale = useLocale();
  const t = COPY[locale] ?? COPY.fr;
  const [email, setEmail]     = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState]     = useState({ status: "idle", message: "" });

  const submit = async (e) => {
    e.preventDefault();
    if (!consent) { setState({ status: "error", message: t.errors.CONSENT_REQUIRED }); return; }
    setState({ status: "loading", message: "" });
    try {
      const r = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, source }),
      });
      const data = await r.json().catch(() => ({}));
      // The API answers with error codes; messages are localised here
      if (!r.ok) { setState({ status: "error", message: t.errors[data.error] ?? t.errors.default }); return; }
      setState({ status: "done", message: t.done });
      setEmail("");
    } catch {
      setState({ status: "error", message: t.errors.network });
    }
  };

  if (state.status === "done") {
    return <p role="status" style={{ color: "#6EE7B7", fontSize: 14, margin: 0 }}>✓ {state.message}</p>;
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 440, width: "100%" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <label htmlFor={`nl-${source}`} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          {t.label}
        </label>
        <input
          id={`nl-${source}`} type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={t.placeholder} autoComplete="email" dir="ltr"
          style={{ flex: 1, minWidth: 200, background: "#07090F", border: "1px solid #1E2733", borderRadius: 10, padding: "11px 14px", color: "#F0F4FF", fontSize: 14 }}
        />
        <button type="submit" disabled={state.status === "loading"}
          style={{ background: accent, color: "#fff", border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: state.status === "loading" ? 0.6 : 1 }}>
          {state.status === "loading" ? "…" : t.submit}
        </button>
      </div>
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start", color: "#6B7A99", fontSize: 12, lineHeight: 1.5, textAlign: "start", cursor: "pointer" }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
        <span>{t.consent}</span>
      </label>
      {state.status === "error" && <p role="alert" style={{ color: "#FCA5A5", fontSize: 13, margin: 0 }}>{state.message}</p>}
    </form>
  );
}
