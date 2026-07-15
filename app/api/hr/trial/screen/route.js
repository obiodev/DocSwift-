import { NextResponse } from "next/server";
import { getUsageToday, incrementUsage } from "@/lib/supabase";
import { analyzeCV, extractPdfText } from "@/lib/gemini";

const MAX_CVS         = 5;
const MAX_FILE_SIZE   = 5 * 1024 * 1024; // 5 MB per CV
const DAILY_TRIAL_CAP = 1;               // 1 free trial run per IP per day

// Namespaced identifier so this never collides with the Academic anonymous
// usage counter, which keys usage_logs by bare IP.
function trialIdentifier(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
  return `hr_trial:${ip}`;
}

// ── POST /api/hr/trial/screen — Anonymous CV screening (no account, no persistence) ──
export async function POST(request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_KEY_MISSING", message: "Service temporairement indisponible." }, { status: 503 });
  }

  const identifier = trialIdentifier(request);
  const usedToday   = await getUsageToday(identifier);
  if (usedToday >= DAILY_TRIAL_CAP) {
    return NextResponse.json({ error: "TRIAL_LIMIT_REACHED", message: "Essai gratuit déjà utilisé aujourd'hui. Réessayez demain ou créez un compte." }, { status: 429 });
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
      return { filename: file.name, status: "error", error_msg: err.message?.slice(0, 255) ?? "Erreur inconnue" };
    }
  }));

  return NextResponse.json({ jobTitle, results });
}
