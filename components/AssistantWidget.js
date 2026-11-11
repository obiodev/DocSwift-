"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const HR_INTRO = {
  greeting: "Bonjour, je suis Swift 👋 Je réponds à vos questions sur DocSwift HR : fonctionnement, tarifs, essai gratuit, données, abonnement. Combien de CV recevez-vous par mois environ ?",
  suggestions: ["Combien ça coûte ?", "Comment marche l'essai gratuit ?", "Mes données sont-elles protégées ?"],
};
const GENERAL_INTRO = {
  greeting: "Bonjour, je suis Swift 👋 Je peux vous aider sur DocSwift : le tri de CV par IA pour recruteurs (DocSwift HR), les outils PDF et le créateur de CV. Que cherchez-vous ?",
  suggestions: ["Je recrute : comment trier mes CV ?", "Combien coûte DocSwift HR ?", "Comment convertir un PDF ?"],
};

const URL_RE = /(https:\/\/getdocswift\.com\/[^\s)]*)/g;

// Plain text only; our own links become clickable, nothing else is rendered as HTML
function RichText({ text }) {
  // split() with a capturing group puts the matched URLs at odd indexes
  return text.split(URL_RE).map((part, i) =>
    i % 2 === 1
      ?<a key={i} href={part.replace("https://getdocswift.com", "")} style={{ color: "#FDBA74", wordBreak: "break-all" }}>{part.replace("https://", "")}</a>
      : <span key={i}>{part}</span>
  );
}

export default function AssistantWidget() {
  const pathname = usePathname() ?? "";
  const intro    = /\/hr(\/|$)/.test(pathname) ? HR_INTRO : GENERAL_INTRO;
  const SUGGESTIONS = intro.suggestions;

  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: intro.greeting }]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const listRef  = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1), page: window.location.pathname }),
      });
      const data = await r.json().catch(() => ({}));
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "Désolé, je n'ai pas pu répondre. Réessayez dans un instant." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Erreur réseau. Réessayez dans un instant." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div role="dialog" aria-label="Assistant DocSwift"
          style={{ position: "fixed", right: 16, bottom: 88, zIndex: 1000, width: "min(380px, calc(100vw - 32px))", height: "min(560px, calc(100vh - 120px))",
                   display: "flex", flexDirection: "column", background: "#0D1117", border: "1px solid #1E2733", borderRadius: 16,
                   boxShadow: "0 20px 60px rgba(0,0,0,.5)", overflow: "hidden", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #1E2733", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0A0E17" }}>
            <div>
              <div style={{ fontWeight: 800, color: "#F0F4FF", fontSize: 15 }}>Swift · Assistant {intro === HR_INTRO ? "DocSwift HR" : "DocSwift"}</div>
              <div style={{ color: "#6B7A99", fontSize: 12 }}>Réponse immédiate · IA, un humain prend le relais si besoin</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fermer l'assistant"
              style={{ background: "none", border: "none", color: "#8892AA", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>

          <div ref={listRef} aria-live="polite" style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%",
                background: m.role === "user" ? "#F97316" : "#161B26", color: m.role === "user" ? "#fff" : "#D1D9E6",
                padding: "9px 12px", borderRadius: 12, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap",
              }}>
                <RichText text={m.content} />
              </div>
            ))}
            {loading && <div style={{ alignSelf: "flex-start", color: "#6B7A99", fontSize: 13 }}>Swift écrit…</div>}
            {messages.length === 1 && !loading && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    style={{ background: "transparent", border: "1px solid #2A3444", color: "#C0CBE0", borderRadius: 20, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(); }} style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #1E2733" }}>
            <label htmlFor="assistant-input" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Votre question</label>
            <input id="assistant-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={1200}
              placeholder="Posez votre question…" autoComplete="off"
              style={{ flex: 1, background: "#07090F", border: "1px solid #1E2733", borderRadius: 10, padding: "10px 12px", color: "#F0F4FF", fontSize: 14 }} />
            <button type="submit" disabled={loading || !input.trim()}
              style={{ background: "#F97316", color: "#fff", border: "none", borderRadius: 10, padding: "0 16px", fontWeight: 700, cursor: "pointer", opacity: loading || !input.trim() ? 0.5 : 1 }}>
              Envoyer
            </button>
          </form>
          <p style={{ margin: 0, padding: "0 12px 10px", color: "#4B5563", fontSize: 11 }}>
            Si vous laissez votre email, nous l&apos;utilisons uniquement pour vous répondre.
          </p>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)} aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant DocSwift"} aria-expanded={open}
        style={{ position: "fixed", right: 16, bottom: 16, zIndex: 1000, height: 56, borderRadius: 28, padding: open ? "0 20px" : "0 20px 0 16px",
                 background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", cursor: "pointer",
                 boxShadow: "0 10px 30px rgba(249,115,22,.4)", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14 }}>
        <span aria-hidden="true" style={{ fontSize: 20 }}>{open ? "×" : "💬"}</span>
        {!open && "Une question ?"}
      </button>
    </>
  );
}
