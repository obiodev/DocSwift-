import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";

// ── GET /api/hr/[id]/export — CSV download ────────────────────────────────
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { id } = await params;

  const { data: job } = await supabaseAdmin
    .from("hr_jobs")
    .select("id, user_email, title, status")
    .eq("id", id)
    .maybeSingle();

  if (!job) return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
  if (job.user_email !== session.user.email) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (job.status !== "done") return NextResponse.json({ error: "NOT_DONE_YET" }, { status: 409 });

  const { data: analyses } = await supabaseAdmin
    .from("hr_cv_analyses")
    .select("filename, score, status, strengths, weaknesses, summary")
    .eq("job_id", id)
    .order("score", { ascending: false, nullsFirst: false });

  if (!analyses?.length) return NextResponse.json({ error: "NO_DATA" }, { status: 404 });

  // Build CSV
  const escape = (v) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
  };

  const header = ["Fichier", "Score /100", "Statut", "Points forts", "Points faibles", "Résumé"];
  const rows   = analyses.map(a => [
    escape(a.filename),
    escape(a.score ?? ""),
    escape(a.status),
    escape((a.strengths  ?? []).join(" | ")),
    escape((a.weaknesses ?? []).join(" | ")),
    escape(a.summary ?? ""),
  ]);

  const csv = [header, ...rows].map(r => r.join(",")).join("\r\n");
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
