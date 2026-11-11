import { NextResponse } from "next/server";
import { getUsageToday, incrementUsage } from "@/lib/supabase";
import { analyzeCV, extractPdfText } from "@/lib/gemini";
import { getClientIp } from "@/lib/clientIp";

const MAX_CVS         = 5;
const MAX_FILE_SIZE   = 5 * 1024 * 1024; // 5 MB per CV
const MAX_BODY_SIZE   = MAX_CVS * MAX_FILE_SIZE + 512 * 1024;
const DAILY_TRIAL_CAP = 3;               // 3 free trial runs per IP per day (shared office NAT)

// Namespaced identifier so this never collides with the Academic anonymous
// usage counter, which keys usage_logs by bare IP.
function trialIdentifier(request) {
  return `hr_trial:${getClientIp(request)}`;
}

// ── POST /api/hr/trial/screen — Anonymous CV screening (no account, no persistence) ──
export async function POST(request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_KEY_MISSING", message: "Service temporairement indisponible." }, { status: 503 });
  }

  const identifier = trialIdentifier(request);
  const usedToday   = await getUsageToday(identifier);
  if (usedToday >= DAILY_TRIAL_CAP) {
    return NextResponse.json({ error: "TRIAL_LIMIT_REACHED", message: "Limite d'essais gratuits atteinte pour aujourd'hui. Créez votre compte pour continuer : 14 jours offerts." }, { status: 429 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (!contentLength || contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  }

  const formData    = await request.formData();
  const jobTitle    = (formData.get("jobTitle") ?? "").toString().trim();
  const jobDesc     = (formData.get("jobDescription") ?? "").toString().trim();
  const files       = formData.getAll("files");

  if (!jobTitle || !jobDesc) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }
  if (!files.length) {
    return NextResponse.json({ error: "NO_FILES" }, { status: 400 });
  }
  if (files.length > MAX_CVS) {
    return NextResponse.json({ error: "TOO_MANY_CVS", max: MAX_CVS }, { status: 400 });
  }

  await incrementUsage(identifier);

  const results = await Promise.all(files.map(async (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return { filename: file.name, status: "error", error_msg: "Fichier trop volumineux (max 5 MB)." };
    }
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const cvText = await extractPdfText(buffer);
      if (!cvText.trim()) {
        return { filename: file.name, status: "error", error_msg: "Impossible d'extraire le texte du PDF." };
      }
      const result = await analyzeCV({ jobTitle, jobDescription: jobDesc, cvText });
      return { filename: file.name, ...result };
    } catch (err) {
      console.error("[hr/trial] analysis error:", err?.message);
      return { filename: file.name, status: "error", error_msg: "Analyse impossible pour ce fichier." };
    }
  }));

  return NextResponse.json({ jobTitle, results });
}
