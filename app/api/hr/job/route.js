import { NextResponse }      from "next/server";
import { getServerSession }  from "next-auth";
import { authOptions }       from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { isHrActive } from "@/lib/hrSubscription";

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

  const { title, description } = await request.json();
  if (!title?.trim() || !description?.trim()) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("hr_jobs")
    .insert({ user_email: session.user.email, title: title.trim(), description: description.trim() })
    .select()
    .single();

  if (error) {
    console.error("hr_jobs insert error:", error);
    return NextResponse.json({ error: "DB_ERROR" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── GET /api/hr/job — List user's jobs ─────────────────────────────────────
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("hr_jobs")
    .select("id, title, cv_count, analyzed_count, status, created_at")
    .eq("user_email", session.user.email)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: "DB_ERROR" }, { status: 500 });
  return NextResponse.json(data ?? []);
}
