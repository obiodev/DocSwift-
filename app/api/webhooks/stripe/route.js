import { NextResponse }  from "next/server";
import Stripe            from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { HR_PLAN_QUOTAS } from "@/lib/hrSubscription";
import {
  sendHrSubscriptionConfirmEmail,
  sendHrPaymentFailedEmail,
  sendHrSubscriptionCancelledEmail,
} from "@/lib/email";

// Dedicated webhook for DocSwift HR (B2B). Kept separate from /api/stripe/webhook
// (Academic) — only events tagged metadata.product === "hr" are processed here,
// so this endpoint is safe even if both are pointed at the same Stripe events.
const STATUS_MAP = { trialing: "trialing", active: "active", past_due: "past_due", canceled: "canceled" };

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_HR_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body      = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_HR_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  const upsertHrSub = async ({ email, plan, status, stripeCustomerId, stripeSubscriptionId, periodEnd, resetUsage }) => {
    if (!supabaseAdmin || !email) return;
    const row = {
      user_email:             email,
      stripe_customer_id:     stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      status,
      current_period_end:     periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at:             new Date().toISOString(),
    };
    if (plan) {
      row.plan     = plan;
      row.cv_quota = HR_PLAN_QUOTAS[plan] ?? 0;
    }
    if (resetUsage) row.cv_screened_this_month = 0;
    const { error } = await supabaseAdmin.from("hr_subscriptions").upsert(row, { onConflict: "user_email" });
    // Throw so the handler answers 500 and Stripe retries instead of losing a payment
    if (error) throw new Error(`hr_subscriptions upsert failed: ${error.message}`);
  };

  // Stripe API ≥ 2025-03 (basil/dahlia) moved these fields; support both shapes.
  const subPeriodEnd   = (s) => s.current_period_end ?? s.items?.data?.[0]?.current_period_end ?? null;
  const invoiceSubId   = (inv) => inv.subscription ?? inv.parent?.subscription_details?.subscription ?? null;

  try {
  switch (event.type) {

    case "checkout.session.completed": {
      const s = event.data.object;
      if (s.metadata?.product !== "hr" || s.mode !== "subscription") break;

      const email = s.customer_email ?? s.metadata?.userEmail;
      const plan  = s.metadata?.plan;

      await upsertHrSub({
        email, plan, status: "trialing",
        stripeCustomerId: s.customer, stripeSubscriptionId: s.subscription,
        periodEnd: null, resetUsage: true,
      });

      if (email) {
        const { data: user } = await supabaseAdmin?.from("users").select("name").eq("email", email).maybeSingle() ?? {};
        sendHrSubscriptionConfirmEmail({ email, name: user?.name ?? "", plan }).catch(() => {});
      }
      break;
    }

    case "customer.subscription.updated": {
      const s = event.data.object;
      if (s.metadata?.product !== "hr") break;

      const cus  = await stripe.customers.retrieve(s.customer);
      const plan = s.metadata?.plan;

      await upsertHrSub({
        email: cus.email, plan,
        status: STATUS_MAP[s.status] ?? "past_due",
        stripeCustomerId: s.customer, stripeSubscriptionId: s.id,
        periodEnd: subPeriodEnd(s),
      });
      break;
    }

    // New billing period paid → reset the monthly CV counter
    case "invoice.paid": {
      const inv   = event.data.object;
      const subId = invoiceSubId(inv);
      if (!subId) break;
      if (!["subscription_cycle", "subscription_create"].includes(inv.billing_reason)) break;

      const sub = await stripe.subscriptions.retrieve(subId);
      if (sub.metadata?.product !== "hr") break;

      const cus = await stripe.customers.retrieve(inv.customer);
      await upsertHrSub({
        email: cus.email, plan: sub.metadata?.plan,
        status: STATUS_MAP[sub.status] ?? "active",
        stripeCustomerId: inv.customer, stripeSubscriptionId: subId,
        periodEnd: subPeriodEnd(sub),
        resetUsage: inv.billing_reason === "subscription_cycle",
      });
      break;
    }

    case "customer.subscription.deleted": {
      const s = event.data.object;
      if (s.metadata?.product !== "hr") break;

      const cus = await stripe.customers.retrieve(s.customer);
      await upsertHrSub({
        email: cus.email, plan: s.metadata?.plan, status: "canceled",
        stripeCustomerId: s.customer, stripeSubscriptionId: s.id, periodEnd: null,
      });

      if (cus.email) {
        const { data: user } = await supabaseAdmin?.from("users").select("name").eq("email", cus.email).maybeSingle() ?? {};
        sendHrSubscriptionCancelledEmail({ email: cus.email, name: user?.name ?? "" }).catch(() => {});
      }
      break;
    }

    case "invoice.payment_failed": {
      const inv = event.data.object;
      const subId = invoiceSubId(inv);
      if (!subId) break;
      const sub = await stripe.subscriptions.retrieve(subId);
      if (sub.metadata?.product !== "hr") break;

      const cus = await stripe.customers.retrieve(inv.customer);
      if (cus.email) {
        const { data: user } = await supabaseAdmin?.from("users").select("name").eq("email", cus.email).maybeSingle() ?? {};
        const retryUrl = inv.hosted_invoice_url ?? undefined;
        sendHrPaymentFailedEmail({ email: cus.email, name: user?.name ?? "", retryUrl }).catch(() => {});
      }
      break;
    }
  }
  } catch (err) {
    console.error(`[hr webhook] ${event.type} failed:`, err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
