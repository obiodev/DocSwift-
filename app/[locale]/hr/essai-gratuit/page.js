"use client";
import { useState, useRef } from "react";

const MAX_CVS = 5;

const STATUS_COLOR = { recommended:"#10B981", consider:"#F59E0B", rejected:"#EF4444", error:"#EF4444" };
const STATUS_LABEL = { recommended:"Recommandé", consider:"À considérer", rejected:"Non retenu", error:"Erreur" };

export default function HrTrialPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc]   = useState("");
  const [files, setFiles]       = useState([]);
  const [screening, setScreening] = useState(false);
  const [results, setResults]   = useState(null);   // { jobTitle, results: [...] }
  const [error, setError]       = useState("");

  const [email, setEmail]         = useState("");
  const [unlocked, setUnlocked]   = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadError, setLeadError] = useState("");

  const fileInputRef = useRef(null);

  const addFiles = (list) => {
    const pdfFiles = Array.from(list).filter(f => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...pdfFiles.filter(f => !names.has(f.name))].slice(0, MAX_CVS);
    });
  };

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name));

  const runTrial = async () => {
    setError("");
    if (!jobTitle.trim() || !jobDesc.trim()) { setError("Remplissez le titre et la description du poste."); return; }
    if (!files.length) { setError("Ajoutez au moins un CV (PDF)."); return; }

    setScreening(true);
    try {
      const fd = new FormData();
      fd.append("jobTitle", jobTitle);
      fd.append("jobDescription", jobDesc);
      files.forEach(f => fd.append("files", f));

      const r = await fetch("/api/hr/trial/screen", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) { setError(data.message ?? "Erreur lors de l'analyse."); return; }
      setResults(data);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setScreening(false);
    }
  };

  const submitLead = async () => {
    setLeadError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setLeadError("Adresse email invalide."); return; }
    setSubmittingLead(true);
    try {
      const r = await fetch("/api/hr/trial/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, jobTitle: results?.jobTitle, cvCount: results?.results?.length ?? 0 }),
      });
      if (!r.ok) { setLeadError("Erreur, réessayez."); return; }
      setUnlocked(true);
    } catch {
      setLeadError("Erreur réseau.");
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh",background:"#07090F",color:"#F0F4FF",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",padding:"48px 20px" }}>
      <div style={{ maxWidth:720,margin:"0 auto" }}>

        <div style={{ textAlign:"center",marginBottom:36 }}>
          <div style={{ display:"inline-block",background:"rgba(249,115,22,.1)",border:"1px solid rgba(249,115,22,.3)",borderRadius:50,padding:"6px 16px",fontSize:12,fontWeight:700,color:"#F97316",marginBottom:14 }}>
            👥 DocSwift HR — Essai gratuit
          </div>
          <h1 style={{ fontSize:28,fontWeight:900,letterSpacing:-1,margin:"0 0 10px" }}>Testez le screening de CV par IA</h1>
          <p style={{ color:"#6B7A99",fontSize:15,margin:0 }}>Jusqu'à {MAX_CVS} CVs, sans compte. Scoring et matching en 2 minutes.</p>
        </div>

        {!results && (
          <div style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:20,padding:28 }}>
            <label style={{ display:"block",marginBottom:6,fontSize:13,fontWeight:600,color:"#8892AA" }}>Titre du poste *</label>
            <input
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="ex. Développeur React Senior"
              style={{ width:"100%",background:"#07090F",border:"1px solid #1E2733",borderRadius:10,padding:"12px 14px",color:"#F0F4FF",fontSize:14,marginBottom:18,boxSizing:"border-box",outline:"none" }}
            />

            <label style={{ display:"block",marginBottom:6,fontSize:13,fontWeight:600,color:"#8892AA" }}>Fiche de poste *</label>
            <textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Décrivez le poste, les responsabilités, les compétences requises…"
              rows={6}
              style={{ width:"100%",background:"#07090F",border:"1px solid #1E2733",borderRadius:10,padding:"12px 14px",color:"#F0F4FF",fontSize:14,resize:"vertical",marginBottom:18,boxSizing:"border-box",outline:"none",fontFamily:"inherit" }}
            />

            <label style={{ display:"block",marginBottom:6,fontSize:13,fontWeight:600,color:"#8892AA" }}>CVs (PDF, max {MAX_CVS}) *</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ border:"2px dashed #1E2733",borderRadius:14,padding:"28px 20px",textAlign:"center",cursor:"pointer",marginBottom:14 }}>
              <div style={{ fontSize:28,marginBottom:6 }}>📄</div>
              <p style={{ color:"#6B7A99",fontSize:13,margin:0 }}>
                {files.length ? `${files.length} fichier${files.length>1?"s":""} sélectionné${files.length>1?"s":""}` : "Cliquez pour choisir vos CVs"}
              </p>
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf" multiple style={{ display:"none" }} onChange={e => { addFiles(e.target.files ?? []); e.target.value = ""; }} />

            {files.length > 0 && (
              <div style={{ background:"#07090F",borderRadius:10,border:"1px solid #1E2733",marginBottom:18,overflow:"hidden" }}>
                {files.map(f => (
                  <div key={f.name} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px",borderBottom:"1px solid #0A0D14",fontSize:13 }}>
                    <span style={{ color:"#C0CBE0" }}>📄 {f.name}</span>
                    <button onClick={() => removeFile(f.name)} style={{ background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:13 }}>Retirer</button>
                  </div>
                ))}
              </div>
            )}

            {error && <p style={{ color:"#EF4444",fontSize:13,marginBottom:14 }}>{error}</p>}

            <button onClick={runTrial} disabled={screening}
              style={{ width:"100%",background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"13px",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",opacity:screening?0.6:1 }}>
              {screening ? "Analyse en cours…" : `Analyser ${files.length || ""} CV${files.length>1?"s":""} gratuitement →`}
            </button>
          </div>
        )}

        {results && (
          <div style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:20,overflow:"hidden" }}>
            <div style={{ padding:"18px 22px",borderBottom:"1px solid #1E2733" }}>
              <span style={{ fontWeight:800,fontSize:15 }}>Résultats — {results.jobTitle}</span>
            </div>

            <div style={{ padding:"0 22px" }}>
              {results.results.map((r, i) => (
                <div key={i} style={{ padding:"16px 0",borderBottom:i<results.results.length-1?"1px solid #1E2733":"none" }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:unlocked?10:0 }}>
                    <span style={{ fontWeight:600,fontSize:14,color:"#C0CBE0" }}>{r.filename.replace(/\.pdf$/i,"")}</span>
                    {r.score != null ? (
                      <span style={{ background:`${STATUS_COLOR[r.status]}15`,color:STATUS_COLOR[r.status],fontSize:12,fontWeight:800,padding:"3px 12px",borderRadius:20,border:`1px solid ${STATUS_COLOR[r.status]}30` }}>
                        {r.score}/100 — {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    ) : (
                      <span style={{ color:"#EF4444",fontSize:12 }}>{r.error_msg ?? "Erreur"}</span>
                    )}
                  </div>

                  {unlocked && r.summary && (
                    <div style={{ fontSize:13,color:"#8892AA",lineHeight:1.6 }}>
                      <p style={{ margin:"0 0 8px",fontStyle:"italic" }}>💬 {r.summary}</p>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                        <div>
                          <div style={{ color:"#10B981",fontWeight:700,fontSize:11,marginBottom:4 }}>✅ POINTS FORTS</div>
                          {(r.strengths ?? []).map((s,j) => <div key={j}>• {s}</div>)}
                        </div>
                        <div>
                          <div style={{ color:"#EF4444",fontWeight:700,fontSize:11,marginBottom:4 }}>⚠️ POINTS FAIBLES</div>
                          {(r.weaknesses ?? []).map((w,j) => <div key={j}>• {w}</div>)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!unlocked && (
              <div style={{ padding:"24px 22px",background:"#0A0E17",borderTop:"1px solid #1E2733" }}>
                <p style={{ fontSize:14,fontWeight:700,margin:"0 0 4px" }}>🔓 Débloquez l'analyse complète</p>
                <p style={{ fontSize:13,color:"#6B7A99",margin:"0 0 14px" }}>Entrez votre email pour voir les points forts, points faibles et résumé détaillé de chaque CV.</p>
                <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vous@entreprise.com"
                    type="email"
                    style={{ flex:1,minWidth:200,background:"#07090F",border:"1px solid #1E2733",borderRadius:10,padding:"12px 14px",color:"#F0F4FF",fontSize:14,outline:"none" }}
                  />
                  <button onClick={submitLead} disabled={submittingLead}
                    style={{ background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"12px 24px",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",opacity:submittingLead?0.6:1 }}>
                    {submittingLead ? "…" : "Voir les résultats →"}
                  </button>
                </div>
                {leadError && <p style={{ color:"#EF4444",fontSize:13,marginTop:10 }}>{leadError}</p>}
              </div>
            )}

            {unlocked && (
              <div style={{ padding:"24px 22px",background:"#0A0E17",borderTop:"1px solid #1E2733",textAlign:"center" }}>
                <p style={{ fontSize:14,color:"#8892AA",margin:"0 0 14px" }}>Envie d'analyser jusqu'à 1000 CVs par mois ?</p>
                <a href="/hr/dashboard" style={{ display:"inline-block",background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",textDecoration:"none",padding:"12px 28px",borderRadius:10,fontSize:14,fontWeight:700 }}>
                  Découvrir DocSwift HR →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
