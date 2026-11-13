"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "next-intl";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import NewsletterForm from "../../../components/NewsletterForm";

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
// Plan names (Solo, Cabinet, Volume) stay identical in every language.
const PLANS = [
  { plan:"starter",  name:"Solo",     price:"49",  color:"#6B7A99", border:"#1E2733", bg:"#0D1117" },
  { plan:"pro",       name:"Cabinet",  price:"129", color:"#F97316", border:"#F97316", bg:"linear-gradient(145deg,#1A1000,#261500)", badgeBg:"linear-gradient(135deg,#F97316,#EA580C)" },
  { plan:"business",  name:"Volume",   price:"290", color:"#FB923C", border:"#F97316", bg:"linear-gradient(145deg,#1A1000,#2A1800)", badgeBg:"linear-gradient(135deg,#F97316,#EA580C)" },
];

const COPY = {
  fr: {
    nav: { trial:"Essai gratuit", pricing:"Tarifs", dashboard:"Dashboard →", login:"Connexion" },
    hero: {
      badge:"Recrutement assisté par IA",
      titleHighlight:"Triez 100 CVs",
      titleRest:"en 3 minutes.",
      subBefore:"DocSwift HR analyse automatiquement vos candidatures et vous donne un ",
      subStrong:"score de matching",
      subAfter:" avec votre fiche de poste.",
      audience:"Pour les cabinets RH, PME et recruteurs indépendants.",
      ctaPrimary:"Essayer gratuitement →",
      ctaDemo:"Voir la démo ↓",
      trust:"✓ 5 CVs gratuits sans compte  ·  ✓ Essai 14 jours, 0 € débité avant J14  ·  ✓ Résiliable en 1 clic",
    },
    stats: [
      { value:"100", label:"CVs par analyse" },
      { value:"≈ 3 min", label:"pour trier 100 CVs" },
      { value:"FR · EN · AR", label:"analyse multilingue" },
      { value:"0", label:"décision automatique : vous gardez la main" },
    ],
    problem: {
      badge:"😩 Le problème",
      titleBefore:"Trier à la main ", titleHighlight:"100 CVs", titleAfter:" pour un seul poste prend facilement une journée.",
      text:"Lecture individuelle, notes dispersées, critères subjectifs, oublis… Le tri de CV est chronophage, épuisant et source d'erreurs.",
    },
    solution: {
      badge:"✅ La solution",
      titleBefore:"DocSwift HR le fait en ", titleHighlight:"quelques minutes", titleAfter:".",
      text:"Uploadez votre fiche de poste + vos CVs. L'IA analyse chaque profil, calcule un score de matching et génère une recommandation RH instantanément.",
    },
    demo: {
      badge:"👥 Démo",
      title:"Tableau de résultats en temps réel",
      disclaimer:"Exemple illustratif : candidats fictifs.",
      subtitle:"Chaque CV analysé automatiquement — score, forces, faiblesses, recommandation.",
      windowTitle:"DocSwift HR — Développeur React Senior — 4 candidats analysés",
      headers:["Candidat","Score","Statut","Action"],
      details:"Voir détails",
      footer:"4 CVs analysés · Temps total : 1m 43s",
      export:"⬇️ Exporter CSV",
    },
    status: { recommended:"Recommandé", consider:"À considérer", rejected:"Non retenu" },
    pricing: {
      title:"Tarifs simples et transparents",
      subtitle:"14 jours d'essai gratuit sur tous les plans. Annulable à tout moment.",
      perMonth:"/mois",
      noCommitment:"Sans engagement · Annulation facile",
      cta:"Démarrer l'essai →",
      footnote:"Paiement sécurisé par Stripe · Annulation à tout moment · Facture mensuelle",
    },
    plans: [
      { badge:null,
        features:["300 CVs analysés / mois", "Recruteur indépendant, 1 utilisateur", "Score /100 + points forts et faibles", "Export CSV / Excel", "≈ 0,16 € par CV"] },
      { badge:"Le plus choisi",
        features:["1 500 CVs analysés / mois", "Jusqu'à 3 recruteurs", "Score /100 + points forts et faibles", "Export CSV / Excel", "Support prioritaire", "≈ 0,09 € par CV"] },
      { badge:"✦ Centres d'appels / RPO",
        features:["5 000 CVs analysés / mois", "Utilisateurs illimités", "Score /100 + points forts et faibles", "Export CSV / Excel", "Interlocuteur dédié", "≈ 0,06 € par CV"] },
    ],
    faqTitle:"Questions fréquentes",
    faq: [
      { q:"Combien de CVs peut-on analyser simultanément ?", a:"Jusqu'à 100 CVs par analyse, dans la limite du quota mensuel de votre plan." },
      { q:"Les données de mes candidats sont-elles sécurisées ?", a:"Le fichier PDF est effacé dès que son analyse est terminée. Seuls le score et la synthèse restent dans votre espace, et vous pouvez supprimer une analyse à tout moment. Les coordonnées (email, téléphone, liens) sont masquées avant l'envoi à l'IA, et les CVs ne servent pas à entraîner de modèle." },
      { q:"Puis-je exporter les résultats d'analyse ?", a:"Oui, export CSV/Excel disponible sur tous les plans." },
      { q:"L'IA prend-elle la décision à ma place ?", a:"Non. DocSwift HR classe et justifie, vous décidez. L'IA ne tient compte ni de l'âge, ni du genre, ni de l'origine : uniquement des compétences et de l'expérience au regard du poste. Le score est une aide au tri, pas un verdict." },
      { q:"Comment fonctionne la facturation ?", a:"Paiement mensuel par carte via Stripe. Annulation à tout moment, sans frais ni engagement." },
      { q:"Y a-t-il une période d'essai gratuite ?", a:"Oui, 14 jours d'essai gratuit sur tous les plans (carte bancaire requise, aucun débit avant la fin de l'essai)." },
    ],
    cta: {
      title:"Prêt à recruter plus vite ?",
      line1:"Testez sur vos propres candidatures, en moins d'une minute.",
      line2:"5 CVs gratuits, sans compte.",
      button:"Essayer gratuitement →",
    },
    newsletter: {
      title:"Recruter plus vite, sans enfreindre le RGPD",
      text:"Nos conseils pratiques sur le tri de CV et l'IA en recrutement, deux fois par mois maximum.",
    },
    footer: {
      tagline:"© 2026 Motoko LLC — DocSwift HR. Recrutement assisté par IA.",
      dashboard:"Dashboard", trial:"Essai gratuit", pricing:"Tarifs", legal:"Confidentialité & CGU",
    },
  },
  en: {
    nav: { trial:"Free trial", pricing:"Pricing", dashboard:"Dashboard →", login:"Log in" },
    hero: {
      badge:"AI-assisted recruiting",
      titleHighlight:"Screen 100 CVs",
      titleRest:"in 3 minutes.",
      subBefore:"DocSwift HR automatically analyzes your applications and gives you a ",
      subStrong:"match score",
      subAfter:" against your job description.",
      audience:"For recruitment agencies, SMBs and independent recruiters.",
      ctaPrimary:"Try it free →",
      ctaDemo:"See the demo ↓",
      trust:"✓ 5 free CVs, no account needed  ·  ✓ 14-day trial, €0 charged before day 14  ·  ✓ Cancel in 1 click",
    },
    stats: [
      { value:"100", label:"CVs per analysis" },
      { value:"≈ 3 min", label:"to screen 100 CVs" },
      { value:"FR · EN · AR", label:"multilingual analysis" },
      { value:"0", label:"automated decisions: you stay in control" },
    ],
    problem: {
      badge:"😩 The problem",
      titleBefore:"Manually screening ", titleHighlight:"100 CVs", titleAfter:" for a single role can easily take a full day.",
      text:"Reading one by one, scattered notes, subjective criteria, things slipping through… CV screening is time-consuming, exhausting and error-prone.",
    },
    solution: {
      badge:"✅ The solution",
      titleBefore:"DocSwift HR does it in ", titleHighlight:"a few minutes", titleAfter:".",
      text:"Upload your job description + your CVs. The AI analyzes each profile, calculates a match score and instantly generates a hiring recommendation.",
    },
    demo: {
      badge:"👥 Demo",
      title:"Real-time results dashboard",
      disclaimer:"Illustrative example: fictional candidates.",
      subtitle:"Every CV analyzed automatically — score, strengths, weaknesses, recommendation.",
      windowTitle:"DocSwift HR — Senior React Developer — 4 candidates analyzed",
      headers:["Candidate","Score","Status","Action"],
      details:"View details",
      footer:"4 CVs analyzed · Total time: 1m 43s",
      export:"⬇️ Export CSV",
    },
    status: { recommended:"Recommended", consider:"To consider", rejected:"Not selected" },
    pricing: {
      title:"Simple, transparent pricing",
      subtitle:"14-day free trial on all plans. Cancel anytime.",
      perMonth:"/month",
      noCommitment:"No commitment · Easy cancellation",
      cta:"Start the trial →",
      footnote:"Secure payment by Stripe · Cancel anytime · Monthly invoice",
    },
    plans: [
      { badge:null,
        features:["300 CVs analyzed / month", "Independent recruiter, 1 user", "Score /100 + strengths and weaknesses", "CSV / Excel export", "≈ €0.16 per CV"] },
      { badge:"Most popular",
        features:["1,500 CVs analyzed / month", "Up to 3 recruiters", "Score /100 + strengths and weaknesses", "CSV / Excel export", "Priority support", "≈ €0.09 per CV"] },
      { badge:"✦ Call centers / RPO",
        features:["5,000 CVs analyzed / month", "Unlimited users", "Score /100 + strengths and weaknesses", "CSV / Excel export", "Dedicated contact", "≈ €0.06 per CV"] },
    ],
    faqTitle:"Frequently asked questions",
    faq: [
      { q:"How many CVs can be analyzed at once?", a:"Up to 100 CVs per analysis, within your plan's monthly quota." },
      { q:"Is my candidates' data secure?", a:"The PDF file is deleted as soon as its analysis is complete. Only the score and summary remain in your workspace, and you can delete an analysis at any time. Contact details (email, phone, links) are masked before being sent to the AI, and CVs are not used to train any model." },
      { q:"Can I export the analysis results?", a:"Yes, CSV/Excel export is available on all plans." },
      { q:"Does the AI make the decision for me?", a:"No. DocSwift HR ranks and explains, you decide. The AI does not take age, gender or origin into account: only skills and experience relative to the role. The score is a screening aid, not a verdict." },
      { q:"How does billing work?", a:"Monthly card payment via Stripe. Cancel anytime, with no fees or commitment." },
      { q:"Is there a free trial period?", a:"Yes, a 14-day free trial on all plans (credit card required, no charge before the trial ends)." },
    ],
    cta: {
      title:"Ready to hire faster?",
      line1:"Try it on your own applications, in under a minute.",
      line2:"5 free CVs, no account needed.",
      button:"Try it free →",
    },
    newsletter: {
      title:"Hire faster, without breaching GDPR",
      text:"Our practical tips on CV screening and AI in recruiting, twice a month at most.",
    },
    footer: {
      tagline:"© 2026 Motoko LLC — DocSwift HR. AI-assisted recruiting.",
      dashboard:"Dashboard", trial:"Free trial", pricing:"Pricing", legal:"Privacy & Terms",
    },
  },
  ar: {
    nav: { trial:"تجربة مجانية", pricing:"الأسعار", dashboard:"لوحة التحكم ←", login:"تسجيل الدخول" },
    hero: {
      badge:"توظيف بمساعدة الذكاء الاصطناعي",
      titleHighlight:"افرز 100 سيرة ذاتية",
      titleRest:"في 3 دقائق.",
      subBefore:"يحلّل DocSwift HR طلبات التوظيف لديك تلقائيًا ويمنحك ",
      subStrong:"درجة مطابقة",
      subAfter:" مع الوصف الوظيفي.",
      audience:"لمكاتب الموارد البشرية والشركات الصغيرة والمتوسطة ومسؤولي التوظيف المستقلين.",
      ctaPrimary:"جرّبه مجانًا ←",
      ctaDemo:"شاهد العرض التوضيحي ↓",
      trust:"✓ 5 سير ذاتية مجانًا دون حساب  ·  ✓ تجربة 14 يومًا، 0 € قبل اليوم 14  ·  ✓ إلغاء بنقرة واحدة",
    },
    stats: [
      { value:"100", label:"سيرة ذاتية لكل تحليل" },
      { value:"≈ 3 دقائق", label:"لفرز 100 سيرة ذاتية" },
      { value:"FR · EN · AR", label:"تحليل متعدد اللغات" },
      { value:"0", label:"قرار آلي: القرار يبقى بيدك" },
    ],
    problem: {
      badge:"😩 المشكلة",
      titleBefore:"فرز ", titleHighlight:"100 سيرة ذاتية", titleAfter:" يدويًا لوظيفة واحدة قد يستغرق يومًا كاملًا بسهولة.",
      text:"قراءة كل ملف على حدة، وملاحظات متفرقة، ومعايير ذاتية، وسهو… فرز السير الذاتية يستهلك الوقت ومرهق ومعرّض للأخطاء.",
    },
    solution: {
      badge:"✅ الحل",
      titleBefore:"يقوم DocSwift HR بذلك في ", titleHighlight:"بضع دقائق", titleAfter:".",
      text:"ارفع الوصف الوظيفي + السير الذاتية. يحلّل الذكاء الاصطناعي كل ملف، ويحسب درجة المطابقة، ويقدّم توصية توظيف فورًا.",
    },
    demo: {
      badge:"👥 عرض توضيحي",
      title:"لوحة نتائج في الوقت الفعلي",
      disclaimer:"مثال توضيحي: مرشحون وهميون.",
      subtitle:"كل سيرة ذاتية تُحلَّل تلقائيًا — الدرجة، نقاط القوة، نقاط الضعف، التوصية.",
      windowTitle:"DocSwift HR — مطوّر React أول — 4 مرشحين تم تحليلهم",
      headers:["المرشح","الدرجة","الحالة","إجراء"],
      details:"عرض التفاصيل",
      footer:"4 سير ذاتية تم تحليلها · الوقت الإجمالي: 1m 43s",
      export:"⬇️ تصدير CSV",
    },
    status: { recommended:"موصى به", consider:"يستحق النظر", rejected:"غير مقبول" },
    pricing: {
      title:"أسعار بسيطة وشفافة",
      subtitle:"تجربة مجانية لمدة 14 يومًا على جميع الباقات. يمكن الإلغاء في أي وقت.",
      perMonth:"/شهريًا",
      noCommitment:"دون التزام · إلغاء سهل",
      cta:"ابدأ التجربة ←",
      footnote:"دفع آمن عبر Stripe · إلغاء في أي وقت · فاتورة شهرية",
    },
    plans: [
      { badge:null,
        features:["300 سيرة ذاتية مُحلَّلة / شهريًا", "مسؤول توظيف مستقل، مستخدم واحد", "درجة من 100 + نقاط القوة والضعف", "تصدير CSV / Excel", "≈ 0.16 € لكل سيرة ذاتية"] },
      { badge:"الأكثر اختيارًا",
        features:["1,500 سيرة ذاتية مُحلَّلة / شهريًا", "حتى 3 مسؤولي توظيف", "درجة من 100 + نقاط القوة والضعف", "تصدير CSV / Excel", "دعم ذو أولوية", "≈ 0.09 € لكل سيرة ذاتية"] },
      { badge:"✦ مراكز الاتصال / RPO",
        features:["5,000 سيرة ذاتية مُحلَّلة / شهريًا", "عدد غير محدود من المستخدمين", "درجة من 100 + نقاط القوة والضعف", "تصدير CSV / Excel", "مسؤول تواصل مخصص", "≈ 0.06 € لكل سيرة ذاتية"] },
    ],
    faqTitle:"الأسئلة الشائعة",
    faq: [
      { q:"كم سيرة ذاتية يمكن تحليلها في آن واحد؟", a:"حتى 100 سيرة ذاتية لكل تحليل، ضمن الحصة الشهرية لباقتك." },
      { q:"هل بيانات المرشحين لديّ آمنة؟", a:"يُحذف ملف PDF فور انتهاء تحليله. لا يبقى في مساحتك سوى الدرجة والملخص، ويمكنك حذف أي تحليل في أي وقت. تُخفى بيانات الاتصال (البريد الإلكتروني، الهاتف، الروابط) قبل إرسالها إلى الذكاء الاصطناعي، ولا تُستخدم السير الذاتية لتدريب أي نموذج." },
      { q:"هل يمكنني تصدير نتائج التحليل؟", a:"نعم، التصدير بصيغة CSV/Excel متاح في جميع الباقات." },
      { q:"هل يتخذ الذكاء الاصطناعي القرار بدلًا مني؟", a:"لا. يرتّب DocSwift HR ويبرّر، وأنت من يقرّر. لا يأخذ الذكاء الاصطناعي في الاعتبار العمر ولا الجنس ولا الأصل: فقط المهارات والخبرة بالنسبة إلى الوظيفة. الدرجة أداة مساعدة على الفرز، وليست حكمًا نهائيًا." },
      { q:"كيف تتم الفوترة؟", a:"دفع شهري بالبطاقة عبر Stripe. إلغاء في أي وقت، دون رسوم أو التزام." },
      { q:"هل توجد فترة تجربة مجانية؟", a:"نعم، تجربة مجانية لمدة 14 يومًا على جميع الباقات (بطاقة بنكية مطلوبة، دون أي خصم قبل نهاية التجربة)." },
    ],
    cta: {
      title:"مستعد للتوظيف بشكل أسرع؟",
      line1:"جرّبه على طلبات التوظيف الخاصة بك، في أقل من دقيقة.",
      line2:"5 سير ذاتية مجانًا، دون حساب.",
      button:"جرّبه مجانًا ←",
    },
    newsletter: {
      title:"وظّف بشكل أسرع، دون مخالفة اللائحة العامة لحماية البيانات (GDPR)",
      text:"نصائحنا العملية حول فرز السير الذاتية والذكاء الاصطناعي في التوظيف، مرتين في الشهر كحد أقصى.",
    },
    footer: {
      tagline:"© 2026 Motoko LLC — DocSwift HR. توظيف بمساعدة الذكاء الاصطناعي.",
      dashboard:"لوحة التحكم", trial:"تجربة مجانية", pricing:"الأسعار", legal:"الخصوصية والشروط",
    },
  },
};

export default function HrLanding() {
  const locale  = useLocale();
  const { data: session } = useSession();
  const router  = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const t = COPY[locale] ?? COPY.fr;
  const plans = PLANS.map((p, i) => ({ ...p, ...t.plans[i] }));

  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  const go = (path) => router.push(`${localePrefix}${path}`);

  const handleSubscribe = async (plan) => {
    // Keep the chosen plan through login: the dashboard resumes checkout from ?plan=
    if (!session) { signIn(undefined, { callbackUrl: `${localePrefix}/hr/dashboard?plan=${plan}` }); return; }
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
          👥 <bdi dir="ltr">Doc<span style={{ color:"#F97316" }}>Swift HR</span></bdi>
        </a>
        <div className="nav-links" style={{ display:"flex",gap:28,alignItems:"center" }}>
          <a href={`${localePrefix}/hr/essai-gratuit`} className="nav-link" style={{ color:"#8892AA",textDecoration:"none",fontSize:14 }}>{t.nav.trial}</a>
          <a href="#pricing" className="nav-link" style={{ color:"#8892AA",textDecoration:"none",fontSize:14 }}>{t.nav.pricing}</a>
          <LanguageSwitcher />
          {session
            ? <button className="btn-primary" onClick={() => go("/hr/dashboard")} style={{ background:"#F97316",color:"#fff",padding:"9px 22px",borderRadius:8,fontSize:14,fontWeight:700,border:"none",cursor:"pointer" }}>{t.nav.dashboard}</button>
            : <button className="btn-primary" onClick={() => signIn(undefined, { callbackUrl:`${localePrefix}/hr/dashboard` })} style={{ background:"#F97316",color:"#fff",padding:"9px 22px",borderRadius:8,fontSize:14,fontWeight:700,border:"none",cursor:"pointer" }}>{t.nav.login}</button>
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
            {t.hero.badge}
          </div>

          <h1 className="hero-text hero-h1" style={{ fontSize:"clamp(36px,6.5vw,80px)",fontWeight:900,letterSpacing:-3,lineHeight:1.04,marginBottom:24 }}>
            <span className="gradient-text-orange">{t.hero.titleHighlight}</span><br />{t.hero.titleRest}
          </h1>

          <p className="hero-sub" style={{ color:"#8892AA",fontSize:19,maxWidth:560,margin:"0 auto 14px",lineHeight:1.7 }}>
            {t.hero.subBefore}<strong style={{ color:"#F0F4FF" }}>{t.hero.subStrong}</strong>{t.hero.subAfter}
          </p>
          <p style={{ color:"#4B5563",fontSize:14,maxWidth:480,margin:"0 auto 44px" }}>
            {t.hero.audience}
          </p>

          <div className="hero-ctas" style={{ display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap" }}>
            <button className="btn-primary" onClick={() => go("/hr/essai-gratuit")} style={{ background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",padding:"16px 38px",borderRadius:14,fontSize:17,fontWeight:800,border:"none",cursor:"pointer",letterSpacing:-.3 }}>
              {t.hero.ctaPrimary}
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById("demo")?.scrollIntoView({behavior:"smooth"})}
              style={{ background:"rgba(30,39,51,.6)",color:"#C0CBE0",padding:"16px 28px",borderRadius:14,fontSize:16,cursor:"pointer",border:"1px solid #1E2733",backdropFilter:"blur(10px)" }}>
              {t.hero.ctaDemo}
            </button>
          </div>

          <p className="hero-trust" style={{ marginTop:28,color:"#4B5563",fontSize:13 }}>
            {t.hero.trust}
          </p>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ borderTop:"1px solid #1E2733",borderBottom:"1px solid #1E2733",padding:"32px 24px",background:"rgba(13,17,23,.9)" }}>
        <div className="stats-bar" style={{ maxWidth:960,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24,textAlign:"center" }}>
          {t.stats.map(s => (
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
              <div style={{ display:"inline-block",background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",color:"#FCA5A5",padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700,marginBottom:20 }}>{t.problem.badge}</div>
              <h2 style={{ fontSize:"clamp(24px,3.5vw,42px)",fontWeight:900,letterSpacing:-1.5,lineHeight:1.15,marginBottom:20 }}>
                {t.problem.titleBefore}<span style={{ color:"#EF4444" }}>{t.problem.titleHighlight}</span>{t.problem.titleAfter}
              </h2>
              <p style={{ color:"#6B7A99",fontSize:16,lineHeight:1.7 }}>
                {t.problem.text}
              </p>
            </div>
            <div>
              <div style={{ display:"inline-block",background:"rgba(16,185,129,.08)",border:"1px solid rgba(16,185,129,.2)",color:"#6EE7B7",padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700,marginBottom:20 }}>{t.solution.badge}</div>
              <h2 style={{ fontSize:"clamp(24px,3.5vw,42px)",fontWeight:900,letterSpacing:-1.5,lineHeight:1.15,marginBottom:20 }}>
                {t.solution.titleBefore}<span style={{ color:"#10B981" }}>{t.solution.titleHighlight}</span>{t.solution.titleAfter}
              </h2>
              <p style={{ color:"#6B7A99",fontSize:16,lineHeight:1.7 }}>
                {t.solution.text}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── DÉMO HR ── */}
      <div id="demo" style={{ padding:"80px 24px",background:"#070B13",borderTop:"1px solid #1E2733",borderBottom:"1px solid #1E2733" }}>
        <div style={{ maxWidth:900,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:48 }}>
            <div style={{ display:"inline-block",background:"rgba(249,115,22,.08)",border:"1px solid rgba(249,115,22,.2)",color:"#FB923C",padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700,marginBottom:16 }}>{t.demo.badge}</div>
            <h2 style={{ fontSize:"clamp(24px,4vw,44px)",fontWeight:900,letterSpacing:-1.5,marginBottom:12 }}>{t.demo.title}</h2>
            <p style={{ color:"#4B5563",fontSize:12,margin:"0 0 8px" }}>{t.demo.disclaimer}</p>
            <p style={{ color:"#6B7A99",fontSize:16 }}>{t.demo.subtitle}</p>
          </div>

          <div style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:20,overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,.5)" }}>
            <div style={{ padding:"14px 20px",borderBottom:"1px solid #1E2733",display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ width:12,height:12,borderRadius:"50%",background:"#EF4444" }} />
              <div style={{ width:12,height:12,borderRadius:"50%",background:"#F59E0B" }} />
              <div style={{ width:12,height:12,borderRadius:"50%",background:"#10B981" }} />
              <span style={{ color:"#4B5563",fontSize:12,marginLeft:8 }}>{t.demo.windowTitle}</span>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:14 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid #1E2733" }}>
                    {t.demo.headers.map(h => (
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
                        <span style={{ background:`${STATUS_COLOR[row.status]}18`,color:STATUS_COLOR[row.status],fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:20,border:`1px solid ${STATUS_COLOR[row.status]}35` }}>{t.status[row.status]}</span>
                      </td>
                      <td style={{ padding:"14px 20px" }}>
                        <button style={{ background:"rgba(249,115,22,.08)",color:"#FB923C",border:"1px solid rgba(249,115,22,.2)",padding:"5px 12px",borderRadius:7,fontSize:12,cursor:"pointer",fontWeight:600 }}>{t.demo.details}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding:"14px 20px",borderTop:"1px solid #1E2733",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ color:"#4B5563",fontSize:13 }}>{t.demo.footer}</span>
              <button style={{ background:"rgba(16,185,129,.1)",color:"#10B981",border:"1px solid rgba(16,185,129,.25)",padding:"7px 16px",borderRadius:8,fontSize:13,cursor:"pointer",fontWeight:700 }}>{t.demo.export}</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" style={{ padding:"100px 24px",background:"#07090F" }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:60 }}>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)",fontWeight:900,letterSpacing:-1.5,marginBottom:14 }}>{t.pricing.title}</h2>
            <p style={{ color:"#6B7A99",fontSize:16 }}>{t.pricing.subtitle}</p>
          </div>

          <div className="pricing-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }}>
            {plans.map((plan, i) => (
              <div key={i} className="pricing-card" style={{ background:plan.bg,border:`2px solid ${plan.border}`,borderRadius:24,padding:"36px 28px",position:"relative" }}>
                {plan.badge && (
                  <div style={{ position:"absolute",top:-15,left:"50%",transform:"translateX(-50%)",background:plan.badgeBg,color:"#fff",fontSize:11,fontWeight:800,padding:"5px 16px",borderRadius:20,whiteSpace:"nowrap" }}>{plan.badge}</div>
                )}
                <div style={{ fontSize:12,fontWeight:800,color:plan.color,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10 }}>{plan.name}</div>
                <div style={{ display:"flex",alignItems:"flex-end",gap:4,marginBottom:4 }}>
                  <span style={{ fontSize:52,fontWeight:900,letterSpacing:-2,color:"#F0F4FF",lineHeight:1 }}>{plan.price}€</span>
                  <span style={{ color:"#4B5563",fontSize:15,marginBottom:8 }}>{t.pricing.perMonth}</span>
                </div>
                <div style={{ color:"#4B5563",fontSize:12,marginBottom:28 }}>{t.pricing.noCommitment}</div>
                <ul style={{ listStyle:"none",padding:0,margin:"0 0 32px",display:"flex",flexDirection:"column",gap:11 }}>
                  {plan.features.map((f,j) => (
                    <li key={j} style={{ display:"flex",alignItems:"center",gap:10,fontSize:13,color:"#8892AA" }}>
                      <span style={{ color:plan.border,flexShrink:0,fontSize:15 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button className="btn-primary" onClick={() => handleSubscribe(plan.plan)} disabled={checkoutLoading === plan.plan}
                  style={{ width:"100%",padding:"14px",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",background:"linear-gradient(135deg,#F97316,#EA580C)",border:"none",color:"#fff",opacity:checkoutLoading===plan.plan?0.6:1 }}>
                  {checkoutLoading === plan.plan ? "…" : t.pricing.cta}
                </button>
              </div>
            ))}
          </div>
          <p style={{ textAlign:"center",color:"#4B5563",fontSize:13,marginTop:24 }}>{t.pricing.footnote}</p>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ padding:"80px 24px",background:"#070B13",borderTop:"1px solid #1E2733" }}>
        <div style={{ maxWidth:900,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:52 }}>
            <h2 style={{ fontSize:"clamp(26px,4vw,44px)",fontWeight:900,letterSpacing:-1.5,marginBottom:12 }}>{t.faqTitle}</h2>
          </div>
          <div className="faq-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            {t.faq.map((item, i) => (
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
          <h2 style={{ fontSize:"clamp(28px,4vw,48px)",fontWeight:900,letterSpacing:-1.5,marginBottom:16 }}>{t.cta.title}</h2>
          <p style={{ color:"#6B7A99",fontSize:17,marginBottom:40,lineHeight:1.7 }}>
            {t.cta.line1}<br />{t.cta.line2}
          </p>
          <button className="btn-primary" onClick={() => go("/hr/essai-gratuit")}
            style={{ background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"18px 48px",borderRadius:16,fontSize:18,fontWeight:800,cursor:"pointer" }}>
            {t.cta.button}
          </button>
        </div>
      </div>

      {/* ── NEWSLETTER ── */}
      <section style={{ borderTop:"1px solid #1E2733",padding:"48px 24px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:14 }}>
        <h2 style={{ fontSize:22,fontWeight:900,letterSpacing:-0.5,margin:0 }}>{t.newsletter.title}</h2>
        <p style={{ color:"#8892AA",fontSize:15,maxWidth:520,margin:0,lineHeight:1.6 }}>
          {t.newsletter.text}
        </p>
        <NewsletterForm source="hr_landing" />
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid #1E2733",padding:"32px 40px" }}>
        <div className="footer-inner" style={{ maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:20 }}>
          <div>
            <div style={{ fontWeight:900,fontSize:18,letterSpacing:-0.5,marginBottom:4 }}>
              <bdi dir="ltr">Doc<span style={{ color:"#F97316" }}>Swift HR</span></bdi>
            </div>
            <div style={{ color:"#4B5563",fontSize:12 }}>{t.footer.tagline}</div>
          </div>
          <div style={{ display:"flex",gap:24,flexWrap:"wrap" }}>
            <a href={`${localePrefix}/hr/dashboard`} style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>{t.footer.dashboard}</a>
            <a href={`${localePrefix}/hr/essai-gratuit`} style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>{t.footer.trial}</a>
            <a href="#pricing" style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>{t.footer.pricing}</a>
            <a href={`${localePrefix}/terms`} style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>{t.footer.legal}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
