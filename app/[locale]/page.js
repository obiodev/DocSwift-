"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import LanguageSwitcher from "../../components/LanguageSwitcher";

const CSS = `
  @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-60px) scale(1.1)} 66%{transform:translate(-30px,30px) scale(0.9)} }
  @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,70px) scale(1.05)} 66%{transform:translate(30px,-40px) scale(0.95)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  .hero-text{animation:fadeUp .9s ease both}
  .hero-sub{animation:fadeUp .9s .15s ease both;opacity:0}
  .product-card{transition:all .22s cubic-bezier(.4,0,.2,1)}
  .product-card:hover{transform:translateY(-6px);box-shadow:0 24px 48px rgba(0,0,0,.4)}
  .nav-link{transition:color .15s}
  .nav-link:hover{color:#F0F4FF!important}
  .btn-primary{transition:all .2s ease}
  .btn-primary:hover{transform:translateY(-2px)}
  @media(max-width:768px){
    .nav-wrap{padding:12px 16px!important}
    .products-grid{grid-template-columns:1fr!important}
    .hero-h1{font-size:32px!important}
  }
`;

export default function Home() {
  const locale = useLocale();
  const { data: session } = useSession();
  const router = useRouter();
  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  const go = (path) => router.push(`${localePrefix}${path}`);

  return (
    <div style={{ minHeight:"100vh", background:"#07090F", color:"#F0F4FF", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", overflowX:"hidden" }}>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className="nav-wrap" style={{ position:"fixed",top:0,left:0,right:0,zIndex:200,padding:"16px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(7,9,15,.92)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(30,39,51,.9)" }}>
        <div style={{ fontWeight:900,fontSize:22,letterSpacing:-1 }}>
          Doc<span style={{ color:"#3B82F6" }}>Swift</span>
        </div>
        <div style={{ display:"flex",gap:20,alignItems:"center" }}>
          <LanguageSwitcher />
          {session
            ? <button className="btn-primary" onClick={() => go("/dashboard")} style={{ background:"#3B82F6",color:"#fff",padding:"9px 22px",borderRadius:8,fontSize:14,fontWeight:700,border:"none",cursor:"pointer" }}>Dashboard →</button>
            : <button className="btn-primary" onClick={() => signIn()} style={{ background:"#3B82F6",color:"#fff",padding:"9px 22px",borderRadius:8,fontSize:14,fontWeight:700,border:"none",cursor:"pointer" }}>Connexion</button>
          }
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position:"relative",overflow:"hidden",minHeight:"70vh",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"140px 24px 60px" }}>
        <div style={{ position:"absolute",top:"18%",left:"12%",width:560,height:560,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,.08) 0%,transparent 65%)",animation:"blob1 9s ease-in-out infinite",pointerEvents:"none" }} />
        <div style={{ position:"absolute",top:"35%",right:"8%", width:440,height:440,borderRadius:"50%",background:"radial-gradient(circle,rgba(249,115,22,.07) 0%,transparent 65%)",animation:"blob2 11s ease-in-out infinite",pointerEvents:"none" }} />

        <div style={{ position:"relative",zIndex:1,maxWidth:760 }}>
          <h1 className="hero-text hero-h1" style={{ fontSize:"clamp(32px,5.5vw,58px)",fontWeight:900,letterSpacing:-2,lineHeight:1.1,marginBottom:20 }}>
            L'assistant intelligent pour vos documents.
          </h1>
          <p className="hero-sub" style={{ color:"#8892AA",fontSize:18,maxWidth:540,margin:"0 auto",lineHeight:1.7 }}>
            Deux produits DocSwift, chacun conçu pour un usage précis.
          </p>
        </div>
      </div>

      {/* ── PRODUCTS ── */}
      <div style={{ padding:"20px 24px 120px" }}>
        <div className="products-grid" style={{ maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }}>

          <div className="product-card" style={{ background:"#0D1117",border:"2px solid #1E2733",borderRadius:24,padding:"40px 36px",cursor:"pointer" }} onClick={() => go("/academic")}>
            <div style={{ fontSize:40,marginBottom:18 }}>📄</div>
            <h2 style={{ fontSize:24,fontWeight:900,letterSpacing:-0.8,marginBottom:10 }}>DocSwift <span style={{ color:"#3B82F6" }}>Academic</span></h2>
            <p style={{ color:"#8892AA",fontSize:15,lineHeight:1.7,marginBottom:24 }}>
              Convertissez, compressez et chattez avec vos PDFs par IA. Créez votre CV professionnel. Gratuit pour commencer.
            </p>
            <div style={{ color:"#3B82F6",fontSize:14,fontWeight:700 }}>Découvrir →</div>
          </div>

          <div className="product-card" style={{ background:"#0D1117",border:"2px solid #1E2733",borderRadius:24,padding:"40px 36px",cursor:"pointer" }} onClick={() => go("/hr")}>
            <div style={{ fontSize:40,marginBottom:18 }}>👥</div>
            <h2 style={{ fontSize:24,fontWeight:900,letterSpacing:-0.8,marginBottom:10 }}>DocSwift <span style={{ color:"#F97316" }}>HR</span></h2>
            <p style={{ color:"#8892AA",fontSize:15,lineHeight:1.7,marginBottom:24 }}>
              Analysez jusqu'à 100 CVs en 2 minutes par IA. Scoring automatique, matching poste/candidat, export CSV. Pour recruteurs et cabinets RH.
            </p>
            <div style={{ color:"#F97316",fontSize:14,fontWeight:700 }}>Découvrir →</div>
          </div>

        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid #1E2733",padding:"32px 40px" }}>
        <div style={{ maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:20 }}>
          <div>
            <div style={{ fontWeight:900,fontSize:18,letterSpacing:-0.5,marginBottom:4 }}>Doc<span style={{ color:"#3B82F6" }}>Swift</span></div>
            <div style={{ color:"#4B5563",fontSize:12 }}>© 2026 Mokoto LLC — DocSwift.</div>
          </div>
          <div style={{ display:"flex",gap:24,flexWrap:"wrap" }}>
            <a href={`${localePrefix}/academic`} style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>DocSwift Academic</a>
            <a href={`${localePrefix}/hr`}       style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>DocSwift HR</a>
            <a href={`${localePrefix}/terms`}    style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>Confidentialité & CGU</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
