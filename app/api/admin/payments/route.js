import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin }    from "@/lib/supabase";

function isAdmin(email) {
  return process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;
}

// GET /api/admin/payments — list all subscriptions/payments
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!supabaseAdmin) return NextResponse.json({ payments: [] });

  const { data: subs } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .order("updated_at", { ascending: false });

  const payments = (subs ?? []).map(s => ({
    email:              s.user_email,
    status:             s.status,
    stripeCustomerId:   s.stripe_customer_id,
    stripeSubId:        s.stripe_subscription_id,
    periodEnd:          s.current_period_end,
    giftedBy:           s.gifted_by ?? null,
    updatedAt:          s.updated_at,
    createdAt:          s.created_at,
  }));

  // Stats
  const proCount  = payments.filter(p => p.status === "pro").length;
  const gifted    = payments.filter(p => p.giftedBy).length;
  const stripe    = payments.filter(p => p.stripeSubId).length;
  const mrr       = stripe * 9.99;

  return NextResponse.json({
    payments,
    stats: { total: payments.length, pro: proCount, gifted, stripe, mrr },
  });
}
