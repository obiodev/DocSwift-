"use client";
import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { useSession, signIn } from "next-auth/react";
import { useLocale } from "next-intl";

const COPY = {
  fr: {
    dateLocale: "fr-FR",
    statusLabel: { recommended:"Recommandé", consider:"À considérer", rejected:"Non retenu", pending:"En attente", error:"Erreur" },
    badge: { pending:"En attente", analyzing:"En cours…", done:"✓ Terminé", error:"Erreur" },
    planQuota: { starter:"300 CVs/mois", pro:"1 500 CVs/mois", business:"5 000 CVs/mois" },
    errCheckout: "Erreur lors de la création de l'abonnement.",
    errNetwork: "Erreur réseau.",
    errGeneric: "Erreur.",
    errFillAll: "Remplissez tous les champs.",
    errCreate: "Erreur lors de la création.",
    errUpload: "Erreur upload",
    errNetworkShort: "Erreur réseau",
    errAnalyze: "Erreur lors du démarrage de l'analyse.",
    confirmDelete: "Supprimer définitivement cette analyse et tous les résultats des candidats ? Cette action est irréversible.",
    errDelete: "Suppression impossible. Réessayez.",
    loading: "Chargement…",
    backToSite: "Retour au site DocSwift HR",
    backToList: "← Retour aux analyses",
    subtitle: "Analyse de CVs par IA — scoring /100 · export CSV",
    newAnalysis: "+ Nouvelle analyse",
    newAnalysisCard: "Nouvelle analyse",
    planWord: "Plan",
    trial: "· Essai",
    usage: (used, quota) => `${used}/${quota} CVs screenés ce mois-ci`,
    manageSub: "Gérer l'abonnement",
    choosePlan: "Choisissez votre plan DocSwift HR",
    planIntro: "14 jours d'essai gratuit · Carte bancaire requise · Annulez à tout moment",
    perMonth: "/mois",
    startTrial: "Démarrer l'essai →",
    emptyTitle: "Aucune analyse pour l'instant",
    emptyText: "Créez votre première analyse pour commencer le tri de CVs par IA.",
    cvCount: (n) => `📄 ${n} CVs`,
    analyzedCount: (n) => `✓ ${n} analysés`,
    createTitle: "Nouvelle analyse de CVs",
    jobTitleLabel: "Titre du poste *",
    jobTitlePh: "ex. Développeur React Senior",
    jobDescLabel: "Fiche de poste *",
    jobDescPh: "Décrivez le poste, les responsabilités, les compétences requises, le profil recherché…",
    cancel: "Annuler",
    creating: "Création…",
    createBtn: "Créer l'analyse →",
    cvsUploaded: (n) => `${n} CV${n !== 1 ? "s" : ""} uploadé${n !== 1 ? "s" : ""}`,
    addCvs: "📎 Ajouter des CVs",
    alreadyLoaded: (n) => `(${n} déjà chargés)`,
    filesSelected: (n) => `${n} fichier${n>1?"s":""} sélectionné${n>1?"s":""}`,
    dropHere: "Glissez vos CVs ici",
    dropHint: "PDF uniquement · Max 5 MB/fichier · 100 CVs max",
    uploading: "Upload…",
    uploadBtn: (n) => `⬆️ Uploader ${n} CV${n>1?"s":""}`,
    analyzeBtn: (n) => `🔍 Analyser ${n} CV${n>1?"s":""} →`,
    analyzing: "Analyse en cours…",
    progressLine: (done, total) => `${done} / ${total} CVs analysés · Gemini 1.5 Flash`,
    results: (title) => `Résultats — ${title}`,
    resultsCount: (done, total) => `${done}/${total} analysés`,
    exportCsv: "⬇️ Export CSV",
    deleteBtn: "🗑 Supprimer",
    rerun: "🔄 Relancer",
    statRecommended: "Recommandés",
    statConsider: "À considérer",
    statRejected: "Non retenus",
    thFile: "Fichier",
    thScore: "Score",
    thStatus: "Statut",
    thSummary: "Résumé IA",
    pendingAnalysis: "En attente d'analyse…",
    collapse: "▲ Réduire",
    details: "▼ Détails",
    strengths: "✅ POINTS FORTS",
    weaknesses: "⚠️ POINTS FAIBLES",
    emptyJob: "Ajoutez des CVs ci-dessus pour démarrer l'analyse.",
  },
  en: {
    dateLocale: "en-US",
    statusLabel: { recommended:"Recommended", consider:"To consider", rejected:"Not selected", pending:"Pending", error:"Error" },
    badge: { pending:"Pending", analyzing:"In progress…", done:"✓ Done", error:"Error" },
    planQuota: { starter:"300 CVs/month", pro:"1,500 CVs/month", business:"5,000 CVs/month" },
    errCheckout: "Error while creating the subscription.",
    errNetwork: "Network error.",
    errGeneric: "Error.",
    errFillAll: "Please fill in all fields.",
    errCreate: "Error while creating the analysis.",
    errUpload: "Upload error",
    errNetworkShort: "Network error",
    errAnalyze: "Error while starting the analysis.",
    confirmDelete: "Permanently delete this analysis and all candidate results? This action cannot be undone.",
    errDelete: "Unable to delete. Please try again.",
    loading: "Loading…",
    backToSite: "Back to the DocSwift HR website",
    backToList: "← Back to analyses",
    subtitle: "AI-powered CV analysis — scoring /100 · CSV export",
    newAnalysis: "+ New analysis",
    newAnalysisCard: "New analysis",
    planWord: "Plan",
    trial: "· Trial",
    usage: (used, quota) => `${used}/${quota} CVs screened this month`,
    manageSub: "Manage subscription",
    choosePlan: "Choose your DocSwift HR plan",
    planIntro: "14-day free trial · Credit card required · Cancel anytime",
    perMonth: "/month",
    startTrial: "Start the trial →",
    emptyTitle: "No analyses yet",
    emptyText: "Create your first analysis to start AI-powered CV screening.",
    cvCount: (n) => `📄 ${n} CVs`,
    analyzedCount: (n) => `✓ ${n} analyzed`,
    createTitle: "New CV analysis",
    jobTitleLabel: "Job title *",
    jobTitlePh: "e.g. Senior React Developer",
    jobDescLabel: "Job description *",
    jobDescPh: "Describe the role, responsibilities, required skills and the profile you are looking for…",
    cancel: "Cancel",
    creating: "Creating…",
    createBtn: "Create analysis →",
    cvsUploaded: (n) => `${n} CV${n !== 1 ? "s" : ""} uploaded`,
    addCvs: "📎 Add CVs",
    alreadyLoaded: (n) => `(${n} already uploaded)`,
    filesSelected: (n) => `${n} file${n>1?"s":""} selected`,
    dropHere: "Drop your CVs here",
    dropHint: "PDF only · Max 5 MB/file · 100 CVs max",
    uploading: "Uploading…",
    uploadBtn: (n) => `⬆️ Upload ${n} CV${n>1?"s":""}`,
    analyzeBtn: (n) => `🔍 Analyze ${n} CV${n>1?"s":""} →`,
    analyzing: "Analysis in progress…",
    progressLine: (done, total) => `${done} / ${total} CVs analyzed · Gemini 1.5 Flash`,
    results: (title) => `Results — ${title}`,
    resultsCount: (done, total) => `${done}/${total} analyzed`,
    exportCsv: "⬇️ Export CSV",
    deleteBtn: "🗑 Delete",
    rerun: "🔄 Run again",
    statRecommended: "Recommended",
    statConsider: "To consider",
    statRejected: "Not selected",
    thFile: "File",
    thScore: "Score",
    thStatus: "Status",
    thSummary: "AI summary",
    pendingAnalysis: "Awaiting analysis…",
    collapse: "▲ Collapse",
    details: "▼ Details",
    strengths: "✅ STRENGTHS",
    weaknesses: "⚠️ WEAKNESSES",
    emptyJob: "Add CVs above to start the analysis.",
  },
  ar: {
    dateLocale: "ar",
    statusLabel: { recommended:"موصى به", consider:"قيد النظر", rejected:"غير مقبول", pending:"قيد الانتظار", error:"خطأ" },
    badge: { pending:"قيد الانتظار", analyzing:"جارٍ التحليل…", done:"✓ مكتمل", error:"خطأ" },
    planQuota: { starter:"300 سيرة ذاتية/شهريًا", pro:"1500 سيرة ذاتية/شهريًا", business:"5000 سيرة ذاتية/شهريًا" },
    errCheckout: "حدث خطأ أثناء إنشاء الاشتراك.",
    errNetwork: "خطأ في الشبكة.",
    errGeneric: "حدث خطأ.",
    errFillAll: "يرجى ملء جميع الحقول.",
    errCreate: "حدث خطأ أثناء الإنشاء.",
    errUpload: "خطأ في الرفع",
    errNetworkShort: "خطأ في الشبكة",
    errAnalyze: "حدث خطأ أثناء بدء التحليل.",
    confirmDelete: "هل تريد حذف هذا التحليل وجميع نتائج المرشحين نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.",
    errDelete: "تعذّر الحذف. يرجى المحاولة مرة أخرى.",
    loading: "جارٍ التحميل…",
    backToSite: "العودة إلى موقع DocSwift HR",
    backToList: "→ العودة إلى التحليلات",
    subtitle: "تحليل السير الذاتية بالذكاء الاصطناعي — تقييم من 100 · تصدير CSV",
    newAnalysis: "+ تحليل جديد",
    newAnalysisCard: "تحليل جديد",
    planWord: "خطة",
    trial: "· تجربة",
    usage: (used, quota) => `${used}/${quota} سيرة ذاتية تم فرزها هذا الشهر`,
    manageSub: "إدارة الاشتراك",
    choosePlan: "اختر خطة DocSwift HR الخاصة بك",
    planIntro: "تجربة مجانية لمدة 14 يومًا · البطاقة البنكية مطلوبة · يمكنك الإلغاء في أي وقت",
    perMonth: "/شهريًا",
    startTrial: "ابدأ التجربة ←",
    emptyTitle: "لا توجد تحليلات حتى الآن",
    emptyText: "أنشئ تحليلك الأول لبدء فرز السير الذاتية بالذكاء الاصطناعي.",
    cvCount: (n) => `📄 ${n} سيرة ذاتية`,
    analyzedCount: (n) => `✓ ${n} تم تحليلها`,
    createTitle: "تحليل جديد للسير الذاتية",
    jobTitleLabel: "المسمى الوظيفي *",
    jobTitlePh: "مثال: مطوّر React أول",
    jobDescLabel: "الوصف الوظيفي *",
    jobDescPh: "صف الوظيفة والمسؤوليات والمهارات المطلوبة والملف المطلوب…",
    cancel: "إلغاء",
    creating: "جارٍ الإنشاء…",
    createBtn: "إنشاء التحليل ←",
    cvsUploaded: (n) => `عدد السير الذاتية المرفوعة: ${n}`,
    addCvs: "📎 إضافة سير ذاتية",
    alreadyLoaded: (n) => `(${n} مرفوعة مسبقًا)`,
    filesSelected: (n) => `عدد الملفات المحددة: ${n}`,
    dropHere: "اسحب سيرك الذاتية وأفلتها هنا",
    dropHint: "ملفات PDF فقط · 5 ميغابايت كحد أقصى لكل ملف · 100 سيرة ذاتية كحد أقصى",
    uploading: "جارٍ الرفع…",
    uploadBtn: (n) => `⬆️ رفع ${n} سيرة ذاتية`,
    analyzeBtn: (n) => `🔍 تحليل ${n} سيرة ذاتية ←`,
    analyzing: "جارٍ التحليل…",
    progressLine: (done, total) => `تم تحليل ${done} / ${total} سيرة ذاتية · Gemini 1.5 Flash`,
    results: (title) => `النتائج — ${title}`,
    resultsCount: (done, total) => `تم تحليل ${done}/${total}`,
    exportCsv: "⬇️ تصدير CSV",
    deleteBtn: "🗑 حذف",
    rerun: "🔄 إعادة التشغيل",
    statRecommended: "موصى بهم",
    statConsider: "قيد النظر",
    statRejected: "غير مقبولين",
    thFile: "الملف",
    thScore: "التقييم",
    thStatus: "الحالة",
    thSummary: "ملخص الذكاء الاصطناعي",
    pendingAnalysis: "في انتظار التحليل…",
    collapse: "▲ طي",
    details: "▼ التفاصيل",
    strengths: "✅ نقاط القوة",
    weaknesses: "⚠️ نقاط الضعف",
    emptyJob: "أضف سيرًا ذاتية أعلاه لبدء التحليل.",
  },
};

// V2 strings: criteria, human decisions, client report
const COPY_V2 = {
  fr: {
    dropHint: "PDF ou Word (.docx) · PDF scannés acceptés · Max 5 MB/fichier · 100 CVs max",
    progressLine: (done, total) => `${done} / ${total} CVs analysés`,
    resumed: "L'analyse a été reprise là où elle s'était arrêtée.",
    critTitle: "Critères de présélection",
    critHint: "Le score est calculé à partir de ces critères : chaque verdict est justifié par un extrait du CV. Sans critère, l'IA évalue l'adéquation globale.",
    critSuggest: "✨ Suggérer avec l'IA",
    critSuggesting: "Suggestion…",
    critSuggestNeedDesc: "Renseignez d'abord le titre et une fiche de poste détaillée.",
    critSuggestErr: "Suggestion indisponible pour le moment. Ajoutez vos critères à la main.",
    critAdd: "+ Ajouter un critère",
    critPh: "ex. 3 ans d'expérience en React",
    critMust: "Obligatoire",
    critWeight: { 1: "Bonus", 2: "Important", 3: "Essentiel" },
    critRemove: "Retirer",
    critMax: "10 critères maximum.",
    critEdit: "Modifier",
    critSave: "Enregistrer",
    critSaved: "Critères enregistrés. Ils s'appliquent aux prochains CVs analysés.",
    critNone: "Aucun critère : évaluation globale par rapport à la fiche de poste.",
    thDecision: "Décision",
    decide: { shortlisted: "✓ Retenir", to_review: "↻ À revoir", rejected: "✗ Écarter" },
    decisionLabel: { shortlisted: "Retenu", to_review: "À revoir", rejected: "Écarté" },
    decisionClear: "Annuler la décision",
    notePh: "Note (optionnelle, visible dans l'export et le rapport client)",
    decisionHint: "L'IA suggère, vous décidez : chaque décision est horodatée dans le journal d'audit.",
    verdict: { met: "Oui", partial: "Partiel", missing: "Non" },
    criteriaTitle: "🎯 CRITÈRES",
    readVision: "PDF scanné lu par l'IA",
    shareBtn: "🔗 Rapport client",
    shareCompanyPrompt: "Nom affiché sur le rapport (votre cabinet, optionnel) :",
    shareTitle: "Rapport client partagé",
    shareHint: "Lien en lecture seule, anonymisé (sans nom de fichier ni coordonnées). Si vous avez retenu des candidats, seuls ceux-ci y figurent.",
    shareCopy: "Copier le lien",
    shareCopied: "Lien copié ✓",
    shareOpen: "Ouvrir",
    shareRevoke: "Révoquer",
    shareRevokeConfirm: "Révoquer ce lien ? Il cessera immédiatement de fonctionner.",
    shareErr: "Impossible de créer le lien.",
    retryErrors: (n) => `🔄 Relancer ${n} erreur${n > 1 ? "s" : ""}`,
    errNothing: "Aucun CV à analyser.",
  },
  en: {
    dropHint: "PDF or Word (.docx) · Scanned PDFs accepted · Max 5 MB/file · 100 CVs max",
    progressLine: (done, total) => `${done} / ${total} CVs analyzed`,
    resumed: "The analysis resumed where it had stopped.",
    critTitle: "Screening criteria",
    critHint: "The score is computed from these criteria: every verdict is backed by an excerpt of the CV. Without criteria, the AI assesses overall fit.",
    critSuggest: "✨ Suggest with AI",
    critSuggesting: "Suggesting…",
    critSuggestNeedDesc: "Fill in the title and a detailed job description first.",
    critSuggestErr: "Suggestion unavailable right now. Add your criteria manually.",
    critAdd: "+ Add a criterion",
    critPh: "e.g. 3 years of React experience",
    critMust: "Required",
    critWeight: { 1: "Bonus", 2: "Important", 3: "Essential" },
    critRemove: "Remove",
    critMax: "10 criteria maximum.",
    critEdit: "Edit",
    critSave: "Save",
    critSaved: "Criteria saved. They apply to the next CVs analyzed.",
    critNone: "No criteria: overall assessment against the job description.",
    thDecision: "Decision",
    decide: { shortlisted: "✓ Shortlist", to_review: "↻ To review", rejected: "✗ Reject" },
    decisionLabel: { shortlisted: "Shortlisted", to_review: "To review", rejected: "Rejected" },
    decisionClear: "Clear decision",
    notePh: "Note (optional, shown in the export and the client report)",
    decisionHint: "The AI suggests, you decide: every decision is timestamped in the audit log.",
    verdict: { met: "Yes", partial: "Partial", missing: "No" },
    criteriaTitle: "🎯 CRITERIA",
    readVision: "Scanned PDF read by the AI",
    shareBtn: "🔗 Client report",
    shareCompanyPrompt: "Name shown on the report (your agency, optional):",
    shareTitle: "Shared client report",
    shareHint: "Read-only, anonymised link (no file names or contact details). If you shortlisted candidates, only they are included.",
    shareCopy: "Copy link",
    shareCopied: "Link copied ✓",
    shareOpen: "Open",
    shareRevoke: "Revoke",
    shareRevokeConfirm: "Revoke this link? It will stop working immediately.",
    shareErr: "Unable to create the link.",
    retryErrors: (n) => `🔄 Retry ${n} error${n > 1 ? "s" : ""}`,
    errNothing: "No CVs to analyze.",
  },
  ar: {
    dropHint: "PDF أو Word (.docx) · تُقبل ملفات PDF الممسوحة ضوئيًا · 5 ميغابايت كحد أقصى لكل ملف · 100 سيرة ذاتية كحد أقصى",
    progressLine: (done, total) => `تم تحليل ${done} / ${total} سيرة ذاتية`,
    resumed: "تم استئناف التحليل من حيث توقف.",
    critTitle: "معايير الفرز",
    critHint: "يُحتسب التقييم من هذه المعايير: كل حكم مدعوم بمقتطف من السيرة الذاتية. بدون معايير، يقيّم الذكاء الاصطناعي الملاءمة العامة.",
    critSuggest: "✨ اقتراح بالذكاء الاصطناعي",
    critSuggesting: "جارٍ الاقتراح…",
    critSuggestNeedDesc: "أدخل أولاً المسمى الوظيفي ووصفًا وظيفيًا مفصلاً.",
    critSuggestErr: "الاقتراح غير متاح حاليًا. أضف معاييرك يدويًا.",
    critAdd: "+ إضافة معيار",
    critPh: "مثال: 3 سنوات خبرة في React",
    critMust: "إلزامي",
    critWeight: { 1: "إضافي", 2: "مهم", 3: "أساسي" },
    critRemove: "حذف",
    critMax: "10 معايير كحد أقصى.",
    critEdit: "تعديل",
    critSave: "حفظ",
    critSaved: "تم حفظ المعايير. تُطبَّق على السير الذاتية التي ستُحلَّل لاحقًا.",
    critNone: "لا توجد معايير: تقييم عام مقارنة بالوصف الوظيفي.",
    thDecision: "القرار",
    decide: { shortlisted: "✓ اختيار", to_review: "↻ للمراجعة", rejected: "✗ استبعاد" },
    decisionLabel: { shortlisted: "مختار", to_review: "للمراجعة", rejected: "مستبعد" },
    decisionClear: "إلغاء القرار",
    notePh: "ملاحظة (اختيارية، تظهر في التصدير وتقرير العميل)",
    decisionHint: "الذكاء الاصطناعي يقترح وأنت تقرر: كل قرار مؤرخ في سجل التدقيق.",
    verdict: { met: "نعم", partial: "جزئي", missing: "لا" },
    criteriaTitle: "🎯 المعايير",
    readVision: "PDF ممسوح قرأه الذكاء الاصطناعي",
    shareBtn: "🔗 تقرير العميل",
    shareCompanyPrompt: "الاسم المعروض في التقرير (مكتبك، اختياري):",
    shareTitle: "تقرير العميل المشترك",
    shareHint: "رابط للقراءة فقط ومجهول الهوية (بدون أسماء ملفات أو بيانات اتصال). إذا اخترت مرشحين، فلن يظهر سواهم.",
    shareCopy: "نسخ الرابط",
    shareCopied: "تم نسخ الرابط ✓",
    shareOpen: "فتح",
    shareRevoke: "إلغاء",
    shareRevokeConfirm: "إلغاء هذا الرابط؟ سيتوقف عن العمل فورًا.",
    shareErr: "تعذّر إنشاء الرابط.",
    retryErrors: (n) => `🔄 إعادة محاولة ${n} خطأ`,
    errNothing: "لا توجد سير ذاتية للتحليل.",
  },
};

const DECISION_COLOR = { shortlisted:"#10B981", to_review:"#F59E0B", rejected:"#EF4444" };
const VERDICT_COLOR  = { met:"#10B981", partial:"#F59E0B", missing:"#6B7A99" };

const CSS = `
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .spin { animation:spin 1s linear infinite; }
  .fade-in { animation:fadeIn .3s ease both; }
  .drop-zone { transition:all .2s ease; }
  .drop-zone:hover, .drop-zone.drag-over { border-color:#3B82F6!important; background:rgba(59,130,246,.06)!important; }
  .cv-row { transition:background .15s; }
  .cv-row:hover { background:rgba(30,39,51,.6)!important; }
  .btn { transition:all .18s ease; cursor:pointer; }
  .btn:hover { transform:translateY(-1px); }
  .btn:active { transform:translateY(0); }
  .job-card { transition:all .18s ease; cursor:pointer; }
  .job-card:hover { border-color:rgba(59,130,246,.4)!important; }
  @media(max-width:640px) {
    .hr-header { flex-direction:column!important; align-items:flex-start!important; gap:12px!important; }
    .steps-row { flex-direction:column!important; }
    .results-actions { flex-direction:column!important; align-items:stretch!important; }
    .table-wrap { font-size:12px!important; }
  }
`;

const STATUS_COLOR = { recommended:"#10B981", consider:"#F59E0B", rejected:"#EF4444", pending:"#4B5563", error:"#EF4444" };

const PLAN_CARDS = [
  { plan:"starter",  label:"Solo",     price:"49€" },
  { plan:"pro",       label:"Cabinet",  price:"129€" },
  { plan:"business",  label:"Volume",   price:"290€" },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function HrDashboardPage() {
  const locale = useLocale();
  const t = { ...(COPY[locale] ?? COPY.fr), ...(COPY_V2[locale] ?? COPY_V2.fr) };
  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      signIn(undefined, { callbackUrl: window.location.pathname + window.location.search });
    }
  }, [sessionStatus]);

  // ── Subscription state ──────────────────────────────────────────────────
  const [sub, setSub]             = useState(null);   // { active, plan, quota, used, remaining, status }
  const [subLoading, setSubLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null); // plan being checked out
  const [portalLoading, setPortalLoading]     = useState(false);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    fetch("/api/hr/subscription").then(r => r.ok ? r.json() : null).then(setSub).finally(() => setSubLoading(false));
  }, [sessionStatus]);

  const startCheckout = async (plan) => {
    setCheckoutLoading(plan);
    try {
      const r = await fetch("/api/hr/checkout", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ plan }) });
      const data = await r.json();
      if (!r.ok) { alert(data.message ?? t.errCheckout); return; }
      window.location.href = data.url;
    } catch { alert(t.errNetwork); }
    finally { setCheckoutLoading(null); }
  };

  // Resume the plan picked on the landing page before login (?plan=pro)
  const autoCheckoutDone = useRef(false);
  useEffect(() => {
    if (subLoading || autoCheckoutDone.current || sub?.active) return;
    const plan = new URLSearchParams(window.location.search).get("plan");
    if (!plan || !PLAN_CARDS.some(p => p.plan === plan)) return;
    autoCheckoutDone.current = true;
    startCheckout(plan);
  }, [subLoading, sub]);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const r = await fetch("/api/hr/portal", { method:"POST" });
      const data = await r.json();
      if (!r.ok) { alert(data.message ?? t.errGeneric); return; }
      window.location.href = data.url;
    } catch { alert(t.errNetwork); }
    finally { setPortalLoading(false); }
  };

  // ── View state ──────────────────────────────────────────────────────────
  const [view, setView]     = useState("list");      // list | create | job
  const [jobs, setJobs]     = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // ── New job form ─────────────────────────────────────────────────────────
  const [jobTitle, setJobTitle]       = useState("");
  const [jobDesc, setJobDesc]         = useState("");
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState("");
  const [criteria, setCriteria]       = useState([]);   // [{id,label,weight,must}]
  const [suggesting, setSuggesting]   = useState(false);
  const [critMsg, setCritMsg]         = useState("");

  // ── Criteria on an existing job ─────────────────────────────────────────
  const [editCrit, setEditCrit]       = useState(null); // draft array while editing
  const [savingCrit, setSavingCrit]   = useState(false);

  // ── Decisions & share ───────────────────────────────────────────────────
  const [notes, setNotes]             = useState({});   // cvId -> draft note
  const [deciding, setDeciding]       = useState(null); // cvId being saved
  const [sharing, setSharing]         = useState(false);
  const [copied, setCopied]           = useState(false);
  const [resumedMsg, setResumedMsg]   = useState(false);

  // ── Active job ──────────────────────────────────────────────────────────
  const [activeJob, setActiveJob]   = useState(null);  // full job object
  const [analyses, setAnalyses]     = useState([]);
  const [cvFiles, setCvFiles]       = useState([]);     // File[] to upload
  const [uploading, setUploading]   = useState(false);
  const [analyzing, setAnalyzing]   = useState(false);
  const [pollTimer, setPollTimer]   = useState(null);
  const [detailRow, setDetailRow]   = useState(null);   // expanded CV row

  const fileInputRef = useRef(null);
  const dragRef      = useRef(false);

  // ── Load jobs list ──────────────────────────────────────────────────────
  const loadJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const r = await fetch("/api/hr/job");
      if (r.ok) setJobs(await r.json());
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => { if (sessionStatus === "authenticated") loadJobs(); }, [sessionStatus, loadJobs]);

  // ── Poll results ────────────────────────────────────────────────────────
  const startPolling = useCallback((jobId) => {
    const timer = setInterval(async () => {
      try {
        const r = await fetch(`/api/hr/${jobId}/results`);
        if (!r.ok) return;
        const data = await r.json();
        setActiveJob(data.job);
        setAnalyses(data.analyses ?? []);
        if (data.job.resumed) setResumedMsg(true);
        if (data.job.status === "done" || data.job.status === "error") {
          clearInterval(timer);
          setPollTimer(null);
          setAnalyzing(false);
          loadJobs();
        }
      } catch {}
    }, 2000);
    setPollTimer(timer);
    return timer;
  }, [loadJobs]);

  useEffect(() => () => { if (pollTimer) clearInterval(pollTimer); }, [pollTimer]);

  // ── Open an existing job ─────────────────────────────────────────────────
  const openJob = async (job) => {
    setView("job");
    setActiveJob(job);
    setAnalyses([]);
    setCvFiles([]);
    setEditCrit(null); setCritMsg(""); setResumedMsg(false); setDetailRow(null); setNotes({});
    if (job.status === "analyzing") {
      setAnalyzing(true);
      startPolling(job.id);
    } else if (job.status === "done" || job.cv_count > 0) {
      const r = await fetch(`/api/hr/${job.id}/results`);
      if (r.ok) {
        const data = await r.json();
        setActiveJob(data.job);
        setAnalyses(data.analyses ?? []);
      }
    }
  };

  // ── Create new job ───────────────────────────────────────────────────────
  const createJob = async () => {
    if (!jobTitle.trim() || !jobDesc.trim()) { setCreateError(t.errFillAll); return; }
    setCreating(true); setCreateError("");
    try {
      const r = await fetch("/api/hr/job", { method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ title:jobTitle, description:jobDesc, criteria:criteria.filter(c => c.label.trim()), language:locale }) });
      const data = await r.json();
      if (!r.ok) { setCreateError(data.message ?? t.errCreate); return; }
      await loadJobs();
      setJobTitle(""); setJobDesc(""); setCriteria([]); setCritMsg("");
      openJob(data);
    } catch { setCreateError(t.errNetwork); }
    finally { setCreating(false); }
  };

  // ── Criteria: AI suggestion & save ──────────────────────────────────────
  const suggest = async (title, description, apply) => {
    if (!title.trim() || description.trim().length < 40) { setCritMsg(t.critSuggestNeedDesc); return; }
    setSuggesting(true); setCritMsg("");
    try {
      const r = await fetch("/api/hr/criteria/suggest", { method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ title, description, language:locale }) });
      const data = await r.json();
      if (!r.ok || !data.criteria?.length) { setCritMsg(t.critSuggestErr); return; }
      apply(data.criteria);
    } catch { setCritMsg(t.critSuggestErr); }
    finally { setSuggesting(false); }
  };

  const saveCriteria = async () => {
    if (!activeJob || !editCrit) return;
    setSavingCrit(true); setCritMsg("");
    try {
      const r = await fetch(`/api/hr/${activeJob.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ criteria:editCrit.filter(c => c.label.trim()) }) });
      const data = await r.json();
      if (!r.ok) { setCritMsg(data.message ?? t.errGeneric); return; }
      setActiveJob(j => ({ ...j, criteria:data.criteria }));
      setEditCrit(null); setCritMsg(t.critSaved);
    } catch { setCritMsg(t.errNetwork); }
    finally { setSavingCrit(false); }
  };

  // ── Human decision on a CV ──────────────────────────────────────────────
  const decide = async (cv, decision) => {
    setDeciding(cv.id);
    try {
      const r = await fetch(`/api/hr/cv/${cv.id}/decision`, { method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ decision, note: notes[cv.id] ?? cv.decision_note ?? "" }) });
      const data = await r.json();
      if (!r.ok) { alert(t.errGeneric); return; }
      setAnalyses(list => list.map(a => a.id === cv.id ? { ...a, ...data } : a));
    } catch { alert(t.errNetworkShort); }
    finally { setDeciding(null); }
  };

  // ── Client report link ──────────────────────────────────────────────────
  const shareUrl = activeJob?.share && typeof window !== "undefined" ? `${window.location.origin}${localePrefix}/hr/rapport/${activeJob.share.token}` : "";
  const createShare = async () => {
    if (!activeJob) return;
    const company = window.prompt(t.shareCompanyPrompt, activeJob.share?.company ?? "");
    if (company === null) return;
    setSharing(true);
    try {
      const r = await fetch(`/api/hr/${activeJob.id}/share`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ company }) });
      const data = await r.json();
      if (!r.ok) { alert(t.shareErr); return; }
      setActiveJob(j => ({ ...j, share:{ token:data.token, company:data.company, shared_at:new Date().toISOString() } }));
    } catch { alert(t.errNetworkShort); }
    finally { setSharing(false); }
  };
  const revokeShare = async () => {
    if (!activeJob || !window.confirm(t.shareRevokeConfirm)) return;
    const r = await fetch(`/api/hr/${activeJob.id}/share`, { method:"DELETE" });
    if (r.ok) setActiveJob(j => ({ ...j, share:null }));
  };
  const copyShare = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  // ── Upload CVs ───────────────────────────────────────────────────────────
  const uploadCVs = async () => {
    if (!cvFiles.length || !activeJob) return;
    setUploading(true);
    try {
      const fd = new FormData();
      cvFiles.forEach(f => fd.append("files", f));
      const r = await fetch(`/api/hr/${activeJob.id}/upload-cvs`, { method:"POST", body:fd });
      const data = await r.json();
      if (!r.ok) { alert(data.message ?? t.errUpload); return; }
      setCvFiles([]);
      // Refresh job
      const r2 = await fetch(`/api/hr/${activeJob.id}/results`);
      if (r2.ok) { const d = await r2.json(); setActiveJob(d.job); setAnalyses(d.analyses ?? []); }
    } catch { alert(t.errNetworkShort); }
    finally { setUploading(false); }
  };

  // ── Start analysis ───────────────────────────────────────────────────────
  const startAnalysis = async () => {
    if (!activeJob) return;
    setAnalyzing(true);
    try {
      const r = await fetch(`/api/hr/${activeJob.id}/analyze`, { method:"POST" });
      const data = await r.json();
      if (!r.ok) {
        alert(data.message ?? (data.error === "NOTHING_TO_ANALYZE" ? t.errNothing : t.errAnalyze));
        setAnalyzing(false); return;
      }
      startPolling(activeJob.id);
    } catch { setAnalyzing(false); alert(t.errNetworkShort); }
  };

  // ── Export CSV ───────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!activeJob) return;
    window.open(`/api/hr/${activeJob.id}/export`, "_blank");
  };

  // ── Delete job (GDPR erasure) ────────────────────────────────────────────
  const deleteJob = async () => {
    if (!activeJob) return;
    if (!window.confirm(t.confirmDelete)) return;
    const r = await fetch(`/api/hr/${activeJob.id}`, { method:"DELETE" });
    if (!r.ok) { alert(t.errDelete); return; }
    setActiveJob(null); setAnalyses([]); setView("list");
    loadJobs();
  };

  // ── File drop handlers ───────────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault(); dragRef.current = false;
    const files = Array.from(e.dataTransfer.files).filter(f => /\.(pdf|docx)$/i.test(f.name));
    setCvFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...files.filter(f => !names.has(f.name))].slice(0, 100);
    });
  };
  const handleFileInput = (e) => {
    const files = Array.from(e.target.files ?? []);
    setCvFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...files.filter(f => !names.has(f.name))].slice(0, 100);
    });
    e.target.value = "";
  };

  const pendingCount = analyses.filter(a => a.status === "pending").length;
  const errorCount   = analyses.filter(a => a.status === "error").length;

  // ── Progress ─────────────────────────────────────────────────────────────
  const progress = activeJob
    ? activeJob.cv_count > 0
      ? Math.round((activeJob.analyzed_count / activeJob.cv_count) * 100)
      : 0
    : 0;

  if (sessionStatus === "loading" || !session) {
    return (
      <div style={{ minHeight:"100vh",background:"#07090F",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <div style={{ color:"#6B7A99",fontSize:14 }}>{t.loading}</div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh",background:"#07090F" }}>
      {/* ── HR TOPBAR (isolé — pas de lien vers Academic) ── */}
      <div style={{ borderBottom:"1px solid #1E2733",padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <a href={`${localePrefix}/hr`} style={{ textDecoration:"none",color:"#F0F4FF",fontWeight:900,fontSize:16,display:"flex",alignItems:"center",gap:8 }}>
          👥 <bdi dir="ltr">Doc<span style={{ color:"#F97316" }}>Swift HR</span></bdi>
        </a>
        <div style={{ display:"flex",alignItems:"center",gap:14,fontSize:13,color:"#6B7A99" }}>
          <span>{session.user?.email}</span>
          <a href={`${localePrefix}/hr`} style={{ color:"#4B5563",textDecoration:"none" }} title={t.backToSite}>↗</a>
        </div>
      </div>

    <div style={{ padding:"32px 28px",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:"#F0F4FF",maxWidth:1100,margin:"0 auto" }}>
      <style>{CSS}</style>

      {/* ── HEADER ── */}
      <div className="hr-header" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:32 }}>
        <div>
          {view !== "list" && (
            <button className="btn" onClick={() => { setView("list"); setActiveJob(null); setAnalyses([]); if(pollTimer) clearInterval(pollTimer); setAnalyzing(false); }}
              style={{ background:"none",border:"none",color:"#6B7A99",fontSize:13,cursor:"pointer",padding:"0 0 8px",display:"flex",alignItems:"center",gap:6 }}>
              {t.backToList}
            </button>
          )}
          <h1 style={{ fontSize:26,fontWeight:900,letterSpacing:-1,margin:0,display:"flex",alignItems:"center",gap:10 }}>
            <span>👥</span> DocSwift HR
          </h1>
          <p style={{ color:"#6B7A99",fontSize:14,margin:"4px 0 0" }}>{t.subtitle}</p>
        </div>
        {view === "list" && sub?.active && (
          <button className="btn" onClick={() => setView("create")}
            style={{ background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"11px 24px",borderRadius:12,fontSize:14,fontWeight:700 }}>
            {t.newAnalysis}
          </button>
        )}
      </div>

      {/* ── SUBSCRIPTION STATUS / PLAN PICKER ── */}
      {!subLoading && sub?.active && (
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,background:"#0D1117",border:"1px solid #1E2733",borderRadius:14,padding:"14px 20px",marginBottom:28 }}>
          <div style={{ display:"flex",alignItems:"center",gap:18,flexWrap:"wrap" }}>
            <span style={{ fontSize:12,fontWeight:700,color:"#F97316",background:"rgba(249,115,22,.1)",border:"1px solid rgba(249,115,22,.3)",padding:"4px 12px",borderRadius:20 }}>
              {t.planWord} {sub.plan?.charAt(0).toUpperCase()}{sub.plan?.slice(1)} {sub.status === "trialing" ? t.trial : ""}
            </span>
            <span style={{ fontSize:13,color:"#8892AA" }}>{t.usage(sub.used, sub.quota)}</span>
          </div>
          <button className="btn" onClick={openPortal} disabled={portalLoading}
            style={{ background:"transparent",border:"1px solid #1E2733",color:"#C0CBE0",padding:"8px 18px",borderRadius:10,fontSize:13,fontWeight:600,opacity:portalLoading?0.6:1 }}>
            {portalLoading ? "…" : t.manageSub}
          </button>
        </div>
      )}

      {!subLoading && !sub?.active && (
        <div className="fade-in" style={{ marginBottom:32 }}>
          <div style={{ textAlign:"center",marginBottom:24 }}>
            <h2 style={{ fontSize:20,fontWeight:800,margin:"0 0 6px" }}>{t.choosePlan}</h2>
            <p style={{ color:"#6B7A99",fontSize:14,margin:0 }}>{t.planIntro}</p>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16 }}>
            {PLAN_CARDS.map(c => (
              <div key={c.plan} style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:16,padding:24,textAlign:"center" }}>
                <div style={{ fontSize:14,fontWeight:700,color:"#8892AA",marginBottom:8 }}>{c.label}</div>
                <div style={{ fontSize:28,fontWeight:900,marginBottom:4 }}>{c.price}<span style={{ fontSize:13,color:"#4B5563",fontWeight:600 }}>{t.perMonth}</span></div>
                <div style={{ fontSize:12,color:"#6B7A99",marginBottom:18 }}>{t.planQuota[c.plan]}</div>
                <button className="btn" onClick={() => startCheckout(c.plan)} disabled={checkoutLoading === c.plan}
                  style={{ width:"100%",background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"11px",borderRadius:10,fontSize:13,fontWeight:700,opacity:checkoutLoading===c.plan?0.6:1 }}>
                  {checkoutLoading === c.plan ? "…" : t.startTrial}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ LIST VIEW ══════════════ */}
      {view === "list" && sub?.active && (
        <div className="fade-in">
          {jobsLoading ? (
            <div style={{ textAlign:"center",padding:60,color:"#4B5563" }}>{t.loading}</div>
          ) : jobs.length === 0 ? (
            <div style={{ textAlign:"center",padding:"80px 20px" }}>
              <div style={{ fontSize:52,marginBottom:16 }}>📋</div>
              <h2 style={{ fontWeight:800,fontSize:20,marginBottom:8 }}>{t.emptyTitle}</h2>
              <p style={{ color:"#6B7A99",fontSize:14,marginBottom:28 }}>{t.emptyText}</p>
              <button className="btn" onClick={() => setView("create")}
                style={{ background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"13px 32px",borderRadius:12,fontSize:15,fontWeight:700 }}>
                {t.newAnalysis}
              </button>
            </div>
          ) : (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16 }}>
              {jobs.map(job => (
                <div key={job.id} className="job-card fade-in"
                  style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:16,padding:"20px 22px",cursor:"pointer" }}
                  onClick={() => openJob(job)}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                    <h3 style={{ fontSize:15,fontWeight:800,margin:0,flex:1,paddingRight:8 }}>{job.title}</h3>
                    <StatusBadge status={job.status} small />
                  </div>
                  <div style={{ display:"flex",gap:16,color:"#6B7A99",fontSize:12 }}>
                    <span>{t.cvCount(job.cv_count)}</span>
                    {job.analyzed_count > 0 && <span>{t.analyzedCount(job.analyzed_count)}</span>}
                  </div>
                  <div style={{ color:"#4B5563",fontSize:11,marginTop:8 }}>
                    {new Date(job.created_at).toLocaleDateString(t.dateLocale, { day:"numeric",month:"long",hour:"2-digit",minute:"2-digit" })}
                  </div>
                </div>
              ))}
              {/* New analysis card */}
              <div className="job-card" onClick={() => setView("create")}
                style={{ background:"transparent",border:"2px dashed #1E2733",borderRadius:16,padding:"20px 22px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,minHeight:110,color:"#4B5563" }}>
                <span style={{ fontSize:28 }}>+</span>
                <span style={{ fontSize:13,fontWeight:600 }}>{t.newAnalysisCard}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ CREATE VIEW ══════════════ */}
      {view === "create" && (
        <div className="fade-in" style={{ maxWidth:660 }}>
          <div style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:20,padding:32 }}>
            <h2 style={{ fontSize:19,fontWeight:800,marginBottom:24,marginTop:0 }}>{t.createTitle}</h2>

            <label style={{ display:"block",marginBottom:6,fontSize:13,fontWeight:600,color:"#8892AA" }}>{t.jobTitleLabel}</label>
            <input
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder={t.jobTitlePh}
              style={{ width:"100%",background:"#07090F",border:"1px solid #1E2733",borderRadius:10,padding:"12px 14px",color:"#F0F4FF",fontSize:14,marginBottom:20,boxSizing:"border-box",outline:"none" }}
            />

            <label style={{ display:"block",marginBottom:6,fontSize:13,fontWeight:600,color:"#8892AA" }}>{t.jobDescLabel}</label>
            <textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder={t.jobDescPh}
              rows={8}
              style={{ width:"100%",background:"#07090F",border:"1px solid #1E2733",borderRadius:10,padding:"12px 14px",color:"#F0F4FF",fontSize:14,resize:"vertical",marginBottom:20,boxSizing:"border-box",outline:"none",fontFamily:"inherit" }}
            />

            <CriteriaEditor t={t} value={criteria} onChange={setCriteria}
              onSuggest={() => suggest(jobTitle, jobDesc, setCriteria)} suggesting={suggesting} message={critMsg} />

            {createError && <p style={{ color:"#EF4444",fontSize:13,marginBottom:12 }}>{createError}</p>}

            <div style={{ display:"flex",gap:12 }}>
              <button className="btn" onClick={() => { setView("list"); setCreateError(""); }}
                style={{ flex:1,background:"transparent",border:"1px solid #1E2733",color:"#8892AA",padding:"12px",borderRadius:10,fontSize:14,fontWeight:600 }}>
                {t.cancel}
              </button>
              <button className="btn" onClick={createJob} disabled={creating}
                style={{ flex:2,background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"12px",borderRadius:10,fontSize:14,fontWeight:700,opacity:creating?0.5:1 }}>
                {creating ? t.creating : t.createBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ JOB VIEW ══════════════ */}
      {view === "job" && activeJob && (
        <div className="fade-in">

          {/* Job title + status */}
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:28,flexWrap:"wrap" }}>
            <h2 style={{ fontSize:20,fontWeight:900,margin:0,letterSpacing:-0.5 }}>{activeJob.title}</h2>
            <StatusBadge status={activeJob.status} />
            <span style={{ color:"#4B5563",fontSize:13 }}>
              {t.cvsUploaded(activeJob.cv_count)}
            </span>
          </div>

          {resumedMsg && (
            <div style={{ background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.25)",color:"#93C5FD",borderRadius:12,padding:"10px 16px",fontSize:13,marginBottom:20 }}>
              {t.resumed}
            </div>
          )}

          {/* ── CRITERIA ── */}
          <div style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:20,padding:"20px 24px",marginBottom:24 }}>
            {editCrit ? (
              <>
                <CriteriaEditor t={t} value={editCrit} onChange={setEditCrit}
                  onSuggest={() => suggest(activeJob.title, activeJob.description ?? "", setEditCrit)} suggesting={suggesting} message={critMsg} />
                <div style={{ display:"flex",gap:10 }}>
                  <button className="btn" onClick={() => { setEditCrit(null); setCritMsg(""); }}
                    style={{ background:"transparent",border:"1px solid #1E2733",color:"#8892AA",padding:"9px 18px",borderRadius:10,fontSize:13,fontWeight:600 }}>{t.cancel}</button>
                  <button className="btn" onClick={saveCriteria} disabled={savingCrit}
                    style={{ background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"9px 22px",borderRadius:10,fontSize:13,fontWeight:700,opacity:savingCrit?.6:1 }}>
                    {savingCrit ? "…" : t.critSave}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:10 }}>
                  <h3 style={{ fontSize:14,fontWeight:800,margin:0,color:"#C0CBE0" }}>{t.critTitle}</h3>
                  {activeJob.status !== "analyzing" && (
                    <button className="btn" onClick={() => { setEditCrit((activeJob.criteria ?? []).map(c => ({ ...c }))); setCritMsg(""); }}
                      style={{ background:"none",border:"1px solid #1E2733",color:"#8892AA",padding:"5px 12px",borderRadius:8,fontSize:12,fontWeight:600 }}>
                      {t.critEdit}
                    </button>
                  )}
                </div>
                {(activeJob.criteria ?? []).length ? (
                  <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                    {activeJob.criteria.map(c => (
                      <span key={c.id} style={{ fontSize:12,color:"#C0CBE0",background:"#07090F",border:"1px solid #1E2733",borderRadius:20,padding:"4px 12px" }}>
                        {c.label}
                        <span style={{ marginInlineStart:6,fontWeight:700,color:c.must ? "#F87171" : "#6B7A99" }}>{c.must ? t.critMust : t.critWeight[c.weight]}</span>
                      </span>
                    ))}
                  </div>
                ) : <p style={{ color:"#6B7A99",fontSize:13,margin:0 }}>{t.critNone}</p>}
                {critMsg && <p style={{ color:"#10B981",fontSize:12,margin:"10px 0 0" }}>{critMsg}</p>}
              </>
            )}
          </div>

          {/* ── UPLOAD SECTION (if not analyzing/done) ── */}
          {activeJob.status !== "analyzing" && (
            <div style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:20,padding:28,marginBottom:24 }}>
              <h3 style={{ fontSize:15,fontWeight:800,margin:"0 0 16px",color:"#C0CBE0" }}>
                {t.addCvs} {activeJob.cv_count > 0 && <span style={{ color:"#4B5563",fontWeight:500,fontSize:13 }}>{t.alreadyLoaded(activeJob.cv_count)}</span>}
              </h3>

              {/* Drop zone */}
              <div
                className={`drop-zone${dragRef.current ? " drag-over" : ""}`}
                style={{ border:"2px dashed #1E2733",borderRadius:14,padding:"36px 20px",textAlign:"center",cursor:"pointer",marginBottom:16 }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); dragRef.current = true; }}
                onDragLeave={() => { dragRef.current = false; }}
                onDrop={handleDrop}>
                <div style={{ fontSize:32,marginBottom:8 }}>📄</div>
                <p style={{ color:"#6B7A99",fontSize:14,margin:"0 0 4px" }}>
                  {cvFiles.length ? t.filesSelected(cvFiles.length) : t.dropHere}
                </p>
                <p style={{ color:"#4B5563",fontSize:12,margin:0 }}>{t.dropHint}</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple style={{ display:"none" }} onChange={handleFileInput} />

              {/* File list preview */}
              {cvFiles.length > 0 && (
                <div style={{ background:"#07090F",borderRadius:10,border:"1px solid #1E2733",marginBottom:16,maxHeight:180,overflowY:"auto" }}>
                  {cvFiles.map((f, i) => (
                    <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px",borderBottom:i<cvFiles.length-1?"1px solid #0A0D14":"none",fontSize:13 }}>
                      <span style={{ color:"#C0CBE0" }}>📄 {f.name}</span>
                      <span style={{ color:"#4B5563" }}>{(f.size/1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
                {cvFiles.length > 0 && (
                  <button className="btn" onClick={uploadCVs} disabled={uploading}
                    style={{ background:"#1E2733",color:"#F0F4FF",border:"none",padding:"11px 24px",borderRadius:10,fontSize:13,fontWeight:700,opacity:uploading?.6:1 }}>
                    {uploading ? t.uploading : t.uploadBtn(cvFiles.length)}
                  </button>
                )}
                {pendingCount > 0 && !analyzing && (
                  <button className="btn" onClick={startAnalysis}
                    style={{ background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"11px 28px",borderRadius:10,fontSize:14,fontWeight:700 }}>
                    {t.analyzeBtn(pendingCount)}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── PROGRESS BAR ── */}
          {analyzing && (
            <div className="fade-in" style={{ background:"#0D1117",border:"1px solid rgba(249,115,22,.25)",borderRadius:20,padding:28,marginBottom:24 }}>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
                <div className="spin" style={{ width:18,height:18,border:"2px solid #F97316",borderTopColor:"transparent",borderRadius:"50%" }} />
                <span style={{ fontWeight:700,fontSize:15 }}>{t.analyzing}</span>
                <span style={{ color:"#F97316",fontWeight:800,marginLeft:"auto" }}>{progress}%</span>
              </div>
              <div style={{ background:"#1E2733",borderRadius:99,height:8,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#F97316,#EA580C)",borderRadius:99,transition:"width .5s ease" }} />
              </div>
              <p style={{ color:"#6B7A99",fontSize:12,marginTop:10,margin:"10px 0 0" }}>
                {t.progressLine(activeJob.analyzed_count, activeJob.cv_count)}
              </p>
            </div>
          )}

          {/* ── RESULTS TABLE ── */}
          {analyses.length > 0 && (
            <div className="fade-in" style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:20,overflow:"hidden" }}>
              {/* Table header */}
              <div style={{ padding:"18px 22px",borderBottom:"1px solid #1E2733",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
                <div>
                  <span style={{ fontWeight:800,fontSize:15 }}>{t.results(activeJob.title)}</span>
                  <span style={{ color:"#4B5563",fontSize:13,marginLeft:10 }}>{t.resultsCount(analyses.filter(a=>a.status!=="pending").length, analyses.length)}</span>
                </div>
                {activeJob.status === "done" && (
                  <div className="results-actions" style={{ display:"flex",gap:10 }}>
                    <button className="btn" onClick={exportCSV}
                      style={{ background:"rgba(16,185,129,.1)",color:"#10B981",border:"1px solid rgba(16,185,129,.25)",padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:700 }}>
                      {t.exportCsv}
                    </button>
                    <button className="btn" onClick={deleteJob}
                      style={{ background:"rgba(239,68,68,.08)",color:"#FCA5A5",border:"1px solid rgba(239,68,68,.25)",padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:700 }}>
                      {t.deleteBtn}
                    </button>
                    <button className="btn" onClick={createShare} disabled={sharing}
                      style={{ background:"rgba(249,115,22,.1)",color:"#FB923C",border:"1px solid rgba(249,115,22,.3)",padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:700,opacity:sharing?.6:1 }}>
                      {sharing ? "…" : t.shareBtn}
                    </button>
                    {errorCount > 0 && (
                      <button className="btn" onClick={startAnalysis} disabled={analyzing}
                        style={{ background:"rgba(59,130,246,.1)",color:"#60A5FA",border:"1px solid rgba(59,130,246,.25)",padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:700 }}>
                        {t.retryErrors(errorCount)}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Shared client report */}
              {activeJob.share && shareUrl && (
                <div style={{ padding:"14px 22px",borderBottom:"1px solid #1E2733",background:"rgba(249,115,22,.04)" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#FB923C",marginBottom:4 }}>{t.shareTitle}</div>
                  <div style={{ fontSize:12,color:"#6B7A99",marginBottom:10 }}>{t.shareHint}</div>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
                    <code dir="ltr" style={{ flex:"1 1 260px",fontSize:12,color:"#C0CBE0",background:"#07090F",border:"1px solid #1E2733",borderRadius:8,padding:"7px 10px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{shareUrl}</code>
                    <button className="btn" onClick={copyShare} style={{ background:"#1E2733",color:"#F0F4FF",border:"none",padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:700 }}>{copied ? t.shareCopied : t.shareCopy}</button>
                    <a href={shareUrl} target="_blank" rel="noopener noreferrer" style={{ color:"#93C5FD",fontSize:12,fontWeight:700,textDecoration:"none",padding:"7px 6px" }}>{t.shareOpen} ↗</a>
                    <button className="btn" onClick={revokeShare} style={{ background:"none",border:"1px solid rgba(239,68,68,.3)",color:"#FCA5A5",padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:700 }}>{t.shareRevoke}</button>
                  </div>
                </div>
              )}

              {/* Stats row */}
              <div style={{ display:"flex",gap:0,borderBottom:"1px solid #1E2733" }}>
                {[
                  { label:t.statRecommended, count:analyses.filter(a=>a.status==="recommended").length, color:"#10B981" },
                  { label:t.statConsider, count:analyses.filter(a=>a.status==="consider").length, color:"#F59E0B" },
                  { label:t.statRejected,  count:analyses.filter(a=>a.status==="rejected").length, color:"#EF4444" },
                ].map((s,i) => (
                  <div key={i} style={{ flex:1,padding:"14px 16px",textAlign:"center",borderRight:i<2?"1px solid #1E2733":"none" }}>
                    <div style={{ fontSize:22,fontWeight:900,color:s.color }}>{s.count}</div>
                    <div style={{ fontSize:11,color:"#4B5563" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="table-wrap" style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid #1E2733" }}>
                      {[t.thFile,t.thScore,t.thStatus,t.thDecision,t.thSummary,""].map(h => (
                        <th key={h} style={{ padding:"10px 18px",textAlign:"start",color:"#4B5563",fontWeight:600,fontSize:11,letterSpacing:.5,textTransform:"uppercase",whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.map((a, i) => (
                      <Fragment key={a.id}>
                        <tr className="cv-row"
                          style={{ borderBottom:"1px solid #0A0D14",background:i%2===0?"#0A0E17":"transparent",cursor:"pointer" }}
                          onClick={() => setDetailRow(detailRow===a.id ? null : a.id)}>
                          <td style={{ padding:"12px 18px",color:"#C0CBE0",fontWeight:600,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                            {a.filename.replace(/\.(pdf|docx)$/i,"")}
                          </td>
                          <td style={{ padding:"12px 18px" }}>
                            {a.score != null ? (
                              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                                <div style={{ width:56,height:5,background:"#1E2733",borderRadius:99,overflow:"hidden" }}>
                                  <div style={{ height:"100%",width:`${a.score}%`,background:STATUS_COLOR[a.status],borderRadius:99 }} />
                                </div>
                                <span style={{ fontWeight:800,color:STATUS_COLOR[a.status],fontSize:14 }}>{a.score}</span>
                                <span style={{ color:"#4B5563",fontSize:11 }}>/100</span>
                              </div>
                            ) : <span style={{ color:"#4B5563" }}>—</span>}
                          </td>
                          <td style={{ padding:"12px 18px" }}>
                            <span style={{ background:`${STATUS_COLOR[a.status]}15`,color:STATUS_COLOR[a.status],fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,border:`1px solid ${STATUS_COLOR[a.status]}30`,whiteSpace:"nowrap" }}>
                              {t.statusLabel[a.status] ?? a.status}
                            </span>
                          </td>
                          <td style={{ padding:"12px 18px",whiteSpace:"nowrap" }}>
                            {a.decision ? (
                              <span style={{ color:DECISION_COLOR[a.decision],fontSize:12,fontWeight:800 }}>● {t.decisionLabel[a.decision]}</span>
                            ) : <span style={{ color:"#374151" }}>—</span>}
                          </td>
                          <td style={{ padding:"12px 18px",color:"#6B7A99",maxWidth:260,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                            {a.summary || (a.status === "pending" ? t.pendingAnalysis : a.error_msg ?? "—")}
                          </td>
                          <td style={{ padding:"12px 18px",color:"#3B82F6",fontWeight:600,fontSize:12,whiteSpace:"nowrap" }}>
                            {detailRow === a.id ? t.collapse : t.details}
                          </td>
                        </tr>

                        {/* Expanded detail row */}
                        {detailRow === a.id && (
                          <tr>
                            <td colSpan={6} style={{ padding:"16px 22px 20px",background:"#060911",borderBottom:"1px solid #1E2733" }}>
                              {a.read_mode === "vision" && (
                                <div style={{ fontSize:11,color:"#93C5FD",marginBottom:10 }}>🔎 {t.readVision}</div>
                              )}
                              {(a.criteria_results ?? []).length > 0 && (
                                <div style={{ marginBottom:16 }}>
                                  <div style={{ fontSize:12,fontWeight:700,color:"#FB923C",marginBottom:8,letterSpacing:.5 }}>{t.criteriaTitle}</div>
                                  <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                                    {a.criteria_results.map(v => {
                                      const c = (activeJob.criteria ?? []).find(x => x.id === v.id);
                                      return (
                                        <div key={v.id} style={{ display:"grid",gridTemplateColumns:"minmax(140px,1fr) 70px 2fr",gap:10,fontSize:13,alignItems:"baseline" }}>
                                          <span style={{ color:"#C0CBE0" }}>{c?.label ?? v.id}{c?.must && <span style={{ color:"#F87171",fontSize:11,marginInlineStart:6 }}>{t.critMust}</span>}</span>
                                          <span style={{ color:VERDICT_COLOR[v.verdict],fontWeight:800 }}>{t.verdict[v.verdict]}</span>
                                          <span style={{ color:"#6B7A99" }}>{v.evidence}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:20 }}>
                                <div>
                                  <div style={{ fontSize:12,fontWeight:700,color:"#10B981",marginBottom:8,letterSpacing:.5 }}>{t.strengths}</div>
                                  {(a.strengths ?? []).length ? (
                                    <ul style={{ listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:6 }}>
                                      {a.strengths.map((s,j) => (
                                        <li key={j} style={{ fontSize:13,color:"#8892AA",display:"flex",gap:8 }}>
                                          <span style={{ color:"#10B981",flexShrink:0 }}>✓</span>{s}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : <span style={{ color:"#4B5563",fontSize:12 }}>—</span>}
                                </div>
                                <div>
                                  <div style={{ fontSize:12,fontWeight:700,color:"#EF4444",marginBottom:8,letterSpacing:.5 }}>{t.weaknesses}</div>
                                  {(a.weaknesses ?? []).length ? (
                                    <ul style={{ listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:6 }}>
                                      {a.weaknesses.map((w,j) => (
                                        <li key={j} style={{ fontSize:13,color:"#8892AA",display:"flex",gap:8 }}>
                                          <span style={{ color:"#EF4444",flexShrink:0 }}>✗</span>{w}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : <span style={{ color:"#4B5563",fontSize:12 }}>—</span>}
                                </div>
                              </div>
                              {a.summary && (
                                <p style={{ color:"#6B7A99",fontSize:13,marginTop:16,fontStyle:"italic",borderTop:"1px solid #1E2733",paddingTop:12,margin:"14px 0 0" }}>
                                  💬 {a.summary}
                                </p>
                              )}
                              {["recommended","consider","rejected"].includes(a.status) && (
                                <div style={{ borderTop:"1px solid #1E2733",marginTop:16,paddingTop:14 }}>
                                  <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:10 }}>
                                    {["shortlisted","to_review","rejected"].map(d => (
                                      <button key={d} className="btn" disabled={deciding === a.id}
                                        onClick={e => { e.stopPropagation(); decide(a, a.decision === d ? null : d); }}
                                        style={{ background:a.decision === d ? DECISION_COLOR[d] : "transparent",color:a.decision === d ? "#fff" : DECISION_COLOR[d],
                                          border:`1px solid ${DECISION_COLOR[d]}66`,padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:800,opacity:deciding===a.id?.6:1 }}
                                        title={a.decision === d ? t.decisionClear : undefined}>
                                        {t.decide[d]}
                                      </button>
                                    ))}
                                  </div>
                                  <textarea rows={2} maxLength={500} placeholder={t.notePh}
                                    value={notes[a.id] ?? a.decision_note ?? ""}
                                    onClick={e => e.stopPropagation()}
                                    onChange={e => setNotes(n => ({ ...n, [a.id]: e.target.value }))}
                                    onBlur={() => { if (a.decision && (notes[a.id] ?? null) !== null && notes[a.id] !== (a.decision_note ?? "")) decide(a, a.decision); }}
                                    style={{ width:"100%",boxSizing:"border-box",background:"#07090F",border:"1px solid #1E2733",borderRadius:8,padding:"8px 10px",color:"#C0CBE0",fontSize:12,fontFamily:"inherit",resize:"vertical" }} />
                                  <div style={{ fontSize:11,color:"#4B5563",marginTop:6 }}>{t.decisionHint}</div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state when job exists but no CVs yet */}
          {!analyzing && activeJob.cv_count === 0 && cvFiles.length === 0 && analyses.length === 0 && (
            <div style={{ textAlign:"center",padding:"60px 20px",color:"#4B5563" }}>
              <div style={{ fontSize:40,marginBottom:12 }}>📎</div>
              <p style={{ fontSize:14 }}>{t.emptyJob}</p>
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function CriteriaEditor({ t, value, onChange, onSuggest, suggesting, message }) {
  const update = (i, patch) => onChange(value.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const add = () => {
    if (value.length >= 10) return;
    const used = new Set(value.map(c => c.id));
    let n = value.length + 1;
    while (used.has(`c${n}`)) n++;
    onChange([...value, { id:`c${n}`, label:"", weight:2, must:false }]);
  };
  const field = { background:"#07090F",border:"1px solid #1E2733",borderRadius:8,color:"#F0F4FF",fontSize:13,padding:"8px 10px",outline:"none",fontFamily:"inherit" };

  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:6 }}>
        <label style={{ fontSize:13,fontWeight:600,color:"#8892AA" }}>{t.critTitle}</label>
        <button type="button" className="btn" onClick={onSuggest} disabled={suggesting}
          style={{ background:"rgba(249,115,22,.1)",color:"#FB923C",border:"1px solid rgba(249,115,22,.3)",padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:700,opacity:suggesting?.6:1 }}>
          {suggesting ? t.critSuggesting : t.critSuggest}
        </button>
      </div>
      <p style={{ fontSize:12,color:"#6B7A99",margin:"0 0 12px" }}>{t.critHint}</p>

      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {value.map((c, i) => (
          <div key={c.id} style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
            <input value={c.label} maxLength={160} placeholder={t.critPh}
              onChange={e => update(i, { label:e.target.value })}
              style={{ ...field, flex:"1 1 220px" }} />
            <select value={c.weight} onChange={e => update(i, { weight:Number(e.target.value) })} style={{ ...field, flex:"0 0 auto" }}>
              {[3, 2, 1].map(w => <option key={w} value={w}>{t.critWeight[w]}</option>)}
            </select>
            <label style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:c.must ? "#F87171" : "#8892AA",cursor:"pointer" }}>
              <input type="checkbox" checked={c.must} onChange={e => update(i, { must:e.target.checked })} />
              {t.critMust}
            </label>
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={t.critRemove} title={t.critRemove}
              style={{ background:"none",border:"none",color:"#6B7A99",fontSize:16,cursor:"pointer",padding:"4px 6px" }}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ display:"flex",alignItems:"center",gap:12,marginTop:10 }}>
        <button type="button" className="btn" onClick={add} disabled={value.length >= 10}
          style={{ background:"none",border:"1px dashed #1E2733",color:"#8892AA",padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:600,opacity:value.length>=10?.5:1 }}>
          {t.critAdd}
        </button>
        {value.length >= 10 && <span style={{ fontSize:12,color:"#6B7A99" }}>{t.critMax}</span>}
      </div>
      {message && <p style={{ fontSize:12,color:"#F59E0B",margin:"10px 0 0" }}>{message}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status, small }) {
  const locale = useLocale();
  const t = COPY[locale] ?? COPY.fr;
  const cfg = {
    pending:   { label:t.badge.pending,    bg:"rgba(75,85,99,.15)",   color:"#6B7A99",  border:"#374151" },
    analyzing: { label:t.badge.analyzing,     bg:"rgba(249,115,22,.1)",  color:"#FB923C",  border:"rgba(249,115,22,.3)" },
    done:      { label:t.badge.done,     bg:"rgba(16,185,129,.1)",  color:"#10B981",  border:"rgba(16,185,129,.25)" },
    error:     { label:t.badge.error,        bg:"rgba(239,68,68,.1)",   color:"#F87171",  border:"rgba(239,68,68,.25)" },
  }[status] ?? { label:status, bg:"rgba(75,85,99,.15)", color:"#6B7A99", border:"#374151" };

  return (
    <span style={{
      background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`,
      padding: small ? "2px 8px" : "4px 12px",
      borderRadius:20,
      fontSize: small ? 11 : 12,
      fontWeight:700, whiteSpace:"nowrap",
    }}>
      {cfg.label}
    </span>
  );
}
