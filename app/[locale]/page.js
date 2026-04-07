"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter }          from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from '../../components/LanguageSwitcher';

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

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const { data: session } = useSession();
  const router = useRouter();
  const [pricing, setPricing] = useState({ promo_enabled:"true", promo_price:"4.99", promo_months:"3", normal_price:"9.99" });

  useEffect(() => {
    fetch("/api/settings").then(r=>r.json()).then(d=>setPricing(d)).catch(()=>{});
  }, []);

  const isPromo     = pricing.promo_enabled === "true";
  const promoPrice  = pricing.promo_price   ?? "4.99";
  const promoMonths = pricing.promo_months  ?? "3";
  const normalPrice = pricing.normal_price  ?? "9.99";

  const localePrefix = locale === 'fr' ? '' : `/${locale}`;
  const go = (path) => router.push(`${localePrefix}${path}`);

  const handleUpgrade = async () => {
    if (!session) { signIn(); return; }
    const res  = await fetch("/api/stripe/checkout", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ affiliateCode: typeof window !== "undefined" ? localStorage.getItem("docswift_ref") : null }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const TOOLS = [
    {icon:"📝", nameKey:"landing.tools.pdfToWord.name",  descKey:"landing.tools.pdfToWord.desc",  href:"/tools?tool=pdf-to-word", color:"#3B82F6", glow:"rgba(59,130,246,.18)", tagKey:"landing.tools.pdfToWord.tag", tagC:"#10B981"},
    {icon:"🔄", nameKey:"landing.tools.wordToPdf.name",  descKey:"landing.tools.wordToPdf.desc",  href:"/tools?tool=word-to-pdf", color:"#6366F1", glow:"rgba(99,102,241,.15)"},
    {icon:"🗜️",nameKey:"landing.tools.compressPdf.name", descKey:"landing.tools.compressPdf.desc", href:"/tools?tool=compress-pdf",color:"#F59E0B", glow:"rgba(245,158,11,.15)", tagKey:"landing.tools.compressPdf.tag", tagC:"#F59E0B"},
    {icon:"🔗", nameKey:"landing.tools.mergePdf.name",   descKey:"landing.tools.mergePdf.desc",   href:"/tools?tool=merge-pdf",   color:"#10B981", glow:"rgba(16,185,129,.15)"},
    {icon:"✂️", nameKey:"landing.tools.splitPdf.name",   descKey:"landing.tools.splitPdf.desc",   href:"/tools?tool=split-pdf",   color:"#EC4899", glow:"rgba(236,72,153,.15)"},
    {icon:"🖼️",nameKey:"landing.tools.imageToPdf.name",  descKey:"landing.tools.imageToPdf.desc",  href:"/tools?tool=image-to-pdf",color:"#8B5CF6", glow:"rgba(139,92,246,.15)"},
    {icon:"📄", nameKey:"landing.tools.createCv.name",   descKey:"landing.tools.createCv.desc",   href:"/cv",                     color:"#14B8A6", glow:"rgba(20,184,166,.15)", tagKey:"landing.tools.createCv.tag", tagC:"#14B8A6"},
  ];

  const STATS = [
    {value:"120 000+", labelKey:"landing.stats.docs"},
    {value:"15 000+",  labelKey:"landing.stats.users"},
    {value:"< 10s",    labelKey:"landing.stats.time"},
    {value:"4.9 ★",    labelKey:"landing.stats.rating"},
  ];

  const TESTIMONIALS = [
    {name:t('landing.testimonials.t1Name'), role:t('landing.testimonials.t1Role'), text:t('landing.testimonials.t1Text'), stars:5, av:"S", grad:"135deg,#3B82F6,#6366F1"},
    {name:t('landing.testimonials.t2Name'), role:t('landing.testimonials.t2Role'), text:t('landing.testimonials.t2Text'), stars:5, av:"T", grad:"135deg,#F59E0B,#EF4444"},
    {name:t('landing.testimonials.t3Name'), role:t('landing.testimonials.t3Role'), text:t('landing.testimonials.t3Text'), stars:5, av:"A", grad:"135deg,#10B981,#14B8A6"},
  ];

  const STEPS = [
    {n:"01", icon:"📂", titleKey:"landing.how.step1Title", descKey:"landing.how.step1Desc"},
    {n:"02", icon:"⬆️", titleKey:"landing.how.step2Title", descKey:"landing.how.step2Desc"},
    {n:"03", icon:"⚡", titleKey:"landing.how.step3Title", descKey:"landing.how.step3Desc"},
    {n:"04", icon:"⬇️", titleKey:"landing.how.step4Title", descKey:"landing.how.step4Desc"},
  ];

  const FREE_FEATURES = t.raw('landing.pricing.freeFeatures');
  const PRO_FEATURES  = t.raw('landing.pricing.proFeatures');

  return (
    <div style={{ minHeight:"100vh", background:"#07090F", color:"#F0F4FF", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", overflowX:"hidden" }}>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:200,padding:"16px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(7,9,15,.88)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(30,39,51,.9)" }}>
        <div style={{ fontWeight:900,fontSize:22,letterSpacing:-1,cursor:"pointer" }} onClick={() => go("/")}>
          Doc<span style={{ color:"#3B82F6" }}>Swift</span>
        </div>
        <div className="nav-links" style={{ display:"flex",gap:28,alignItems:"center" }}>
          <a href="#tools"   className="nav-link" style={{ color:"#8892AA",textDecoration:"none",fontSize:14 }}>{t('nav.tools')}</a>
          <a href="#how"     className="nav-link" style={{ color:"#8892AA",textDecoration:"none",fontSize:14 }}>{t('nav.howItWorks')}</a>
          <a href="#pricing" className="nav-link" style={{ color:"#8892AA",textDecoration:"none",fontSize:14 }}>{t('nav.pricing')}</a>
          <LanguageSwitcher />
          {session
            ? <button className="btn-primary" onClick={() => go("/tools")} style={{ background:"#3B82F6",color:"#fff",padding:"9px 22px",borderRadius:8,fontSize:14,fontWeight:700,border:"none",cursor:"pointer" }}>{t('nav.myTools')}</button>
            : <button className="btn-primary" onClick={() => signIn()}     style={{ background:"#3B82F6",color:"#fff",padding:"9px 22px",borderRadius:8,fontSize:14,fontWeight:700,border:"none",cursor:"pointer" }}>{t('nav.login')}</button>
          }
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position:"relative",overflow:"hidden",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"130px 24px 80px" }}>
        <div style={{ position:"absolute",top:"18%",left:"12%",width:560,height:560,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,.1) 0%,transparent 65%)",animation:"blob1 9s ease-in-out infinite",pointerEvents:"none" }} />
        <div style={{ position:"absolute",top:"35%",right:"8%", width:440,height:440,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,.09) 0%,transparent 65%)",animation:"blob2 11s ease-in-out infinite",pointerEvents:"none" }} />
        <div style={{ position:"absolute",bottom:"15%",left:"40%",width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(20,184,166,.07) 0%,transparent 65%)",animation:"blob1 13s ease-in-out infinite 2s",pointerEvents:"none" }} />

        <div style={{ position:"relative",zIndex:1,maxWidth:820 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.22)",color:"#93C5FD",padding:"6px 18px",borderRadius:40,fontSize:13,fontWeight:600,marginBottom:32 }}>
            <span className="pulse-dot" style={{ width:7,height:7,background:"#10B981",borderRadius:"50%",display:"inline-block" }} />
            {t('landing.badge')}
          </div>

          <h1 className="hero-text hero-h1" style={{ fontSize:"clamp(44px,7.5vw,86px)",fontWeight:900,letterSpacing:-3,lineHeight:1.01,marginBottom:24 }}>
            <span className="gradient-text">{t('landing.hero.title1')}</span><br />
            {t('landing.hero.title2')}
          </h1>

          <p className="hero-sub" style={{ color:"#8892AA",fontSize:19,maxWidth:520,margin:"0 auto 48px",lineHeight:1.7 }}>
            {t('landing.hero.subtitle')}
          </p>

          <div className="hero-ctas" style={{ display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap" }}>
            <button className="btn-primary" onClick={() => go("/tools")} style={{ background:"linear-gradient(135deg,#3B82F6,#2563EB)",color:"#fff",padding:"16px 38px",borderRadius:14,fontSize:17,fontWeight:800,border:"none",cursor:"pointer",letterSpacing:-.3 }}>
              {t('landing.hero.ctaStart')}
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById("tools")?.scrollIntoView({behavior:"smooth"})}
              style={{ background:"rgba(30,39,51,.6)",color:"#C0CBE0",padding:"16px 28px",borderRadius:14,fontSize:16,cursor:"pointer",border:"1px solid #1E2733",backdropFilter:"blur(10px)" }}>
              {t('landing.hero.ctaTools')}
            </button>
          </div>

          <p className="hero-trust" style={{ marginTop:28,color:"#4B5563",fontSize:13 }}>
            {t('landing.hero.trust')}
          </p>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ borderTop:"1px solid #1E2733",borderBottom:"1px solid #1E2733",padding:"32px 24px",background:"rgba(13,17,23,.9)" }}>
        <div className="stats-bar" style={{ maxWidth:920,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24,textAlign:"center" }}>
          {STATS.map(s => (
            <div key={s.labelKey} className="stat-card" style={{ padding:"16px 12px",borderRadius:14,border:"1px solid transparent",cursor:"default" }}>
              <div style={{ fontSize:30,fontWeight:900,color:"#F0F4FF",letterSpacing:-1 }}>{s.value}</div>
              <div style={{ fontSize:13,color:"#6B7A99",marginTop:5 }}>{t(s.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TOOLS ── */}
      <div id="tools" style={{ padding:"100px 24px",background:"#07090F" }}>
        <div style={{ maxWidth:1200,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:64 }}>
            <div style={{ display:"inline-block",background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.15)",color:"#93C5FD",padding:"5px 16px",borderRadius:20,fontSize:11,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",marginBottom:18 }}>
              {t('landing.tools.sectionBadge')}
            </div>
            <h2 style={{ fontSize:"clamp(28px,4vw,50px)",fontWeight:900,letterSpacing:-1.5,marginBottom:14 }}>
              {t('landing.tools.title')}
            </h2>
            <p style={{ color:"#6B7A99",fontSize:16,maxWidth:480,margin:"0 auto" }}>
              {t('landing.tools.subtitle')}
            </p>
          </div>

          <div className="tools-grid" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:20 }}>
            {TOOLS.map(tool => {
              const name = t(tool.nameKey);
              const desc = t(tool.descKey);
              const tag  = tool.tagKey ? t(tool.tagKey) : null;
              return (
                <div key={tool.nameKey} className="tool-card" onClick={() => go(tool.href)}
                  style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:22,padding:28,cursor:"pointer",position:"relative",overflow:"hidden" }}>
                  <div style={{ position:"absolute",top:0,right:0,width:130,height:130,background:`radial-gradient(circle at top right,${tool.glow},transparent 70%)`,pointerEvents:"none" }} />
                  {tag && (
                    <span style={{ position:"absolute",top:18,right:18,background:`${tool.tagC}18`,color:tool.tagC,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,border:`1px solid ${tool.tagC}35` }}>
                      {tag}
                    </span>
                  )}
                  <div style={{ width:50,height:50,borderRadius:14,background:`${tool.color}18`,border:`1px solid ${tool.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:18 }}>
                    {tool.icon}
                  </div>
                  <div style={{ fontWeight:800,fontSize:17,marginBottom:8,color:"#F0F4FF" }}>{name}</div>
                  <div style={{ color:"#6B7A99",fontSize:13,lineHeight:1.65,marginBottom:20 }}>{desc}</div>
                  <div style={{ display:"flex",alignItems:"center",gap:6,color:tool.color,fontSize:13,fontWeight:700 }}>
                    {t('landing.tools.useBtn')}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign:"center",marginTop:48 }}>
            <button className="btn-primary" onClick={() => go("/tools")}
              style={{ background:"linear-gradient(135deg,#3B82F6,#2563EB)",color:"#fff",border:"none",padding:"15px 38px",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer" }}>
              {t('landing.tools.allTools')}
            </button>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div id="how" style={{ padding:"100px 24px",background:"#070B13",borderTop:"1px solid #1E2733",borderBottom:"1px solid #1E2733" }}>
        <div style={{ maxWidth:1000,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:64 }}>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)",fontWeight:900,letterSpacing:-1.5,marginBottom:14 }}>
              {t('landing.how.title')}
            </h2>
            <p style={{ color:"#6B7A99",fontSize:16 }}>
              {t('landing.how.subtitle')}
            </p>
          </div>

          <div className="steps-grid" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:32,position:"relative" }}>
            <div style={{ position:"absolute",top:28,left:"12%",right:"12%",height:1,background:"linear-gradient(90deg,transparent,#1E2733 20%,#1E2733 80%,transparent)",zIndex:0 }} />
            {STEPS.map((s) => (
              <div key={s.n} style={{ textAlign:"center",position:"relative",zIndex:1 }}>
                <div style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:56,height:56,borderRadius:16,background:"#0D1117",border:"1px solid rgba(59,130,246,.3)",fontSize:11,fontWeight:900,color:"#93C5FD",letterSpacing:1,marginBottom:18,boxShadow:"0 0 20px rgba(59,130,246,.1)" }}>
                  {s.n}
                </div>
                <div style={{ fontSize:30,marginBottom:12 }}>{s.icon}</div>
                <div style={{ fontWeight:700,fontSize:15,marginBottom:8 }}>{t(s.titleKey)}</div>
                <div style={{ color:"#6B7A99",fontSize:13,lineHeight:1.65 }}>{t(s.descKey)}</div>
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
              {t('landing.testimonials.title')}
            </h2>
            <p style={{ color:"#6B7A99",fontSize:16 }}>
              {t('landing.testimonials.subtitle')}
            </p>
          </div>

          <div className="testi-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }}>
            {TESTIMONIALS.map(tst => (
              <div key={tst.name} className="testi-card" style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:22,padding:28 }}>
                <div style={{ display:"flex",gap:2,marginBottom:16 }}>
                  {Array.from({length:tst.stars}).map((_,i) => <span key={i} style={{ color:"#F59E0B",fontSize:16 }}>★</span>)}
                </div>
                <p style={{ color:"#C0CBE0",fontSize:14,lineHeight:1.75,marginBottom:22 }}>"{tst.text}"</p>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:40,height:40,borderRadius:"50%",background:`linear-gradient(${tst.grad})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,color:"#fff",flexShrink:0 }}>
                    {tst.av}
                  </div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:14,color:"#F0F4FF" }}>{tst.name}</div>
                    <div style={{ fontSize:12,color:"#6B7A99" }}>{tst.role}</div>
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
              {t('landing.pricing.title')}
            </h2>
            <p style={{ color:"#6B7A99",fontSize:16 }}>
              {t('landing.pricing.subtitle')}
            </p>
          </div>

          <div className="pricing-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }}>
            {/* FREE */}
            <div style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:24,padding:"36px 32px" }}>
              <div style={{ fontSize:12,fontWeight:800,color:"#6B7A99",letterSpacing:1.5,textTransform:"uppercase",marginBottom:10 }}>{t('landing.pricing.freePlan')}</div>
              <div style={{ fontSize:54,fontWeight:900,letterSpacing:-2,color:"#F0F4FF",lineHeight:1 }}>0€</div>
              <div style={{ color:"#4B5563",fontSize:14,marginBottom:28,marginTop:4 }}>{t('landing.pricing.forever')}</div>
              <ul style={{ listStyle:"none",padding:0,margin:"0 0 32px",display:"flex",flexDirection:"column",gap:13 }}>
                {(Array.isArray(FREE_FEATURES) ? FREE_FEATURES : []).map((f, i) => (
                  <li key={i} style={{ display:"flex",alignItems:"center",gap:10,fontSize:14,color:"#8892AA" }}>
                    <span style={{ color:"#4B5563",flexShrink:0,fontSize:16 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => go("/tools")} style={{ width:"100%",padding:"13px",borderRadius:12,border:"1px solid #1E2733",background:"transparent",color:"#F0F4FF",fontSize:15,fontWeight:600,cursor:"pointer" }}>
                {t('landing.pricing.startFree')}
              </button>
            </div>

            {/* PRO */}
            <div style={{ background:"linear-gradient(145deg,#0D1F3C,#132240)",border:"2px solid #3B82F6",borderRadius:24,padding:"36px 32px",position:"relative" }}>
              <div style={{ position:"absolute",top:-15,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#3B82F6,#2563EB)",color:"#fff",fontSize:11,fontWeight:800,padding:"5px 18px",borderRadius:20,whiteSpace:"nowrap",letterSpacing:.5 }}>
                {isPromo ? t('landing.pricing.launchOffer') : t('landing.pricing.mostPopular')}
              </div>
              <div style={{ fontSize:12,fontWeight:800,color:"#60A5FA",letterSpacing:1.5,textTransform:"uppercase",marginBottom:10 }}>{t('landing.pricing.proLabel')}</div>
              {isPromo ? (
                <>
                  <div style={{ display:"flex",alignItems:"flex-end",gap:10 }}>
                    <div style={{ fontSize:54,fontWeight:900,letterSpacing:-2,color:"#fff",lineHeight:1 }}>{promoPrice}€</div>
                    <div style={{ fontSize:18,color:"#4B6A8A",textDecoration:"line-through",marginBottom:8 }}>{normalPrice}€</div>
                  </div>
                  <div style={{ color:"#60A5FA",fontSize:14,marginBottom:8,marginTop:4 }}>
                    {t('landing.pricing.perMonthFor', { months: promoMonths, price: normalPrice })}
                  </div>
                  <div style={{ background:"rgba(16,185,129,.12)",border:"1px solid rgba(16,185,129,.25)",color:"#10B981",fontSize:12,fontWeight:700,padding:"5px 12px",borderRadius:8,display:"inline-block",marginBottom:20 }}>
                    {t('landing.pricing.saveAmount', { amount: ((parseFloat(normalPrice)-parseFloat(promoPrice))*parseInt(promoMonths)).toFixed(2), months: promoMonths })}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize:54,fontWeight:900,letterSpacing:-2,color:"#fff",lineHeight:1 }}>{normalPrice}€</div>
                  <div style={{ color:"#60A5FA",fontSize:14,marginBottom:28,marginTop:4 }}>{t('landing.pricing.perMonth')}</div>
                </>
              )}
              <ul style={{ listStyle:"none",padding:0,margin:"0 0 32px",display:"flex",flexDirection:"column",gap:13 }}>
                {(Array.isArray(PRO_FEATURES) ? PRO_FEATURES : []).map((f, i) => (
                  <li key={i} style={{ display:"flex",alignItems:"center",gap:10,fontSize:14,color:"#D1E8FF" }}>
                    <span style={{ color:"#3B82F6",flexShrink:0,fontSize:16 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button className="btn-primary" onClick={handleUpgrade}
                style={{ width:"100%",padding:"14px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#3B82F6,#2563EB)",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer" }}>
                {session ? t('landing.pricing.upgradeSession') : t('landing.pricing.upgradeGuest')}
              </button>
            </div>
          </div>

          <p style={{ textAlign:"center",color:"#4B5563",fontSize:13,marginTop:24 }}>
            {t('landing.pricing.securePayment')}
          </p>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding:"100px 24px",background:"#07090F",textAlign:"center" }}>
        <div style={{ maxWidth:600,margin:"0 auto" }}>
          <div style={{ fontSize:56,marginBottom:20 }}>🚀</div>
          <h2 style={{ fontSize:"clamp(28px,4vw,48px)",fontWeight:900,letterSpacing:-1.5,marginBottom:16 }}>
            {t('landing.cta.title')}
          </h2>
          <p style={{ color:"#6B7A99",fontSize:17,marginBottom:40,lineHeight:1.7 }}>
            {t('landing.cta.subtitle')}
          </p>
          <button className="btn-primary" onClick={() => go("/tools")}
            style={{ background:"linear-gradient(135deg,#3B82F6,#2563EB)",color:"#fff",border:"none",padding:"18px 48px",borderRadius:16,fontSize:18,fontWeight:800,cursor:"pointer" }}>
            {t('landing.cta.btn')}
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
            <div style={{ color:"#4B5563",fontSize:12 }}>{t('landing.footer.copyright')}</div>
          </div>
          <div style={{ display:"flex",gap:24,flexWrap:"wrap" }}>
            <a href={`${localePrefix}/tools`}   style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>{t('landing.footer.tools')}</a>
            <a href={`${localePrefix}/cv`}       style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>{t('landing.footer.createCv')}</a>
            <a href="#pricing"                   style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>{t('landing.footer.pricing')}</a>
            <a href="/privacy"                   style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>{t('landing.footer.privacy')}</a>
            <a href={`${localePrefix}/terms`}    style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>{t('landing.footer.terms')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
