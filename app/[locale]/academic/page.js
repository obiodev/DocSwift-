"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import LanguageSwitcher from "../../../components/LanguageSwitcher";

const CSS = `
  @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-60px) scale(1.1)} 66%{transform:translate(-30px,30px) scale(0.9)} }
  @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,70px) scale(1.05)} 66%{transform:translate(30px,-40px) scale(0.95)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  .hero-text{animation:fadeUp .9s ease both}
  .hero-sub{animation:fadeUp .9s .15s ease both;opacity:0}
  .hero-ctas{animation:fadeUp .9s .3s ease both;opacity:0}
  .btn-primary{transition:all .2s ease}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(59,130,246,.45)}
  .btn-secondary{transition:all .2s ease}
  .btn-secondary:hover{border-color:#3B82F6!important;color:#F0F4FF!important}
  .module-card{transition:all .22s cubic-bezier(.4,0,.2,1)}
  .module-card:hover{transform:translateY(-6px);box-shadow:0 24px 48px rgba(0,0,0,.4)}
  .testi-card{transition:all .22s ease}
  .nav-link{transition:color .15s}
  .nav-link:hover{color:#F0F4FF!important}
  .gradient-text{ background:linear-gradient(135deg,#FFFFFF 0%,#93C5FD 45%,#818CF8 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .pricing-card{transition:all .22s cubic-bezier(.4,0,.2,1)}
  .pricing-card:hover{transform:translateY(-4px)}
  .faq-item{transition:all .2s}
  @media(max-width:768px){
    .nav-links{display:none!important}
    .nav-wrap{padding:12px 16px!important}
    .modules-grid{grid-template-columns:1fr!important}
    .hero-h1{font-size:36px!important}
    .pricing-grid{grid-template-columns:1fr!important}
    .testi-grid{grid-template-columns:1fr!important}
    .hero-ctas{flex-direction:column!important;align-items:stretch!important;max-width:340px!important;margin:0 auto!important}
    .faq-grid{grid-template-columns:1fr!important}
  }
`;

const MODULE_META = [
  { icon:"📄", color:"#3B82F6", glow:"rgba(59,130,246,.15)", href:"/tools" },
  { icon:"🤖", color:"#8B5CF6", glow:"rgba(139,92,246,.15)", href:"/dashboard/ai" },
  { icon:"📝", color:"#10B981", glow:"rgba(16,185,129,.15)", href:"/cv" },
];

const COPY = {
  fr: {
    navTools:"Outils", navPricing:"Tarifs", navDashboard:"Dashboard →", navLogin:"Connexion",
    heroBadge:"📄 L'assistant PDF intelligent",
    heroTitle:"Vos PDFs, en un clic.",
    heroSub:"Convertissez, compressez et fusionnez vos PDFs. Créez votre CV professionnel. Gratuit pour commencer.",
    ctaTry:"Essayer gratuitement →", ctaCv:"Créer mon CV →",
    heroTrust:["✓ 5 conversions gratuites/jour", "✓ Sans inscription pour essayer", "✓ Fichiers supprimés après traitement"],
    modulesTitle:"Tout pour vos documents.",
    modulesSub:"Du traitement PDF basique à l'IA conversationnelle, tout est centralisé.",
    discover:"Découvrir →",
    modules:[
      { badge:"Inclus dans tous les plans", title:"Outils PDF", desc:"Convertissez, compressez, fusionnez et divisez vos documents PDF en quelques clics.",
        features:["PDF → Word", "Word → PDF", "Compresser, Fusionner, Diviser", "Images → PDF"] },
      { badge:"Bientôt disponible", title:"DocSwift AI", desc:"En cours de développement : chattez avec vos PDFs, extrayez des clauses, générez des résumés.",
        features:["Chat avec vos PDFs", "Extraction de clauses", "Résumé exécutif", "Traduction FR / EN / AR"] },
      { badge:"Gratuit", title:"CV Builder", desc:"Créez un CV professionnel en PDF avec un formulaire guidé et un aperçu en direct.",
        features:["3 modèles modernes", "Aperçu en direct", "Export PDF instantané", "Sans inscription"] },
    ],
    pricingTitle:"Tarifs simples et transparents",
    pricingSub:"Commencez gratuitement. Passez Pro quand vous en avez besoin.",
    perMonth:"/mois", quote:"Sur devis",
    offer:(pct) => `🔥 OFFRE -${pct}%`, popular:"Le plus populaire",
    thenPrice:(p) => `puis ${p}€/mois`,
    noCommitment:"Sans engagement · Annulation facile",
    plans:{
      free:{ name:"Gratuit", features:["5 conversions par jour", "Tous les outils PDF", "CV Builder inclus", "Fichiers jusqu'à 20 MB"], cta:"Commencer gratuitement" },
      pro:{ name:"Pro", features:["Conversions illimitées", "Zéro publicité", "Support prioritaire"], cta:"Passer Pro" },
    },
    pricingFoot:"Paiement sécurisé par Stripe · Annulation à tout moment · Facture mensuelle",
    faqTitle:"Questions fréquentes",
    faq:[
      { q:"Les outils PDF sont-ils vraiment gratuits ?", a:"Oui, 5 conversions par jour sont gratuites. Le plan Pro débloque des conversions illimitées." },
      { q:"Mes documents sont-ils stockés ?", a:"Non. Vos fichiers sont traités puis supprimés après conversion. Rien n'est conservé sur nos serveurs." },
      { q:"Comment fonctionne la facturation ?", a:"Paiement mensuel par carte via Stripe. Annulation à tout moment, sans frais ni engagement." },
      { q:"Y a-t-il une période d'essai gratuite ?", a:"Oui, 7 jours d'essai gratuit sur le plan Pro. Une carte bancaire est demandée, aucun débit pendant l'essai." },
    ],
    finalTitle:"Prêt à simplifier vos PDFs ?",
    finalSub:"5 conversions gratuites par jour, sans carte bancaire.",
    footerTagline:"© 2026 Motoko LLC — DocSwift. L'assistant PDF intelligent pour les professionnels.",
    footerDashboard:"Dashboard", footerPricing:"Tarifs", footerTerms:"Confidentialité & CGU",
  },
  en: {
    navTools:"Tools", navPricing:"Pricing", navDashboard:"Dashboard →", navLogin:"Log in",
    heroBadge:"📄 The smart PDF assistant",
    heroTitle:"Your PDFs, in one click.",
    heroSub:"Convert, compress and merge your PDFs. Create your professional resume. Free to get started.",
    ctaTry:"Try it free →", ctaCv:"Create my resume →",
    heroTrust:["✓ 5 free conversions/day", "✓ No sign-up needed to try", "✓ Files deleted after processing"],
    modulesTitle:"Everything for your documents.",
    modulesSub:"From basic PDF processing to conversational AI, everything in one place.",
    discover:"Explore →",
    modules:[
      { badge:"Included in all plans", title:"PDF Tools", desc:"Convert, compress, merge and split your PDF documents in just a few clicks.",
        features:["PDF → Word", "Word → PDF", "Compress, Merge, Split", "Images → PDF"] },
      { badge:"Coming soon", title:"DocSwift AI", desc:"In development: chat with your PDFs, extract clauses and generate summaries.",
        features:["Chat with your PDFs", "Clause extraction", "Executive summary", "FR / EN / AR translation"] },
      { badge:"Free", title:"CV Builder", desc:"Create a professional PDF resume with a guided form and a live preview.",
        features:["3 modern templates", "Live preview", "Instant PDF export", "No sign-up required"] },
    ],
    pricingTitle:"Simple, transparent pricing",
    pricingSub:"Start for free. Go Pro when you need it.",
    perMonth:"/month", quote:"Custom quote",
    offer:(pct) => `🔥 OFFER -${pct}%`, popular:"Most popular",
    thenPrice:(p) => `then €${p}/month`,
    noCommitment:"No commitment · Easy cancellation",
    plans:{
      free:{ name:"Free", features:["5 conversions per day", "All PDF tools", "CV Builder included", "Files up to 20 MB"], cta:"Get started free" },
      pro:{ name:"Pro", features:["Unlimited conversions", "Zero ads", "Priority support"], cta:"Go Pro" },
    },
    pricingFoot:"Secure payment via Stripe · Cancel anytime · Monthly invoice",
    faqTitle:"Frequently asked questions",
    faq:[
      { q:"Are the PDF tools really free?", a:"Yes, 5 conversions per day are free. The Pro plan unlocks unlimited conversions." },
      { q:"Are my documents stored?", a:"No. Your files are processed and then deleted after conversion. Nothing is kept on our servers." },
      { q:"How does billing work?", a:"Monthly card payment via Stripe. Cancel anytime, with no fees or commitment." },
      { q:"Is there a free trial?", a:"Yes, a 7-day free trial on the Pro plan. A card is required, and nothing is charged during the trial." },
    ],
    finalTitle:"Ready to simplify your PDFs?",
    finalSub:"5 free conversions per day, no credit card required.",
    footerTagline:"© 2026 Motoko LLC — DocSwift. The smart PDF assistant for professionals.",
    footerDashboard:"Dashboard", footerPricing:"Pricing", footerTerms:"Privacy & Terms",
  },
  ar: {
    navTools:"الأدوات", navPricing:"الأسعار", navDashboard:"لوحة التحكم ←", navLogin:"تسجيل الدخول",
    heroBadge:"📄 مساعد PDF الذكي",
    heroTitle:"ملفات PDF الخاصة بك، بنقرة واحدة.",
    heroSub:"حوّل ملفات PDF واضغطها وادمجها. أنشئ سيرتك الذاتية الاحترافية. مجاني للبدء.",
    ctaTry:"جرّبه مجانًا ←", ctaCv:"أنشئ سيرتي الذاتية ←",
    heroTrust:["✓ 5 تحويلات مجانية يوميًا", "✓ دون تسجيل للتجربة", "✓ حذف الملفات بعد المعالجة"],
    modulesTitle:"كل ما تحتاجه لمستنداتك.",
    modulesSub:"من المعالجة الأساسية لملفات PDF إلى الذكاء الاصطناعي التحاوري، كل شيء في مكان واحد.",
    discover:"اكتشف ←",
    modules:[
      { badge:"مضمَّن في جميع الخطط", title:"أدوات PDF", desc:"حوّل مستندات PDF واضغطها وادمجها وقسّمها ببضع نقرات.",
        features:["PDF → Word", "Word → PDF", "ضغط، دمج، تقسيم", "صور ← PDF"] },
      { badge:"قريبًا", title:"DocSwift AI", desc:"قيد التطوير: تحاور مع ملفات PDF، واستخرج البنود، وأنشئ ملخصات.",
        features:["محادثة مع ملفات PDF", "استخراج البنود", "ملخص تنفيذي", "ترجمة FR / EN / AR"] },
      { badge:"مجاني", title:"CV Builder", desc:"أنشئ سيرة ذاتية احترافية بصيغة PDF عبر نموذج موجَّه ومعاينة مباشرة.",
        features:["3 قوالب عصرية", "معاينة مباشرة", "تصدير PDF فوري", "دون تسجيل"] },
    ],
    pricingTitle:"أسعار بسيطة وشفافة",
    pricingSub:"ابدأ مجانًا. انتقل إلى Pro عندما تحتاج إليه.",
    perMonth:"/شهريًا", quote:"حسب الطلب",
    offer:(pct) => `🔥 عرض -${pct}%`, popular:"الأكثر شيوعًا",
    thenPrice:(p) => `ثم ${p}€/شهريًا`,
    noCommitment:"دون التزام · إلغاء سهل",
    plans:{
      free:{ name:"مجاني", features:["5 تحويلات يوميًا", "جميع أدوات PDF", "CV Builder مضمَّن", "ملفات حتى 20 MB"], cta:"ابدأ مجانًا" },
      pro:{ name:"Pro", features:["تحويلات غير محدودة", "بلا إعلانات", "دعم ذو أولوية"], cta:"انتقل إلى Pro" },
    },
    pricingFoot:"دفع آمن عبر Stripe · إلغاء في أي وقت · فاتورة شهرية",
    faqTitle:"الأسئلة الشائعة",
    faq:[
      { q:"هل أدوات PDF مجانية حقًا؟", a:"نعم، 5 تحويلات يوميًا مجانية. تتيح خطة Pro تحويلات غير محدودة." },
      { q:"هل يتم تخزين مستنداتي؟", a:"لا. تُعالَج ملفاتك ثم تُحذف بعد التحويل. لا يُحتفظ بأي شيء على خوادمنا." },
      { q:"كيف تتم الفوترة؟", a:"دفع شهري بالبطاقة عبر Stripe. يمكنك الإلغاء في أي وقت، دون رسوم أو التزام." },
      { q:"هل توجد فترة تجريبية مجانية؟", a:"نعم، 7 أيام تجربة مجانية على خطة Pro. تُطلب بطاقة بنكية، ولا يُخصم أي مبلغ خلال فترة التجربة." },
    ],
    finalTitle:"هل أنت مستعد لتبسيط ملفات PDF الخاصة بك؟",
    finalSub:"5 تحويلات مجانية يوميًا، دون بطاقة بنكية.",
    footerTagline:"© 2026 Motoko LLC — DocSwift. مساعد PDF الذكي للمحترفين.",
    footerDashboard:"لوحة التحكم", footerPricing:"الأسعار", footerTerms:"الخصوصية والشروط",
  },
};

export default function AcademicLanding() {
  const locale = useLocale();
  const t = COPY[locale] ?? COPY.fr;
  const MODULES = MODULE_META.map((m, i) => ({ ...m, ...t.modules[i] }));
  const FAQ = t.faq;
  const { data: session } = useSession();
  const router = useRouter();
  const [pricing, setPricing] = useState({ promo_enabled:"true", promo_price:"4.99", promo_months:"3", normal_price:"9.99" });
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => { fetch("/api/settings").then(r=>r.json()).then(d=>setPricing(d)).catch(()=>{}); }, []);

  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  const go = (path) => router.push(`${localePrefix}${path}`);

  const promoActive  = pricing.promo_enabled === "true";
  const proPrice     = promoActive ? pricing.promo_price : pricing.normal_price;
  const regularPrice = pricing.normal_price;

  const PLANS = [
    { name:t.plans.free.name, price:"0", period:t.perMonth, color:"#6B7A99", border:"#1E2733", bg:"#0D1117", badge:null,
      features:t.plans.free.features,
      cta:t.plans.free.cta, plan:"free", ctaStyle:{ background:"transparent", border:"1px solid #1E2733", color:"#F0F4FF" } },
    { name:t.plans.pro.name, price:proPrice, period:t.perMonth, color:"#60A5FA", border:"#3B82F6", bg:"linear-gradient(145deg,#0D1F3C,#132240)",
      badge: promoActive ? t.offer(Math.round((1 - parseFloat(proPrice)/parseFloat(regularPrice))*100)) : t.popular,
      badgeBg:"linear-gradient(135deg,#3B82F6,#2563EB)",
      promoNote: null, // promo price is not time-limited in Stripe
      features:t.plans.pro.features,
      cta:t.plans.pro.cta, plan: promoActive ? "promo" : "regular", ctaStyle:{ background:"linear-gradient(135deg,#3B82F6,#2563EB)", border:"none", color:"#fff" } },
  ];

  const handleUpgrade = async (plan) => {
    if (!session) { signIn(); return; }
    const res  = await fetch("/api/stripe/checkout", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ plan: plan === "free" ? undefined : plan }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div style={{ minHeight:"100vh", background:"#07090F", color:"#F0F4FF", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", overflowX:"hidden" }}>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className="nav-wrap" style={{ position:"fixed",top:0,left:0,right:0,zIndex:200,padding:"16px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(7,9,15,.92)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(30,39,51,.9)" }}>
        <a href={`${localePrefix}/`} style={{ fontWeight:900,fontSize:22,letterSpacing:-1,textDecoration:"none",color:"#F0F4FF" }}>
          <bdi dir="ltr">Doc<span style={{ color:"#3B82F6" }}>Swift</span></bdi>
        </a>
        <div className="nav-links" style={{ display:"flex",gap:28,alignItems:"center" }}>
          <a href="#modules" className="nav-link" style={{ color:"#8892AA",textDecoration:"none",fontSize:14 }}>{t.navTools}</a>
          <a href="#pricing" className="nav-link" style={{ color:"#8892AA",textDecoration:"none",fontSize:14 }}>{t.navPricing}</a>
          <LanguageSwitcher />
          {session
            ? <button className="btn-primary" onClick={() => go("/dashboard")} style={{ background:"#3B82F6",color:"#fff",padding:"9px 22px",borderRadius:8,fontSize:14,fontWeight:700,border:"none",cursor:"pointer" }}>{t.navDashboard}</button>
            : <button className="btn-primary" onClick={() => signIn()} style={{ background:"#3B82F6",color:"#fff",padding:"9px 22px",borderRadius:8,fontSize:14,fontWeight:700,border:"none",cursor:"pointer" }}>{t.navLogin}</button>
          }
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position:"relative",overflow:"hidden",minHeight:"90vh",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"130px 24px 80px" }}>
        <div style={{ position:"absolute",top:"18%",left:"12%",width:560,height:560,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,.08) 0%,transparent 65%)",animation:"blob1 9s ease-in-out infinite",pointerEvents:"none" }} />
        <div style={{ position:"absolute",top:"35%",right:"8%", width:440,height:440,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,.07) 0%,transparent 65%)",animation:"blob2 11s ease-in-out infinite",pointerEvents:"none" }} />

        <div style={{ position:"relative",zIndex:1,maxWidth:820 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.22)",color:"#BFDBFE",padding:"6px 18px",borderRadius:40,fontSize:13,fontWeight:600,marginBottom:32 }}>
            {t.heroBadge}
          </div>

          <h1 className="hero-text hero-h1" style={{ fontSize:"clamp(36px,6.5vw,72px)",fontWeight:900,letterSpacing:-3,lineHeight:1.04,marginBottom:24 }}>
            <span className="gradient-text">{t.heroTitle}</span>
          </h1>

          <p className="hero-sub" style={{ color:"#8892AA",fontSize:19,maxWidth:560,margin:"0 auto 14px",lineHeight:1.7 }}>
            {t.heroSub}
          </p>

          <div className="hero-ctas" style={{ display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginTop:30 }}>
            <button className="btn-primary" onClick={() => go("/tools")} style={{ background:"linear-gradient(135deg,#3B82F6,#2563EB)",color:"#fff",padding:"16px 38px",borderRadius:14,fontSize:17,fontWeight:800,border:"none",cursor:"pointer",letterSpacing:-.3 }}>
              {t.ctaTry}
            </button>
            <button className="btn-secondary" onClick={() => go("/cv")}
              style={{ background:"rgba(30,39,51,.6)",color:"#C0CBE0",padding:"16px 28px",borderRadius:14,fontSize:16,cursor:"pointer",border:"1px solid #1E2733",backdropFilter:"blur(10px)" }}>
              {t.ctaCv}
            </button>
          </div>

          <p style={{ marginTop:28,color:"#4B5563",fontSize:13 }}>
            {t.heroTrust[0]} &nbsp;·&nbsp; {t.heroTrust[1]} &nbsp;·&nbsp; {t.heroTrust[2]}
          </p>
        </div>
      </div>

      {/* ── MODULES ── */}
      <div id="modules" style={{ padding:"100px 24px",background:"#07090F" }}>
        <div style={{ maxWidth:1200,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:64 }}>
            <h2 style={{ fontSize:"clamp(28px,4vw,50px)",fontWeight:900,letterSpacing:-1.5,marginBottom:14 }}>{t.modulesTitle}</h2>
            <p style={{ color:"#6B7A99",fontSize:16,maxWidth:500,margin:"0 auto" }}>{t.modulesSub}</p>
          </div>

          <div className="modules-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24 }}>
            {MODULES.map((mod, i) => (
              <div key={i} className="module-card"
                style={{ background:"#0D1117",border:"2px solid #1E2733",borderRadius:24,padding:"32px 28px",cursor:"pointer",position:"relative",overflow:"hidden" }}
                onClick={() => go(mod.href)}>
                <div style={{ position:"absolute",top:0,right:0,width:120,height:120,background:`radial-gradient(circle at top right,${mod.glow},transparent 70%)`,pointerEvents:"none" }} />
                <div style={{ display:"inline-block",background:`${mod.color}15`,color:mod.color,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:12,border:`1px solid ${mod.color}30`,marginBottom:18 }}>{mod.badge}</div>
                <div style={{ fontSize:36,marginBottom:14 }}>{mod.icon}</div>
                <h3 style={{ fontSize:20,fontWeight:800,marginBottom:10,color:"#F0F4FF" }}>{mod.title}</h3>
                <p style={{ color:"#6B7A99",fontSize:14,lineHeight:1.65,marginBottom:22 }}>{mod.desc}</p>
                <ul style={{ listStyle:"none",padding:0,margin:"0 0 24px",display:"flex",flexDirection:"column",gap:8 }}>
                  {mod.features.map((f,j) => (
                    <li key={j} style={{ display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#8892AA" }}>
                      <span style={{ color:mod.color,fontSize:14 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <div style={{ color:mod.color,fontSize:13,fontWeight:700 }}>{t.discover}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" style={{ padding:"100px 24px",background:"#070B13",borderTop:"1px solid #1E2733" }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:60 }}>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)",fontWeight:900,letterSpacing:-1.5,marginBottom:14 }}>{t.pricingTitle}</h2>
            <p style={{ color:"#6B7A99",fontSize:16 }}>{t.pricingSub}</p>
          </div>

          <div className="pricing-grid" style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:20,maxWidth:720,margin:"0 auto" }}>
            {PLANS.map((plan, i) => (
              <div key={i} className="pricing-card" style={{ background:plan.bg,border:`2px solid ${plan.border}`,borderRadius:24,padding:"36px 28px",position:"relative" }}>
                {plan.badge && (
                  <div style={{ position:"absolute",top:-15,left:"50%",transform:"translateX(-50%)",background:plan.badgeBg,color:"#fff",fontSize:11,fontWeight:800,padding:"5px 16px",borderRadius:20,whiteSpace:"nowrap" }}>{plan.badge}</div>
                )}
                <div style={{ fontSize:12,fontWeight:800,color:plan.color,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10 }}>{plan.name}</div>
                <div style={{ display:"flex",alignItems:"flex-end",gap:4,marginBottom:4 }}>
                  <span style={{ fontSize:44,fontWeight:900,letterSpacing:-2,color:"#F0F4FF",lineHeight:1 }}>{plan.price === t.quote ? plan.price : `${plan.price}€`}</span>
                  <span style={{ color:"#4B5563",fontSize:15,marginBottom:8 }}>{plan.period}</span>
                </div>
                <div style={{ color:"#4B5563",fontSize:12,marginBottom:28 }}>{t.noCommitment}</div>
                <ul style={{ listStyle:"none",padding:0,margin:"0 0 32px",display:"flex",flexDirection:"column",gap:11 }}>
                  {plan.features.map((f,j) => (
                    <li key={j} style={{ display:"flex",alignItems:"center",gap:10,fontSize:13,color:"#8892AA" }}>
                      <span style={{ color:plan.border,flexShrink:0,fontSize:15 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button className="btn-primary" onClick={() => plan.plan === "free" ? go("/tools") : handleUpgrade(plan.plan)}
                  style={{ width:"100%",padding:"14px",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",...plan.ctaStyle }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          <p style={{ textAlign:"center",color:"#4B5563",fontSize:13,marginTop:24 }}>{t.pricingFoot}</p>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ padding:"80px 24px",background:"#070B13",borderTop:"1px solid #1E2733" }}>
        <div style={{ maxWidth:900,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:52 }}>
            <h2 style={{ fontSize:"clamp(26px,4vw,44px)",fontWeight:900,letterSpacing:-1.5,marginBottom:12 }}>{t.faqTitle}</h2>
          </div>
          <div className="faq-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            {FAQ.map((item, i) => (
              <div key={i} className="faq-item"
                style={{ background:"#0D1117",border:`1px solid ${openFaq===i?"rgba(59,130,246,.3)":"#1E2733"}`,borderRadius:16,padding:"20px 22px",cursor:"pointer" }}
                onClick={() => setOpenFaq(openFaq===i ? null : i)}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
                  <span style={{ fontWeight:700,fontSize:14,color:"#F0F4FF",lineHeight:1.5 }}>{item.q}</span>
                  <span style={{ color:"#3B82F6",fontSize:18,flexShrink:0,transition:"transform .2s",transform:openFaq===i?"rotate(45deg)":"none" }}>+</span>
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
          <div style={{ fontSize:56,marginBottom:20 }}>📄</div>
          <h2 style={{ fontSize:"clamp(28px,4vw,48px)",fontWeight:900,letterSpacing:-1.5,marginBottom:16 }}>{t.finalTitle}</h2>
          <p style={{ color:"#6B7A99",fontSize:17,marginBottom:40,lineHeight:1.7 }}>{t.finalSub}</p>
          <button className="btn-primary" onClick={() => go("/tools")}
            style={{ background:"linear-gradient(135deg,#3B82F6,#2563EB)",color:"#fff",border:"none",padding:"18px 48px",borderRadius:16,fontSize:18,fontWeight:800,cursor:"pointer" }}>
            {t.ctaTry}
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid #1E2733",padding:"32px 40px" }}>
        <div className="footer-inner" style={{ maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:20 }}>
          <div>
            <div style={{ fontWeight:900,fontSize:18,letterSpacing:-0.5,marginBottom:4 }}><bdi dir="ltr">Doc<span style={{ color:"#3B82F6" }}>Swift</span></bdi></div>
            <div style={{ color:"#4B5563",fontSize:12 }}>{t.footerTagline}</div>
          </div>
          <div style={{ display:"flex",gap:24,flexWrap:"wrap" }}>
            <a href={`${localePrefix}/dashboard`} style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>{t.footerDashboard}</a>
            <a href="#pricing" style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>{t.footerPricing}</a>
            <a href={`${localePrefix}/terms`} style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>{t.footerTerms}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
