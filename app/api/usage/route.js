import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { getUsageToday, incrementUsage, isPro, FREE_LIMIT } from "@/lib/supabase";

// Helper: get the caller's identifier (email or IP)
function getIdentifier(request, session) {
  if (session?.user?.email) return session.user.email;
  const forwarded = request.headers.get("x-forwarded-for");
  return (forwarded ? forwarded.split(",")[0] : "anonymous").trim();
}

// GET /api/usage — returns { used, limit, isPro, remaining }
export async function GET(request) {
  const session    = await getServerSession(authOptions);
  const pro        = session?.user?.email ? await isPro(session.user.email) : false;
  const identifier = getIdentifier(request, session);
  const used       = pro ? 0 : await getUsageToday(identifier);
  const limit      = FREE_LIMIT;

  return NextResponse.json({
    used,
    limit,
    isPro: pro,
    remaining: pro ? Infinity : Math.max(0, limit - used),
  });
}

// POST /api/usage/consume — called after a successful conversion
export async function POST(request) {
  const session    = await getServerSession(authOptions);
  const pro        = session?.user?.email ? await isPro(session.user.email) : false;

  if (pro) {
    return NextResponse.json({ ok: true, remaining: Infinity });
  }

  const identifier = getIdentifier(request, session);
  const used       = await getUsageToday(identifier);

  if (used >= FREE_LIMIT) {
    return NextResponse.json(
      { error: "Daily limit reached", remaining: 0 },
      { status: 429 }
    );
  }

  const newCount = await incrementUsage(identifier);
  return NextResponse.json({
    ok: true,
    used:      newCount,
    remaining: Math.max(0, FREE_LIMIT - newCount),
  });
}
