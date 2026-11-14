/**
 * Background screening run for a DocSwift HR job.
 * Resumable: a run whose heartbeat is stale (redeploy, crash) can be claimed
 * again and only the CVs still "pending" are processed.
 */
import { supabaseAdmin }  from "./supabase.js";
import { analyzeCV, readCv } from "./gemini.js";
import { incrementHrCvScreened } from "./hrSubscription.js";
import { normalizeCriteria, normalizeVerdicts, scoreFromVerdicts } from "./hrCriteria.js";
import { downloadCv, removeCvs, audit } from "./hrStorage.js";

const CONCURRENCY = 4;
export const STALE_MS = 5 * 60 * 1000;

async function loadFile(cv) {
  if (cv.storage_path) return { buffer: await downloadCv(cv.storage_path), mime: cv.mime_type || "application/pdf" };
  if (cv.pdf_data)     return { buffer: Buffer.from(cv.pdf_data, "base64"), mime: "application/pdf" }; // legacy rows
  throw new Error("Fichier introuvable.");
}

async function processCv(cv, job, criteria, userEmail) {
  let succeeded = false;
  try {
    const { buffer, mime } = await loadFile(cv);
    const { text, mode }   = await readCv(buffer, mime);
    if (mode === "docx" && !text) throw new Error("Document Word vide ou illisible.");

    const result = await analyzeCV({
      jobTitle: job.title, jobDescription: job.description, criteria,
      cvText: text, pdfBuffer: mode === "vision" ? buffer : null,
      language: job.language || "fr",
    });

    const verdicts = normalizeVerdicts(criteria, result.criteria);
    const computed = scoreFromVerdicts(criteria, verdicts); // null when no criteria

    await supabaseAdmin.from("hr_cv_analyses").update({
      score:            computed?.score  ?? result.score,
      status:           computed?.status ?? result.status,
      strengths:        result.strengths,
      weaknesses:       result.weaknesses,
      summary:          result.summary,
      criteria_results: verdicts,
      read_mode:        mode,
      error_msg:        null,
      pdf_data:         null,
      storage_path:     null,
    }).eq("id", cv.id);
    succeeded = true;
    if (cv.storage_path) await removeCvs([cv.storage_path]); // data minimisation
  } catch (err) {
    console.error(`[hr/run] ${cv.id}:`, err.message);
    await supabaseAdmin.from("hr_cv_analyses").update({
      status: "error", error_msg: err.message?.slice(0, 255) ?? "Erreur inconnue",
    }).eq("id", cv.id);
  }
  await supabaseAdmin.rpc("hr_increment_analyzed", { p_job_id: job.id });
  await supabaseAdmin.from("hr_jobs").update({ heartbeat_at: new Date().toISOString() }).eq("id", job.id);
  if (succeeded) await incrementHrCvScreened(userEmail, 1);
}

async function runBatch(job, userEmail) {
  const criteria = normalizeCriteria(job.criteria);
  const { data: cvs } = await supabaseAdmin
    .from("hr_cv_analyses")
    .select("id, filename, pdf_data, storage_path, mime_type")
    .eq("job_id", job.id)
    .eq("status", "pending");

  for (let i = 0; i < (cvs?.length ?? 0); i += CONCURRENCY) {
    await supabaseAdmin.from("hr_jobs").update({ heartbeat_at: new Date().toISOString() }).eq("id", job.id);
    await Promise.allSettled(cvs.slice(i, i + CONCURRENCY).map((cv) => processCv(cv, job, criteria, userEmail)));
    if (i + CONCURRENCY < cvs.length) await new Promise((r) => setTimeout(r, 800));
  }

  await supabaseAdmin.from("hr_jobs").update({ status: "done", heartbeat_at: new Date().toISOString() }).eq("id", job.id);
  await audit({ jobId: job.id, actor: "system", action: "analysis_done", detail: { processed: cvs?.length ?? 0, criteria: criteria.length } });
}

/**
 * Claims the job atomically and starts the run in the background.
 * Returns false when a live run already owns the job.
 */
export async function startRun(job, userEmail, { resume = false } = {}) {
  const now = new Date().toISOString();
  const staleBefore = new Date(Date.now() - STALE_MS).toISOString();
  const update = { status: "analyzing", heartbeat_at: now };
  if (!resume) update.started_at = now;

  const { data: claimed, error } = await supabaseAdmin
    .from("hr_jobs")
    .update(update)
    .eq("id", job.id)
    .or(`status.neq.analyzing,heartbeat_at.lt.${staleBefore},heartbeat_at.is.null`)
    .select("id");
  if (error) throw error;
  if (!claimed?.length) return false;

  runBatch(job, userEmail).catch(async (err) => {
    console.error("[hr/run] fatal:", err);
    await supabaseAdmin.from("hr_jobs").update({ status: "error", error_msg: err.message?.slice(0, 255) ?? "Erreur inconnue" }).eq("id", job.id);
  });
  return true;
}

export function isStale(job) {
  if (job.status !== "analyzing") return false;
  const beat = job.heartbeat_at ? new Date(job.heartbeat_at).getTime() : 0;
  return Date.now() - beat > STALE_MS;
}
