/**
 * Weighted screening criteria for DocSwift HR.
 *
 * A criterion: { id, label, weight: 1|2|3, must: boolean }
 * A verdict:   { id, verdict: "met"|"partial"|"missing", evidence: string }
 *
 * The score is computed here, deterministically, from the AI verdicts — not
 * invented by the model. This makes every score explainable to the recruiter
 * (AI Act transparency) and identical for identical verdicts.
 */

export const MAX_CRITERIA = 10;
const VALUE = { met: 1, partial: 0.5, missing: 0 };

export function normalizeCriteria(input) {
  if (!Array.isArray(input)) return [];
  const seen = new Set();
  return input
    .map((c, i) => ({
      id:     String(c?.id ?? `c${i + 1}`).replace(/[^\w-]/g, "").slice(0, 20) || `c${i + 1}`,
      label:  String(c?.label ?? "").trim().slice(0, 160),
      weight: [1, 2, 3].includes(Number(c?.weight)) ? Number(c.weight) : 2,
      must:   Boolean(c?.must),
    }))
    .filter((c) => c.label && !seen.has(c.id) && seen.add(c.id))
    .slice(0, MAX_CRITERIA);
}

export function normalizeVerdicts(criteria, raw) {
  const byId = new Map((Array.isArray(raw) ? raw : []).map((r) => [String(r?.id), r]));
  return criteria.map((c) => {
    const r = byId.get(c.id) ?? {};
    const verdict = ["met", "partial", "missing"].includes(r.verdict) ? r.verdict : "missing";
    return { id: c.id, verdict, evidence: String(r.evidence ?? "").trim().slice(0, 300) };
  });
}

/**
 * Returns { score, status }.
 * - weighted average of verdicts × 100
 * - a missing "must" criterion caps the score at 44 (band "rejected")
 */
export function scoreFromVerdicts(criteria, verdicts) {
  if (!criteria.length) return null;
  const byId = new Map(verdicts.map((v) => [v.id, v]));
  let total = 0, max = 0, mustMissing = false;
  for (const c of criteria) {
    const v = byId.get(c.id)?.verdict ?? "missing";
    total += c.weight * VALUE[v];
    max   += c.weight;
    if (c.must && v === "missing") mustMissing = true;
  }
  let score = Math.round((total / max) * 100);
  if (mustMissing) score = Math.min(score, 44);
  const status = score >= 75 ? "recommended" : score >= 45 ? "consider" : "rejected";
  return { score, status };
}
