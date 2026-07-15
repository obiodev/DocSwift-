"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "next-intl";
import LanguageSwitcher from "../../../components/LanguageSwitcher";

const CSS = `
  @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-60px) scale(1.1)} 66%{transform:translate(-30px,30px) scale(0.9)} }
  @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,70px) scale(1.05)} 66%{transform:translate(30px,-40px) scale(0.95)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse-dot { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.6)} 50%{box-shadow:0 0 0 6px rgba(16,185,129,0)} }
  .hero-text{animation:fadeUp .9s ease both}
  .hero-sub{animation:fadeUp .9s .15s ease both;opacity:0}
  .hero-ctas{animation:fadeUp .9s .3s ease both;opacity:0}
  .pulse-dot{animation:pulse-dot 2s infinite}
  .btn-primary{transition:all .2s ease}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(249,115,22,.4)}
  .btn-secondary{transition:all .2s ease}
  .btn-secondary:hover{border-color:#F97316!important;color:#F0F4FF!important}
  .testi-card{transition:all .22s ease}
  .nav-link{transition:color .15s}
  .nav-link:hover{color:#F0F4FF!important}
  .gradient-text-orange{ background:linear-gradient(135deg,#FFFFFF 0%,#FED7AA 45%,#F97316 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .stat-card{transition:all .2s}
  .stat-card:hover{border-color:rgba(249,115,22,.25)!important;background:#0D1520!important}
  .faq-item{transition:all .2s}
  .pricing-card{transition:all .22s cubic-bezier(.4,0,.2,1)}
  .pricing-card:hover{transform:translateY(-4px)}
  @media(max-width:768px){
    .nav-links{display:none!important}
    .nav-wrap{padding:12px 16px!important}
    .hero-h1{font-size:36px!important}
    .pricing-grid{grid-template-columns:1fr!important}
    .stats-bar{grid-template-columns:1fr 1fr!important}
    .hero-ctas{flex-direction:column!important;align-items:stretch!important;max-width:340px!important;margin:0 auto!important}
    .problem-grid{grid-template-columns:1fr!important}
    .faq-grid{grid-template-columns:1fr!important}
  }
`;

const MOCKUP_DATA = [
  { name:"Sophie Marchand", score:92, status:"recommended" },
  { name:"Thomas Ribeiro",  score:78, status:"consider" },
  { name:"Amir Khalil",     score:61, status:"consider" },
  { name:"Julie Fontaine",  score:34, status:"rejected" },
];
const STATUS_COLOR = { recommended:"#10B981", consider:"#F59E0B", rejected:"#EF4444" };
const STATUS_LABEL = { recommended:"Recommandé", consider:"À considérer", rejected:"Non retenu" };

const PLANS = [
  { plan:"starter",  name:"Starter",  price:"49",  color:"#6B7A99", border:"#1E2733", bg:"#0D1117", badge:null,
    features:["50 CVs screenés / mois", "Scoring IA /100", "Matching fiche de poste", "Export CSV"] },
  { plan:"pro",       name:"Pro",      price:"149", color:"#F97316", border:"#F97316", bg:"linear-gradient(145deg,#1A1000,#261500)", badge:"Le plus populaire", badgeBg:"linear-gradient(135deg,#F97316,#EA580C)",
    features:["250 CVs screenés / mois", "Scoring IA /100", "Matching fiche de poste", "Export CSV / Excel", "Support prioritaire"] },
  { plan:"business",  name:"Business", price:"349", color:"#FB923C", border:"#F97316", bg:"linear-gradient(145deg,#1A1000,#2A1800)", badge:"✦ Volume", badgeBg:"linear-gradient(135deg,#F97316,#EA580C)",
    features:["1000 CVs screenés / mois", "Scoring IA /100", "Matching fiche de poste", "Export CSV / Excel", "Utilisateurs illimités", "Support dédié"] },
];

const FAQ = [
  { q:"Combien de CVs peut-on analyser simultanément ?", a:"Jusqu'à 100 CVs en parallèle par analyse. Chaque analyse prend moins de 2 minutes." },
  { q:"Les données de mes candidats sont-elles sécurisées ?", a:"Oui. Les fichiers sont traités et supprimés immédiatement après analyse. Aucune donnée RH n'est conservée au-delà de votre session." },
  { q:"Puis-je exporter les résultats d'analyse ?", a:"Oui, export CSV/Excel disponible sur tous les plans." },
  { q:"L'IA est-elle vraiment fiable pour évaluer des CVs ?", a:"Elle analyse objectivement les correspondances entre la fiche de poste et les compétences du CV. Elle remplace le tri initial, pas l'entretien humain." },
  { q:"Comment fonctionne la facturation ?", a:"Paiement mensuel par carte via Stripe. Annulation à tout moment, sans frais ni engagement." },
  { q:"Y a-t-il une période d'essai gratuite ?", a:"Oui, 14 jours d'essai gratuit sur tous les plans (carte bancaire requise, aucun débit avant la fin de l'essai)." },
];

export default function HrLanding() {
  const locale  = useLocale();
  const { data: session } = useSession();
  const router  = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  const go = (path) => router.push(`${localePrefix}${path}`);

  const handleSubscribe = async (plan) => {
    if (!session) { signIn(undefined, { callbackUrl: "/hr" }); return; }
    setCheckoutLoading(plan);
    try {
      const r = await fetch("/api/hr/checkout", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ plan }) });
      const data = await r.json();
      if (data.url) window.location.href = data.url;
    } finally { setCheckoutLoading(null); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#07090F", color:"#F0F4FF", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", overflowX:"hidden" }}>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className="nav-wrap" style={{ position:"fixed",top:0,left:0,right:0,zIndex:200,padding:"16px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(7,9,15,.92)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(30,39,51,.9)" }}>
        <a href={`${localePrefix}/hr`} style={{ textDecoration:"none",fontWeight:900,fontSize:22,letterSpacing:-1,color:"#F0F4FF",display:"flex",alignItems:"center",gap:6 }}>
          👥 Doc<span style={{ color:"#F97316" }}>Swift HR</span>
        </a>
        <div className="nav-links" style={{ display:"flex",gap:28,alignItems:"center" }}>
          <a href={`${localePrefix}/hr/essai-gratuit`} className="nav-link" style={{ color:"#8892AA",textDecoration:"none",fontSize:14 }}>Essai gratuit</a>
          <a href="#pricing" className="nav-link" style={{ color:"#8892AA",textDecoration:"none",fontSize:14 }}>Tarifs</a>
          <LanguageSwitcher />
          {session
            ? <button className="btn-primary" onClick={() => go("/hr/dashboard")} style={{ background:"#F97316",color:"#fff",padding:"9px 22px",borderRadius:8,fontSize:14,fontWeight:700,border:"none",cursor:"pointer" }}>Dashboard →</button>
            : <button className="btn-primary" onClick={() => signIn(undefined, { callbackUrl:"/hr/dashboard" })} style={{ background:"#F97316",color:"#fff",padding:"9px 22px",borderRadius:8,fontSize:14,fontWeight:700,border:"none",cursor:"pointer" }}>Connexion</button>
          }
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position:"relative",overflow:"hidden",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"130px 24px 80px" }}>
        <div style={{ position:"absolute",top:"18%",left:"12%",width:560,height:560,borderRadius:"50%",background:"radial-gradient(circle,rgba(249,115,22,.08) 0%,transparent 65%)",animation:"blob1 9s ease-in-out infinite",pointerEvents:"none" }} />
        <div style={{ position:"absolute",top:"35%",right:"8%", width:440,height:440,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,.07) 0%,transparent 65%)",animation:"blob2 11s ease-in-out infinite",pointerEvents:"none" }} />

        <div style={{ position:"relative",zIndex:1,maxWidth:900 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(249,115,22,.08)",border:"1px solid rgba(249,115,22,.22)",color:"#FED7AA",padding:"6px 18px",borderRadius:40,fontSize:13,fontWeight:600,marginBottom:32 }}>
            <span className="pulse-dot" style={{ width:7,height:7,background:"#10B981",borderRadius:"50%",display:"inline-block" }} />
            Recrutement assisté par IA
          </div>

          <h1 className="hero-text hero-h1" style={{ fontSize:"clamp(36px,6.5vw,80px)",fontWeight:900,letterSpacing:-3,lineHeight:1.04,marginBottom:24 }}>
            <span className="gradient-text-orange">Analysez 100 CVs</span><br />en 2 minutes.
          </h1>

          <p className="hero-sub" style={{ color:"#8892AA",fontSize:19,maxWidth:560,margin:"0 auto 14px",lineHeight:1.7 }}>
            DocSwift HR analyse automatiquement vos candidatures et vous donne un <strong style={{ color:"#F0F4FF" }}>score de matching</strong> avec votre fiche de poste.
          </p>
          <p style={{ color:"#4B5563",fontSize:14,maxWidth:480,margin:"0 auto 44px" }}>
            Pour les cabinets RH, PME et recruteurs indépendants.
          </p>

          <div className="hero-ctas" style={{ display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap" }}>
            <button className="btn-primary" onClick={() => go("/hr/essai-gratuit")} style={{ background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",padding:"16px 38px",borderRadius:14,fontSize:17,fontWeight:800,border:"none",cursor:"pointer",letterSpacing:-.3 }}>
              Essayer gratuitement →
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById("demo")?.scrollIntoView({behavior:"smooth"})}
              style={{ background:"rgba(30,39,51,.6)",color:"#C0CBE0",padding:"16px 28px",borderRadius:14,fontSize:16,cursor:"pointer",border:"1px solid #1E2733",backdropFilter:"blur(10px)" }}>
              Voir la démo ↓
            </button>
          </div>

          <p className="hero-trust" style={{ marginTop:28,color:"#4B5563",fontSize:13 }}>
            ✓ 5 CVs gratuits sans compte &nbsp;·&nbsp; ✓ 14 jours d'essai sur les plans payants &nbsp;·&nbsp; ✓ Données supprimées après analyse
          </p>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ borderTop:"1px solid #1E2733",borderBottom:"1px solid #1E2733",padding:"32px 24px",background:"rgba(13,17,23,.9)" }}>
        <div className="stats-bar" style={{ maxWidth:960,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24,textAlign:"center" }}>
          {[
            { value:"6h", label:"économisées par recrutement" },
            { value:"100", label:"CVs analysés en parallèle" },
            { value:"< 2min", label:"pour un batch complet" },
            { value:"98%", label:"de marge opérationnelle" },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ padding:"16px 12px",borderRadius:14,border:"1px solid transparent",cursor:"default" }}>
              <div style={{ fontSize:30,fontWeight:900,color:"#F97316",letterSpacing:-1 }}>{s.value}</div>
              <div style={{ fontSize:13,color:"#6B7A99",marginTop:5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROBLÈME / SOLUTION ── */}
      <div style={{ padding:"100px 24px",background:"#07090F" }}>
        <div style={{ maxWidth:1000,margin:"0 auto" }}>
          <div className="problem-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,alignItems:"center" }}>
            <div>
              <div style={{ display:"inline-block",background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",color:"#FCA5A5",padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700,marginBottom:20 }}>😩 Le problème</div>
              <h2 style={{ fontSize:"clamp(24px,3.5vw,42px)",fontWeight:900,letterSpacing:-1.5,lineHeight:1.15,marginBottom:20 }}>
                Les recruteurs passent en moyenne <span style={{ color:"#EF4444" }}>6 heures</span> à trier les CVs pour un seul poste.
              </h2>
              <p style={{ color:"#6B7A99",fontSize:16,lineHeight:1.7 }}>
                Lecture individuelle, notes dispersées, critères subjectifs, oublis… Le tri de CV est chronophage, épuisant et source d'erreurs.
              </p>
            </div>
            <div>
              <div style={{ display:"inline-block",background:"rgba(16,185,129,.08)",border:"1px solid rgba(16,185,129,.2)",color:"#6EE7B7",padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700,marginBottom:20 }}>✅ La solution</div>
              <h2 style={{ fontSize:"clamp(24px,3.5vw,42px)",fontWeight:900,letterSpacing:-1.5,lineHeight:1.15,marginBottom:20 }}>
                DocSwift HR le fait en <span style={{ color:"#10B981" }}>2 minutes</span>.
              </h2>
              <p style={{ color:"#6B7A99",fontSize:16,lineHeight:1.7 }}>
                Uploadez votre fiche de poste + vos CVs. L'IA analyse chaque profil, calcule un score de matching et génère une recommandation RH instantanément.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── DÉMO HR ── */}
      <div id="demo" style={{ padding:"80px 24px",background:"#070B13",borderTop:"1px solid #1E2733",borderBottom:"1px solid #1E2733" }}>
        <div style={{ maxWidth:900,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:48 }}>
            <div style={{ display:"inline-block",background:"rgba(249,115,22,.08)",border:"1px solid rgba(249,115,22,.2)",color:"#FB923C",padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700,marginBottom:16 }}>👥 Démo</div>
            <h2 style={{ fontSize:"clamp(24px,4vw,44px)",fontWeight:900,letterSpacing:-1.5,marginBottom:12 }}>Tableau de résultats en temps réel</h2>
            <p style={{ color:"#6B7A99",fontSize:16 }}>Chaque CV analysé automatiquement — score, forces, faiblesses, recommandation.</p>
          </div>

          <div style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:20,overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,.5)" }}>
            <div style={{ padding:"14px 20px",borderBottom:"1px solid #1E2733",display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ width:12,height:12,borderRadius:"50%",background:"#EF4444" }} />
              <div style={{ width:12,height:12,borderRadius:"50%",background:"#F59E0B" }} />
              <div style={{ width:12,height:12,borderRadius:"50%",background:"#10B981" }} />
              <span style={{ color:"#4B5563",fontSize:12,marginLeft:8 }}>DocSwift HR — Développeur React Senior — 4 candidats analysés</span>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:14 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid #1E2733" }}>
                    {["Candidat","Score","Statut","Action"].map(h => (
                      <th key={h} style={{ padding:"10px 20px",textAlign:"left",color:"#4B5563",fontWeight:600,fontSize:11,letterSpacing:.5,textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCKUP_DATA.map((row,i) => (
                    <tr key={i} style={{ borderBottom:"1px solid #0D1117",background:i%2===0?"#0A0E17":"transparent" }}>
                      <td style={{ padding:"14px 20px",color:"#F0F4FF",fontWeight:600 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                          <div style={{ width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${STATUS_COLOR[row.status]}33,${STATUS_COLOR[row.status]}66)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:STATUS_COLOR[row.status],flexShrink:0 }}>{row.name[0]}</div>
                          {row.name}
                        </div>
                      </td>
                      <td style={{ padding:"14px 20px" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                          <div style={{ width:80,height:6,background:"#1E2733",borderRadius:99,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${row.score}%`,background:STATUS_COLOR[row.status],borderRadius:99 }} />
                          </div>
                          <span style={{ fontWeight:800,color:STATUS_COLOR[row.status],fontSize:15 }}>{row.score}</span>
                          <span style={{ color:"#4B5563",fontSize:12 }}>/100</span>
                        </div>
                      </td>
                      <td style={{ padding:"14px 20px" }}>
                        <span style={{ background:`${STATUS_COLOR[row.status]}18`,color:STATUS_COLOR[row.status],fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:20,border:`1px solid ${STATUS_COLOR[row.status]}35` }}>{STATUS_LABEL[row.status]}</span>
                      </td>
                      <td style={{ padding:"14px 20px" }}>
                        <button style={{ background:"rgba(249,115,22,.08)",color:"#FB923C",border:"1px solid rgba(249,115,22,.2)",padding:"5px 12px",borderRadius:7,fontSize:12,cursor:"pointer",fontWeight:600 }}>Voir détails</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding:"14px 20px",borderTop:"1px solid #1E2733",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ color:"#4B5563",fontSize:13 }}>4 CVs analysés · Temps total : 1m 43s</span>
              <button style={{ background:"rgba(16,185,129,.1)",color:"#10B981",border:"1px solid rgba(16,185,129,.25)",padding:"7px 16px",borderRadius:8,fontSize:13,cursor:"pointer",fontWeight:700 }}>⬇️ Exporter CSV</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" style={{ padding:"100px 24px",background:"#07090F" }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:60 }}>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)",fontWeight:900,letterSpacing:-1.5,marginBottom:14 }}>Tarifs simples et transparents</h2>
            <p style={{ color:"#6B7A99",fontSize:16 }}>14 jours d'essai gratuit sur tous les plans. Annulable à tout moment.</p>
          </div>

          <div className="pricing-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }}>
            {PLANS.map((plan, i) => (
              <div key={i} className="pricing-card" style={{ background:plan.bg,border:`2px solid ${plan.border}`,borderRadius:24,padding:"36px 28px",position:"relative" }}>
                {plan.badge && (
                  <div style={{ position:"absolute",top:-15,left:"50%",transform:"translateX(-50%)",background:plan.badgeBg,color:"#fff",fontSize:11,fontWeight:800,padding:"5px 16px",borderRadius:20,whiteSpace:"nowrap" }}>{plan.badge}</div>
                )}
                <div style={{ fontSize:12,fontWeight:800,color:plan.color,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10 }}>{plan.name}</div>
                <div style={{ display:"flex",alignItems:"flex-end",gap:4,marginBottom:4 }}>
                  <span style={{ fontSize:52,fontWeight:900,letterSpacing:-2,color:"#F0F4FF",lineHeight:1 }}>{plan.price}€</span>
                  <span style={{ color:"#4B5563",fontSize:15,marginBottom:8 }}>/mois</span>
                </div>
                <div style={{ color:"#4B5563",fontSize:12,marginBottom:28 }}>Sans engagement · Annulation facile</div>
                <ul style={{ listStyle:"none",padding:0,margin:"0 0 32px",display:"flex",flexDirection:"column",gap:11 }}>
                  {plan.features.map((f,j) => (
                    <li key={j} style={{ display:"flex",alignItems:"center",gap:10,fontSize:13,color:"#8892AA" }}>
                      <span style={{ color:plan.border,flexShrink:0,fontSize:15 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button className="btn-primary" onClick={() => handleSubscribe(plan.plan)} disabled={checkoutLoading === plan.plan}
                  style={{ width:"100%",padding:"14px",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",background:"linear-gradient(135deg,#F97316,#EA580C)",border:"none",color:"#fff",opacity:checkoutLoading===plan.plan?0.6:1 }}>
                  {checkoutLoading === plan.plan ? "…" : "Démarrer l'essai →"}
                </button>
              </div>
            ))}
          </div>
          <p style={{ textAlign:"center",color:"#4B5563",fontSize:13,marginTop:24 }}>Paiement sécurisé par Stripe · Annulation à tout moment · Facture mensuelle</p>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ padding:"80px 24px",background:"#070B13",borderTop:"1px solid #1E2733" }}>
        <div style={{ maxWidth:900,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:52 }}>
            <h2 style={{ fontSize:"clamp(26px,4vw,44px)",fontWeight:900,letterSpacing:-1.5,marginBottom:12 }}>Questions fréquentes</h2>
          </div>
          <div className="faq-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            {FAQ.map((item, i) => (
              <div key={i} className="faq-item"
                style={{ background:"#0D1117",border:`1px solid ${openFaq===i?"rgba(249,115,22,.3)":"#1E2733"}`,borderRadius:16,padding:"20px 22px",cursor:"pointer" }}
                onClick={() => setOpenFaq(openFaq===i ? null : i)}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
                  <span style={{ fontWeight:700,fontSize:14,color:"#F0F4FF",lineHeight:1.5 }}>{item.q}</span>
                  <span style={{ color:"#F97316",fontSize:18,flexShrink:0,transition:"transform .2s",transform:openFaq===i?"rotate(45deg)":"none" }}>+</span>
                </div>
                {openFaq===i && <p style={{ color:"#6B7A99",fontSize:13,lineHeight:1.7,marginTop:12,borderTop:"1px solid #1E2733",paddingTop:12 }}>{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA FINAL ── */}
      <div style={{ padding:"100px 24px",background:"#07090F",textAlign:"center" }}>
        <div style={{ maxWidth:640,margin:"0 auto" }}>
          <div style={{ fontSize:56,marginBottom:20 }}>🚀</div>
          <h2 style={{ fontSize:"clamp(28px,4vw,48px)",fontWeight:900,letterSpacing:-1.5,marginBottom:16 }}>Prêt à recruter plus vite ?</h2>
          <p style={{ color:"#6B7A99",fontSize:17,marginBottom:40,lineHeight:1.7 }}>
            Rejoignez les équipes qui analysent leurs CVs en 2 minutes.<br />5 CVs gratuits, sans compte.
          </p>
          <button className="btn-primary" onClick={() => go("/hr/essai-gratuit")}
            style={{ background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"18px 48px",borderRadius:16,fontSize:18,fontWeight:800,cursor:"pointer" }}>
            Essayer gratuitement →
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid #1E2733",padding:"32px 40px" }}>
        <div className="footer-inner" style={{ maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:20 }}>
          <div>
            <div style={{ fontWeight:900,fontSize:18,letterSpacing:-0.5,marginBottom:4 }}>
              Doc<span style={{ color:"#F97316" }}>Swift HR</span>
            </div>
            <div style={{ color:"#4B5563",fontSize:12 }}>© 2026 Mokoto LLC — DocSwift HR. Recrutement assisté par IA.</div>
          </div>
          <div style={{ display:"flex",gap:24,flexWrap:"wrap" }}>
            <a href={`${localePrefix}/hr/dashboard`} style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>Dashboard</a>
            <a href={`${localePrefix}/hr/essai-gratuit`} style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>Essai gratuit</a>
            <a href="#pricing" style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>Tarifs</a>
            <a href={`${localePrefix}/terms`} style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>Confidentialité & CGU</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
