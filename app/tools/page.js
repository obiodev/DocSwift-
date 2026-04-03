"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSession, signIn }               from "next-auth/react";
import { useRouter, useSearchParams }       from "next/navigation";

// ─── Tool definitions ──────────────────────────────────────────────────────
const tools = [
  { id: "pdf-to-word",  icon: "📝", name: "PDF → Word",    desc: "Convertir un PDF en document Word éditable", accept: ".pdf",       type: "pdf-to-word",  multi: false },
  { id: "word-to-pdf",  icon: "🔄", name: "Word → PDF",    desc: "Convertir un document Word en PDF",          accept: ".docx,.doc", type: "word-to-pdf",  multi: false },
  { id: "compress-pdf", icon: "🗜️", name: "Compresser PDF", desc: "Réduire la taille du fichier jusqu'à 80%",  accept: ".pdf",       type: "compress-pdf", multi: false },
  { id: "merge-pdf",    icon: "🔗", name: "Fusionner PDFs", desc: "Combiner plusieurs PDFs en un seul fichier", accept: ".pdf",       type: "merge-pdf",    multi: true  },
  { id: "split-pdf",    icon: "✂️", name: "Diviser PDF",    desc: "Extraire une page spécifique de votre PDF", accept: ".pdf",       type: "split-pdf",    multi: false },
  { id: "image-to-pdf", icon: "🖼️", name: "Image → PDF",   desc: "Convertir des images JPG/PNG en PDF",        accept: "image/*",    type: "image-to-pdf", multi: true  },
];

const FREE_LIMIT = 5;
const MULTI_TOOLS = new Set(["merge-pdf", "image-to-pdf"]);
const AD_BONUS    = 3;
// Durée d'affichage de la pub (secondes)
const AD_DURATION = 30;

// ─── Rewarded Ad Modal ─────────────────────────────────────────────────────
function AdModal({ onComplete, onClose }) {
  const [seconds,      setSeconds]      = useState(AD_DURATION);
  const [done,         setDone]         = useState(false);
  const [rewardedHtml, setRewardedHtml] = useState(null); // null = loading
  const adZoneRef = useRef(null);

  // Fetch ad tag from backend
  useEffect(() => {
    fetch("/api/ads")
      .then(r => r.json())
      .then(d => setRewardedHtml(d.rewardedAdHtml || ""))
      .catch(() => setRewardedHtml(""));
  }, []);

  // Inject ad scripts manually (dangerouslySetInnerHTML doesn't execute <script>)
  useEffect(() => {
    if (!rewardedHtml || !adZoneRef.current) return;
    const container = adZoneRef.current;
    container.innerHTML = rewardedHtml;
    // Re-execute any <script> tags
    container.querySelectorAll("script").forEach(orig => {
      const s = document.createElement("script");
      if (orig.src) { s.src = orig.src; s.async = true; }
      else { s.textContent = orig.textContent; }
      orig.replaceWith(s);
    });
  }, [rewardedHtml]);

  useEffect(() => {
    if (seconds <= 0) { setDone(true); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#0D1117", border: "1px solid #1E2733", borderRadius: 20, padding: "36px 32px", maxWidth: 480, width: "90%", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📺</div>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#F0F4FF" }}>
          Regardez une publicité
        </h3>
        <p style={{ color: "#8892AA", fontSize: 14, marginBottom: 24 }}>
          Regardez cette publicité jusqu'à la fin pour débloquer <strong style={{ color: "#10B981" }}>+{AD_BONUS} conversions</strong> supplémentaires aujourd'hui.
        </p>

        {/* Ad zone */}
        <div style={{ background: "#131922", border: "1px dashed #1E2733", borderRadius: 12, minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, position: "relative", overflow: "hidden" }}>
          {rewardedHtml === null ? (
            <span style={{ color: "#4B5563", fontSize: 13 }}>Chargement...</span>
          ) : rewardedHtml === "" ? (
            <div style={{ textAlign: "center", color: "#4B5563" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🎬</div>
              <div style={{ fontSize: 13 }}>Zone publicitaire</div>
              <div style={{ fontSize: 11, marginTop: 4, color: "#3B3F4A" }}>Configurez votre ad tag dans le back-office</div>
            </div>
          ) : (
            <div ref={adZoneRef} style={{ width: "100%" }} />
          )}
          {/* Timer overlay */}
          <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,.7)", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 700 }}>
            {done ? "✓" : `${seconds}s`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {done ? (
            <button onClick={onComplete}
              style={{ flex: 1, background: "#10B981", color: "#fff", border: "none", padding: "13px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Récupérer mes +{AD_BONUS} conversions →
            </button>
          ) : (
            <button disabled
              style={{ flex: 1, background: "#1E3A5F", color: "#60A5FA", border: "none", padding: "13px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "not-allowed" }}>
              Patientez {seconds}s...
            </button>
          )}
          <button onClick={onClose}
            style={{ background: "none", border: "1px solid #1E2733", color: "#6B7A99", padding: "13px 18px", borderRadius: 10, fontSize: 14, cursor: "pointer" }}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function ToolsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#07090F", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7A99" }}>Chargement...</div>}>
      <ToolsInner />
    </Suspense>
  );
}

function ToolsInner() {
  const { data: session }      = useSession();
  const router                 = useRouter();
  const searchParams           = useSearchParams();

  const [activeTool, setActiveTool] = useState(null);
  const [files, setFiles]           = useState([]);
  const [splitPage, setSplitPage]   = useState("1");
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);
  const [dragOver, setDragOver]     = useState(false);

  // Usage tracking
  const [usage, setUsage] = useState({ used: 0, limit: FREE_LIMIT, isPro: false, remaining: FREE_LIMIT });
  const [showAdModal, setShowAdModal] = useState(false);
  // Bonus uses stored client-side (backed by localStorage)
  const [bonusUses, setBonusUses]    = useState(0);
  // Banner ad HTML fetched from backend
  const [bannerAdHtml, setBannerAdHtml] = useState("");
  const bannerRef = useRef(null);

  const isMulti = activeTool && MULTI_TOOLS.has(activeTool.type);

  // ── Inject banner ad scripts ──────────────────────────────────────────
  useEffect(() => {
    fetch("/api/ads").then(r => r.json()).then(d => setBannerAdHtml(d.bannerAdHtml || "")).catch(() => {});
  }, []);

  useEffect(() => {
    if (!bannerAdHtml || !bannerRef.current) return;
    const container = bannerRef.current;
    container.innerHTML = bannerAdHtml;
    container.querySelectorAll("script").forEach(orig => {
      const s = document.createElement("script");
      if (orig.src) { s.src = orig.src; s.async = true; }
      else { s.textContent = orig.textContent; }
      orig.replaceWith(s);
    });
  }, [bannerAdHtml]);

  // ── Load usage on mount ────────────────────────────────────────────────
  const refreshUsage = useCallback(async () => {
    try {
      const res  = await fetch("/api/usage");
      const data = await res.json();
      setUsage(data);
    } catch {
      // Fallback: read from localStorage
      const key  = "docswift_used_" + new Date().toISOString().slice(0, 10);
      const used = parseInt(localStorage.getItem(key) ?? "0");
      const bonus = parseInt(localStorage.getItem("docswift_bonus_" + new Date().toISOString().slice(0, 10)) ?? "0");
      setBonusUses(bonus);
      setUsage({ used, limit: FREE_LIMIT, isPro: false, remaining: Math.max(0, FREE_LIMIT + bonus - used) });
    }
  }, []);

  useEffect(() => {
    refreshUsage();
    // Load bonus from localStorage
    const key = "docswift_bonus_" + new Date().toISOString().slice(0, 10);
    setBonusUses(parseInt(localStorage.getItem(key) ?? "0"));
    // Show upgrade banner if returning from Stripe
    if (searchParams.get("upgraded") === "1") {
      refreshUsage();
    }
  }, [refreshUsage, searchParams]);

  // ── Effective remaining (includes bonus) ──────────────────────────────
  const effectiveRemaining = usage.isPro
    ? Infinity
    : Math.max(0, (usage.remaining ?? 0) + bonusUses);

  // ── File helpers ───────────────────────────────────────────────────────
  const addFiles = (incoming) => {
    const arr = Array.from(incoming);
    setFiles(prev => isMulti ? [...prev, ...arr] : arr.slice(0, 1));
  };
  const handleDrop       = (e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); };
  const handleFileChange = (e) => addFiles(e.target.files);

  // ── Ad reward ─────────────────────────────────────────────────────────
  const handleAdComplete = () => {
    const key  = "docswift_bonus_" + new Date().toISOString().slice(0, 10);
    const prev = parseInt(localStorage.getItem(key) ?? "0");
    const next = prev + AD_BONUS;
    localStorage.setItem(key, String(next));
    setBonusUses(next);
    setShowAdModal(false);
  };

  // ── Conversion ────────────────────────────────────────────────────────
  const handleConvert = async () => {
    if (!files.length) return;

    // Check limit
    if (!usage.isPro && effectiveRemaining <= 0) {
      setShowAdModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("type", activeTool.type);
      if (MULTI_TOOLS.has(activeTool.type)) {
        files.forEach(f => formData.append("files", f));
      } else {
        formData.append("file", files[0]);
        if (activeTool.type === "split-pdf") formData.append("page", splitPage || "1");
      }

      const response = await fetch("/api/convert", { method: "POST", body: formData });
      const data     = await response.json();

      if (response.status === 429 || data.error === "LIMIT_REACHED") {
        setShowAdModal(true);
        setLoading(false);
        return;
      }

      if (data.error) { setError(data.error); setLoading(false); return; }

      // Track usage in localStorage as fallback
      if (!usage.isPro) {
        const key  = "docswift_used_" + new Date().toISOString().slice(0, 10);
        const used = parseInt(localStorage.getItem(key) ?? "0") + 1;
        localStorage.setItem(key, String(used));
        // Consume a bonus use if applicable
        if (bonusUses > 0) {
          const bKey = "docswift_bonus_" + new Date().toISOString().slice(0, 10);
          localStorage.setItem(bKey, String(bonusUses - 1));
          setBonusUses(b => Math.max(0, b - 1));
        }
      }

      setResult(data);
      await refreshUsage();
    } catch {
      setError("Erreur lors de la conversion. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  // ── Download ──────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!result) return;
    const bytes = Uint8Array.from(atob(result.file), c => c.charCodeAt(0));
    const blob  = new Blob([bytes], { type: result.mimeType || "application/octet-stream" });
    const url   = URL.createObjectURL(blob);
    const a     = Object.assign(document.createElement("a"), { href: url, download: result.filename, style: "display:none" });
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  // ── Reset ─────────────────────────────────────────────────────────────
  const reset = () => { setFiles([]); setResult(null); setError(null); };

  // ── Usage bar color ───────────────────────────────────────────────────
  const usagePct = usage.isPro ? 0 : Math.min(100, ((usage.used) / (FREE_LIMIT + bonusUses)) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#07090F", color: "#F0F4FF", fontFamily: "sans-serif" }}>

      {/* ── NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(7,9,15,.97)", borderBottom: "1px solid #1E2733" }}>
        <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: -1, cursor: "pointer" }} onClick={() => router.push("/")}>
          Doc<span style={{ color: "#3B82F6" }}>Swift</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

          {/* Usage indicator */}
          {!usage.isPro && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 120, height: 6, background: "#1E2733", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${usagePct}%`, background: usagePct >= 100 ? "#EF4444" : "#3B82F6", borderRadius: 99, transition: "width .4s" }} />
              </div>
              <span style={{ fontSize: 12, color: "#6B7A99", whiteSpace: "nowrap" }}>
                {usage.used}/{FREE_LIMIT + bonusUses} aujourd'hui
              </span>
            </div>
          )}

          {usage.isPro && (
            <span style={{ background: "rgba(16,185,129,.15)", color: "#10B981", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(16,185,129,.3)" }}>
              ✓ PRO — Illimité
            </span>
          )}

          {session ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src={session.user?.image ?? ""} alt="" width={28} height={28} style={{ borderRadius: "50%", display: session.user?.image ? "block" : "none" }} />
              <span style={{ fontSize: 13, color: "#8892AA" }}>{session.user?.name ?? session.user?.email}</span>
              {!usage.isPro && (
                <button onClick={async () => {
                  const res  = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ affiliateCode: localStorage.getItem("docswift_ref") }) });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }} style={{ background: "#3B82F6", color: "#fff", border: "none", padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Passer Pro
                </button>
              )}
            </div>
          ) : (
            <button onClick={() => signIn()}
              style={{ background: "#3B82F6", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Connexion
            </button>
          )}
        </div>
      </nav>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "90px 24px 60px" }}>

        {/* Free limit banner */}
        {!usage.isPro && effectiveRemaining === 0 && (
          <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 14, padding: "16px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span style={{ color: "#FCA5A5", fontSize: 14 }}>
              🚫 Limite quotidienne atteinte ({FREE_LIMIT + bonusUses}/{FREE_LIMIT + bonusUses})
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAdModal(true)}
                style={{ background: "rgba(239,68,68,.2)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,.4)", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                📺 +{AD_BONUS} via pub
              </button>
              <button onClick={async () => {
                if (!session) { signIn(); return; }
                const res  = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ affiliateCode: localStorage.getItem("docswift_ref") }) });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              }} style={{ background: "#3B82F6", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                ✨ Passer au Pro — 9,99€/mois
              </button>
            </div>
          </div>
        )}

        {/* Back button */}
        {activeTool && (
          <button onClick={() => { setActiveTool(null); reset(); }}
            style={{ background: "none", border: "1px solid #1E2733", color: "#8892AA", padding: "8px 16px", borderRadius: 8, cursor: "pointer", marginBottom: 28, fontSize: 14 }}>
            ← Retour aux outils
          </button>
        )}

        {/* ── TOOL GRID ── */}
        {!activeTool && (
          <>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, marginBottom: 6 }}>Outils PDF</h1>
              <p style={{ color: "#6B7A99", fontSize: 14 }}>
                {usage.isPro
                  ? "Conversions illimitées — compte Pro actif."
                  : `${effectiveRemaining} conversion${effectiveRemaining > 1 ? "s" : ""} restante${effectiveRemaining > 1 ? "s" : ""} aujourd'hui.`}
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 1, border: "1px solid #1E2733", borderRadius: 16, overflow: "hidden", background: "#1E2733" }}>
              {tools.map(tool => (
                <div key={tool.id}
                  onClick={() => { setActiveTool(tool); reset(); }}
                  style={{ background: "#0D1117", padding: 28, cursor: "pointer", position: "relative", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#131922"}
                  onMouseLeave={e => e.currentTarget.style.background = "#0D1117"}>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{tool.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{tool.name}</div>
                  <div style={{ color: "#6B7A99", fontSize: 13, lineHeight: 1.5 }}>{tool.desc}</div>
                  <span style={{ position: "absolute", top: 14, right: 14, background: "rgba(16,185,129,.1)", color: "#10B981", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(16,185,129,.2)" }}>GRATUIT</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── ACTIVE TOOL ── */}
        {activeTool && (
          <div style={{ maxWidth: 660, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>{activeTool.icon}</div>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, marginBottom: 6 }}>{activeTool.name}</h2>
              <p style={{ color: "#8892AA", fontSize: 14 }}>{activeTool.desc}</p>
            </div>

            {!result && (
              <>
                {/* Drop zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => document.getElementById("fileInput").click()}
                  style={{ border: `2px dashed ${dragOver ? "#3B82F6" : "#1E2733"}`, borderRadius: 16, padding: "56px 40px", textAlign: "center", background: dragOver ? "rgba(59,130,246,.05)" : "#0D1117", transition: "all .2s", cursor: "pointer", marginBottom: 20 }}>
                  <input id="fileInput" type="file" style={{ display: "none" }} accept={activeTool.accept} multiple={MULTI_TOOLS.has(activeTool.type)} onChange={handleFileChange} />
                  {files.length ? (
                    <div>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
                      {files.map((f, i) => (
                        <div key={i} style={{ marginBottom: 3 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</span>
                          <span style={{ color: "#6B7A99", fontSize: 12, marginLeft: 8 }}>{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      ))}
                      {MULTI_TOOLS.has(activeTool.type) && <div style={{ color: "#3B82F6", fontSize: 12, marginTop: 8 }}>Cliquez pour ajouter d'autres fichiers</div>}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 36, marginBottom: 14 }}>☁️</div>
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>
                        {MULTI_TOOLS.has(activeTool.type) ? "Déposez vos fichiers ici" : "Déposez votre fichier ici"}
                      </div>
                      <div style={{ color: "#6B7A99", fontSize: 13 }}>ou cliquez pour parcourir</div>
                      <div style={{ color: "#4B5563", fontSize: 12, marginTop: 10 }}>
                        Max {usage.isPro ? "50" : "5"} MB par fichier
                      </div>
                    </div>
                  )}
                </div>

                {/* Page number for split-pdf */}
                {activeTool.type === "split-pdf" && (
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", color: "#8892AA", fontSize: 13, marginBottom: 6 }}>Numéro de page à extraire</label>
                    <input type="number" min="1" value={splitPage} onChange={e => setSplitPage(e.target.value)}
                      style={{ width: "100%", background: "#0D1117", border: "1px solid #1E2733", color: "#F0F4FF", padding: "11px 14px", borderRadius: 10, fontSize: 15, boxSizing: "border-box" }} />
                  </div>
                )}
              </>
            )}

            {error && (
              <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#FCA5A5", padding: "14px 18px", borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
                ❌ {error}
              </div>
            )}

            {files.length > 0 && !result && (
              <button onClick={handleConvert} disabled={loading}
                style={{ width: "100%", background: loading ? "#1E3A5F" : "#3B82F6", color: "#fff", border: "none", padding: "15px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", transition: "background .2s" }}>
                {loading ? "⏳ Conversion en cours..." : "Convertir maintenant →"}
              </button>
            )}

            {result && (
              <div style={{ textAlign: "center", padding: "36px 24px", background: "#0D1117", borderRadius: 16, border: "1px solid #1E2733" }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Conversion réussie !</h3>
                <p style={{ color: "#8892AA", marginBottom: 22, fontSize: 14 }}>Votre fichier est prêt au téléchargement.</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={handleDownload}
                    style={{ background: "#10B981", color: "#fff", border: "none", padding: "13px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                    ⬇️ Télécharger {result.filename}
                  </button>
                  <button onClick={reset}
                    style={{ background: "#131922", color: "#8892AA", border: "1px solid #1E2733", padding: "13px 22px", borderRadius: 10, fontSize: 14, cursor: "pointer" }}>
                    Convertir un autre
                  </button>
                </div>
              </div>
            )}

            {/* Banner ad for free users */}
            {!usage.isPro && !result && (
              <div style={{ marginTop: 24 }}>
                {bannerAdHtml ? (
                  <div ref={bannerRef} style={{ borderRadius: 12, overflow: "hidden" }} />
                ) : (
                  <div style={{ background: "#0A0E17", border: "1px solid #1E2733", borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#4B5563", fontSize: 12 }}>Publicité — Passez au Pro pour les supprimer</span>
                    <span style={{ color: "#3B82F6", fontSize: 12, cursor: "pointer" }} onClick={async () => {
                      if (!session) { signIn(); return; }
                      const res  = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ affiliateCode: localStorage.getItem("docswift_ref") }) });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                    }}>Supprimer les pubs →</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Rewarded Ad Modal ── */}
      {showAdModal && (
        <AdModal
          onComplete={handleAdComplete}
          onClose={() => setShowAdModal(false)}
        />
      )}
    </div>
  );
}
