import { NextResponse }     from "next/server";
import Stripe               from "stripe";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";

// Prix Stripe
const PRICES = {
  regular: process.env.STRIPE_PRICE_ID         ?? "price_1TnnLEHOgcCONmC6KVui17E1",
  promo:   process.env.STRIPE_PRICE_ID_PROMO   ?? "price_1TnnLIHOgcCONmC6N8QqwnHL",
};

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  let affiliateCode = null;
  let plan = "regular";
  try {
    const body = await request.json().catch(() => ({}));
    affiliateCode = body.affiliateCode ?? null;
    plan = body.plan === "promo" ? "promo" : "regular";
  } catch { /* no body */ }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const priceId = PRICES[plan];

  const metadata = { userEmail: session.user.email };
  if (affiliateCode) metadata.affiliateCode = affiliateCode;

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://getdocswift.com";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode:                 "subscription",
    payment_method_types: ["card"],
    customer_email:       session.user.email,
    line_items:           [{ price: priceId, quantity: 1 }],
    success_url:          `${baseUrl}/tools?upgraded=1`,
    cancel_url:           `${baseUrl}/`,
    subscription_data: {
      trial_period_days: 7,
      metadata,
    },
    metadata,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
