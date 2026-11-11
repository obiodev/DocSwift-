import { NextResponse }  from "next/server";
import Stripe            from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import {
  sendSubscriptionConfirmEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCancelledEmail,
} from "@/lib/email";

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body      = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  const upsertSub = async (stripeCustomerId, subscriptionId, status, periodEnd, email) => {
    if (!supabaseAdmin || !email) return;
    const { error } = await supabaseAdmin.from("subscriptions").upsert({
      user_email:             email,
      stripe_customer_id:     stripeCustomerId,
      stripe_subscription_id: subscriptionId,
      status,
      current_period_end:     periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at:             new Date().toISOString(),
    }, { onConflict: "user_email" });
    if (error) throw new Error(`subscriptions upsert failed: ${error.message}`);
  };

  // HR (B2B) events are handled exclusively by /api/webhooks/stripe.
  const isHr = (obj) => obj?.metadata?.product === "hr";
  const subPeriodEnd = (s) => s.current_period_end ?? s.items?.data?.[0]?.current_period_end ?? null;
  // trialing and past_due (Stripe retry window) keep access; anything else drops to free
  const toAcademicStatus = (stripeStatus) =>
    ["active", "trialing", "past_due"].includes(stripeStatus) ? "pro" : "free";

  try {
  switch (event.type) {

    case "checkout.session.completed": {
      const s     = event.data.object;
      if (isHr(s)) break;
      const email = s.customer_email ?? s.metadata?.userEmail;
      if (s.mode === "subscription") {
        await upsertSub(s.customer, s.subscription, "pro", null, email);

        // Welcome Pro email (non-blocking)
        if (email) {
          const { data: user } = await supabaseAdmin?.from("users").select("name").eq("email", email).maybeSingle() ?? {};
          sendSubscriptionConfirmEmail({ email, name: user?.name ?? "" }).catch(() => {});
        }

        // Track affiliate referral
        const affiliateCode = s.metadata?.affiliateCode;
        if (affiliateCode && supabaseAdmin && email) {
          const { data: aff } = await supabaseAdmin
            .from("affiliates")
            .select("commission_rate")
            .eq("code", affiliateCode)
            .eq("status", "active")
            .maybeSingle();

          if (aff) {
            const amountCents    = s.amount_total ?? 999; // fallback 9.99€
            const commissionCents = Math.round(amountCents * (aff.commission_rate / 100));
            await supabaseAdmin.from("referrals").insert({
              affiliate_code:   affiliateCode,
              referred_email:   email,
              stripe_session_id: s.id,
              amount_cents:     amountCents,
              commission_cents: commissionCents,
              status:           "converted",
            });
          }
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const s   = event.data.object;
      if (isHr(s)) break;
      const cus = await stripe.customers.retrieve(s.customer);
      await upsertSub(
        s.customer, s.id,
        toAcademicStatus(s.status),
        subPeriodEnd(s),
        cus.email
      );
      break;
    }

    case "customer.subscription.deleted": {
      const s   = event.data.object;
      if (isHr(s)) break;
      const cus = await stripe.customers.retrieve(s.customer);
      await upsertSub(s.customer, s.id, "free", null, cus.email);
      // Cancellation email (non-blocking)
      if (cus.email) {
        const { data: user } = await supabaseAdmin?.from("users").select("name").eq("email", cus.email).maybeSingle() ?? {};
        sendSubscriptionCancelledEmail({ email: cus.email, name: user?.name ?? "" }).catch(() => {});
      }
      break;
    }

    case "invoice.payment_failed": {
      const inv = event.data.object;
      const subId = inv.subscription ?? inv.parent?.subscription_details?.subscription;
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        if (isHr(sub)) break;
      }
      const cus = await stripe.customers.retrieve(inv.customer);
      if (cus.email) {
        const { data: user } = await supabaseAdmin?.from("users").select("name").eq("email", cus.email).maybeSingle() ?? {};
        const retryUrl = inv.hosted_invoice_url ?? undefined;
        sendPaymentFailedEmail({ email: cus.email, name: user?.name ?? "", retryUrl }).catch(() => {});
      }
      break;
    }
  }
  } catch (err) {
    console.error(`[academic webhook] ${event.type} failed:`, err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
