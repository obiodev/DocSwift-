import { notFound }        from "next/navigation";
import { supabaseAdmin }   from "@/lib/supabase";
import { normalizeCriteria } from "@/lib/hrCriteria";
import PrintButton         from "./PrintButton";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "Rapport de présélection — DocSwift HR",
    robots: { index: false, follow: false, nocache: true },
    referrer: "no-referrer",
  };
}

const COPY = {
  fr: {
    dateLocale: "fr-FR",
    kicker: "Rapport de présélection",
    preparedBy: (c) => `Préparé par ${c}`,
    sharedOn: (d) => `Partagé le ${d}`,
    criteria: "Critères d'évaluation",
    must: "Obligatoire",
    weight: (w) => ["", "Bonus", "Important", "Essentiel"][w],
    shortlist: "Candidats retenus",
    shortlistHint: "Sélection validée par le recruteur.",
    all: "Candidats analysés",
    allHint: "Classement par adéquation au poste. La décision finale revient au recruteur.",
    candidate: (n) => `Candidat ${n}`,
    status: { recommended: "Recommandé", consider: "À considérer", rejected: "Non retenu" },
    decision: { shortlisted: "Retenu", to_review: "À revoir", rejected: "Écarté" },
    verdict: { met: "Oui", partial: "Partiel", missing: "Non" },
    strengths: "Points forts", weaknesses: "Points de vigilance",
    note: "Note du recruteur",
    print: "Imprimer / PDF",
    empty: "Aucun candidat à afficher dans ce rapport.",
    footer: "Rapport anonymisé : aucune coordonnée de candidat n'y figure. L'analyse par IA est une aide à la décision ; chaque décision est prise par un recruteur.",
    by: "Généré avec DocSwift HR",
  },
  en: {
    dateLocale: "en-GB",
    kicker: "Screening report",
    preparedBy: (c) => `Prepared by ${c}`,
    sharedOn: (d) => `Shared on ${d}`,
    criteria: "Evaluation criteria",
    must: "Required",
    weight: (w) => ["", "Bonus", "Important", "Essential"][w],
    shortlist: "Shortlisted candidates",
    shortlistHint: "Selection approved by the recruiter.",
    all: "Analysed candidates",
    allHint: "Ranked by fit with the role. The final decision rests with the recruiter.",
    candidate: (n) => `Candidate ${n}`,
    status: { recommended: "Recommended", consider: "To consider", rejected: "Not selected" },
    decision: { shortlisted: "Shortlisted", to_review: "To review", rejected: "Rejected" },
    verdict: { met: "Yes", partial: "Partial", missing: "No" },
    strengths: "Strengths", weaknesses: "Points to check",
    note: "Recruiter's note",
    print: "Print / PDF",
    empty: "No candidates to show in this report.",
    footer: "Anonymised report: no candidate contact details are included. The AI analysis supports the decision; every decision is made by a recruiter.",
    by: "Generated with DocSwift HR",
  },
  ar: {
    dateLocale: "ar",
    kicker: "تقرير الفرز الأولي",
    preparedBy: (c) => `من إعداد ${c}`,
    sharedOn: (d) => `تمت المشاركة في ${d}`,
    criteria: "معايير التقييم",
    must: "إلزامي",
    weight: (w) => ["", "إضافي", "مهم", "أساسي"][w],
    shortlist: "المرشحون المختارون",
    shortlistHint: "اختيار تم اعتماده من قبل المسؤول عن التوظيف.",
    all: "المرشحون الذين تم تحليلهم",
    allHint: "مرتبون حسب الملاءمة للوظيفة. القرار النهائي للمسؤول عن التوظيف.",
    candidate: (n) => `المرشح ${n}`,
    status: { recommended: "موصى به", consider: "قيد النظر", rejected: "غير مقبول" },
    decision: { shortlisted: "مختار", to_review: "للمراجعة", rejected: "مستبعد" },
    verdict: { met: "نعم", partial: "جزئي", missing: "لا" },
    strengths: "نقاط القوة", weaknesses: "نقاط للتحقق",
    note: "ملاحظة المسؤول عن التوظيف",
    print: "طباعة / PDF",
    empty: "لا يوجد مرشحون لعرضهم في هذا التقرير.",
    footer: "تقرير مجهول الهوية: لا يتضمن أي بيانات اتصال للمرشحين. تحليل الذكاء الاصطناعي أداة مساعدة؛ كل قرار يتخذه مسؤول التوظيف.",
    by: "تم إنشاؤه باستخدام DocSwift HR",
  },
};

const STATUS_COLOR  = { recommended: "#059669", consider: "#D97706", rejected: "#DC2626" };
const VERDICT_COLOR = { met: "#059669", partial: "#D97706", missing: "#9CA3AF" };

export default async function HrReportPage({ params }) {
  const { locale, token } = await params;
  const t = COPY[locale] ?? COPY.fr;
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) notFound();

  const { data: job } = await supabaseAdmin
    .from("hr_jobs")
    .select("id, title, criteria, share_company, shared_at")
    .eq("share_token", token)
    .maybeSingle();
  if (!job) notFound();

  const { data: rows } = await supabaseAdmin
    .from("hr_cv_analyses")
    .select("id, score, status, strengths, weaknesses, summary, criteria_results, decision, decision_note")
    .eq("job_id", job.id)
    .in("status", ["recommended", "consider", "rejected"])
    .order("score", { ascending: false, nullsFirst: false });

  const criteria  = normalizeCriteria(job.criteria);
  const analysed  = (rows ?? []).filter((r) => r.decision !== "rejected");
  const shortlist = analysed.filter((r) => r.decision === "shortlisted");
  const showShortlist = shortlist.length > 0;
  const list = showShortlist ? shortlist : analysed;
  const sharedOn = job.shared_at ? new Date(job.shared_at).toLocaleDateString(t.dateLocale, { day: "numeric", month: "long", year: "numeric" }) : null;

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#F3F4F6", color: "#111827", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{`@media print { .no-print { display:none!important } body { background:#fff } .card { break-inside: avoid; box-shadow:none!important } }`}</style>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 16px 48px" }}>

        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#EA580C" }}>{t.kicker}</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: "6px 0 6px", letterSpacing: -0.5 }}>{job.title}</h1>
            <div style={{ fontSize: 13, color: "#6B7280" }}>
              {job.share_company && <span>{t.preparedBy(job.share_company)}</span>}
              {job.share_company && sharedOn && <span> · </span>}
              {sharedOn && <span>{t.sharedOn(sharedOn)}</span>}
            </div>
          </div>
          <PrintButton label={t.print} />
        </header>

        {criteria.length > 0 && (
          <section className="card" style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 12px" }}>{t.criteria}</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {criteria.map((c) => (
                <li key={c.id} style={{ fontSize: 13, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 999, padding: "5px 12px" }}>
                  {c.label}
                  <span style={{ color: c.must ? "#DC2626" : "#6B7280", fontWeight: 700, marginInlineStart: 6, fontSize: 11 }}>
                    {c.must ? t.must : t.weight(c.weight)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "8px 0 2px" }}>{showShortlist ? t.shortlist : t.all} ({list.length})</h2>
        <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 14px" }}>{showShortlist ? t.shortlistHint : t.allHint}</p>

        {list.length === 0 && <p style={{ color: "#6B7280" }}>{t.empty}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {list.map((a, i) => {
            const byId = new Map((a.criteria_results ?? []).map((v) => [v.id, v]));
            return (
              <article key={a.id} className="card" style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                  <strong style={{ fontSize: 16 }}>{t.candidate(i + 1)}</strong>
                  <span style={{ fontSize: 22, fontWeight: 900, color: STATUS_COLOR[a.status] }}>{a.score}<span style={{ fontSize: 12, color: "#9CA3AF" }}>/100</span></span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLOR[a.status], border: `1px solid ${STATUS_COLOR[a.status]}55`, borderRadius: 999, padding: "2px 10px" }}>{t.status[a.status]}</span>
                  {a.decision && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: a.decision === "shortlisted" ? "#059669" : "#6B7280", borderRadius: 999, padding: "2px 10px" }}>{t.decision[a.decision]}</span>
                  )}
                </div>
                {a.summary && <p style={{ fontSize: 14, color: "#374151", margin: "0 0 12px" }}>{a.summary}</p>}

                {criteria.length > 0 && (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 12 }}>
                    <tbody>
                      {criteria.map((c) => {
                        const v = byId.get(c.id);
                        return (
                          <tr key={c.id} style={{ borderTop: "1px solid #F3F4F6" }}>
                            <td style={{ padding: "6px 0", width: "38%", color: "#374151" }}>{c.label}</td>
                            <td style={{ padding: "6px 8px", width: 70, fontWeight: 700, color: VERDICT_COLOR[v?.verdict] ?? "#9CA3AF" }}>{v ? t.verdict[v.verdict] : "—"}</td>
                            <td style={{ padding: "6px 0", color: "#6B7280" }}>{v?.evidence}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
                  {[[t.strengths, a.strengths, "#059669"], [t.weaknesses, a.weaknesses, "#D97706"]].map(([label, items, color]) => (
                    <div key={label}>
                      <div style={{ fontSize: 12, fontWeight: 800, color, marginBottom: 4 }}>{label}</div>
                      <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 13, color: "#4B5563" }}>
                        {(items ?? []).map((s, j) => <li key={j}>{s}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>

                {a.decision_note && (
                  <p style={{ fontSize: 13, background: "#FFF7ED", borderRadius: 10, padding: "8px 12px", margin: "12px 0 0" }}>
                    <strong>{t.note} :</strong> {a.decision_note}
                  </p>
                )}
              </article>
            );
          })}
        </div>

        <footer style={{ fontSize: 12, color: "#6B7280", marginTop: 28, lineHeight: 1.6 }}>
          <p style={{ margin: "0 0 6px" }}>{t.footer}</p>
          <p style={{ margin: 0 }}>{t.by} · <bdi dir="ltr">getdocswift.com/hr</bdi></p>
        </footer>
      </div>
    </div>
  );
}
