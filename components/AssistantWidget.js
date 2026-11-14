"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

const COPY = {
  fr: {
    hr: {
      greeting: "Bonjour, je suis Swift 👋 Je réponds à vos questions sur DocSwift HR : fonctionnement, tarifs, essai gratuit, données, abonnement. Combien de CV recevez-vous par mois environ ?",
      suggestions: ["Combien ça coûte ?", "Comment marche l'essai gratuit ?", "Mes données sont-elles protégées ?"],
    },
    general: {
      greeting: "Bonjour, je suis Swift 👋 Je peux vous aider sur DocSwift : le tri de CV par IA pour recruteurs (DocSwift HR), les outils PDF et le créateur de CV. Que cherchez-vous ?",
      suggestions: ["Je recrute : comment trier mes CV ?", "Combien coûte DocSwift HR ?", "Comment convertir un PDF ?"],
    },
    assistant: "Assistant",
    subtitle: "Réponse immédiate · IA, un humain prend le relais si besoin",
    close: "Fermer l'assistant",
    open: "Ouvrir l'assistant DocSwift",
    typing: "Swift écrit…",
    label: "Votre question",
    placeholder: "Posez votre question…",
    send: "Envoyer",
    privacy: "Si vous laissez votre email, nous l'utilisons uniquement pour vous répondre.",
    cta: "Une question ?",
    noReply: "Désolé, je n'ai pas pu répondre. Réessayez dans un instant.",
    network: "Erreur réseau. Réessayez dans un instant.",
  },
  en: {
    hr: {
      greeting: "Hi, I'm Swift 👋 I answer your questions about DocSwift HR: how it works, pricing, free trial, data and subscription. Roughly how many CVs do you receive per month?",
      suggestions: ["How much does it cost?", "How does the free trial work?", "Is my data protected?"],
    },
    general: {
      greeting: "Hi, I'm Swift 👋 I can help you with DocSwift: AI CV screening for recruiters (DocSwift HR), PDF tools and the CV builder. What are you looking for?",
      suggestions: ["I'm hiring: how do I screen my CVs?", "How much is DocSwift HR?", "How do I convert a PDF?"],
    },
    assistant: "Assistant",
    subtitle: "Instant answers · AI, a human takes over if needed",
    close: "Close the assistant",
    open: "Open the DocSwift assistant",
    typing: "Swift is typing…",
    label: "Your question",
    placeholder: "Ask your question…",
    send: "Send",
    privacy: "If you leave your email, we only use it to reply to you.",
    cta: "Any questions?",
    noReply: "Sorry, I couldn't answer. Please try again in a moment.",
    network: "Network error. Please try again in a moment.",
  },
  ar: {
    hr: {
      greeting: "مرحبًا، أنا Swift 👋 أجيب عن أسئلتك حول DocSwift HR: طريقة العمل، الأسعار، التجربة المجانية، البيانات والاشتراك. كم سيرة ذاتية تتلقى تقريبًا في الشهر؟",
      suggestions: ["كم التكلفة؟", "كيف تعمل التجربة المجانية؟", "هل بياناتي محمية؟"],
    },
    general: {
      greeting: "مرحبًا، أنا Swift 👋 يمكنني مساعدتك في DocSwift: فرز السير الذاتية بالذكاء الاصطناعي للمجنِّدين (DocSwift HR)، وأدوات PDF، ومنشئ السيرة الذاتية. عمّ تبحث؟",
      suggestions: ["أقوم بالتوظيف: كيف أفرز السير الذاتية؟", "كم سعر DocSwift HR؟", "كيف أحوّل ملف PDF؟"],
    },
    assistant: "مساعد",
    subtitle: "رد فوري · ذكاء اصطناعي، ويتولى إنسان المتابعة عند الحاجة",
    close: "إغلاق المساعد",
    open: "فتح مساعد DocSwift",
    typing: "Swift يكتب…",
    label: "سؤالك",
    placeholder: "اطرح سؤالك…",
    send: "إرسال",
    privacy: "إذا تركت بريدك الإلكتروني، فلن نستخدمه إلا للرد عليك.",
    cta: "لديك سؤال؟",
    noReply: "عذرًا، لم أتمكن من الرد. حاول مجددًا بعد لحظة.",
    network: "خطأ في الشبكة. حاول مجددًا بعد لحظة.",
  },
};

const URL_RE = /(https:\/\/getdocswift\.com\/[^\s)]*)/g;

// Plain text only; our own links become clickable, nothing else is rendered as HTML
function RichText({ text }) {
  // split() with a capturing group puts the matched URLs at odd indexes
  return text.split(URL_RE).map((part, i) =>
    i % 2 === 1
      ? <a key={i} href={part.replace("https://getdocswift.com", "")} style={{ color: "#FDBA74", wordBreak: "break-all" }}>{part.replace("https://", "")}</a>
      : <span key={i}>{part}</span>
  );
}

export default function AssistantWidget() {
  const locale   = useLocale();
  const t        = COPY[locale] ?? COPY.fr;
  const pathname = usePathname() ?? "";
  const isHr     = /\/hr(\/|$)/.test(pathname);
  const intro    = isHr ? t.hr : t.general;
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
        body: JSON.stringify({ messages: next.slice(1), page: window.location.pathname, locale }),
      });
      const data = await r.json().catch(() => ({}));
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? t.noReply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t.network }]);
    } finally {
      setLoading(false);
    }
  };

  // In RTL the panel and the button stay on the reading-start side
  const side = locale === "ar" ? { left: 16 } : { right: 16 };

  // Client-facing shared reports carry no sales assistant
  if (/\/hr\/rapport\//.test(pathname)) return null;

  return (
    <>
      {open && (
        <div role="dialog" aria-label={`${t.assistant} DocSwift`}
          style={{ position: "fixed", ...side, bottom: 88, zIndex: 1000, width: "min(380px, calc(100vw - 32px))", height: "min(560px, calc(100vh - 120px))",
                   display: "flex", flexDirection: "column", background: "#0D1117", border: "1px solid #1E2733", borderRadius: 16,
                   boxShadow: "0 20px 60px rgba(0,0,0,.5)", overflow: "hidden", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #1E2733", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0A0E17" }}>
            <div>
              <div style={{ fontWeight: 800, color: "#F0F4FF", fontSize: 15 }}>Swift · {t.assistant} {isHr ? "DocSwift HR" : "DocSwift"}</div>
              <div style={{ color: "#6B7A99", fontSize: 12 }}>{t.subtitle}</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label={t.close}
              style={{ background: "none", border: "none", color: "#8892AA", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>

          <div ref={listRef} aria-live="polite" style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} dir="auto" style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%",
                background: m.role === "user" ? "#F97316" : "#161B26", color: m.role === "user" ? "#fff" : "#D1D9E6",
                padding: "9px 12px", borderRadius: 12, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap",
              }}>
                <RichText text={m.content} />
              </div>
            ))}
            {loading && <div style={{ alignSelf: "flex-start", color: "#6B7A99", fontSize: 13 }}>{t.typing}</div>}
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
            <label htmlFor="assistant-input" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{t.label}</label>
            <input id="assistant-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={1200}
              placeholder={t.placeholder} autoComplete="off" dir="auto"
              style={{ flex: 1, background: "#07090F", border: "1px solid #1E2733", borderRadius: 10, padding: "10px 12px", color: "#F0F4FF", fontSize: 14 }} />
            <button type="submit" disabled={loading || !input.trim()}
              style={{ background: "#F97316", color: "#fff", border: "none", borderRadius: 10, padding: "0 16px", fontWeight: 700, cursor: "pointer", opacity: loading || !input.trim() ? 0.5 : 1 }}>
              {t.send}
            </button>
          </form>
          <p style={{ margin: 0, padding: "0 12px 10px", color: "#4B5563", fontSize: 11 }}>{t.privacy}</p>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)} aria-label={open ? t.close : t.open} aria-expanded={open}
        style={{ position: "fixed", ...side, bottom: 16, zIndex: 1000, height: 56, borderRadius: 28, padding: open ? "0 20px" : "0 20px 0 16px",
                 background: "linear-gradient(135deg,#F97316,#EA580C)", color: "#fff", border: "none", cursor: "pointer",
                 boxShadow: "0 10px 30px rgba(249,115,22,.4)", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14 }}>
        <span aria-hidden="true" style={{ fontSize: 20 }}>{open ? "×" : "💬"}</span>
        {!open && t.cta}
      </button>
    </>
  );
}
