"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

const CSS = `
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .spin { animation:spin 1s linear infinite; }
  .fade-in { animation:fadeIn .3s ease both; }
  .drop-zone { transition:all .2s ease; }
  .drop-zone:hover, .drop-zone.drag-over { border-color:#3B82F6!important; background:rgba(59,130,246,.06)!important; }
  .cv-row { transition:background .15s; }
  .cv-row:hover { background:rgba(30,39,51,.6)!important; }
  .btn { transition:all .18s ease; cursor:pointer; }
  .btn:hover { transform:translateY(-1px); }
  .btn:active { transform:translateY(0); }
  .job-card { transition:all .18s ease; cursor:pointer; }
  .job-card:hover { border-color:rgba(59,130,246,.4)!important; }
  @media(max-width:640px) {
    .hr-header { flex-direction:column!important; align-items:flex-start!important; gap:12px!important; }
    .steps-row { flex-direction:column!important; }
    .results-actions { flex-direction:column!important; align-items:stretch!important; }
    .table-wrap { font-size:12px!important; }
  }
`;

const STATUS_COLOR = { recommended:"#10B981", consider:"#F59E0B", rejected:"#EF4444", pending:"#4B5563", error:"#EF4444" };
const STATUS_LABEL = { recommended:"Recommandé", consider:"À considérer", rejected:"Non retenu", pending:"En attente", error:"Erreur" };

// ─────────────────────────────────────────────────────────────────────────────
export default function HRPage() {
  const { data: session } = useSession();

  // ── View state ──────────────────────────────────────────────────────────
  const [view, setView]     = useState("list");      // list | create | job
  const [jobs, setJobs]     = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // ── New job form ─────────────────────────────────────────────────────────
  const [jobTitle, setJobTitle]       = useState("");
  const [jobDesc, setJobDesc]         = useState("");
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState("");

  // ── Active job ──────────────────────────────────────────────────────────
  const [activeJob, setActiveJob]   = useState(null);  // full job object
  const [analyses, setAnalyses]     = useState([]);
  const [cvFiles, setCvFiles]       = useState([]);     // File[] to upload
  const [uploading, setUploading]   = useState(false);
  const [analyzing, setAnalyzing]   = useState(false);
  const [pollTimer, setPollTimer]   = useState(null);
  const [detailRow, setDetailRow]   = useState(null);   // expanded CV row

  const fileInputRef = useRef(null);
  const dragRef      = useRef(false);

  // ── Load jobs list ──────────────────────────────────────────────────────
  const loadJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const r = await fetch("/api/hr/job");
      if (r.ok) setJobs(await r.json());
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  // ── Poll results ────────────────────────────────────────────────────────
  const startPolling = useCallback((jobId) => {
    const timer = setInterval(async () => {
      try {
        const r = await fetch(`/api/hr/${jobId}/results`);
        if (!r.ok) return;
        const data = await r.json();
        setActiveJob(data.job);
        setAnalyses(data.analyses ?? []);
        if (data.job.status === "done" || data.job.status === "error") {
          clearInterval(timer);
          setPollTimer(null);
          setAnalyzing(false);
          loadJobs();
        }
      } catch {}
    }, 2000);
    setPollTimer(timer);
    return timer;
  }, [loadJobs]);

  useEffect(() => () => { if (pollTimer) clearInterval(pollTimer); }, [pollTimer]);

  // ── Open an existing job ─────────────────────────────────────────────────
  const openJob = async (job) => {
    setView("job");
    setActiveJob(job);
    setAnalyses([]);
    setCvFiles([]);
    if (job.status === "analyzing") {
      setAnalyzing(true);
      startPolling(job.id);
    } else if (job.status === "done" || job.cv_count > 0) {
      const r = await fetch(`/api/hr/${job.id}/results`);
      if (r.ok) {
        const data = await r.json();
        setActiveJob(data.job);
        setAnalyses(data.analyses ?? []);
      }
    }
  };

  // ── Create new job ───────────────────────────────────────────────────────
  const createJob = async () => {
    if (!jobTitle.trim() || !jobDesc.trim()) { setCreateError("Remplissez tous les champs."); return; }
    setCreating(true); setCreateError("");
    try {
      const r = await fetch("/api/hr/job", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ title:jobTitle, description:jobDesc }) });
      const data = await r.json();
      if (!r.ok) { setCreateError(data.message ?? "Erreur lors de la création."); return; }
      await loadJobs();
      setJobTitle(""); setJobDesc("");
      openJob(data);
    } catch { setCreateError("Erreur réseau."); }
    finally { setCreating(false); }
  };

  // ── Upload CVs ───────────────────────────────────────────────────────────
  const uploadCVs = async () => {
    if (!cvFiles.length || !activeJob) return;
    setUploading(true);
    try {
      const fd = new FormData();
      cvFiles.forEach(f => fd.append("files", f));
      const r = await fetch(`/api/hr/${activeJob.id}/upload-cvs`, { method:"POST", body:fd });
      const data = await r.json();
      if (!r.ok) { alert(data.message ?? "Erreur upload"); return; }
      setCvFiles([]);
      // Refresh job
      const r2 = await fetch(`/api/hr/${activeJob.id}/results`);
      if (r2.ok) { const d = await r2.json(); setActiveJob(d.job); setAnalyses(d.analyses ?? []); }
    } catch { alert("Erreur réseau"); }
    finally { setUploading(false); }
  };

  // ── Start analysis ───────────────────────────────────────────────────────
  const startAnalysis = async () => {
    if (!activeJob) return;
    setAnalyzing(true);
    try {
      const r = await fetch(`/api/hr/${activeJob.id}/analyze`, { method:"POST" });
      const data = await r.json();
      if (!r.ok) {
        alert(data.message ?? "Erreur lors du démarrage de l'analyse.");
        setAnalyzing(false); return;
      }
      startPolling(activeJob.id);
    } catch { setAnalyzing(false); alert("Erreur réseau"); }
  };

  // ── Export CSV ───────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!activeJob) return;
    window.open(`/api/hr/${activeJob.id}/export`, "_blank");
  };

  // ── File drop handlers ───────────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault(); dragRef.current = false;
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    setCvFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...files.filter(f => !names.has(f.name))].slice(0, 100);
    });
  };
  const handleFileInput = (e) => {
    const files = Array.from(e.target.files ?? []);
    setCvFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...files.filter(f => !names.has(f.name))].slice(0, 100);
    });
    e.target.value = "";
  };

  // ── Progress ─────────────────────────────────────────────────────────────
  const progress = activeJob
    ? activeJob.cv_count > 0
      ? Math.round((activeJob.analyzed_count / activeJob.cv_count) * 100)
      : 0
    : 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh",padding:"32px 28px",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:"#F0F4FF",maxWidth:1100,margin:"0 auto" }}>
      <style>{CSS}</style>

      {/* ── HEADER ── */}
      <div className="hr-header" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:32 }}>
        <div>
          {view !== "list" && (
            <button className="btn" onClick={() => { setView("list"); setActiveJob(null); setAnalyses([]); if(pollTimer) clearInterval(pollTimer); setAnalyzing(false); }}
              style={{ background:"none",border:"none",color:"#6B7A99",fontSize:13,cursor:"pointer",padding:"0 0 8px",display:"flex",alignItems:"center",gap:6 }}>
              ← Retour aux analyses
            </button>
          )}
          <h1 style={{ fontSize:26,fontWeight:900,letterSpacing:-1,margin:0,display:"flex",alignItems:"center",gap:10 }}>
            <span>👥</span> DocSwift HR
          </h1>
          <p style={{ color:"#6B7A99",fontSize:14,margin:"4px 0 0" }}>Analyse de CVs par IA — scoring /100 · export CSV</p>
        </div>
        {view === "list" && (
          <button className="btn" onClick={() => setView("create")}
            style={{ background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"11px 24px",borderRadius:12,fontSize:14,fontWeight:700 }}>
            + Nouvelle analyse
          </button>
        )}
      </div>

      {/* ══════════════ LIST VIEW ══════════════ */}
      {view === "list" && (
        <div className="fade-in">
          {jobsLoading ? (
            <div style={{ textAlign:"center",padding:60,color:"#4B5563" }}>Chargement…</div>
          ) : jobs.length === 0 ? (
            <div style={{ textAlign:"center",padding:"80px 20px" }}>
              <div style={{ fontSize:52,marginBottom:16 }}>📋</div>
              <h2 style={{ fontWeight:800,fontSize:20,marginBottom:8 }}>Aucune analyse pour l'instant</h2>
              <p style={{ color:"#6B7A99",fontSize:14,marginBottom:28 }}>Créez votre première analyse pour commencer le tri de CVs par IA.</p>
              <button className="btn" onClick={() => setView("create")}
                style={{ background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"13px 32px",borderRadius:12,fontSize:15,fontWeight:700 }}>
                + Nouvelle analyse
              </button>
            </div>
          ) : (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16 }}>
              {jobs.map(job => (
                <div key={job.id} className="job-card fade-in"
                  style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:16,padding:"20px 22px",cursor:"pointer" }}
                  onClick={() => openJob(job)}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                    <h3 style={{ fontSize:15,fontWeight:800,margin:0,flex:1,paddingRight:8 }}>{job.title}</h3>
                    <StatusBadge status={job.status} small />
                  </div>
                  <div style={{ display:"flex",gap:16,color:"#6B7A99",fontSize:12 }}>
                    <span>📄 {job.cv_count} CVs</span>
                    {job.analyzed_count > 0 && <span>✓ {job.analyzed_count} analysés</span>}
                  </div>
                  <div style={{ color:"#4B5563",fontSize:11,marginTop:8 }}>
                    {new Date(job.created_at).toLocaleDateString("fr-FR", { day:"numeric",month:"long",hour:"2-digit",minute:"2-digit" })}
                  </div>
                </div>
              ))}
              {/* New analysis card */}
              <div className="job-card" onClick={() => setView("create")}
                style={{ background:"transparent",border:"2px dashed #1E2733",borderRadius:16,padding:"20px 22px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,minHeight:110,color:"#4B5563" }}>
                <span style={{ fontSize:28 }}>+</span>
                <span style={{ fontSize:13,fontWeight:600 }}>Nouvelle analyse</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ CREATE VIEW ══════════════ */}
      {view === "create" && (
        <div className="fade-in" style={{ maxWidth:660 }}>
          <div style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:20,padding:32 }}>
            <h2 style={{ fontSize:19,fontWeight:800,marginBottom:24,marginTop:0 }}>Nouvelle analyse de CVs</h2>

            <label style={{ display:"block",marginBottom:6,fontSize:13,fontWeight:600,color:"#8892AA" }}>Titre du poste *</label>
            <input
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="ex. Développeur React Senior"
              style={{ width:"100%",background:"#07090F",border:"1px solid #1E2733",borderRadius:10,padding:"12px 14px",color:"#F0F4FF",fontSize:14,marginBottom:20,boxSizing:"border-box",outline:"none" }}
            />

            <label style={{ display:"block",marginBottom:6,fontSize:13,fontWeight:600,color:"#8892AA" }}>Fiche de poste *</label>
            <textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Décrivez le poste, les responsabilités, les compétences requises, le profil recherché…"
              rows={8}
              style={{ width:"100%",background:"#07090F",border:"1px solid #1E2733",borderRadius:10,padding:"12px 14px",color:"#F0F4FF",fontSize:14,resize:"vertical",marginBottom:20,boxSizing:"border-box",outline:"none",fontFamily:"inherit" }}
            />

            {createError && <p style={{ color:"#EF4444",fontSize:13,marginBottom:12 }}>{createError}</p>}

            <div style={{ display:"flex",gap:12 }}>
              <button className="btn" onClick={() => { setView("list"); setCreateError(""); }}
                style={{ flex:1,background:"transparent",border:"1px solid #1E2733",color:"#8892AA",padding:"12px",borderRadius:10,fontSize:14,fontWeight:600 }}>
                Annuler
              </button>
              <button className="btn" onClick={createJob} disabled={creating}
                style={{ flex:2,background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"12px",borderRadius:10,fontSize:14,fontWeight:700,opacity:creating?0.5:1 }}>
                {creating ? "Création…" : "Créer l'analyse →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ JOB VIEW ══════════════ */}
      {view === "job" && activeJob && (
        <div className="fade-in">

          {/* Job title + status */}
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:28,flexWrap:"wrap" }}>
            <h2 style={{ fontSize:20,fontWeight:900,margin:0,letterSpacing:-0.5 }}>{activeJob.title}</h2>
            <StatusBadge status={activeJob.status} />
            <span style={{ color:"#4B5563",fontSize:13 }}>
              {activeJob.cv_count} CV{activeJob.cv_count !== 1 ? "s" : ""} uploadé{activeJob.cv_count !== 1 ? "s" : ""}
            </span>
          </div>

          {/* ── UPLOAD SECTION (if not analyzing/done) ── */}
          {activeJob.status !== "analyzing" && (
            <div style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:20,padding:28,marginBottom:24 }}>
              <h3 style={{ fontSize:15,fontWeight:800,margin:"0 0 16px",color:"#C0CBE0" }}>
                📎 Ajouter des CVs {activeJob.cv_count > 0 && <span style={{ color:"#4B5563",fontWeight:500,fontSize:13 }}>({activeJob.cv_count} déjà chargés)</span>}
              </h3>

              {/* Drop zone */}
              <div
                className={`drop-zone${dragRef.current ? " drag-over" : ""}`}
                style={{ border:"2px dashed #1E2733",borderRadius:14,padding:"36px 20px",textAlign:"center",cursor:"pointer",marginBottom:16 }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); dragRef.current = true; }}
                onDragLeave={() => { dragRef.current = false; }}
                onDrop={handleDrop}>
                <div style={{ fontSize:32,marginBottom:8 }}>📄</div>
                <p style={{ color:"#6B7A99",fontSize:14,margin:"0 0 4px" }}>
                  {cvFiles.length ? `${cvFiles.length} fichier${cvFiles.length>1?"s":""} sélectionné${cvFiles.length>1?"s":""}` : "Glissez vos CVs ici"}
                </p>
                <p style={{ color:"#4B5563",fontSize:12,margin:0 }}>PDF uniquement · Max 5 MB/fichier · 100 CVs max</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf" multiple style={{ display:"none" }} onChange={handleFileInput} />

              {/* File list preview */}
              {cvFiles.length > 0 && (
                <div style={{ background:"#07090F",borderRadius:10,border:"1px solid #1E2733",marginBottom:16,maxHeight:180,overflowY:"auto" }}>
                  {cvFiles.map((f, i) => (
                    <div key={i} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px",borderBottom:i<cvFiles.length-1?"1px solid #0A0D14":"none",fontSize:13 }}>
                      <span style={{ color:"#C0CBE0" }}>📄 {f.name}</span>
                      <span style={{ color:"#4B5563" }}>{(f.size/1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
                {cvFiles.length > 0 && (
                  <button className="btn" onClick={uploadCVs} disabled={uploading}
                    style={{ background:"#1E2733",color:"#F0F4FF",border:"none",padding:"11px 24px",borderRadius:10,fontSize:13,fontWeight:700,opacity:uploading?.6:1 }}>
                    {uploading ? "Upload…" : `⬆️ Uploader ${cvFiles.length} CV${cvFiles.length>1?"s":""}`}
                  </button>
                )}
                {activeJob.cv_count > 0 && !analyzing && (
                  <button className="btn" onClick={startAnalysis}
                    style={{ background:"linear-gradient(135deg,#F97316,#EA580C)",color:"#fff",border:"none",padding:"11px 28px",borderRadius:10,fontSize:14,fontWeight:700 }}>
                    🔍 Analyser {activeJob.cv_count} CV{activeJob.cv_count>1?"s":""} →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── PROGRESS BAR ── */}
          {analyzing && (
            <div className="fade-in" style={{ background:"#0D1117",border:"1px solid rgba(249,115,22,.25)",borderRadius:20,padding:28,marginBottom:24 }}>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
                <div className="spin" style={{ width:18,height:18,border:"2px solid #F97316",borderTopColor:"transparent",borderRadius:"50%" }} />
                <span style={{ fontWeight:700,fontSize:15 }}>Analyse en cours…</span>
                <span style={{ color:"#F97316",fontWeight:800,marginLeft:"auto" }}>{progress}%</span>
              </div>
              <div style={{ background:"#1E2733",borderRadius:99,height:8,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#F97316,#EA580C)",borderRadius:99,transition:"width .5s ease" }} />
              </div>
              <p style={{ color:"#6B7A99",fontSize:12,marginTop:10,margin:"10px 0 0" }}>
                {activeJob.analyzed_count} / {activeJob.cv_count} CVs analysés · Gemini 1.5 Flash
              </p>
            </div>
          )}

          {/* ── RESULTS TABLE ── */}
          {analyses.length > 0 && (
            <div className="fade-in" style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:20,overflow:"hidden" }}>
              {/* Table header */}
              <div style={{ padding:"18px 22px",borderBottom:"1px solid #1E2733",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
                <div>
                  <span style={{ fontWeight:800,fontSize:15 }}>Résultats — {activeJob.title}</span>
                  <span style={{ color:"#4B5563",fontSize:13,marginLeft:10 }}>{analyses.filter(a=>a.status!=="pending").length}/{analyses.length} analysés</span>
                </div>
                {activeJob.status === "done" && (
                  <div className="results-actions" style={{ display:"flex",gap:10 }}>
                    <button className="btn" onClick={exportCSV}
                      style={{ background:"rgba(16,185,129,.1)",color:"#10B981",border:"1px solid rgba(16,185,129,.25)",padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:700 }}>
                      ⬇️ Export CSV
                    </button>
                    <button className="btn" onClick={startAnalysis} disabled={analyzing}
                      style={{ background:"rgba(59,130,246,.1)",color:"#60A5FA",border:"1px solid rgba(59,130,246,.25)",padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:700 }}>
                      🔄 Relancer
                    </button>
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div style={{ display:"flex",gap:0,borderBottom:"1px solid #1E2733" }}>
                {[
                  { label:"Recommandés", count:analyses.filter(a=>a.status==="recommended").length, color:"#10B981" },
                  { label:"À considérer", count:analyses.filter(a=>a.status==="consider").length, color:"#F59E0B" },
                  { label:"Non retenus",  count:analyses.filter(a=>a.status==="rejected").length, color:"#EF4444" },
                ].map((s,i) => (
                  <div key={i} style={{ flex:1,padding:"14px 16px",textAlign:"center",borderRight:i<2?"1px solid #1E2733":"none" }}>
                    <div style={{ fontSize:22,fontWeight:900,color:s.color }}>{s.count}</div>
                    <div style={{ fontSize:11,color:"#4B5563" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="table-wrap" style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid #1E2733" }}>
                      {["Fichier","Score","Statut","Résumé IA",""].map(h => (
                        <th key={h} style={{ padding:"10px 18px",textAlign:"left",color:"#4B5563",fontWeight:600,fontSize:11,letterSpacing:.5,textTransform:"uppercase",whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.map((a, i) => (
                      <>
                        <tr key={a.id} className="cv-row"
                          style={{ borderBottom:"1px solid #0A0D14",background:i%2===0?"#0A0E17":"transparent",cursor:"pointer" }}
                          onClick={() => setDetailRow(detailRow===a.id ? null : a.id)}>
                          <td style={{ padding:"12px 18px",color:"#C0CBE0",fontWeight:600,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                            {a.filename.replace(/\.pdf$/i,"")}
                          </td>
                          <td style={{ padding:"12px 18px" }}>
                            {a.score != null ? (
                              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                                <div style={{ width:56,height:5,background:"#1E2733",borderRadius:99,overflow:"hidden" }}>
                                  <div style={{ height:"100%",width:`${a.score}%`,background:STATUS_COLOR[a.status],borderRadius:99 }} />
                                </div>
                                <span style={{ fontWeight:800,color:STATUS_COLOR[a.status],fontSize:14 }}>{a.score}</span>
                                <span style={{ color:"#4B5563",fontSize:11 }}>/100</span>
                              </div>
                            ) : <span style={{ color:"#4B5563" }}>—</span>}
                          </td>
                          <td style={{ padding:"12px 18px" }}>
                            <span style={{ background:`${STATUS_COLOR[a.status]}15`,color:STATUS_COLOR[a.status],fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,border:`1px solid ${STATUS_COLOR[a.status]}30`,whiteSpace:"nowrap" }}>
                              {STATUS_LABEL[a.status] ?? a.status}
                            </span>
                          </td>
                          <td style={{ padding:"12px 18px",color:"#6B7A99",maxWidth:260,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                            {a.summary || (a.status === "pending" ? "En attente d'analyse…" : a.error_msg ?? "—")}
                          </td>
                          <td style={{ padding:"12px 18px",color:"#3B82F6",fontWeight:600,fontSize:12,whiteSpace:"nowrap" }}>
                            {detailRow === a.id ? "▲ Réduire" : "▼ Détails"}
                          </td>
                        </tr>

                        {/* Expanded detail row */}
                        {detailRow === a.id && (
                          <tr key={`${a.id}-detail`}>
                            <td colSpan={5} style={{ padding:"16px 22px 20px",background:"#060911",borderBottom:"1px solid #1E2733" }}>
                              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
                                <div>
                                  <div style={{ fontSize:12,fontWeight:700,color:"#10B981",marginBottom:8,letterSpacing:.5 }}>✅ POINTS FORTS</div>
                                  {(a.strengths ?? []).length ? (
                                    <ul style={{ listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:6 }}>
                                      {a.strengths.map((s,j) => (
                                        <li key={j} style={{ fontSize:13,color:"#8892AA",display:"flex",gap:8 }}>
                                          <span style={{ color:"#10B981",flexShrink:0 }}>✓</span>{s}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : <span style={{ color:"#4B5563",fontSize:12 }}>—</span>}
                                </div>
                                <div>
                                  <div style={{ fontSize:12,fontWeight:700,color:"#EF4444",marginBottom:8,letterSpacing:.5 }}>⚠️ POINTS FAIBLES</div>
                                  {(a.weaknesses ?? []).length ? (
                                    <ul style={{ listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:6 }}>
                                      {a.weaknesses.map((w,j) => (
                                        <li key={j} style={{ fontSize:13,color:"#8892AA",display:"flex",gap:8 }}>
                                          <span style={{ color:"#EF4444",flexShrink:0 }}>✗</span>{w}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : <span style={{ color:"#4B5563",fontSize:12 }}>—</span>}
                                </div>
                              </div>
                              {a.summary && (
                                <p style={{ color:"#6B7A99",fontSize:13,marginTop:16,fontStyle:"italic",borderTop:"1px solid #1E2733",paddingTop:12,margin:"14px 0 0" }}>
                                  💬 {a.summary}
                                </p>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state when job exists but no CVs yet */}
          {!analyzing && activeJob.cv_count === 0 && cvFiles.length === 0 && analyses.length === 0 && (
            <div style={{ textAlign:"center",padding:"60px 20px",color:"#4B5563" }}>
              <div style={{ fontSize:40,marginBottom:12 }}>📎</div>
              <p style={{ fontSize:14 }}>Ajoutez des CVs ci-dessus pour démarrer l'analyse.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status, small }) {
  const cfg = {
    pending:   { label:"En attente",    bg:"rgba(75,85,99,.15)",   color:"#6B7A99",  border:"#374151" },
    analyzing: { label:"En cours…",     bg:"rgba(249,115,22,.1)",  color:"#FB923C",  border:"rgba(249,115,22,.3)" },
    done:      { label:"✓ Terminé",     bg:"rgba(16,185,129,.1)",  color:"#10B981",  border:"rgba(16,185,129,.25)" },
    error:     { label:"Erreur",        bg:"rgba(239,68,68,.1)",   color:"#F87171",  border:"rgba(239,68,68,.25)" },
  }[status] ?? { label:status, bg:"rgba(75,85,99,.15)", color:"#6B7A99", border:"#374151" };

  return (
    <span style={{
      background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`,
      padding: small ? "2px 8px" : "4px 12px",
      borderRadius:20,
      fontSize: small ? 11 : 12,
      fontWeight:700, whiteSpace:"nowrap",
    }}>
      {cfg.label}
    </span>
  );
}
