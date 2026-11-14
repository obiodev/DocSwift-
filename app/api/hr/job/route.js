import { NextResponse }      from "next/server";
import { getServerSession }  from "next-auth";
import { authOptions }       from "@/lib/auth";
import { supabaseAdmin }     from "@/lib/supabase";
import { isHrActive }        from "@/lib/hrSubscription";
import { normalizeCriteria } from "@/lib/hrCriteria";
import { audit }             from "@/lib/hrStorage";

// ── POST /api/hr/job — Create a new HR job ──────────────────────────────────
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const active = await isHrActive(session.user.email);
  if (!active) {
    return NextResponse.json({ error: "HR_SUBSCRIPTION_REQUIRED", message: "DocSwift HR nécessite un abonnement actif." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const title       = String(body.title ?? "").trim().slice(0, 200);
  const description = String(body.description ?? "").trim().slice(0, 8000);
  if (!title || !description) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }
  const criteria = normalizeCriteria(body.criteria);
  const language = ["fr", "en", "ar"].includes(body.language) ? body.language : "fr";

  const { data, error } = await supabaseAdmin
    .from("hr_jobs")
    .insert({ user_email: session.user.email, title, description, criteria, language })
    .select("id, title, description, criteria, language, cv_count, analyzed_count, status, created_at")
    .single();

  if (error) {
    console.error("hr_jobs insert error:", error);
    return NextResponse.json({ error: "DB_ERROR" }, { status: 500 });
  }

  await audit({ jobId: data.id, actor: session.user.email, action: "job_created", detail: { criteria } });
  return NextResponse.json(data);
}

// ── GET /api/hr/job — List user's jobs ─────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("hr_jobs")
    .select("id, title, cv_count, analyzed_count, status, created_at")
    .eq("user_email", session.user.email)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: "DB_ERROR" }, { status: 500 });
  return NextResponse.json(data ?? []);
}
