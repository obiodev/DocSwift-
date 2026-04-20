/**
 * lib/gemini.js
 * Gemini 1.5 Flash — CV analysis against a job description
 * Free tier: 15 RPM · 1M tokens/day  (~0.0002€/CV on paid)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

let _genAI = null;
function getGenAI() {
  if (!_genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set");
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
}

/**
 * Analyze a single CV against a job description.
 *
 * @param {object} opts
 * @param {string} opts.jobTitle
 * @param {string} opts.jobDescription
 * @param {string} opts.cvText        — raw text extracted from the CV PDF
 * @param {string} [opts.language]    — "fr" | "en" | "ar" (default "fr")
 *
 * @returns {{ score:number, status:string, strengths:string[], weaknesses:string[], summary:string }}
 */
export async function analyzeCV({ jobTitle, jobDescription, cvText, language = "fr" }) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
  });

  const langInstruction = {
    fr: "Réponds UNIQUEMENT en français.",
    en: "Reply ONLY in English.",
    ar:  "أجب فقط باللغة العربية.",
  }[language] ?? "Réponds UNIQUEMENT en français.";

  const prompt = `
Tu es un recruteur expert. Analyse ce CV par rapport à la fiche de poste ci-dessous et retourne un objet JSON UNIQUEMENT (aucune explication, aucun markdown).

${langInstruction}

FICHE DE POSTE — ${jobTitle}:
${jobDescription.slice(0, 3000)}

CV DU CANDIDAT:
${cvText.slice(0, 4000)}

Retourne UNIQUEMENT ce JSON valide (sans code fences, sans explication) :
{
  "score": <entier 0-100>,
  "status": "recommended" | "consider" | "rejected",
  "strengths": ["<point fort 1>", "<point fort 2>"],
  "weaknesses": ["<point faible 1>", "<point faible 2>"],
  "summary": "<résumé en une phrase>"
}

Règle de scoring :
- 75-100 → "recommended" (excellent match)
- 45-74  → "consider"     (match partiel)
- 0-44   → "rejected"     (mauvais match)
`.trim();

  const result = await model.generateContent(prompt);
  const raw    = result.response.text().trim();

  // Strip possible markdown code fences
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const match   = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Gemini returned non-JSON: ${raw.slice(0, 200)}`);

  const parsed = JSON.parse(match[0]);

  // Ensure status coherence with score
  const score = Math.max(0, Math.min(100, parseInt(parsed.score) || 0));
  let   status = parsed.status;
  if (!["recommended","consider","rejected"].includes(status)) {
    status = score >= 75 ? "recommended" : score >= 45 ? "consider" : "rejected";
  }

  return {
    score,
    status,
    strengths:  Array.isArray(parsed.strengths)  ? parsed.strengths.slice(0, 4)  : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 4) : [],
    summary:    typeof parsed.summary === "string" ? parsed.summary : "",
  };
}

/**
 * Extract plain text from a PDF buffer using pdfjs-dist.
 * Reuses the same approach as pdfToDocx.js.
 */
export async function extractPdfText(buffer) {
  const { default: pdfjsLib } = await import("pdfjs-dist/legacy/build/pdf.js");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";

  const pdf    = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false, isEvalSupported: false, disableFontFace: true, verbosity: 0,
  }).promise;

  let text = "";
  for (let i = 1; i <= Math.min(pdf.numPages, 6); i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent({ normalizeWhitespace: true });
    text += content.items.map(it => it.str).join(" ") + "\n";
  }
  return text.trim();
}
