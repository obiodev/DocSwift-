import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";

function isAdmin(email) {
  return process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;
}

// POST /api/admin/gift — offer a free Pro account to any email
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { email, months } = await request.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + (parseInt(months) || 1));

  await supabaseAdmin.from("subscriptions").upsert({
    user_email:          email,
    status:              "pro",
    gifted_by:           session.user.email,
    current_period_end:  periodEnd.toISOString(),
    updated_at:          new Date().toISOString(),
  }, { onConflict: "user_email" });

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/gift — revoke a gifted Pro account
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { email } = await request.json();
  await supabaseAdmin.from("subscriptions").upsert({
    user_email:  email,
    status:      "free",
    updated_at:  new Date().toISOString(),
  }, { onConflict: "user_email" });

  return NextResponse.json({ ok: true });
}
