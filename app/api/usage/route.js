import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { getUsageToday, incrementUsage, isPro, getPlan, getFreeLimit } from "@/lib/supabase";

// Helper: get the caller's identifier (email or IP)
function getIdentifier(request, session) {
  if (session?.user?.email) return session.user.email;
  const forwarded = request.headers.get("x-forwarded-for");
  return (forwarded ? forwarded.split(",")[0] : "anonymous").trim();
}

// GET /api/usage — returns { used, limit, isPro, remaining }
export async function GET(request) {
  const session    = await getServerSession(authOptions);
  const plan       = session?.user?.email ? await getPlan(session.user.email) : "free";
  const pro        = plan === "pro" || plan === "premium";
  const identifier = getIdentifier(request, session);
  const freeLimit = await getFreeLimit();
  const [used, limit] = pro
    ? [0, freeLimit]
    : await Promise.all([getUsageToday(identifier), getFreeLimit()]);

  return NextResponse.json({
    used,
    limit,
    isPro: pro,
    isPremium: plan === "premium",
    plan,
    remaining: pro ? -1 : Math.max(0, limit - used), // -1 means unlimited
  });
}

// POST /api/usage/consume — called after a successful conversion
export async function POST(request) {
  const session    = await getServerSession(authOptions);
  const pro        = session?.user?.email ? await isPro(session.user.email) : false;

  if (pro) {
    return NextResponse.json({ ok: true, remaining: -1 });
  }

  const identifier = getIdentifier(request, session);
  const [used, limit] = await Promise.all([getUsageToday(identifier), getFreeLimit()]);

  if (used >= limit) {
    return NextResponse.json(
      { error: "Daily limit reached", remaining: 0 },
      { status: 429 }
    );
  }

  const newCount = await incrementUsage(identifier);
  return NextResponse.json({
    ok: true,
    used:      newCount,
    remaining: Math.max(0, limit - newCount),
  });
}
