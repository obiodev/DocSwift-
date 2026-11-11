"use client";
import { useState } from "react";

/** Newsletter sign-up with explicit GDPR consent and double opt-in. */
export default function NewsletterForm({ source = "site", accent = "#F97316" }) {
  const [email, setEmail]     = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState]     = useState({ status: "idle", message: "" });

  const submit = async (e) => {
    e.preventDefault();
    if (!consent) { setState({ status: "error", message: "Merci de cocher la case de consentement." }); return; }
    setState({ status: "loading", message: "" });
    try {
      const r = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, source }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { setState({ status: "error", message: data.message ?? "Inscription impossible, réessayez." }); return; }
      setState({ status: "done", message: data.message });
      setEmail("");
    } catch {
      setState({ status: "error", message: "Erreur réseau, réessayez." });
    }
  };

  if (state.status === "done") {
    return <p role="status" style={{ color: "#6EE7B7", fontSize: 14, margin: 0 }}>✓ {state.message}</p>;
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 440, width: "100%" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <label htmlFor={`nl-${source}`} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Adresse email
        </label>
        <input
          id={`nl-${source}`} type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@entreprise.com" autoComplete="email"
          style={{ flex: 1, minWidth: 200, background: "#07090F", border: "1px solid #1E2733", borderRadius: 10, padding: "11px 14px", color: "#F0F4FF", fontSize: 14 }}
        />
        <button type="submit" disabled={state.status === "loading"}
          style={{ background: accent, color: "#fff", border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: state.status === "loading" ? 0.6 : 1 }}>
          {state.status === "loading" ? "…" : "S'inscrire"}
        </button>
      </div>
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start", color: "#6B7A99", fontSize: 12, lineHeight: 1.5, textAlign: "left", cursor: "pointer" }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
        <span>J&apos;accepte de recevoir la newsletter DocSwift (2 emails/mois max). Désinscription en un clic dans chaque email.</span>
      </label>
      {state.status === "error" && <p role="alert" style={{ color: "#FCA5A5", fontSize: 13, margin: 0 }}>{state.message}</p>}
    </form>
  );
}
