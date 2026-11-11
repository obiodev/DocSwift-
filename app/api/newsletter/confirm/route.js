import { supabaseAdmin } from "@/lib/supabase";
import { resendClient }  from "@/lib/email";
import { getClientIp }   from "@/lib/clientIp";

function page(title, text) {
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — DocSwift</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#07090F;color:#F0F4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px">
<div style="max-width:440px;text-align:center;background:#0D1117;border:1px solid #1E2733;border-radius:16px;padding:36px">
<div style="font-weight:900;font-size:24px;margin-bottom:18px">Doc<span style="color:#3B82F6">Swift</span></div>
<h1 style="font-size:20px;margin:0 0 10px">${title}</h1>
<p style="color:#8892AA;line-height:1.6;margin:0 0 22px">${text}</p>
<a href="/hr" style="color:#F97316;font-weight:700;text-decoration:none">Découvrir DocSwift HR →</a>
</div></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// Adds the contact to the Resend segment used for broadcasts.
// Resend then handles the unsubscribe link of every newsletter.
async function syncToResend(email) {
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
  if (!resendClient || !segmentId) {
    console.warn("[newsletter] RESEND_NEWSLETTER_SEGMENT_ID manquant — contact non synchronisé :", email);
    return false;
  }
  const created = await resendClient.contacts.create({ email, unsubscribed: false, segments: [{ id: segmentId }] });
  if (!created.error) return true;

  // Contact already exists (e.g. re-subscribing): re-enable and add to the segment
  const updated = await resendClient.contacts.update({ email, unsubscribed: false });
  const added   = await resendClient.contacts.segments.add({ email, segmentId });
  if (updated.error || added.error) {
    console.error("[newsletter] sync Resend échouée :", created.error, updated.error, added.error);
    return false;
  }
  return true;
}

// ── GET /api/newsletter/confirm?token= — step 2 of double opt-in ─────────────
export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!/^[a-f0-9]{64}$/.test(token) || !supabaseAdmin) {
    return page("Lien invalide", "Ce lien de confirmation n'est pas valide. Réinscrivez-vous depuis le site.");
  }

  const { data: sub } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("email")
    .eq("confirm_token", token)
    .maybeSingle();

  if (!sub) return page("Lien expiré", "Ce lien a déjà été utilisé ou a expiré. Si vous êtes déjà inscrit, tout est en ordre.");

  // Proof of consent (GDPR art. 7): when and from where it was confirmed
  const { error } = await supabaseAdmin.from("newsletter_subscribers").update({
    status:        "confirmed",
    confirm_token: null,
    confirmed_at:  new Date().toISOString(),
    confirm_ip:    getClientIp(request),
  }).eq("email", sub.email);

  if (error) {
    console.error("[newsletter/confirm]", error);
    return page("Erreur", "Un problème est survenu. Réessayez dans quelques minutes.");
  }

  const synced = await syncToResend(sub.email);
  if (synced) {
    await supabaseAdmin.from("newsletter_subscribers").update({ synced_at: new Date().toISOString() }).eq("email", sub.email);
  }

  return page("Inscription confirmée ✓", "Merci ! Vous recevrez nos prochains conseils de recrutement assisté par IA. Chaque email contient un lien de désinscription.");
}
