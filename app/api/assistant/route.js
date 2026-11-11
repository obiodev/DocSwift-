import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { generateWithFallback, GEMINI_FALLBACK_MODEL } from "@/lib/gemini";
import { authOptions }      from "@/lib/auth";
import { supabaseAdmin, getUsageToday, incrementUsage } from "@/lib/supabase";
import { getHrQuotaStatus, HR_PLAN_LABELS } from "@/lib/hrSubscription";
import { buildSystemPrompt } from "@/lib/assistantKnowledge";
import { sendAssistantLeadAlert } from "@/lib/email";
import { getClientIp }      from "@/lib/clientIp";

const MODEL            = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const MAX_TURNS        = 12;    // messages kept from the conversation
const MAX_CHARS        = 1200;  // per message
const DAILY_CAP_ANON   = 40;    // messages / IP / day
const DAILY_CAP_USER   = 120;   // messages / account / day
const EMAIL_RE         = /[\w.+-]+@[\w-]+\.[\w.-]+/;

const FALLBACK = "Je rencontre un souci technique. Laissez votre email ici et un membre de l'équipe vous répond sous 24 h ouvrées, ou essayez directement l'analyse gratuite de 5 CV : https://getdocswift.com/hr/essai-gratuit";

// ── POST /api/assistant — on-site sales & support assistant ──────────────────
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const page = String(body.page ?? "").slice(0, 200);

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || !last.content.trim()) {
    return NextResponse.json({ error: "EMPTY" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const email   = session?.user?.email ?? null;

  // ── Rate limit ─────────────────────────────────────────────────────────
  const key = email ? `assistant:${email}` : `assistant:${getClientIp(request)}`;
  if ((await getUsageToday(key)) >= (email ? DAILY_CAP_USER : DAILY_CAP_ANON)) {
    return NextResponse.json({ reply: "Vous avez atteint la limite de messages pour aujourd'hui. Laissez votre email et nous vous répondrons, ou revenez demain." });
  }
  await incrementUsage(key);

  // ── Lead capture: visitor typed an email address ───────────────────────
  const leadMatch = last.content.match(EMAIL_RE);
  if (leadMatch && supabaseAdmin) {
    const leadEmail = leadMatch[0].toLowerCase().slice(0, 254);
    const { error } = await supabaseAdmin.from("hr_leads").insert({ email: leadEmail, source: "assistant", job_title: page || null });
    if (error) console.error("[assistant] lead insert:", error.message);
    sendAssistantLeadAlert({ leadEmail, transcript: messages, page }).catch(() => {});
  }

  // ── Customer context (only their own data) ─────────────────────────────
  let customer = null;
  if (email) {
    const q = await getHrQuotaStatus(email).catch(() => null);
    customer = {
      email,
      active:    !!q?.active,
      planLabel: HR_PLAN_LABELS[q?.plan] ?? q?.plan ?? "",
      used:      q?.used ?? 0,
      quota:     q?.quota ?? 0,
      remaining: q?.remaining ?? 0,
    };
  }

  if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) return NextResponse.json({ reply: FALLBACK });

  try {
    // Gemini requires the history to start with a user turn
    const firstUser = messages.findIndex((m) => m.role === "user");
    const contents  = messages.slice(firstUser).map((m) => ({
      role:  m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Chat favours speed: light model first, the main model as backup
    const result = await generateWithFallback({
      models: [process.env.GEMINI_ASSISTANT_MODEL || GEMINI_FALLBACK_MODEL, MODEL],
      modelParams: {
        systemInstruction: buildSystemPrompt({ customer }),
        generationConfig: { maxOutputTokens: 2048, thinkingConfig: { thinkingLevel: "low" } },
      },
      request: { contents },
      timeoutMs: 20_000,
    });
    const reply  = result.response.text().trim().slice(0, 2000);
    return NextResponse.json({ reply: reply || FALLBACK });
  } catch (err) {
    console.error("[assistant] Gemini error:", err?.message);
    return NextResponse.json({ reply: FALLBACK });
  }
}
