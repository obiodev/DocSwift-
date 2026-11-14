import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";
import { isHrActive }       from "@/lib/hrSubscription";
import { suggestCriteria }  from "@/lib/gemini";

// Light per-user throttle (in memory, per instance)
const hits = new Map();
function throttled(email) {
  const now = Date.now();
  const list = (hits.get(email) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(email, list);
  return list.length > 6;
}

// ── POST /api/hr/criteria/suggest — AI-proposed criteria from a job description ──
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  if (!(await isHrActive(session.user.email))) {
    return NextResponse.json({ error: "HR_SUBSCRIPTION_REQUIRED" }, { status: 403 });
  }
  if (throttled(session.user.email)) return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });

  const body = await request.json().catch(() => ({}));
  const jobTitle       = String(body.title ?? "").trim();
  const jobDescription = String(body.description ?? "").trim();
  if (!jobTitle || jobDescription.length < 40) {
    return NextResponse.json({ error: "DESCRIPTION_TOO_SHORT" }, { status: 400 });
  }
  const language = ["fr", "en", "ar"].includes(body.language) ? body.language : "fr";

  try {
    const criteria = await suggestCriteria({ jobTitle, jobDescription, language });
    return NextResponse.json({ criteria });
  } catch (err) {
    console.error("[hr/criteria/suggest]", err.message);
    return NextResponse.json({ error: "AI_UNAVAILABLE" }, { status: 503 });
  }
}
