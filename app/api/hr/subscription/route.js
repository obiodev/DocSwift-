import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { getHrSubscription, getHrQuotaStatus } from "@/lib/hrSubscription";

// ── GET /api/hr/subscription — Current user's HR subscription + quota status ──
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const [sub, quota] = await Promise.all([
    getHrSubscription(session.user.email),
    getHrQuotaStatus(session.user.email),
  ]);

  return NextResponse.json({
    ...quota,
    status:            sub?.status ?? null,
    currentPeriodEnd:  sub?.current_period_end ?? null,
  });
}
