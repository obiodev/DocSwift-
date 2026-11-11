/**
 * Returns the client IP in a way the client cannot spoof.
 *
 * Trusted, in order:
 *   1. cf-connecting-ip — set by Cloudflare, overwritten on each request
 *   2. x-real-ip when the request came through Railway's edge (x-railway-edge
 *      is present): Railway sets it to the client's remote IP
 *      (docs.railway.com/networking/public-networking/specs-and-limits)
 *   3. the RIGHT-most X-Forwarded-For entry (appended by our own proxy);
 *      left-most entries are attacker-controlled
 *   4. x-real-ip (other hosts)
 *
 * Note: on Railway the right-most X-Forwarded-For entry is an edge address
 * shared by many visitors, so it must not come before x-real-ip there.
 */
export function getClientIp(request) {
  const h = request.headers;

  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const realIp = h.get("x-real-ip")?.trim();
  if (realIp && h.get("x-railway-edge")) return realIp;

  const xff = h.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }

  return realIp || "unknown";
}
