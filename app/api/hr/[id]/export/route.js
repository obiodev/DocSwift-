import { NextResponse }      from "next/server";
import { getServerSession }  from "next-auth";
import { authOptions }       from "@/lib/auth";
import { supabaseAdmin }     from "@/lib/supabase";
import { normalizeCriteria } from "@/lib/hrCriteria";

const STATUS_LABEL   = { recommended: "Recommandé", consider: "À considérer", rejected: "Non retenu", error: "Erreur", pending: "En attente" };
const DECISION_LABEL = { shortlisted: "Retenu", rejected: "Écarté", to_review: "À revoir" };
const VERDICT_LABEL  = { met: "Oui", partial: "Partiel", missing: "Non" };

// ── GET /api/hr/[id]/export — CSV download ────────────────────────────────
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { id } = await params;

  const { data: job } = await supabaseAdmin
    .from("hr_jobs")
    .select("id, user_email, title, status, criteria")
    .eq("id", id)
    .maybeSingle();

  if (!job) return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
  if (job.user_email !== session.user.email) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (job.status !== "done") return NextResponse.json({ error: "NOT_DONE_YET" }, { status: 409 });

  const { data: analyses } = await supabaseAdmin
    .from("hr_cv_analyses")
    .select("filename, score, status, strengths, weaknesses, summary, criteria_results, decision, decision_note")
    .eq("job_id", id)
    .order("score", { ascending: false, nullsFirst: false });

  if (!analyses?.length) return NextResponse.json({ error: "NO_DATA" }, { status: 404 });

  const criteria = normalizeCriteria(job.criteria);

  const escape = (v) => {
    if (v == null) return "";
    let s = String(v);
    // Neutralise spreadsheet formulas (CSV injection, CWE-1236)
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    s = s.replace(/"/g, '""');
    return /[;,"\n]/.test(s) ? `"${s}"` : s;
  };

  const header = [
    "Fichier", "Score /100", "Suggestion IA", "Décision", "Note du recruteur",
    ...criteria.map((c) => `${c.must ? "[Obligatoire] " : ""}${c.label}`),
    "Points forts", "Points faibles", "Résumé",
  ];
  const rows = analyses.map((a) => {
    const byId = new Map((a.criteria_results ?? []).map((v) => [v.id, v]));
    return [
      a.filename,
      a.score ?? "",
      STATUS_LABEL[a.status] ?? a.status,
      DECISION_LABEL[a.decision] ?? "",
      a.decision_note ?? "",
      ...criteria.map((c) => {
        const v = byId.get(c.id);
        return v ? `${VERDICT_LABEL[v.verdict] ?? v.verdict}${v.evidence ? ` — ${v.evidence}` : ""}` : "";
      }),
      (a.strengths  ?? []).join(" | "),
      (a.weaknesses ?? []).join(" | "),
      a.summary ?? "",
    ].map(escape);
  });

  // UTF-8 BOM so Excel opens accents correctly
  const csv = "﻿" + [header.map(escape), ...rows].map((r) => r.join(",")).join("\r\n");
  const slug = job.title.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 40);
  const filename = `docswift_hr_${slug}_${id.slice(0, 8)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
