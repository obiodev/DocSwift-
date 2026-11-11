import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Transactional mail (account, billing). Must be on a domain verified in Resend.
const FROM     = process.env.EMAIL_FROM     ?? "DocSwift <hello@getdocswift.com>";
// Real inbox so customers can simply hit "reply"
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "contact@getdocswift.com";
const BASE_URL = process.env.NEXTAUTH_URL  ?? "https://getdocswift.com";

export { resend as resendClient };

// ── Shared layout ─────────────────────────────────────────────────────────────
function layout(content) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DocSwift</title>
</head>
<body style="margin:0;padding:0;background:#07090F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07090F;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:28px;text-align:center;">
              <a href="${BASE_URL}" style="text-decoration:none;font-size:26px;font-weight:900;color:#F0F4FF;letter-spacing:-1px;">
                Doc<span style="color:#3B82F6">Swift</span>
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0D1117;border:1px solid #1E2733;border-radius:16px;padding:36px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;color:#4B5563;font-size:12px;line-height:1.8;">
              © 2026 Motoko LLC — DocSwift<br/>
              <a href="${BASE_URL}/terms" style="color:#6B7A99;text-decoration:none;">CGU</a>
              &nbsp;·&nbsp;
              <a href="${BASE_URL}/terms" style="color:#6B7A99;text-decoration:none;">Confidentialité</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function btn(text, url, color = "#3B82F6") {
  return `<a href="${escHtml(url)}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-size:15px;font-weight:700;margin-top:8px;">${escHtml(text)}</a>`;
}

function h1(text) {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#F0F4FF;letter-spacing:-0.5px;">${text}</h1>`;
}

function p(text) {
  return `<p style="margin:12px 0;font-size:15px;color:#8892AA;line-height:1.7;">${text}</p>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #1E2733;margin:24px 0;" />`;
}

// ── Send helper ───────────────────────────────────────────────────────────────
async function send({ to, subject, html, idempotencyKey }) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY manquant — email non envoyé :", subject, "→", to);
    return false;
  }
  try {
    // The SDK returns { data, error } instead of throwing on API errors
    const { error } = await resend.emails.send(
      { from: FROM, replyTo: REPLY_TO, to, subject, html },
      idempotencyKey ? { idempotencyKey } : undefined
    );
    if (error) {
      console.error("[email] Resend a refusé l'envoi :", subject, "→", error.message ?? error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Erreur envoi :", err?.message ?? err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 0. VÉRIFICATION D'EMAIL ──────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export async function sendVerificationEmail({ email, name, token }) {
  const firstName = name?.split(" ")[0] ?? "";
  const url = `${BASE_URL}/api/auth/verify?token=${encodeURIComponent(token)}`;
  await send({
    to: email,
    subject: "Confirmez votre adresse email — DocSwift",
    html: layout(`
      ${h1(`Confirmez votre email${firstName ? `, ${escHtml(firstName)}` : ""}`)}
      ${p("Cliquez sur le bouton ci-dessous pour activer votre compte DocSwift. Ce lien expire dans 24 heures.")}
      ${btn("Activer mon compte →", url)}
      ${divider()}
      ${p("Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet email.")}
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 1. EMAIL DE BIENVENUE ────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export async function sendWelcomeEmail({ email, name }) {
  const firstName = name?.split(" ")[0] ?? "là";
  await send({
    to: email,
    subject: "Bienvenue sur DocSwift 👋",
    html: layout(`
      ${h1(`Bienvenue, ${firstName} ! 👋`)}
      ${p("Votre compte DocSwift est créé. Vous pouvez dès maintenant convertir, analyser et extraire des données depuis vos PDFs en quelques secondes.")}
      ${divider()}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #131922;">
            <span style="font-size:20px;">⚡</span>
            <span style="font-size:14px;color:#D1E8FF;font-weight:600;margin-left:10px;">5 conversions gratuites par jour</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #131922;">
            <span style="font-size:20px;">🤖</span>
            <span style="font-size:14px;color:#D1E8FF;font-weight:600;margin-left:10px;">Analyse IA de vos documents</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;">
            <span style="font-size:20px;">📄</span>
            <span style="font-size:14px;color:#D1E8FF;font-weight:600;margin-left:10px;">Export Word, Excel, PowerPoint</span>
          </td>
        </tr>
      </table>
      <div style="text-align:center;margin-top:8px;">
        ${btn("Accéder à mes outils →", `${BASE_URL}/tools`)}
      </div>
      ${divider()}
      ${p("Pour passer illimité et débloquer toutes les fonctionnalités Pro, <a href=\"" + BASE_URL + "\" style=\"color:#3B82F6;text-decoration:none;\">découvrez nos offres</a>.")}
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 2. CONFIRMATION ABONNEMENT PRO ──────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export async function sendSubscriptionConfirmEmail({ email, name, plan = "Pro", periodEnd }) {
  const firstName = name?.split(" ")[0] ?? "là";
  const endDate   = periodEnd ? new Date(periodEnd).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" }) : null;
  await send({
    to: email,
    subject: "Votre abonnement DocSwift Pro est actif ✨",
    html: layout(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);border-radius:50px;padding:8px 20px;font-size:13px;font-weight:700;color:#10B981;">
          ✨ Plan ${plan} activé
        </div>
      </div>
      ${h1(`Merci, ${firstName} !`)}
      ${p("Votre abonnement <strong style=\"color:#F0F4FF;\">DocSwift " + plan + "</strong> est maintenant actif. Accès illimité, toutes les fonctionnalités débloquées.")}
      ${divider()}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #131922;">
            <span style="font-size:20px;">♾️</span>
            <span style="font-size:14px;color:#D1E8FF;font-weight:600;margin-left:10px;">Conversions illimitées</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #131922;">
            <span style="font-size:20px;">🤖</span>
            <span style="font-size:14px;color:#D1E8FF;font-weight:600;margin-left:10px;">IA avancée (chat PDF)</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;">
            <span style="font-size:20px;">⚡</span>
            <span style="font-size:14px;color:#D1E8FF;font-weight:600;margin-left:10px;">Priorité de traitement</span>
          </td>
        </tr>
      </table>
      ${endDate ? `<p style="margin:0 0 20px;font-size:13px;color:#6B7A99;">Prochain renouvellement : <strong style="color:#8892AA;">${endDate}</strong></p>` : ""}
      <div style="text-align:center;">
        ${btn("Accéder à DocSwift Pro →", `${BASE_URL}/tools`, "#10B981")}
      </div>
      ${divider()}
      ${p("Gérez votre abonnement ou annulez à tout moment depuis votre <a href=\"" + BASE_URL + "/tools\" style=\"color:#3B82F6;text-decoration:none;\">espace client</a>.")}
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 3. RELANCE PAIEMENT ÉCHOUÉ ──────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export async function sendPaymentFailedEmail({ email, name, retryUrl }) {
  const firstName = name?.split(" ")[0] ?? "là";
  const url       = retryUrl ?? `${BASE_URL}/tools`;
  await send({
    to: email,
    subject: "⚠️ Échec du paiement — Action requise",
    html: layout(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:50px;padding:8px 20px;font-size:13px;font-weight:700;color:#FCA5A5;">
          ⚠️ Paiement échoué
        </div>
      </div>
      ${h1(`Action requise, ${firstName}`)}
      ${p("Nous n'avons pas pu renouveler votre abonnement DocSwift Pro. Votre accès reste actif pour le moment, mais votre compte sera rétrogradé au plan gratuit si le paiement n'est pas régularisé.")}
      ${divider()}
      <div style="background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.15);border-radius:12px;padding:16px 20px;margin:0 0 20px;">
        <p style="margin:0;font-size:14px;color:#FCA5A5;font-weight:600;">Causes fréquentes :</p>
        <ul style="margin:10px 0 0;padding-left:20px;color:#8892AA;font-size:14px;line-height:1.8;">
          <li>Carte expirée ou bloquée</li>
          <li>Fonds insuffisants</li>
          <li>Carte nécessitant une authentification 3D Secure</li>
        </ul>
      </div>
      <div style="text-align:center;">
        ${btn("Mettre à jour mon moyen de paiement →", url, "#EF4444")}
      </div>
      ${divider()}
      ${p("Si vous avez des questions, répondez directement à cet email. Nous sommes là pour vous aider.")}
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 4. ABONNEMENT ANNULÉ / EXPIRÉ ───────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export async function sendSubscriptionCancelledEmail({ email, name }) {
  const firstName = name?.split(" ")[0] ?? "là";
  await send({
    to: email,
    subject: "Votre abonnement DocSwift a expiré",
    html: layout(`
      ${h1(`À bientôt, ${firstName}`)}
      ${p("Votre abonnement DocSwift Pro a pris fin. Votre compte est maintenant en plan gratuit (5 conversions/jour).")}
      ${divider()}
      <div style="background:#0A0E17;border:1px solid #1E2733;border-radius:12px;padding:20px;margin:0 0 24px;">
        <p style="margin:0 0 12px;font-size:14px;color:#6B7A99;">Ce que vous perdez sans Pro :</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#FCA5A5;">✕ &nbsp;Conversions illimitées</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#FCA5A5;">✕ &nbsp;IA avancée (chat PDF)</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:14px;color:#FCA5A5;">✕ &nbsp;Priorité de traitement</td>
          </tr>
        </table>
      </div>
      <div style="text-align:center;">
        ${btn("Réactiver mon abonnement Pro →", `${BASE_URL}/#pricing`, "#3B82F6")}
      </div>
      ${divider()}
      ${p("Vos données sont conservées. Vous pouvez vous réabonner à tout moment et retrouver exactement là où vous en étiez.")}
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 5. DOCSWIFT HR — CONFIRMATION ABONNEMENT ────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
const HR_PLAN_LABELS = { starter: "Solo", pro: "Cabinet", business: "Volume" };

export async function sendHrSubscriptionConfirmEmail({ email, name, plan }) {
  const firstName = name?.split(" ")[0] ?? "là";
  const planLabel  = HR_PLAN_LABELS[plan] ?? "HR";
  await send({
    to: email,
    subject: "Votre essai DocSwift HR a démarré 👥",
    html: layout(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:rgba(249,115,22,.12);border:1px solid rgba(249,115,22,.3);border-radius:50px;padding:8px 20px;font-size:13px;font-weight:700;color:#F97316;">
          👥 Plan ${planLabel} — essai 14 jours
        </div>
      </div>
      ${h1(`Bienvenue, ${firstName} !`)}
      ${p("Votre essai gratuit de <strong style=\"color:#F0F4FF;\">DocSwift HR</strong> a démarré. Analysez et triez vos CVs par IA dès maintenant — scoring automatique, matching poste/candidat, export CSV.")}
      ${divider()}
      ${p("Aucun débit ne sera effectué avant la fin de votre période d'essai de 14 jours.")}
      <div style="text-align:center;margin-top:8px;">
        ${btn("Accéder à DocSwift HR →", `${BASE_URL}/hr/dashboard`, "#F97316")}
      </div>
      ${divider()}
      ${p("Gérez ou annulez votre abonnement à tout moment depuis votre <a href=\"" + BASE_URL + "/hr/dashboard\" style=\"color:#F97316;text-decoration:none;\">tableau de bord HR</a>.")}
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 6. DOCSWIFT HR — PAIEMENT ÉCHOUÉ ────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export async function sendHrPaymentFailedEmail({ email, name, retryUrl }) {
  const firstName = name?.split(" ")[0] ?? "là";
  const url       = retryUrl ?? `${BASE_URL}/hr/dashboard`;
  await send({
    to: email,
    subject: "⚠️ DocSwift HR — Échec du paiement",
    html: layout(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:50px;padding:8px 20px;font-size:13px;font-weight:700;color:#FCA5A5;">
          ⚠️ Paiement échoué
        </div>
      </div>
      ${h1(`Action requise, ${firstName}`)}
      ${p("Nous n'avons pas pu renouveler votre abonnement DocSwift HR. Votre accès reste actif pour le moment, mais votre compte sera suspendu si le paiement n'est pas régularisé.")}
      <div style="text-align:center;margin-top:16px;">
        ${btn("Mettre à jour mon moyen de paiement →", url, "#EF4444")}
      </div>
      ${divider()}
      ${p("Si vous avez des questions, répondez directement à cet email. Nous sommes là pour vous aider.")}
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 7. DOCSWIFT HR — ABONNEMENT ANNULÉ ──────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
export async function sendHrSubscriptionCancelledEmail({ email, name }) {
  const firstName = name?.split(" ")[0] ?? "là";
  await send({
    to: email,
    subject: "Votre abonnement DocSwift HR a pris fin",
    html: layout(`
      ${h1(`À bientôt, ${firstName}`)}
      ${p("Votre abonnement DocSwift HR a pris fin. Le screening de CVs par IA n'est plus disponible sur votre compte.")}
      <div style="text-align:center;margin-top:16px;">
        ${btn("Réactiver mon abonnement HR →", `${BASE_URL}/hr/dashboard`, "#F97316")}
      </div>
      ${divider()}
      ${p("Vos analyses précédentes restent consultables et supprimables depuis votre espace. Vous pouvez vous réabonner à tout moment.")}
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 8. DOCSWIFT HR — FIN D'ESSAI DANS 3 JOURS (trial_will_end) ──────────────
// ─────────────────────────────────────────────────────────────────────────────
export async function sendHrTrialEndingEmail({ email, name, plan, trialEnd, amount, eventId }) {
  const firstName = escHtml(name?.split(" ")[0] || "");
  const planLabel = HR_PLAN_LABELS[plan] ?? "HR";
  const dateStr   = trialEnd
    ? new Date(trialEnd * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "dans 3 jours";
  const priceStr  = amount != null ? `${(amount / 100).toFixed(2).replace(".", ",")} € HT/mois` : "le tarif de votre plan";
  await send({
    to: email,
    subject: "Votre essai DocSwift HR se termine bientôt",
    idempotencyKey: eventId ? `trial-ending/${eventId}` : undefined,
    html: layout(`
      ${h1(`Votre essai se termine le ${escHtml(dateStr)}${firstName ? `, ${firstName}` : ""}`)}
      ${p(`Sans action de votre part, votre plan <strong style="color:#F0F4FF;">${escHtml(planLabel)}</strong> démarrera à ${escHtml(priceStr)}. Il reste résiliable en un clic, sans engagement.`)}
      <div style="text-align:center;margin-top:16px;">
        ${btn("Gérer mon abonnement →", `${BASE_URL}/hr/dashboard`, "#F97316")}
      </div>
      ${divider()}
      ${p("Une question sur le plan qui vous convient ? Répondez simplement à cet email.")}
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 8b. ALERTE INTERNE — UN PROSPECT A LAISSÉ SON EMAIL À L'ASSISTANT ───────
// ─────────────────────────────────────────────────────────────────────────────
export async function sendAssistantLeadAlert({ leadEmail, transcript, page }) {
  const to = process.env.SALES_ALERT_EMAIL ?? process.env.ADMIN_EMAIL;
  if (!to) return false;
  const lines = transcript
    .map((m) => `<p style="margin:6px 0;font-size:13px;color:${m.role === "user" ? "#F0F4FF" : "#8892AA"};"><strong>${m.role === "user" ? "Visiteur" : "Swift"} :</strong> ${escHtml(m.content).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return send({
    to,
    subject: `🔥 Nouveau prospect via l'assistant : ${leadEmail}`,
    html: layout(`
      ${h1("Un prospect attend une réponse")}
      ${p(`Email : <strong style="color:#F0F4FF;">${escHtml(leadEmail)}</strong>${page ? `<br/>Page : ${escHtml(page)}` : ""}`)}
      ${p("Répondez sous 24 h : un prospect contacté dans l'heure convertit bien mieux.")}
      ${divider()}
      ${lines}
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ── 9. NEWSLETTER — CONFIRMATION D'INSCRIPTION (double opt-in) ──────────────
// ─────────────────────────────────────────────────────────────────────────────
export async function sendNewsletterConfirmEmail({ email, token }) {
  const url = `${BASE_URL}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
  return send({
    to: email,
    subject: "Confirmez votre inscription à la newsletter DocSwift",
    html: layout(`
      ${h1("Encore un clic")}
      ${p("Confirmez votre inscription pour recevoir nos conseils de recrutement assisté par IA et les nouveautés DocSwift HR (2 emails par mois maximum).")}
      <div style="text-align:center;margin-top:16px;">
        ${btn("Confirmer mon inscription →", url)}
      </div>
      ${divider()}
      ${p("Vous n'avez rien demandé ? Ignorez cet email : vous ne serez pas inscrit.")}
    `),
  });
}
