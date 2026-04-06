"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter }          from "next/navigation";

// ─── Tool catalogue ────────────────────────────────────────────────────────
const tools = [
  {
    icon: "📝", title: "PDF → Word", href: "/tools?tool=pdf-to-word",
    tag: "Le plus utilisé", tagColor: "#10B981",
    desc: "Convertissez n'importe quel PDF en document Word entièrement éditable en quelques secondes.",
    details: [
      "Détection automatique des titres H1 / H2 / H3",
      "Préservation du gras, de l'italique et des polices",
      "Fusionne les paragraphes intelligemment",
      "Supporte les PDFs multi-pages",
    ],
  },
  {
    icon: "🔄", title: "Word → PDF", href: "/tools?tool=word-to-pdf",
    desc: "Transformez vos fichiers .docx en PDF pixel-perfect, prêts à être partagés ou imprimés.",
    details: [
      "Compatible .docx et .doc",
      "Mise en page préservée à 100%",
      "PDF universel, lisible partout",
      "Traitement côté serveur sécurisé",
    ],
  },
  {
    icon: "🗜️", title: "Compresser PDF", href: "/tools?tool=compress-pdf",
    tag: "Gain jusqu'à 80%", tagColor: "#F59E0B",
    desc: "Réduisez drastiquement le poids de vos PDFs sans perte visible de qualité.",
    details: [
      "Compression intelligente des images",
      "Idéal pour l'envoi par email",
      "Fichier de sortie optimisé pour le web",
      "Aucune limite de pages",
    ],
  },
  {
    icon: "🔗", title: "Fusionner PDFs", href: "/tools?tool=merge-pdf",
    desc: "Combinez plusieurs fichiers PDF en un seul document en quelques clics.",
    details: [
      "Ajout de fichiers illimité",
      "Glisser-déposer pour réorganiser",
      "Conserve la qualité originale",
      "Parfait pour rapports et dossiers",
    ],
  },
  {
    icon: "✂️", title: "Diviser PDF", href: "/tools?tool=split-pdf",
    desc: "Extrayez précisément la ou les pages dont vous avez besoin depuis un document PDF.",
    details: [
      "Extraction page par page",
      "Sélection précise de la page",
      "PDF de sortie propre et léger",
      "Idéal pour extraire des contrats",
    ],
  },
  {
    icon: "🖼️", title: "Image → PDF", href: "/tools?tool=image-to-pdf",
    desc: "Convertissez vos photos JPG ou PNG en un document PDF propre et professionnel.",
    details: [
      "Supporte JPG, PNG, WEBP",
      "Plusieurs images en un seul PDF",
      "Format A4 automatique",
      "Qualité haute résolution préservée",
    ],
  },
  {
    icon: "📄", title: "Créer un CV", href: "/cv",
    tag: "Nouveau ✨", tagColor: "#8B5CF6",
    desc: "Générez un CV professionnel en PDF en remplissant un formulaire simple et intuitif.",
    details: [
      "Formulaire étape par étape guidé",
      "Choix de la couleur et du style",
      "Sections : expériences, formation, compétences, langues",
      "Téléchargement PDF immédiat",
    ],
  },
];

const S = {
  page:    { minHeight: "100vh", background: "#07090F", color: "#F0F4FF", fontFamily: "sans-serif" },
  nav:     { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(7,9,15,.95)", borderBottom: "1px solid #1E2733" },
  logo:    { fontWeight: 800, fontSize: 22, letterSpacing: -1, cursor: "pointer" },
  navLinks:{ display: "flex", gap: 24, alignItems: "center" },
  navLink: { color: "#8892AA", textDecoration: "none", fontSize: 14 },
  btnPrimary: { background: "#3B82F6", color: "#fff", padding: "9px 22px", borderRadius: 8, fontSize: 14, textDecoration: "none", fontWeight: 600, border: "none", cursor: "pointer" },
  hero:    { textAlign: "center", padding: "140px 24px 80px" },
  badge:   { display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(59,130,246,.1)", border: "1px solid rgba(59,130,246,.25)", color: "#60A5FA", padding: "6px 16px", borderRadius: 40, fontSize: 13, marginBottom: 32 },
  dot:     { width: 6, height: 6, background: "#10B981", borderRadius: "50%", display: "inline-block" },
  h1:      { fontSize: "clamp(36px,6vw,72px)", fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, marginBottom: 20 },
  sub:     { color: "#8892AA", fontSize: 18, maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.6 },
  heroActions: { display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" },
  btnLg:   { padding: "14px 32px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", border: "none" },
  section: { maxWidth: 1200, margin: "0 auto", padding: "80px 24px" },
  sectionTitle: { textAlign: "center", fontSize: 36, fontWeight: 800, letterSpacing: -1, marginBottom: 12 },
  sectionSub:   { textAlign: "center", color: "#6B7A99", marginBottom: 56, fontSize: 16, maxWidth: 540, margin: "0 auto 56px" },
  pricingGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24, maxWidth: 780, margin: "0 auto" },
  pricingCard: { borderRadius: 20, padding: "36px 32px", position: "relative" },
  planName:    { fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  price:       { fontSize: 52, fontWeight: 900, letterSpacing: -2, lineHeight: 1 },
  pricePer:    { color: "#6B7A99", fontSize: 14, marginTop: 4, marginBottom: 24 },
  featureList: { listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12 },
  featureItem: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#C0CBE0" },
  footer: { borderTop: "1px solid #1E2733", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" },
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
          <a href="#tools"   style={S.navLink}>Outils</a>
          <a href="#pricing" style={S.navLink}>Tarifs</a>
          <a href="/tools"   style={S.navLink}>Accès direct</a>
          {session ? (
            <button onClick={() => router.push("/tools")} style={S.btnPrimary}>Mes outils</button>
          ) : (
            <button onClick={() => signIn()} style={S.btnPrimary}>Connexion</button>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={S.hero}>
        <div style={S.badge}>
          <span style={S.dot} />
          7 outils PDF & documents — gratuits pour commencer
        </div>
        <h1 style={S.h1}>
          Tous vos documents,<br />
          <span style={{ color: "#6B7A99" }}>traités en quelques secondes.</span>
        </h1>
        <p style={S.sub}>
          Convertissez, compressez, fusionnez vos PDFs et créez votre CV professionnel.
          Gratuit jusqu'à 5 utilisations par jour, illimité en Pro.
        </p>
        <div style={S.heroActions}>
          <button onClick={handleGetStarted} style={{ ...S.btnLg, background: "#3B82F6", color: "#fff" }}>
            Commencer gratuitement →
          </button>
          <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            style={{ ...S.btnLg, background: "transparent", color: "#8892AA", border: "1px solid #1E2733" }}>
            Voir les tarifs
          </button>
        </div>
        <div style={{ marginTop: 56, color: "#4B5563", fontSize: 13 }}>
          ✓ Aucune inscription requise &nbsp;·&nbsp; ✓ Traitement sécurisé &nbsp;·&nbsp; ✓ Fichiers supprimés après conversion
        </div>
      </div>

      {/* ── TOOLS ── */}
      <div id="tools" style={{ background: "#070B12", padding: "80px 0", borderTop: "1px solid #1E2733", borderBottom: "1px solid #1E2733" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={S.sectionTitle}>Tous nos outils</h2>
          <p style={{ ...S.sectionSub, marginBottom: 56 }}>7 outils essentiels, disponibles sans compte, conçus pour vous faire gagner du temps.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
            {tools.map(t => (
              <div key={t.title}
                onClick={() => router.push(t.href)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1E2733"; e.currentTarget.style.transform = "translateY(0)"; }}
                style={{ background: "#0D1117", border: "1px solid #1E2733", borderRadius: 18, padding: 28, cursor: "pointer", transition: "all .2s", position: "relative" }}>

                {/* Tag */}
                {t.tag && (
                  <div style={{ position: "absolute", top: 18, right: 18, background: `${t.tagColor}20`, color: t.tagColor, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: `1px solid ${t.tagColor}40` }}>
                    {t.tag}
                  </div>
                )}

                {/* Icon + Title */}
                <div style={{ fontSize: 36, marginBottom: 14 }}>{t.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{t.title}</div>
                <div style={{ color: "#8892AA", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>{t.desc}</div>

                {/* Feature list */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {t.details.map(d => (
                    <li key={d} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "#6B7A99" }}>
                      <span style={{ color: "#3B82F6", marginTop: 1, flexShrink: 0 }}>✓</span>
                      {d}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#3B82F6", fontSize: 13, fontWeight: 700 }}>
                  Utiliser cet outil <span>→</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button onClick={handleGetStarted}
              style={{ background: "#3B82F6", color: "#fff", border: "none", padding: "13px 32px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Accéder à tous les outils →
            </button>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ ...S.section, paddingTop: 80 }}>
        <h2 style={S.sectionTitle}>Simple comme bonjour</h2>
        <p style={{ ...S.sectionSub, marginBottom: 56 }}>Pas d'inscription, pas de logiciel à installer. Tout se passe dans votre navigateur.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 32, maxWidth: 900, margin: "0 auto" }}>
          {[
            { step: "1", icon: "📂", title: "Choisissez un outil", desc: "Sélectionnez l'action souhaitée parmi nos 7 outils disponibles." },
            { step: "2", icon: "⬆️", title: "Déposez votre fichier", desc: "Glissez-déposez votre document ou cliquez pour le sélectionner." },
            { step: "3", icon: "⚡", title: "Traitement instantané", desc: "Votre fichier est traité en quelques secondes côté serveur." },
            { step: "4", icon: "⬇️", title: "Téléchargez", desc: "Récupérez votre fichier converti, compressé ou généré." },
          ].map(s => (
            <div key={s.step} style={{ textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(59,130,246,.15)", border: "1px solid rgba(59,130,246,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 20, fontWeight: 800, color: "#3B82F6" }}>{s.step}</div>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{s.title}</div>
              <div style={{ color: "#6B7A99", fontSize: 13, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" style={{ background: "#070B12", padding: "80px 24px", borderTop: "1px solid #1E2733" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={S.sectionTitle}>Tarifs simples et transparents</h2>
          <p style={{ ...S.sectionSub, marginBottom: 48 }}>Pas de surprise. Passez au Pro quand vous en avez besoin.</p>

          <div style={S.pricingGrid}>
            {/* FREE */}
            <div style={{ ...S.pricingCard, background: "#0D1117", border: "1px solid #1E2733" }}>
              <div style={{ ...S.planName, color: "#6B7A99" }}>Gratuit</div>
              <div style={S.price}>0€</div>
              <div style={S.pricePer}>pour toujours</div>
              <ul style={S.featureList}>
                {["✓  5 utilisations par jour", "✓  Tous les 7 outils inclus", "✓  Fichiers jusqu'à 5 MB", "✓  Publicités affichées", "◎  +3 via pub vidéo"].map(f =>
                  <li key={f} style={S.featureItem}>{f}</li>)}
              </ul>
              <button onClick={handleGetStarted}
                style={{ width: "100%", padding: 13, borderRadius: 10, border: "1px solid #1E2733", background: "transparent", color: "#F0F4FF", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                Commencer gratuitement
              </button>
            </div>

            {/* PRO */}
            <div style={{ ...S.pricingCard, background: "linear-gradient(135deg,#1E3A5F,#0D1F3C)", border: "2px solid #3B82F6" }}>
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#3B82F6", color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 16px", borderRadius: 20, whiteSpace: "nowrap" }}>
                LE PLUS POPULAIRE
              </div>
              <div style={{ ...S.planName, color: "#60A5FA" }}>Pro</div>
              <div style={{ ...S.price, color: "#fff" }}>9,99€</div>
              <div style={{ ...S.pricePer, color: "#60A5FA" }}>par mois · sans engagement</div>
              <ul style={S.featureList}>
                {["✓  Utilisations illimitées", "✓  Tous les 7 outils inclus", "✓  Fichiers jusqu'à 50 MB", "✓  Aucune publicité", "✓  Traitement prioritaire", "✓  Support par email"].map(f =>
                  <li key={f} style={{ ...S.featureItem, color: "#D1E8FF" }}>{f}</li>)}
              </ul>
              <button onClick={handleUpgrade}
                style={{ width: "100%", padding: 13, borderRadius: 10, border: "none", background: "#3B82F6", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                {session ? "Passer au Pro →" : "S'inscrire et passer au Pro →"}
              </button>
            </div>
          </div>

          <p style={{ textAlign: "center", color: "#4B5563", fontSize: 13, marginTop: 28 }}>
            Paiement sécurisé par Stripe · Annulation à tout moment
          </p>
        </div>
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
