"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter }          from "next/navigation";

const CSS = `
  @keyframes blob1 {
    0%,100%{transform:translate(0,0) scale(1)}
    33%{transform:translate(40px,-60px) scale(1.1)}
    66%{transform:translate(-30px,30px) scale(0.9)}
  }
  @keyframes blob2 {
    0%,100%{transform:translate(0,0) scale(1)}
    33%{transform:translate(-50px,70px) scale(1.05)}
    66%{transform:translate(30px,-40px) scale(0.95)}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(24px)}
    to{opacity:1;transform:translateY(0)}
  }
  @keyframes pulse-dot {
    0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.6)}
    50%{box-shadow:0 0 0 6px rgba(16,185,129,0)}
  }
  .hero-text{animation:fadeUp .9s ease both}
  .hero-sub{animation:fadeUp .9s .15s ease both;opacity:0}
  .hero-ctas{animation:fadeUp .9s .3s ease both;opacity:0}
  .hero-trust{animation:fadeUp .9s .45s ease both;opacity:0}
  .pulse-dot{animation:pulse-dot 2s infinite}
  .btn-primary{transition:all .2s ease}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(59,130,246,.45)}
  .btn-secondary{transition:all .2s ease}
  .btn-secondary:hover{border-color:#3B82F6!important;color:#F0F4FF!important}
  .tool-card{transition:all .22s cubic-bezier(.4,0,.2,1)}
  .tool-card:hover{transform:translateY(-6px);box-shadow:0 24px 48px rgba(0,0,0,.4)}
  .testi-card{transition:all .22s ease}
  .testi-card:hover{transform:translateY(-4px);border-color:rgba(59,130,246,.35)!important}
  .nav-link{transition:color .15s}
  .nav-link:hover{color:#F0F4FF!important}
  .gradient-text{
    background:linear-gradient(135deg,#FFFFFF 0%,#93C5FD 45%,#818CF8 100%);
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
    background-clip:text;
  }
  .stat-card:hover{border-color:rgba(59,130,246,.25)!important;background:#0D1520!important}
  .stat-card{transition:all .2s}
  @media(max-width:768px){
    .nav-links{display:none!important}
    .tools-grid{grid-template-columns:1fr 1fr!important}
    .hero-h1{font-size:42px!important}
    .pricing-grid{grid-template-columns:1fr!important}
    .testi-grid{grid-template-columns:1fr!important}
    .stats-bar{grid-template-columns:1fr 1fr!important}
    .steps-grid{grid-template-columns:1fr 1fr!important}
  }
`;

const TOOLS = [
  {icon:"📝",name:"PDF → Word",   desc:"Convertissez tout PDF en document Word entièrement éditable.",href:"/tools?tool=pdf-to-word", color:"#3B82F6",glow:"rgba(59,130,246,.18)", tag:"Le plus utilisé",tagC:"#10B981"},
  {icon:"🔄",name:"Word → PDF",   desc:"Transformez vos .docx en PDF pixel-perfect en un clic.",      href:"/tools?tool=word-to-pdf", color:"#6366F1",glow:"rgba(99,102,241,.15)"},
  {icon:"🗜️",name:"Compresser PDF",desc:"Réduisez le poids de vos PDFs jusqu'à 80% sans perte visible.",href:"/tools?tool=compress-pdf",color:"#F59E0B",glow:"rgba(245,158,11,.15)",tag:"Gain max 80%",tagC:"#F59E0B"},
  {icon:"🔗",name:"Fusionner PDFs",desc:"Combinez plusieurs PDFs en un seul document propre.",          href:"/tools?tool=merge-pdf",   color:"#10B981",glow:"rgba(16,185,129,.15)"},
  {icon:"✂️",name:"Diviser PDF",   desc:"Extrayez précisément la ou les pages dont vous avez besoin.",  href:"/tools?tool=split-pdf",   color:"#EC4899",glow:"rgba(236,72,153,.15)"},
  {icon:"🖼️",name:"Image → PDF",  desc:"Convertissez vos photos JPG/PNG en PDF professionnel.",        href:"/tools?tool=image-to-pdf",color:"#8B5CF6",glow:"rgba(139,92,246,.15)"},
  {icon:"📄",name:"Créer un CV",   desc:"Générez un CV pro en PDF en remplissant un formulaire guidé.", href:"/cv",                      color:"#14B8A6",glow:"rgba(20,184,166,.15)",tag:"Nouveau ✨",tagC:"#14B8A6"},
];

const STATS = [
  {value:"120 000+",label:"Documents traités"},
  {value:"15 000+", label:"Utilisateurs actifs"},
  {value:"< 10s",   label:"Temps moyen"},
  {value:"4.9 ★",   label:"Satisfaction"},
];

const TESTIMONIALS = [
  {name:"Sophie M.",role:"Assistante RH, Paris",  text:"J'utilise DocSwift tous les jours pour convertir les CV des candidats. En 10 secondes c'est fait — bluffant.",stars:5,av:"S",grad:"135deg,#3B82F6,#6366F1"},
  {name:"Thomas R.",role:"Consultant freelance",   text:"Le compresseur PDF est incroyable. J'ai réduit un rapport de 45 Mo à 6 Mo sans aucune perte de qualité visible.",stars:5,av:"T",grad:"135deg,#F59E0B,#EF4444"},
  {name:"Amina K.", role:"Étudiante en master",    text:"J'ai créé mon CV en 5 minutes avec le générateur. Rendu super professionnel, téléchargé directement en PDF.",stars:5,av:"A",grad:"135deg,#10B981,#14B8A6"},
];

const STEPS = [
  {n:"01",icon:"📂",title:"Choisissez un outil",   desc:"Sélectionnez parmi nos 7 outils l'action dont vous avez besoin."},
  {n:"02",icon:"⬆️",title:"Déposez votre fichier", desc:"Glissez-déposez votre document ou cliquez pour le sélectionner."},
  {n:"03",icon:"⚡",title:"Traitement express",    desc:"Votre fichier est traité côté serveur en quelques secondes."},
  {n:"04",icon:"⬇️",title:"Téléchargez",           desc:"Récupérez votre document transformé, immédiatement prêt à l'emploi."},
];

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const go = (path) => router.push(path);

  const handleUpgrade = async () => {
    if (!session) { signIn(); return; }
    const res  = await fetch("/api/stripe/checkout", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ affiliateCode: typeof window !== "undefined" ? localStorage.getItem("docswift_ref") : null }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div style={{ minHeight:"100vh", background:"#07090F", color:"#F0F4FF", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", overflowX:"hidden" }}>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:200,padding:"16px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(7,9,15,.88)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(30,39,51,.9)" }}>
        <div style={{ fontWeight:900,fontSize:22,letterSpacing:-1,cursor:"pointer" }} onClick={() => go("/")}>
          Doc<span style={{ color:"#3B82F6" }}>Swift</span>
        </div>
        <div className="nav-links" style={{ display:"flex",gap:28,alignItems:"center" }}>
          <a href="#tools"   className="nav-link" style={{ color:"#8892AA",textDecoration:"none",fontSize:14 }}>Outils</a>
          <a href="#how"     className="nav-link" style={{ color:"#8892AA",textDecoration:"none",fontSize:14 }}>Comment ça marche</a>
          <a href="#pricing" className="nav-link" style={{ color:"#8892AA",textDecoration:"none",fontSize:14 }}>Tarifs</a>
          {session
            ? <button className="btn-primary" onClick={() => go("/tools")} style={{ background:"#3B82F6",color:"#fff",padding:"9px 22px",borderRadius:8,fontSize:14,fontWeight:700,border:"none",cursor:"pointer" }}>Mes outils</button>
            : <button className="btn-primary" onClick={() => signIn()}     style={{ background:"#3B82F6",color:"#fff",padding:"9px 22px",borderRadius:8,fontSize:14,fontWeight:700,border:"none",cursor:"pointer" }}>Connexion</button>
          }
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position:"relative",overflow:"hidden",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"130px 24px 80px" }}>
        {/* Blobs */}
        <div style={{ position:"absolute",top:"18%",left:"12%",width:560,height:560,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,.1) 0%,transparent 65%)",animation:"blob1 9s ease-in-out infinite",pointerEvents:"none" }} />
        <div style={{ position:"absolute",top:"35%",right:"8%", width:440,height:440,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,.09) 0%,transparent 65%)",animation:"blob2 11s ease-in-out infinite",pointerEvents:"none" }} />
        <div style={{ position:"absolute",bottom:"15%",left:"40%",width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(20,184,166,.07) 0%,transparent 65%)",animation:"blob1 13s ease-in-out infinite 2s",pointerEvents:"none" }} />

        <div style={{ position:"relative",zIndex:1,maxWidth:820 }}>
          {/* Badge */}
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.22)",color:"#93C5FD",padding:"6px 18px",borderRadius:40,fontSize:13,fontWeight:600,marginBottom:32 }}>
            <span className="pulse-dot" style={{ width:7,height:7,background:"#10B981",borderRadius:"50%",display:"inline-block" }} />
            7 outils PDF · Gratuit · Sans inscription
          </div>

          <h1 className="hero-text hero-h1" style={{ fontSize:"clamp(44px,7.5vw,86px)",fontWeight:900,letterSpacing:-3,lineHeight:1.01,marginBottom:24 }}>
            <span className="gradient-text">Vos documents,</span><br />
            transformés en secondes.
          </h1>

          <p className="hero-sub" style={{ color:"#8892AA",fontSize:19,maxWidth:520,margin:"0 auto 48px",lineHeight:1.7 }}>
            Convertissez, compressez, fusionnez vos PDFs et créez votre CV professionnel. Rapide, gratuit, sécurisé.
          </p>

          <div className="hero-ctas" style={{ display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap" }}>
            <button className="btn-primary" onClick={() => go("/tools")} style={{ background:"linear-gradient(135deg,#3B82F6,#2563EB)",color:"#fff",padding:"16px 38px",borderRadius:14,fontSize:17,fontWeight:800,border:"none",cursor:"pointer",letterSpacing:-.3 }}>
              Commencer gratuitement →
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById("tools")?.scrollIntoView({behavior:"smooth"})}
              style={{ background:"rgba(30,39,51,.6)",color:"#C0CBE0",padding:"16px 28px",borderRadius:14,fontSize:16,cursor:"pointer",border:"1px solid #1E2733",backdropFilter:"blur(10px)" }}>
              Voir les outils
            </button>
          </div>

          <p className="hero-trust" style={{ marginTop:28,color:"#4B5563",fontSize:13 }}>
            ✓ Sans inscription &nbsp;·&nbsp; ✓ Données sécurisées &nbsp;·&nbsp; ✓ Fichiers supprimés après traitement
          </p>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ borderTop:"1px solid #1E2733",borderBottom:"1px solid #1E2733",padding:"32px 24px",background:"rgba(13,17,23,.9)" }}>
        <div className="stats-bar" style={{ maxWidth:920,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24,textAlign:"center" }}>
          {STATS.map(s => (
            <div key={s.label} className="stat-card" style={{ padding:"16px 12px",borderRadius:14,border:"1px solid transparent",cursor:"default" }}>
              <div style={{ fontSize:30,fontWeight:900,color:"#F0F4FF",letterSpacing:-1 }}>{s.value}</div>
              <div style={{ fontSize:13,color:"#6B7A99",marginTop:5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TOOLS ── */}
      <div id="tools" style={{ padding:"100px 24px",background:"#07090F" }}>
        <div style={{ maxWidth:1200,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:64 }}>
            <div style={{ display:"inline-block",background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.15)",color:"#93C5FD",padding:"5px 16px",borderRadius:20,fontSize:11,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",marginBottom:18 }}>
              Outils disponibles
            </div>
            <h2 style={{ fontSize:"clamp(28px,4vw,50px)",fontWeight:900,letterSpacing:-1.5,marginBottom:14 }}>
              Tout ce dont vous avez besoin
            </h2>
            <p style={{ color:"#6B7A99",fontSize:16,maxWidth:480,margin:"0 auto" }}>
              7 outils essentiels, disponibles sans compte et sans aucune installation.
            </p>
          </div>

          <div className="tools-grid" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:20 }}>
            {TOOLS.map(t => (
              <div key={t.name} className="tool-card" onClick={() => go(t.href)}
                style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:22,padding:28,cursor:"pointer",position:"relative",overflow:"hidden" }}>

                {/* Glow top-right */}
                <div style={{ position:"absolute",top:0,right:0,width:130,height:130,background:`radial-gradient(circle at top right,${t.glow},transparent 70%)`,pointerEvents:"none" }} />

                {/* Tag */}
                {t.tag && (
                  <span style={{ position:"absolute",top:18,right:18,background:`${t.tagC}18`,color:t.tagC,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,border:`1px solid ${t.tagC}35` }}>
                    {t.tag}
                  </span>
                )}

                {/* Icon box */}
                <div style={{ width:50,height:50,borderRadius:14,background:`${t.color}18`,border:`1px solid ${t.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:18 }}>
                  {t.icon}
                </div>

                <div style={{ fontWeight:800,fontSize:17,marginBottom:8,color:"#F0F4FF" }}>{t.name}</div>
                <div style={{ color:"#6B7A99",fontSize:13,lineHeight:1.65,marginBottom:20 }}>{t.desc}</div>

                <div style={{ display:"flex",alignItems:"center",gap:6,color:t.color,fontSize:13,fontWeight:700 }}>
                  Utiliser cet outil <span>→</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign:"center",marginTop:48 }}>
            <button className="btn-primary" onClick={() => go("/tools")}
              style={{ background:"linear-gradient(135deg,#3B82F6,#2563EB)",color:"#fff",border:"none",padding:"15px 38px",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer" }}>
              Accéder à tous les outils →
            </button>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div id="how" style={{ padding:"100px 24px",background:"#070B13",borderTop:"1px solid #1E2733",borderBottom:"1px solid #1E2733" }}>
        <div style={{ maxWidth:1000,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:64 }}>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)",fontWeight:900,letterSpacing:-1.5,marginBottom:14 }}>
              Simple comme bonjour
            </h2>
            <p style={{ color:"#6B7A99",fontSize:16 }}>
              Aucune inscription, aucun logiciel. Tout se passe dans votre navigateur.
            </p>
          </div>

          <div className="steps-grid" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:32,position:"relative" }}>
            {/* Connecting line */}
            <div style={{ position:"absolute",top:28,left:"12%",right:"12%",height:1,background:"linear-gradient(90deg,transparent,#1E2733 20%,#1E2733 80%,transparent)",zIndex:0 }} />

            {STEPS.map((s,i) => (
              <div key={s.n} style={{ textAlign:"center",position:"relative",zIndex:1 }}>
                <div style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:56,height:56,borderRadius:16,background:"#0D1117",border:"1px solid rgba(59,130,246,.3)",fontSize:11,fontWeight:900,color:"#93C5FD",letterSpacing:1,marginBottom:18,boxShadow:"0 0 20px rgba(59,130,246,.1)" }}>
                  {s.n}
                </div>
                <div style={{ fontSize:30,marginBottom:12 }}>{s.icon}</div>
                <div style={{ fontWeight:700,fontSize:15,marginBottom:8 }}>{s.title}</div>
                <div style={{ color:"#6B7A99",fontSize:13,lineHeight:1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={{ padding:"100px 24px",background:"#07090F" }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:60 }}>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)",fontWeight:900,letterSpacing:-1.5,marginBottom:14 }}>
              Ils font confiance à DocSwift
            </h2>
            <p style={{ color:"#6B7A99",fontSize:16 }}>
              Des milliers d'utilisateurs convertissent leurs fichiers chaque jour.
            </p>
          </div>

          <div className="testi-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testi-card" style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:22,padding:28 }}>
                <div style={{ display:"flex",gap:2,marginBottom:16 }}>
                  {Array.from({length:t.stars}).map((_,i) => <span key={i} style={{ color:"#F59E0B",fontSize:16 }}>★</span>)}
                </div>
                <p style={{ color:"#C0CBE0",fontSize:14,lineHeight:1.75,marginBottom:22 }}>"{t.text}"</p>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:40,height:40,borderRadius:"50%",background:`linear-gradient(${t.grad})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,color:"#fff",flexShrink:0 }}>
                    {t.av}
                  </div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:14,color:"#F0F4FF" }}>{t.name}</div>
                    <div style={{ fontSize:12,color:"#6B7A99" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" style={{ padding:"100px 24px",background:"#070B13",borderTop:"1px solid #1E2733" }}>
        <div style={{ maxWidth:820,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:60 }}>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)",fontWeight:900,letterSpacing:-1.5,marginBottom:14 }}>
              Tarifs simples et transparents
            </h2>
            <p style={{ color:"#6B7A99",fontSize:16 }}>
              Commencez gratuitement. Passez au Pro quand vous en avez besoin.
            </p>
          </div>

          <div className="pricing-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }}>
            {/* FREE */}
            <div style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:24,padding:"36px 32px" }}>
              <div style={{ fontSize:12,fontWeight:800,color:"#6B7A99",letterSpacing:1.5,textTransform:"uppercase",marginBottom:10 }}>Gratuit</div>
              <div style={{ fontSize:54,fontWeight:900,letterSpacing:-2,color:"#F0F4FF",lineHeight:1 }}>0€</div>
              <div style={{ color:"#4B5563",fontSize:14,marginBottom:28,marginTop:4 }}>pour toujours</div>
              <ul style={{ listStyle:"none",padding:0,margin:"0 0 32px",display:"flex",flexDirection:"column",gap:13 }}>
                {["5 conversions par jour","Tous les 7 outils","Fichiers jusqu'à 5 MB","Publicités affichées","+3 via pub vidéo"].map(f => (
                  <li key={f} style={{ display:"flex",alignItems:"center",gap:10,fontSize:14,color:"#8892AA" }}>
                    <span style={{ color:"#4B5563",flexShrink:0,fontSize:16 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => go("/tools")} style={{ width:"100%",padding:"13px",borderRadius:12,border:"1px solid #1E2733",background:"transparent",color:"#F0F4FF",fontSize:15,fontWeight:600,cursor:"pointer" }}>
                Commencer gratuitement
              </button>
            </div>

            {/* PRO */}
            <div style={{ background:"linear-gradient(145deg,#0D1F3C,#132240)",border:"2px solid #3B82F6",borderRadius:24,padding:"36px 32px",position:"relative" }}>
              <div style={{ position:"absolute",top:-15,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#3B82F6,#2563EB)",color:"#fff",fontSize:11,fontWeight:800,padding:"5px 18px",borderRadius:20,whiteSpace:"nowrap",letterSpacing:.5 }}>
                LE PLUS POPULAIRE
              </div>
              <div style={{ fontSize:12,fontWeight:800,color:"#60A5FA",letterSpacing:1.5,textTransform:"uppercase",marginBottom:10 }}>Pro</div>
              <div style={{ fontSize:54,fontWeight:900,letterSpacing:-2,color:"#fff",lineHeight:1 }}>9,99€</div>
              <div style={{ color:"#60A5FA",fontSize:14,marginBottom:28,marginTop:4 }}>par mois · sans engagement</div>
              <ul style={{ listStyle:"none",padding:0,margin:"0 0 32px",display:"flex",flexDirection:"column",gap:13 }}>
                {["Conversions illimitées","Tous les 7 outils","Fichiers jusqu'à 50 MB","Zéro publicité","Traitement prioritaire","Support par email"].map(f => (
                  <li key={f} style={{ display:"flex",alignItems:"center",gap:10,fontSize:14,color:"#D1E8FF" }}>
                    <span style={{ color:"#3B82F6",flexShrink:0,fontSize:16 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button className="btn-primary" onClick={handleUpgrade}
                style={{ width:"100%",padding:"14px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#3B82F6,#2563EB)",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer" }}>
                {session ? "Passer au Pro →" : "S'inscrire et passer au Pro →"}
              </button>
            </div>
          </div>

          <p style={{ textAlign:"center",color:"#4B5563",fontSize:13,marginTop:24 }}>
            Paiement sécurisé par Stripe · Annulation à tout moment · Sans carte pour le plan gratuit
          </p>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding:"100px 24px",background:"#07090F",textAlign:"center" }}>
        <div style={{ maxWidth:600,margin:"0 auto" }}>
          <div style={{ fontSize:56,marginBottom:20 }}>🚀</div>
          <h2 style={{ fontSize:"clamp(28px,4vw,48px)",fontWeight:900,letterSpacing:-1.5,marginBottom:16 }}>
            Prêt à gagner du temps ?
          </h2>
          <p style={{ color:"#6B7A99",fontSize:17,marginBottom:40,lineHeight:1.7 }}>
            Rejoignez 15 000+ utilisateurs qui traitent leurs documents avec DocSwift chaque jour.
          </p>
          <button className="btn-primary" onClick={() => go("/tools")}
            style={{ background:"linear-gradient(135deg,#3B82F6,#2563EB)",color:"#fff",border:"none",padding:"18px 48px",borderRadius:16,fontSize:18,fontWeight:800,cursor:"pointer" }}>
            Essayer maintenant — c'est gratuit →
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid #1E2733",padding:"32px 40px" }}>
        <div style={{ maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:20 }}>
          <div>
            <div style={{ fontWeight:900,fontSize:18,letterSpacing:-0.5,marginBottom:4 }}>
              Doc<span style={{ color:"#3B82F6" }}>Swift</span>
            </div>
            <div style={{ color:"#4B5563",fontSize:12 }}>© 2026 DocSwift. Tous droits réservés.</div>
          </div>
          <div style={{ display:"flex",gap:24,flexWrap:"wrap" }}>
            <a href="/tools"   style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>Outils</a>
            <a href="/cv"      style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>Créer un CV</a>
            <a href="#pricing" style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>Tarifs</a>
            <a href="/privacy" style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>Confidentialité</a>
            <a href="/terms"   style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>CGU</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
