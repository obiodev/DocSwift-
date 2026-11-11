/**
 * Returns the client IP in a way the client cannot spoof.
 *
 * Proxies (Railway / Cloudflare) APPEND the real peer address to
 * X-Forwarded-For, so the left-most entries are attacker-controlled.
 * We therefore trust, in order:
 *   1. cf-connecting-ip (set by Cloudflare, overwritten on each request)
 *   2. the RIGHT-most X-Forwarded-For entry (added by our own edge proxy)
 *   3. x-real-ip
 */
export function getClientIp(request) {
  const h = request.headers;
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const xff = h.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }

  return h.get("x-real-ip")?.trim() || "unknown";
}
