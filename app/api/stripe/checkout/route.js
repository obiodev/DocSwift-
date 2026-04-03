import { NextResponse }     from "next/server";
import Stripe               from "stripe";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  // Read affiliate code if passed from client
  let affiliateCode = null;
  try {
    const body = await request.json().catch(() => ({}));
    affiliateCode = body.affiliateCode ?? null;
  } catch { /* no body */ }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const metadata = { userEmail: session.user.email };
  if (affiliateCode) metadata.affiliateCode = affiliateCode;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode:                 "subscription",
    payment_method_types: ["card"],
    customer_email:       session.user.email,
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/tools?upgraded=1`,
    cancel_url:  `${process.env.NEXTAUTH_URL}/`,
    metadata,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
