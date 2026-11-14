/**
 * CV files live in the private Supabase Storage bucket "hr-cvs" only until
 * they are analysed, then they are deleted (data minimisation).
 */
import crypto from "crypto";
import { supabaseAdmin } from "./supabase.js";

const BUCKET = "hr-cvs";

export const ACCEPTED_TYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export function detectType(file) {
  if (ACCEPTED_TYPES[file.type]) return file.type;
  const name = String(file.name || "").toLowerCase();
  if (name.endsWith(".pdf"))  return "application/pdf";
  if (name.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return null;
}

export async function uploadCv(jobId, buffer, mime) {
  const path = `${jobId}/${crypto.randomUUID()}.${ACCEPTED_TYPES[mime]}`;
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, { contentType: mime, upsert: false });
  if (error) throw new Error(`storage upload failed: ${error.message}`);
  return path;
}

export async function downloadCv(path) {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(path);
  if (error) throw new Error(`storage download failed: ${error.message}`);
  return Buffer.from(await data.arrayBuffer());
}

export async function removeCvs(paths) {
  const list = paths.filter(Boolean);
  if (!list.length) return;
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove(list);
  if (error) console.error("[hrStorage] remove failed:", error.message);
}

export async function audit({ jobId, cvId = null, actor, action, detail = {} }) {
  const { error } = await supabaseAdmin.from("hr_audit_log").insert({ job_id: jobId, cv_id: cvId, actor, action, detail });
  if (error) console.error("[audit]", action, error.message);
}
