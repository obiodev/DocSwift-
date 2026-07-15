import { NextResponse }     from "next/server";
import Stripe                from "stripe";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { getHrSubscription } from "@/lib/hrSubscription";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const sub = await getHrSubscription(session.user.email);
  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const portalSession = await stripe.billingPortal.sessions.create({
    customer:   sub.stripe_customer_id,
    return_url: `${process.env.NEXTAUTH_URL ?? "https://getdocswift.com"}/dashboard/hr`,
  });

  return NextResponse.json({ url: portalSession.url });
}
