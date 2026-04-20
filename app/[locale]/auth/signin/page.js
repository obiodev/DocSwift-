"use client";
import { useState } from "react";
import { signIn }   from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

const CSS = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .auth-card { animation: fadeUp .4s ease both; }
  .input-field:focus { border-color:#3B82F6!important; outline:none; box-shadow:0 0 0 3px rgba(59,130,246,.15); }
  .btn-google:hover { background:#f5f5f5!important; }
  .btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(59,130,246,.35); }
  .tab-btn.active { color:#F0F4FF!important; border-bottom:2px solid #3B82F6; }
  .tab-btn { transition:all .15s; }
`;

export default function SignInPage() {
  const router       = useRouter();
  const locale       = useLocale();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") || (locale === "fr" ? "/dashboard/hr" : `/${locale}/dashboard/hr`);

  const [tab, setTab]           = useState("signin");   // signin | signup
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const prefix = locale === "fr" ? "" : `/${locale}`;

  // ── Sign In ──────────────────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await signIn("credentials", { email: email.trim().toLowerCase(), password, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Email ou mot de passe incorrect."); return; }
    router.push(callbackUrl);
  };

  // ── Sign Up ──────────────────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email.trim().toLowerCase(), password }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error ?? "Erreur lors de l'inscription."); setLoading(false); return; }
      // Auto sign-in after registration
      const res = await signIn("credentials", { email: email.trim().toLowerCase(), password, redirect: false });
      setLoading(false);
      if (res?.error) { setSuccess("Compte créé ! Connectez-vous maintenant."); setTab("signin"); return; }
      router.push(callbackUrl);
    } catch { setError("Erreur réseau."); setLoading(false); }
  };

  // ── Google ───────────────────────────────────────────────────────────────
  const handleGoogle = () => signIn("google", { callbackUrl });

  return (
    <div style={{ minHeight:"100vh", background:"#07090F", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{CSS}</style>

      <div className="auth-card" style={{ width:"100%", maxWidth:420 }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontWeight:900, fontSize:28, letterSpacing:-1, cursor:"pointer" }} onClick={() => router.push(`${prefix}/`)}>
            Doc<span style={{ color:"#3B82F6" }}>Swift</span>
          </div>
          <p style={{ color:"#6B7A99", fontSize:14, marginTop:6 }}>L'assistant PDF intelligent pour les professionnels</p>
        </div>

        {/* Card */}
        <div style={{ background:"#0D1117", border:"1px solid #1E2733", borderRadius:20, padding:32 }}>

          {/* Tabs */}
          <div style={{ display:"flex", borderBottom:"1px solid #1E2733", marginBottom:28, gap:4 }}>
            {[["signin","Connexion"],["signup","Créer un compte"]].map(([id,label]) => (
              <button key={id} className={`tab-btn${tab===id?" active":""}`}
                onClick={() => { setTab(id); setError(""); setSuccess(""); }}
                style={{ flex:1, background:"none", border:"none", borderBottom:"2px solid transparent", color:"#4B5563", fontSize:14, fontWeight:700, padding:"10px 0 12px", cursor:"pointer" }}>
                {label}
              </button>
            ))}
          </div>

          {/* Google button */}
          <button className="btn-google" onClick={handleGoogle}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10, background:"#fff", color:"#1F2937", border:"1px solid #E5E7EB", borderRadius:10, padding:"11px 16px", fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:20 }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <div style={{ flex:1, height:1, background:"#1E2733" }} />
            <span style={{ color:"#4B5563", fontSize:12 }}>ou</span>
            <div style={{ flex:1, height:1, background:"#1E2733" }} />
          </div>

          {/* Error / Success */}
          {error   && <div style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", color:"#FCA5A5", padding:"10px 14px", borderRadius:8, fontSize:13, marginBottom:16 }}>{error}</div>}
          {success && <div style={{ background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.2)", color:"#6EE7B7", padding:"10px 14px", borderRadius:8, fontSize:13, marginBottom:16 }}>{success}</div>}

          {/* ── SIGN IN FORM ── */}
          {tab === "signin" && (
            <form onSubmit={handleSignIn} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#8892AA", marginBottom:6 }}>Email professionnel</label>
                <input className="input-field" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@entreprise.com"
                  style={{ width:"100%", background:"#07090F", border:"1px solid #1E2733", borderRadius:9, padding:"11px 14px", color:"#F0F4FF", fontSize:14, boxSizing:"border-box", transition:"border-color .15s" }} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#8892AA", marginBottom:6 }}>Mot de passe</label>
                <input className="input-field" type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                  style={{ width:"100%", background:"#07090F", border:"1px solid #1E2733", borderRadius:9, padding:"11px 14px", color:"#F0F4FF", fontSize:14, boxSizing:"border-box", transition:"border-color .15s" }} />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}
                style={{ background:"linear-gradient(135deg,#3B82F6,#2563EB)", color:"#fff", border:"none", borderRadius:10, padding:"13px", fontSize:14, fontWeight:700, cursor:"pointer", transition:"all .2s", opacity:loading?0.6:1, marginTop:4 }}>
                {loading ? "Connexion…" : "Se connecter →"}
              </button>
            </form>
          )}

          {/* ── SIGN UP FORM ── */}
          {tab === "signup" && (
            <form onSubmit={handleSignUp} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#8892AA", marginBottom:6 }}>Nom complet</label>
                <input className="input-field" type="text" required value={name} onChange={e=>setName(e.target.value)} placeholder="Jean Dupont"
                  style={{ width:"100%", background:"#07090F", border:"1px solid #1E2733", borderRadius:9, padding:"11px 14px", color:"#F0F4FF", fontSize:14, boxSizing:"border-box", transition:"border-color .15s" }} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#8892AA", marginBottom:6 }}>Email professionnel</label>
                <input className="input-field" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@entreprise.com"
                  style={{ width:"100%", background:"#07090F", border:"1px solid #1E2733", borderRadius:9, padding:"11px 14px", color:"#F0F4FF", fontSize:14, boxSizing:"border-box", transition:"border-color .15s" }} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#8892AA", marginBottom:6 }}>Mot de passe <span style={{ color:"#4B5563", fontWeight:400 }}>(8 caractères min)</span></label>
                <input className="input-field" type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                  style={{ width:"100%", background:"#07090F", border:"1px solid #1E2733", borderRadius:9, padding:"11px 14px", color:"#F0F4FF", fontSize:14, boxSizing:"border-box", transition:"border-color .15s" }} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#8892AA", marginBottom:6 }}>Confirmer le mot de passe</label>
                <input className="input-field" type="password" required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="••••••••"
                  style={{ width:"100%", background:"#07090F", border:"1px solid #1E2733", borderRadius:9, padding:"11px 14px", color:"#F0F4FF", fontSize:14, boxSizing:"border-box", transition:"border-color .15s" }} />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}
                style={{ background:"linear-gradient(135deg,#F97316,#EA580C)", color:"#fff", border:"none", borderRadius:10, padding:"13px", fontSize:14, fontWeight:700, cursor:"pointer", transition:"all .2s", opacity:loading?0.6:1, marginTop:4 }}>
                {loading ? "Création…" : "Créer mon compte →"}
              </button>
              <p style={{ color:"#4B5563", fontSize:11, textAlign:"center", margin:0 }}>
                En créant un compte, vous acceptez nos <a href={`${prefix}/terms`} style={{ color:"#6B7A99" }}>CGU</a>.
              </p>
            </form>
          )}
        </div>

        <p style={{ textAlign:"center", color:"#4B5563", fontSize:12, marginTop:20 }}>
          © 2026 Mokoto LLC — DocSwift
        </p>
      </div>
    </div>
  );
}
