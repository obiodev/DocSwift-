"use client";
import { useState, useRef } from "react";
import { useLocale } from "next-intl";

const MAX_CVS = 5;

const COPY = {
  fr: {
    back: "← DocSwift HR",
    badge: "👥 DocSwift HR — Essai gratuit",
    title: "Testez le screening de CV par IA",
    subtitle: (max) => `Jusqu'à ${max} CVs, sans compte. Résultat en moins d'une minute.`,
    sampleButton: "⚡ Pas de CV sous la main ? Essayer avec 3 CV d'exemple",
    jobTitleLabel: "Titre du poste *",
    jobTitlePlaceholder: "ex. Développeur React Senior",
    jobDescLabel: "Fiche de poste *",
    jobDescPlaceholder: "Décrivez le poste, les responsabilités, les compétences requises…",
    cvsLabel: (max) => `CVs (PDF, max ${max}) *`,
    filesSelected: (n) => `${n} fichier${n>1?"s":""} sélectionné${n>1?"s":""}`,
    dropHint: "Glissez vos CV ici ou cliquez pour les choisir",
    remove: "Retirer",
    analyzing: "Analyse en cours…",
    analyze: (n) => `Analyser ${n || ""} CV${n>1?"s":""} gratuitement →`,
    resultsTitle: (job) => `Résultats — ${job}`,
    strengths: "✅ POINTS FORTS",
    weaknesses: "⚠️ POINTS FAIBLES",
    unlockTitle: "🔓 Débloquez l'analyse complète",
    unlockText: "Entrez votre email pour voir les points forts, points faibles et résumé détaillé de chaque CV.",
    emailPlaceholder: "vous@entreprise.com",
    seeResults: "Voir les résultats →",
    ctaText: "Ce tri vous a fait gagner du temps ? Analysez toutes les candidatures de ce poste : 14 jours offerts, 0 € débité avant J14.",
    ctaButton: "Lancer mon essai 14 jours →",
    seePricing: "Voir les tarifs",
    status: { recommended:"Recommandé", consider:"À considérer", rejected:"Non retenu", error:"Erreur" },
    errorLabel: "Erreur",
    errSampleLoad: "Impossible de charger les CV d'exemple. Ajoutez vos propres CV.",
    errJobMissing: "Remplissez le titre et la description du poste.",
    errNoCv: "Ajoutez au moins un CV (PDF).",
    errAnalysis: "Erreur lors de l'analyse.",
    errNetwork: "Erreur réseau.",
    errEmail: "Adresse email invalide.",
    errRetry: "Erreur, réessayez.",
    sampleJobTitle: "Conseiller relation client bilingue",
    sampleJobDesc: "Centre d'appels, recrutement de conseillers clientèle. Expérience de 2 ans minimum en relation client par téléphone, français courant et anglais professionnel (B2+), maîtrise d'un CRM, gestion des réclamations. Un plus : arabe, expérience en vente additionnelle.",
  },
  en: {
    back: "← DocSwift HR",
    badge: "👥 DocSwift HR — Free trial",
    title: "Try AI-powered CV screening",
    subtitle: (max) => `Up to ${max} CVs, no account needed. Results in under a minute.`,
    sampleButton: "⚡ No CVs at hand? Try it with 3 sample CVs",
    jobTitleLabel: "Job title *",
    jobTitlePlaceholder: "e.g. Senior React Developer",
    jobDescLabel: "Job description *",
    jobDescPlaceholder: "Describe the role, responsibilities and required skills…",
    cvsLabel: (max) => `CVs (PDF, max ${max}) *`,
    filesSelected: (n) => `${n} file${n>1?"s":""} selected`,
    dropHint: "Drag your CVs here or click to choose them",
    remove: "Remove",
    analyzing: "Analyzing…",
    analyze: (n) => `Analyze ${n || ""} CV${n>1?"s":""} for free →`,
    resultsTitle: (job) => `Results — ${job}`,
    strengths: "✅ STRENGTHS",
    weaknesses: "⚠️ WEAKNESSES",
    unlockTitle: "🔓 Unlock the full analysis",
    unlockText: "Enter your email to see the strengths, weaknesses and detailed summary for each CV.",
    emailPlaceholder: "you@company.com",
    seeResults: "See the results →",
    ctaText: "Did this screening save you time? Analyze every application for this role: 14 days free, €0 charged before day 14.",
    ctaButton: "Start my 14-day trial →",
    seePricing: "See pricing",
    status: { recommended:"Recommended", consider:"To consider", rejected:"Not selected", error:"Error" },
    errorLabel: "Error",
    errSampleLoad: "Unable to load the sample CVs. Please add your own CVs.",
    errJobMissing: "Please fill in the job title and description.",
    errNoCv: "Add at least one CV (PDF).",
    errAnalysis: "An error occurred during the analysis.",
    errNetwork: "Network error.",
    errEmail: "Invalid email address.",
    errRetry: "An error occurred, please try again.",
    sampleJobTitle: "Bilingual Customer Service Advisor",
    sampleJobDesc: "Call center hiring customer service advisors. At least 2 years of experience in phone-based customer service, fluent French and professional English (B2+), proficiency with a CRM, complaint handling. A plus: Arabic, upselling experience.",
  },
  ar: {
    back: "→ DocSwift HR",
    badge: "👥 DocSwift HR — تجربة مجانية",
    title: "جرّب فرز السير الذاتية بالذكاء الاصطناعي",
    subtitle: (max) => `حتى ${max} سير ذاتية، دون الحاجة إلى حساب. النتيجة في أقل من دقيقة.`,
    sampleButton: "⚡ لا تتوفر لديك سير ذاتية؟ جرّب باستخدام 3 سير ذاتية نموذجية",
    jobTitleLabel: "المسمى الوظيفي *",
    jobTitlePlaceholder: "مثال: مطوّر React أول",
    jobDescLabel: "الوصف الوظيفي *",
    jobDescPlaceholder: "صِف الوظيفة والمسؤوليات والمهارات المطلوبة…",
    cvsLabel: (max) => `السير الذاتية (PDF، ${max} كحد أقصى) *`,
    filesSelected: (n) => (n === 1 ? "تم اختيار ملف واحد" : `تم اختيار ${n} ملفات`),
    dropHint: "اسحب سيرك الذاتية إلى هنا أو انقر لاختيارها",
    remove: "إزالة",
    analyzing: "جارٍ التحليل…",
    analyze: (n) => (n === 1 ? "حلّل سيرة ذاتية واحدة مجانًا ←" : n ? `حلّل ${n} سير ذاتية مجانًا ←` : "حلّل السير الذاتية مجانًا ←"),
    resultsTitle: (job) => `النتائج — ${job}`,
    strengths: "✅ نقاط القوة",
    weaknesses: "⚠️ نقاط الضعف",
    unlockTitle: "🔓 اطّلع على التحليل الكامل",
    unlockText: "أدخل بريدك الإلكتروني لعرض نقاط القوة ونقاط الضعف والملخص المفصّل لكل سيرة ذاتية.",
    emailPlaceholder: "you@company.com",
    seeResults: "عرض النتائج ←",
    ctaText: "هل وفّر عليك هذا الفرز الوقت؟ حلّل جميع طلبات التوظيف لهذه الوظيفة: 14 يومًا مجانًا، ولا يُخصم أي مبلغ (0 €) قبل اليوم الرابع عشر.",
    ctaButton: "ابدأ تجربتي لمدة 14 يومًا ←",
    seePricing: "عرض الأسعار",
    status: { recommended:"موصى به", consider:"يستحق النظر", rejected:"غير مقبول", error:"خطأ" },
    errorLabel: "خطأ",
    errSampleLoad: "تعذّر تحميل السير الذاتية النموذجية. أضف سيرك الذاتية الخاصة.",
    errJobMissing: "يرجى ملء المسمى الوظيفي والوصف الوظيفي.",
    errNoCv: "أضف سيرة ذاتية واحدة على الأقل (PDF).",
    errAnalysis: "حدث خطأ أثناء التحليل.",
    errNetwork: "خطأ في الشبكة.",
    errEmail: "عنوان البريد الإلكتروني غير صالح.",
    errRetry: "حدث خطأ، يرجى المحاولة مرة أخرى.",
    sampleJobTitle: "مستشار خدمة عملاء ثنائي اللغة",
    sampleJobDesc: "مركز اتصال يوظّف مستشاري خدمة عملاء. خبرة لا تقل عن سنتين في خدمة العملاء عبر الهاتف، إتقان اللغة الفرنسية والإنجليزية المهنية (B2+)، إتقان استخدام نظام CRM، ومعالجة الشكاوى. ميزة إضافية: اللغة العربية، وخبرة في البيع الإضافي.",
  },
};

const STATUS_COLOR = { recommended:"#10B981", consider:"#F59E0B", rejected:"#EF4444", error:"#EF4444" };

export default function HrTrialPage() {
  const locale = useLocale();
  const t = COPY[locale] ?? COPY.fr;
  const prefix = locale === "fr" ? "" : `/${locale}`;
  const STATUS_LABEL = t.status;

  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc]   = useState("");
  const [files, setFiles]       = useState([]);
  const [screening, setScreening] = useState(false);
  const [results, setResults]   = useState(null);   // { jobTitle, results: [...] }
  const [error, setError]       = useState("");

  const [email, setEmail]         = useState("");
  const [unlocked, setUnlocked]   = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadError, setLeadError] = useState("");

  const fileInputRef = useRef(null);

  const addFiles = (list) => {
    const pdfFiles = Array.from(list).filter(f => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...pdfFiles.filter(f => !names.has(f.name))].slice(0, MAX_CVS);
    });
  };

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name));

  const [dragOver, setDragOver] = useState(false);

  // One-click demo: fictional job + 3 fictional CVs, no real candidate data needed
  const loadSample = async () => {
    setError("");
    setJobTitle(t.sampleJobTitle);
    setJobDesc(t.sampleJobDesc);
    try {
      const names = ["candidat-exemple-1.pdf", "candidat-exemple-2.pdf", "candidat-exemple-3.pdf"];
      const blobs = await Promise.all(names.map(n => fetch(`/samples/${n}`).then(r => { if (!r.ok) throw new Error(); return r.blob(); })));
      setFiles(blobs.map((b, i) => new File([b], names[i], { type: "application/pdf" })));
    } catch {
      setError(t.errSampleLoad);
    }
  };

  const runTrial = async () => {
    setError("");
    if (!jobTitle.trim() || !jobDesc.trim()) { setError(t.errJobMissing); return; }
    if (!files.length) { setError(t.errNoCv); return; }

    setScreening(true);
    try {
      const fd = new FormData();
      fd.append("jobTitle", jobTitle);
      fd.append("jobDescription", jobDesc);
      files.forEach(f => fd.append("files", f));

      const r = await fetch("/api/hr/trial/screen", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) { setError(data.message ?? t.errAnalysis); return; }
      setResults(data);
    } catch {
      setError(t.errNetwork);
    } finally {
      setScreening(false);
    }
  };

  const submitLead = async () => {
    setLeadError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setLeadError(t.errEmail); return; }
    setSubmittingLead(true);
    try {
      const r = await fetch("/api/hr/trial/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, jobTitle: results?.jobTitle, cvCount: results?.results?.length ?? 0 }),
      });
      if (!r.ok) { setLeadError(t.errRetry); return; }
      setUnlocked(true);
    } catch {
      setLeadError(t.errNetwork);
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh",background:"#07090F",color:"#F0F4FF",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",padding:"48px 20px" }}>
      <div style={{ maxWidth:720,margin:"0 auto" }}>

        <a href={`${prefix}/hr`} style={{ color:"#6B7A99",fontSize:13,textDecoration:"none",display:"inline-block",marginBottom:20 }}>{t.back}</a>
        <div style={{ textAlign:"center",marginBottom:36 }}>
          <div style={{ display:"inline-block",background:"rgba(249,115,22,.1)",border:"1px solid rgba(249,115,22,.3)",borderRadius:50,padding:"6px 16px",fontSize:12,fontWeight:700,color:"#F97316",marginBottom:14 }}>
            {t.badge}
          </div>
          <h1 style={{ fontSize:28,fontWeight:900,letterSpacing:-1,margin:"0 0 10px" }}>{t.title}</h1>
          <p style={{ color:"#6B7A99",fontSize:15,margin:0 }}>{t.subtitle(MAX_CVS)}</p>
        </div>

        {!results && (
          <div style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:20,padding:28 }}>
            <button type="button" onClick={loadSample}
              style={{ width:"100%",background:"rgba(249,115,22,.08)",border:"1px solid rgba(249,115,22,.35)",color:"#FDBA74",borderRadius:10,padding:"11px",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:20 }}>
              {t.sampleButton}
            </button>
            <label style={{ display:"block",marginBottom:6,fontSize:13,fontWeight:600,color:"#8892AA" }}>{t.jobTitleLabel}</label>
            <input
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder={t.jobTitlePlaceholder}
              style={{ width:"100%",background:"#07090F",border:"1px solid #1E2733",borderRadius:10,padding:"12px 14px",color:"#F0F4FF",fontSize:14,marginBottom:18,boxSizing:"border-box",outline:"none" }}
            />

            <label style={{ display:"block",marginBottom:6,fontSize:13,fontWeight:600,color:"#8892AA" }}>{t.jobDescLabel}</label>
            <textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder={t.jobDescPlaceholder}
              rows={6}
              style={{ width:"100%",background:"#07090F",border:"1px solid #1E2733",borderRadius:10,padding:"12px 14px",color:"#F0F4FF",fontSize:14,resize:"vertical",marginBottom:18,boxSizing:"border-box",outline:"none",fontFamily:"inherit" }}
            />

            <label style={{ display:"block",marginBottom:6,fontSize:13,fontWeight:600,color:"#8892AA" }}>{t.cvsLabel(MAX_CVS)}</label>
            <button type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files ?? []); }}
              style={{ display:"block",width:"100%",border:`2px dashed ${dragOver ? "#F97316" : "#1E2733"}`,background:dragOver ? "rgba(249,115,22,.06)" : "transparent",borderRadius:14,padding:"28px 20px",textAlign:"center",cursor:"pointer",marginBottom:14,color:"inherit",font:"inherit" }}>
              <div style={{ fontSize:28,marginBottom:6 }}>📄</div>
              <p style={{ color:"#6B7A99",fontSize:13,margin:0 }}>
                {files.length ? t.filesSelected(files.length) : t.dropHint}
              </p>
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf" multiple style={{ display:"none" }} onChange={e => { addFiles(e.target.files ?? []); e.target.value = ""; }} />

            {files.length > 0 && (
              <div style={{ background:"#07090F",borderRadius:10,border:"1px solid #1E2733",marginBottom:18,overflow:"hidden" }}>
                {files.map(f => (
                  <div key={f.name} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px",borderBottom:"1px solid #0A0D14",fontSize:13 }}>
                    <span style={{ color:"#C0CBE0" }}>📄 {f.name}</span>
                    <button onClick={() => removeFile(f.name)} style={{ background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:13 }}>{t.remove}</button>
                  </div>
                ))}
              </div>
            )}

            {error && <p style={{ color:"#EF4444",fontSize:13,marginBottom:14 }}>{error}</p>}

            <button onClick={runTrial} disabled={screening}
              style={{ width:"100%",background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"13px",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",opacity:screening?0.6:1 }}>
              {screening ? t.analyzing : t.analyze(files.length)}
            </button>
          </div>
        )}

        {results && (
          <div style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:20,overflow:"hidden" }}>
            <div style={{ padding:"18px 22px",borderBottom:"1px solid #1E2733" }}>
              <span style={{ fontWeight:800,fontSize:15 }}>{t.resultsTitle(results.jobTitle)}</span>
            </div>

            <div style={{ padding:"0 22px" }}>
              {results.results.map((r, i) => (
                <div key={i} style={{ padding:"16px 0",borderBottom:i<results.results.length-1?"1px solid #1E2733":"none" }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:unlocked?10:0 }}>
                    <span style={{ fontWeight:600,fontSize:14,color:"#C0CBE0" }}>{r.filename.replace(/\.pdf$/i,"")}</span>
                    {r.score != null ? (
                      <span style={{ background:`${STATUS_COLOR[r.status]}15`,color:STATUS_COLOR[r.status],fontSize:12,fontWeight:800,padding:"3px 12px",borderRadius:20,border:`1px solid ${STATUS_COLOR[r.status]}30` }}>
                        {r.score}/100 — {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    ) : (
                      <span style={{ color:"#EF4444",fontSize:12 }}>{r.error_msg ?? t.errorLabel}</span>
                    )}
                  </div>

                  {unlocked && r.summary && (
                    <div style={{ fontSize:13,color:"#8892AA",lineHeight:1.6 }}>
                      <p style={{ margin:"0 0 8px",fontStyle:"italic" }}>💬 {r.summary}</p>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                        <div>
                          <div style={{ color:"#10B981",fontWeight:700,fontSize:11,marginBottom:4 }}>{t.strengths}</div>
                          {(r.strengths ?? []).map((s,j) => <div key={j}>• {s}</div>)}
                        </div>
                        <div>
                          <div style={{ color:"#EF4444",fontWeight:700,fontSize:11,marginBottom:4 }}>{t.weaknesses}</div>
                          {(r.weaknesses ?? []).map((w,j) => <div key={j}>• {w}</div>)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!unlocked && (
              <div style={{ padding:"24px 22px",background:"#0A0E17",borderTop:"1px solid #1E2733" }}>
                <p style={{ fontSize:14,fontWeight:700,margin:"0 0 4px" }}>{t.unlockTitle}</p>
                <p style={{ fontSize:13,color:"#6B7A99",margin:"0 0 14px" }}>{t.unlockText}</p>
                <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    type="email"
                    style={{ flex:1,minWidth:200,background:"#07090F",border:"1px solid #1E2733",borderRadius:10,padding:"12px 14px",color:"#F0F4FF",fontSize:14,outline:"none" }}
                  />
                  <button onClick={submitLead} disabled={submittingLead}
                    style={{ background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"12px 24px",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",opacity:submittingLead?0.6:1 }}>
                    {submittingLead ? "…" : t.seeResults}
                  </button>
                </div>
                {leadError && <p style={{ color:"#EF4444",fontSize:13,marginTop:10 }}>{leadError}</p>}
              </div>
            )}

            {unlocked && (
              <div style={{ padding:"24px 22px",background:"#0A0E17",borderTop:"1px solid #1E2733",textAlign:"center" }}>
                <p style={{ fontSize:14,color:"#8892AA",margin:"0 0 14px" }}>{t.ctaText}</p>
                <a href={`${prefix}/hr/dashboard?plan=starter`} style={{ display:"inline-block",background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",textDecoration:"none",padding:"12px 28px",borderRadius:10,fontSize:14,fontWeight:700 }}>
                  {t.ctaButton}
                </a>
                <div style={{ marginTop:12 }}>
                  <a href={`${prefix}/hr#pricing`} style={{ color:"#6B7A99",fontSize:13 }}>{t.seePricing}</a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
