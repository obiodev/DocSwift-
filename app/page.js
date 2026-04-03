"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const features = [
  { icon: "📝", title: "PDF → Word",     desc: "Extract text and formatting from any PDF into an editable .doc file." },
  { icon: "🔄", title: "Word → PDF",     desc: "Convert .docx documents to pixel-perfect PDFs instantly." },
  { icon: "🗜️", title: "Compress PDF",   desc: "Shrink heavy PDFs without visible quality loss." },
  { icon: "🔗", title: "Merge PDFs",     desc: "Combine multiple PDFs into one file in seconds." },
  { icon: "✂️", title: "Split PDF",      desc: "Extract exactly the pages you need." },
  { icon: "🖼️", title: "Image → PDF",   desc: "Turn JPG or PNG images into a clean PDF document." },
];

const S = {
  // layout
  page:    { minHeight: "100vh", background: "#07090F", color: "#F0F4FF", fontFamily: "sans-serif" },
  nav:     { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(7,9,15,.95)", borderBottom: "1px solid #1E2733" },
  logo:    { fontWeight: 800, fontSize: 22, letterSpacing: -1, cursor: "pointer" },
  navLinks:{ display: "flex", gap: 24, alignItems: "center" },
  navLink: { color: "#8892AA", textDecoration: "none", fontSize: 14 },
  btnPrimary: { background: "#3B82F6", color: "#fff", padding: "9px 22px", borderRadius: 8, fontSize: 14, textDecoration: "none", fontWeight: 600, border: "none", cursor: "pointer" },
  // hero
  hero:    { textAlign: "center", padding: "140px 24px 80px" },
  badge:   { display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(59,130,246,.1)", border: "1px solid rgba(59,130,246,.25)", color: "#60A5FA", padding: "6px 16px", borderRadius: 40, fontSize: 13, marginBottom: 32 },
  dot:     { width: 6, height: 6, background: "#10B981", borderRadius: "50%", display: "inline-block" },
  h1:      { fontSize: "clamp(36px,6vw,72px)", fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, marginBottom: 20 },
  sub:     { color: "#8892AA", fontSize: 18, maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.6 },
  heroActions: { display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" },
  btnLg:   { padding: "14px 32px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", border: "none" },
  // features
  section: { maxWidth: 1100, margin: "0 auto", padding: "60px 24px" },
  sectionTitle: { textAlign: "center", fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 12 },
  sectionSub:   { textAlign: "center", color: "#6B7A99", marginBottom: 48, fontSize: 15 },
  grid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 },
  card:    { background: "#0D1117", border: "1px solid #1E2733", borderRadius: 16, padding: 28 },
  // pricing
  pricingGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24, maxWidth: 780, margin: "0 auto" },
  pricingCard: { borderRadius: 20, padding: "36px 32px", position: "relative" },
  planName:    { fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  price:       { fontSize: 52, fontWeight: 900, letterSpacing: -2, lineHeight: 1 },
  pricePer:    { color: "#6B7A99", fontSize: 14, marginTop: 4, marginBottom: 24 },
  featureList: { listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12 },
  featureItem: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#C0CBE0" },
  // footer
  footer: { borderTop: "1px solid #1E2733", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1100, margin: "0 auto" },
};

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleGetStarted = () => router.push("/tools");
  const handleUpgrade    = async () => {
    if (!session) { signIn(); return; }
    const res  = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ affiliateCode: localStorage.getItem("docswift_ref") }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div style={S.page}>

      {/* ── NAV ── */}
      <nav style={S.nav}>
        <div style={S.logo} onClick={() => router.push("/")}>
          Doc<span style={{ color: "#3B82F6" }}>Swift</span>
        </div>
        <div style={S.navLinks}>
          <a href="#features" style={S.navLink}>Fonctionnalités</a>
          <a href="#pricing"  style={S.navLink}>Tarifs</a>
          <a href="/tools"    style={S.navLink}>Outils</a>
          {session ? (
            <button onClick={() => router.push("/tools")} style={S.btnPrimary}>
              Mes outils
            </button>
          ) : (
            <button onClick={() => signIn()} style={S.btnPrimary}>
              Connexion
            </button>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={S.hero}>
        <div style={S.badge}>
          <span style={S.dot} />
          Tous les outils PDF — gratuits pour commencer
        </div>
        <h1 style={S.h1}>
          Chaque outil PDF<br />
          <span style={{ color: "#6B7A99" }}>dont vous aurez besoin.</span>
        </h1>
        <p style={S.sub}>
          Convertissez, compressez, fusionnez et signez vos PDFs en quelques secondes.
          Gratuit jusqu'à 5 conversions par jour, illimité en Pro.
        </p>
        <div style={S.heroActions}>
          <button
            onClick={handleGetStarted}
            style={{ ...S.btnLg, background: "#3B82F6", color: "#fff" }}>
            Commencer gratuitement →
          </button>
          <button
            onClick={() => document.getElementById("pricing").scrollIntoView({ behavior: "smooth" })}
            style={{ ...S.btnLg, background: "transparent", color: "#8892AA", border: "1px solid #1E2733" }}>
            Voir les tarifs
          </button>
        </div>

        {/* Social proof */}
        <div style={{ marginTop: 56, color: "#4B5563", fontSize: 13 }}>
          ✓ Aucune inscription requise &nbsp;·&nbsp; ✓ Traitement côté serveur sécurisé &nbsp;·&nbsp; ✓ Fichiers supprimés après conversion
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div id="features" style={S.section}>
        <h2 style={S.sectionTitle}>Tout ce dont vous avez besoin</h2>
        <p style={S.sectionSub}>6 outils essentiels, disponibles sans compte.</p>
        <div style={S.grid}>
          {features.map(f => (
            <div key={f.title} style={S.card} onClick={handleGetStarted}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#3B82F6"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#1E2733"}
              style={{ ...S.card, cursor: "pointer", transition: "border-color .2s" }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
              <div style={{ color: "#6B7A99", fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" style={{ ...S.section, paddingTop: 80 }}>
        <h2 style={S.sectionTitle}>Tarifs simples et transparents</h2>
        <p style={S.sectionSub}>Pas de surprise. Passez au Pro quand vous en avez besoin.</p>

        <div style={S.pricingGrid}>

          {/* FREE */}
          <div style={{ ...S.pricingCard, background: "#0D1117", border: "1px solid #1E2733" }}>
            <div style={{ ...S.planName, color: "#6B7A99" }}>Gratuit</div>
            <div style={S.price}>0€</div>
            <div style={S.pricePer}>pour toujours</div>
            <ul style={S.featureList}>
              {[
                "✓  5 conversions par jour",
                "✓  Tous les outils inclus",
                "✓  Fichiers jusqu'à 5 MB",
                "✓  Publicités affichées",
                "◎  +3 uses via pub vidéo",
              ].map(f => <li key={f} style={S.featureItem}>{f}</li>)}
            </ul>
            <button onClick={handleGetStarted}
              style={{ width: "100%", padding: "13px", borderRadius: 10, border: "1px solid #1E2733", background: "transparent", color: "#F0F4FF", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Commencer gratuitement
            </button>
          </div>

          {/* PRO */}
          <div style={{ ...S.pricingCard, background: "linear-gradient(135deg,#1E3A5F,#0D1F3C)", border: "2px solid #3B82F6", position: "relative" }}>
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#3B82F6", color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 16px", borderRadius: 20, whiteSpace: "nowrap" }}>
              LE PLUS POPULAIRE
            </div>
            <div style={{ ...S.planName, color: "#60A5FA" }}>Pro</div>
            <div style={{ ...S.price, color: "#fff" }}>9,99€</div>
            <div style={{ ...S.pricePer, color: "#60A5FA" }}>par mois · sans engagement</div>
            <ul style={S.featureList}>
              {[
                "✓  Conversions illimitées",
                "✓  Tous les outils inclus",
                "✓  Fichiers jusqu'à 50 MB",
                "✓  Aucune publicité",
                "✓  Traitement prioritaire",
                "✓  Support par email",
              ].map(f => <li key={f} style={{ ...S.featureItem, color: "#D1E8FF" }}>{f}</li>)}
            </ul>
            <button onClick={handleUpgrade}
              style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: "#3B82F6", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              {session ? "Passer au Pro →" : "S'inscrire et passer au Pro →"}
            </button>
          </div>

        </div>

        <p style={{ textAlign: "center", color: "#4B5563", fontSize: 13, marginTop: 28 }}>
          Paiement sécurisé par Stripe · Annulation à tout moment
        </p>
      </div>

      {/* ── FOOTER ── */}
      <footer style={S.footer}>
        <span style={{ fontSize: 13, color: "#4B5563" }}>© 2026 DocSwift. Tous droits réservés.</span>
        <div style={{ display: "flex", gap: 20 }}>
          <a href="/privacy" style={{ fontSize: 13, color: "#4B5563", textDecoration: "none" }}>Confidentialité</a>
          <a href="/terms"   style={{ fontSize: 13, color: "#4B5563", textDecoration: "none" }}>CGU</a>
        </div>
      </footer>
    </div>
  );
}
