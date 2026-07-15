import { NextResponse }     from "next/server";
import Stripe                from "stripe";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { HR_PLANS }         from "@/lib/hrSubscription";

// Prix Stripe HR — un Price récurrent mensuel par plan (créés séparément dans Stripe)
const HR_PRICES = {
  [HR_PLANS.STARTER]:  process.env.STRIPE_PRICE_HR_STARTER,
  [HR_PLANS.PRO]:      process.env.STRIPE_PRICE_HR_PRO,
  [HR_PLANS.BUSINESS]: process.env.STRIPE_PRICE_HR_BUSINESS,
};

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const plan = body.plan;
  const priceId = HR_PRICES[plan];
  if (!priceId) {
    return NextResponse.json({ error: "INVALID_PLAN", message: "Plan HR inconnu ou non configuré." }, { status: 400 });
  }

  const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY);
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://getdocswift.com";
  const metadata = { product: "hr", plan, userEmail: session.user.email };

  const checkoutSession = await stripe.checkout.sessions.create({
    mode:                     "subscription",
    payment_method_types:     ["card"],
    payment_method_collection: "always", // carte obligatoire dès l'inscription, même en essai
    customer_email:           session.user.email,
    line_items:                [{ price: priceId, quantity: 1 }],
    success_url:               `${baseUrl}/hr/dashboard?subscribed=1`,
    cancel_url:                `${baseUrl}/hr/dashboard`,
    subscription_data: {
      trial_period_days: 14,
      metadata,
    },
    metadata,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
