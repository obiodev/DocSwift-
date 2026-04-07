"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSession, signIn }               from "next-auth/react";
import { useRouter, useSearchParams }       from "next/navigation";
import { useTranslations, useLocale }       from 'next-intl';
import LanguageSwitcher                     from '../../../components/LanguageSwitcher';

const CSS = `
  @keyframes spin { to { transform:rotate(360deg) } }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse-dot { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.5)} 50%{box-shadow:0 0 0 5px rgba(16,185,129,0)} }
  @keyframes checkmark { from{stroke-dashoffset:50} to{stroke-dashoffset:0} }
  .tool-card { transition:all .18s cubic-bezier(.4,0,.2,1) }
  .tool-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,.4) }
  .drop-zone { transition:all .2s ease }
  .drop-zone:hover { border-color:#3B82F6!important; background:rgba(59,130,246,.04)!important }
  .btn-convert { transition:all .2s ease }
  .btn-convert:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(59,130,246,.4) }
  .fade-in { animation:fadeIn .3s ease both }
  .spinner { animation:spin 1s linear infinite }
  @media(max-width:768px){
    .tools-grid{grid-template-columns:1fr 1fr!important}
    .nav-wrap{padding:10px 16px!important}
    .usage-bar-label{display:none!important}
    .nav-user-name{display:none!important}
    .nav-user-img{display:none!important}
  }
  @media(max-width:480px){
    .tools-grid{grid-template-columns:1fr!important}
    .drop-inner{padding:28px 20px!important}
  }
`;

const FREE_LIMIT  = 5;
const AD_BONUS    = 3;
const AD_DURATION = 30;
const MULTI_TOOLS = new Set(["merge-pdf","image-to-pdf"]);

function AdModal({ onComplete, onClose }) {
  const t = useTranslations('tools');
  const [seconds, setSeconds]  = useState(AD_DURATION);
  const [done,    setDone]     = useState(false);
  const [adHtml,  setAdHtml]   = useState(null);
  const zoneRef = useRef(null);

  useEffect(() => {
    fetch("/api/ads").then(r=>r.json()).then(d=>setAdHtml(d.rewardedAdHtml||"")).catch(()=>setAdHtml(""));
  }, []);

  useEffect(() => {
    if (!adHtml || !zoneRef.current) return;
    const el = zoneRef.current;
    el.innerHTML = adHtml;
    el.querySelectorAll("script").forEach(orig => {
      const s = document.createElement("script");
      if (orig.src) { s.src=orig.src; s.async=true; } else { s.textContent=orig.textContent; }
      orig.replaceWith(s);
    });
  }, [adHtml]);

  useEffect(() => {
    if (seconds <= 0) { setDone(true); return; }
    const timer = setTimeout(()=>setSeconds(s=>s-1), 1000);
    return ()=>clearTimeout(timer);
  }, [seconds]);

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div className="fade-in" style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:24,padding:"36px 32px",maxWidth:480,width:"100%",textAlign:"center" }}>
        <div style={{ fontSize:44,marginBottom:14 }}>📺</div>
        <h3 style={{ fontSize:22,fontWeight:800,marginBottom:8,color:"#F0F4FF" }}>{t('adModal.title')}</h3>
        <p style={{ color:"#8892AA",fontSize:14,marginBottom:24,lineHeight:1.6 }}>
          {t('adModal.desc', { bonus: AD_BONUS })}
        </p>
        <div style={{ background:"#131922",border:"1px dashed #1E2733",borderRadius:14,minHeight:180,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,position:"relative",overflow:"hidden" }}>
          {adHtml === null
            ? <span style={{ color:"#4B5563",fontSize:13 }}>{t('adModal.loading')}</span>
            : adHtml === ""
              ? <div style={{ textAlign:"center",color:"#4B5563" }}><div style={{ fontSize:30,marginBottom:8 }}>🎬</div><div style={{ fontSize:13 }}>{t('adModal.adZone')}</div></div>
              : <div ref={zoneRef} style={{ width:"100%" }} />
          }
          <div style={{ position:"absolute",top:10,right:10,background:"rgba(0,0,0,.7)",color:"#fff",borderRadius:8,padding:"4px 10px",fontSize:13,fontWeight:700 }}>
            {done ? "✓" : t('adModal.wait', { seconds })}
          </div>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          {done
            ? <button onClick={onComplete} style={{ flex:1,background:"#10B981",color:"#fff",border:"none",padding:13,borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer" }}>{t('adModal.claim', { bonus: AD_BONUS })}</button>
            : <button disabled style={{ flex:1,background:"#1E3A5F",color:"#60A5FA",border:"none",padding:13,borderRadius:10,fontSize:15,fontWeight:600,cursor:"not-allowed" }}>{t('adModal.wait', { seconds })}</button>
          }
          <button onClick={onClose} style={{ background:"none",border:"1px solid #1E2733",color:"#6B7A99",padding:"13px 16px",borderRadius:10,cursor:"pointer" }}>✕</button>
        </div>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  const t = useTranslations();
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh",background:"#07090F",display:"flex",alignItems:"center",justifyContent:"center",color:"#6B7A99",fontFamily:"sans-serif" }}>{t('common.loading')}</div>}>
      <ToolsInner />
    </Suspense>
  );
}

function ToolsInner() {
  const t      = useTranslations();
  const locale = useLocale();
  const { data: session }  = useSession();
  const router             = useRouter();
  const searchParams       = useSearchParams();

  const localePrefix = locale === 'fr' ? '' : `/${locale}`;

  const TOOLS = [
    { id:"pdf-to-word",  icon:"📝", nameKey:"tools.pdfToWord.name",  descKey:"tools.pdfToWord.desc",  accept:".pdf",       type:"pdf-to-word",  multi:false, color:"#3B82F6", glow:"rgba(59,130,246,.12)"  },
    { id:"word-to-pdf",  icon:"🔄", nameKey:"tools.wordToPdf.name",  descKey:"tools.wordToPdf.desc",  accept:".docx,.doc", type:"word-to-pdf",  multi:false, color:"#6366F1", glow:"rgba(99,102,241,.12)"  },
    { id:"compress-pdf", icon:"🗜️",nameKey:"tools.compressPdf.name", descKey:"tools.compressPdf.desc", accept:".pdf",       type:"compress-pdf", multi:false, color:"#F59E0B", glow:"rgba(245,158,11,.12)"  },
    { id:"merge-pdf",    icon:"🔗", nameKey:"tools.mergePdf.name",   descKey:"tools.mergePdf.desc",   accept:".pdf",       type:"merge-pdf",    multi:true,  color:"#10B981", glow:"rgba(16,185,129,.12)"  },
    { id:"split-pdf",    icon:"✂️", nameKey:"tools.splitPdf.name",   descKey:"tools.splitPdf.desc",   accept:".pdf",       type:"split-pdf",    multi:false, color:"#EC4899", glow:"rgba(236,72,153,.12)"  },
    { id:"image-to-pdf", icon:"🖼️",nameKey:"tools.imageToPdf.name",  descKey:"tools.imageToPdf.desc",  accept:"image/*",    type:"image-to-pdf", multi:true,  color:"#8B5CF6", glow:"rgba(139,92,246,.12)"  },
    { id:"create-cv",    icon:"📄", nameKey:"tools.createCv.name",   descKey:"tools.createCv.desc",   accept:"",           type:"create-cv",    multi:false, color:"#14B8A6", glow:"rgba(20,184,166,.12)", external:`${localePrefix}/cv` },
  ];

  const [activeTool,   setActiveTool]   = useState(null);
  const [files,        setFiles]        = useState([]);
  const [splitPage,    setSplitPage]    = useState("1");
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [error,        setError]        = useState(null);
  const [dragOver,     setDragOver]     = useState(false);
  const [usage,        setUsage]        = useState({ used:0, limit:FREE_LIMIT, isPro:false, remaining:FREE_LIMIT });
  const [showAd,       setShowAd]       = useState(false);
  const [bonusUses,    setBonusUses]    = useState(0);
  const [bannerAdHtml, setBannerAdHtml] = useState("");
  const bannerRef = useRef(null);
  const isMulti   = activeTool && MULTI_TOOLS.has(activeTool.type);

  useEffect(() => {
    fetch("/api/ads").then(r=>r.json()).then(d=>setBannerAdHtml(d.bannerAdHtml||"")).catch(()=>{});
  }, []);
  useEffect(() => {
    if (!bannerAdHtml || !bannerRef.current) return;
    const el = bannerRef.current;
    el.innerHTML = bannerAdHtml;
    el.querySelectorAll("script").forEach(orig => {
      const s = document.createElement("script");
      if (orig.src){s.src=orig.src;s.async=true;}else{s.textContent=orig.textContent;}
      orig.replaceWith(s);
    });
  }, [bannerAdHtml]);

  const refreshUsage = useCallback(async () => {
    try {
      const d = await fetch("/api/usage").then(r=>r.json());
      setUsage(d);
    } catch {
      const key  = "docswift_used_" + new Date().toISOString().slice(0,10);
      const used = parseInt(localStorage.getItem(key)??"0");
      const bonus= parseInt(localStorage.getItem("docswift_bonus_"+new Date().toISOString().slice(0,10))??"0");
      setBonusUses(bonus);
      setUsage({ used, limit:FREE_LIMIT, isPro:false, remaining:Math.max(0,FREE_LIMIT+bonus-used) });
    }
  }, []);

  useEffect(() => {
    refreshUsage();
    const key = "docswift_bonus_" + new Date().toISOString().slice(0,10);
    setBonusUses(parseInt(localStorage.getItem(key)??"0"));
    if (searchParams.get("upgraded")==="1") refreshUsage();
    const toolId = searchParams.get("tool");
    if (toolId) { const tool = TOOLS.find(tool=>tool.id===toolId); if (tool && !tool.external) setActiveTool(tool); }
  }, [refreshUsage, searchParams]);

  const effectiveRemaining = usage.isPro ? Infinity : Math.max(0,(usage.remaining??0)+bonusUses);

  const addFiles = (incoming) => {
    const arr = Array.from(incoming);
    setFiles(prev => isMulti ? [...prev,...arr] : arr.slice(0,1));
  };
  const handleDrop       = (e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); };
  const handleFileChange = (e) => addFiles(e.target.files);
  const reset            = ()  => { setFiles([]); setResult(null); setError(null); };

  const handleAdComplete = () => {
    const key  = "docswift_bonus_" + new Date().toISOString().slice(0,10);
    const next = parseInt(localStorage.getItem(key)??"0") + AD_BONUS;
    localStorage.setItem(key, String(next));
    setBonusUses(next);
    setShowAd(false);
  };

  const goUpgrade = async () => {
    if (!session) { signIn(); return; }
    const res  = await fetch("/api/stripe/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({affiliateCode:localStorage.getItem("docswift_ref")})});
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const handleConvert = async () => {
    if (!files.length) return;
    if (!usage.isPro && effectiveRemaining <= 0) { setShowAd(true); return; }
    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("type", activeTool.type);
      if (MULTI_TOOLS.has(activeTool.type)) { files.forEach(f=>fd.append("files",f)); }
      else {
        fd.append("file", files[0]);
        if (activeTool.type==="split-pdf") fd.append("page", splitPage||"1");
      }
      const response = await fetch("/api/convert",{method:"POST",body:fd});
      const data     = await response.json();
      if (response.status===429||data.error==="LIMIT_REACHED") { setShowAd(true); setLoading(false); return; }
      if (data.error) { setError(data.error); setLoading(false); return; }
      if (!usage.isPro) {
        const key = "docswift_used_"+new Date().toISOString().slice(0,10);
        localStorage.setItem(key, String(parseInt(localStorage.getItem(key)??"0")+1));
        if (bonusUses > 0) {
          const bk = "docswift_bonus_"+new Date().toISOString().slice(0,10);
          localStorage.setItem(bk, String(bonusUses-1));
          setBonusUses(b=>Math.max(0,b-1));
        }
      }
      setResult(data);
      await refreshUsage();
    } catch { setError(t('tools.errorConvert') || "Conversion error. Please retry."); }
    finally { setLoading(false); }
  };

  const handleDownload = () => {
    if (!result) return;
    const bytes = Uint8Array.from(atob(result.file), c=>c.charCodeAt(0));
    const blob  = new Blob([bytes],{type:result.mimeType||"application/octet-stream"});
    const url   = URL.createObjectURL(blob);
    const a     = Object.assign(document.createElement("a"),{href:url,download:result.filename,style:"display:none"});
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const dynLimit  = (usage.limit ?? FREE_LIMIT) + bonusUses;
  const usagePct  = usage.isPro ? 0 : Math.min(100,(usage.used/dynLimit)*100);
  const activeTc  = activeTool?.color ?? "#3B82F6";

  return (
    <div style={{ minHeight:"100vh",background:"#07090F",color:"#F0F4FF",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className="nav-wrap" style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"14px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(7,9,15,.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1E2733" }}>
        <div style={{ fontWeight:900,fontSize:20,letterSpacing:-1,cursor:"pointer" }} onClick={()=>router.push(`${localePrefix}/`)}>
          Doc<span style={{ color:"#3B82F6" }}>Swift</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          {!usage.isPro && (
            <div style={{ display:"flex",alignItems:"center",gap:9 }}>
              <div style={{ width:80,height:5,background:"#1E2733",borderRadius:99,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${usagePct}%`,background:usagePct>=100?"#EF4444":"#3B82F6",borderRadius:99,transition:"width .4s" }} />
              </div>
              <span className="usage-bar-label" style={{ fontSize:12,color:"#6B7A99",whiteSpace:"nowrap" }}>
                {usage.used}/{dynLimit} {t('tools.today')}
              </span>
            </div>
          )}
          {usage.isPro && (
            <span style={{ background:"rgba(16,185,129,.12)",color:"#10B981",fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:20,border:"1px solid rgba(16,185,129,.25)" }}>
              {t('tools.proBadge')}
            </span>
          )}
          <LanguageSwitcher />
          {session ? (
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              {session.user?.image && <img className="nav-user-img" src={session.user.image} alt="" width={28} height={28} style={{ borderRadius:"50%" }} />}
              <span className="nav-user-name" style={{ fontSize:13,color:"#8892AA" }}>{session.user?.name??session.user?.email}</span>
              {!usage.isPro && (
                <button onClick={goUpgrade} style={{ background:"#3B82F6",color:"#fff",border:"none",padding:"7px 16px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}>
                  {t('tools.upgradePro')}
                </button>
              )}
            </div>
          ) : (
            <button onClick={()=>signIn()} style={{ background:"#3B82F6",color:"#fff",border:"none",padding:"8px 18px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer" }}>
              {t('nav.login')}
            </button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth:1100,margin:"0 auto",padding:"88px 24px 60px" }}>

        {/* Limit banner */}
        {!usage.isPro && effectiveRemaining===0 && (
          <div className="fade-in" style={{ background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.25)",borderRadius:14,padding:"16px 22px",marginBottom:24,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
            <span style={{ color:"#FCA5A5",fontSize:14 }}>{t('tools.limitBanner.reached', { used: dynLimit, limit: dynLimit })}</span>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>setShowAd(true)} style={{ background:"rgba(239,68,68,.15)",color:"#FCA5A5",border:"1px solid rgba(239,68,68,.35)",padding:"7px 14px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}>
                {t('tools.limitBanner.watchAd', { bonus: AD_BONUS })}
              </button>
              <button onClick={goUpgrade} style={{ background:"#3B82F6",color:"#fff",border:"none",padding:"7px 14px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}>
                {t('tools.limitBanner.goPro')}
              </button>
            </div>
          </div>
        )}

        {/* Back button */}
        {activeTool && (
          <button onClick={()=>{setActiveTool(null);reset();}}
            style={{ background:"none",border:"1px solid #1E2733",color:"#8892AA",padding:"8px 16px",borderRadius:8,cursor:"pointer",marginBottom:28,fontSize:14,display:"flex",alignItems:"center",gap:6 }}>
            {t('nav.backToTools')}
          </button>
        )}

        {/* ── TOOL GRID ── */}
        {!activeTool && (
          <div className="fade-in">
            <div style={{ marginBottom:28 }}>
              <h1 style={{ fontSize:26,fontWeight:900,letterSpacing:-1,marginBottom:6 }}>{t('tools.title')}</h1>
              <p style={{ color:"#6B7A99",fontSize:14 }}>
                {usage.isPro
                  ? t('tools.usageInfoPro')
                  : t('tools.usageInfoFree', { remaining: effectiveRemaining, plural: effectiveRemaining!==1?"s":"", pluralE: effectiveRemaining!==1?"s":"" })}
              </p>
            </div>

            <div className="tools-grid" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16 }}>
              {TOOLS.map(tool => (
                <div key={tool.id} className="tool-card"
                  onClick={()=>{ if(tool.external){router.push(tool.external);return;} setActiveTool(tool);reset(); }}
                  style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:18,padding:24,cursor:"pointer",position:"relative",overflow:"hidden" }}>
                  <div style={{ position:"absolute",top:0,right:0,width:80,height:80,background:`radial-gradient(circle at top right,${tool.glow},transparent 70%)`,pointerEvents:"none" }} />
                  <div style={{ width:44,height:44,borderRadius:12,background:`${tool.color}18`,border:`1px solid ${tool.color}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:14 }}>
                    {tool.icon}
                  </div>
                  <div style={{ fontWeight:700,fontSize:15,marginBottom:5,color:"#F0F4FF" }}>{t(tool.nameKey)}</div>
                  <div style={{ color:"#6B7A99",fontSize:13,lineHeight:1.5 }}>{t(tool.descKey)}</div>
                  <div style={{ marginTop:14,fontSize:12,fontWeight:600,color:tool.color }}>{t('tools.useBtn')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ACTIVE TOOL ── */}
        {activeTool && (
          <div className="fade-in" style={{ maxWidth:660,margin:"0 auto" }}>
            <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:32,padding:"20px 24px",background:"#0D1117",borderRadius:18,border:`1px solid ${activeTc}30` }}>
              <div style={{ width:52,height:52,borderRadius:14,background:`${activeTc}18`,border:`1px solid ${activeTc}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0 }}>
                {activeTool.icon}
              </div>
              <div>
                <h2 style={{ fontSize:20,fontWeight:800,letterSpacing:-0.5,marginBottom:4,color:"#F0F4FF" }}>{t(activeTool.nameKey)}</h2>
                <p style={{ color:"#8892AA",fontSize:13,margin:0 }}>{t(activeTool.descKey)}</p>
              </div>
            </div>

            {!result && (
              <>
                <div className="drop-zone"
                  onDrop={handleDrop}
                  onDragOver={(e)=>{e.preventDefault();setDragOver(true);}}
                  onDragLeave={()=>setDragOver(false)}
                  onClick={()=>document.getElementById("fileInput").click()}
                  className="drop-zone drop-inner"
                  style={{ border:`2px dashed ${dragOver?"#3B82F6":"#1E2733"}`,borderRadius:18,padding:"52px 40px",textAlign:"center",background:dragOver?"rgba(59,130,246,.05)":"#0D1117",cursor:"pointer",marginBottom:18 }}>
                  <input id="fileInput" type="file" style={{ display:"none" }} accept={activeTool.accept} multiple={MULTI_TOOLS.has(activeTool.type)} onChange={handleFileChange} />
                  {files.length ? (
                    <div>
                      <div style={{ fontSize:34,marginBottom:10 }}>📄</div>
                      {files.map((f,i)=>(
                        <div key={i} style={{ marginBottom:3 }}>
                          <span style={{ fontWeight:600,fontSize:14,color:"#F0F4FF" }}>{f.name}</span>
                          <span style={{ color:"#6B7A99",fontSize:12,marginLeft:8 }}>{(f.size/1024/1024).toFixed(2)} MB</span>
                        </div>
                      ))}
                      {isMulti && <div style={{ color:"#3B82F6",fontSize:12,marginTop:8 }}>{t('tools.dropzone.addMore')}</div>}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize:38,marginBottom:14 }}>☁️</div>
                      <div style={{ fontWeight:700,marginBottom:6,fontSize:15 }}>
                        {isMulti ? t('tools.dropzone.dropMulti') : t('tools.dropzone.dropSingle')}
                      </div>
                      <div style={{ color:"#6B7A99",fontSize:13 }}>{t('tools.dropzone.browse')}</div>
                      <div style={{ color:"#4B5563",fontSize:12,marginTop:10 }}>
                        {t('tools.dropzone.formats', { accept: activeTool.accept || "all", max: usage.isPro?"50":"5" })}
                      </div>
                    </div>
                  )}
                </div>

                {activeTool.type==="split-pdf" && (
                  <div style={{ marginBottom:18 }}>
                    <label style={{ display:"block",color:"#8892AA",fontSize:13,marginBottom:6 }}>{t('tools.splitPageLabel')}</label>
                    <input type="number" min="1" value={splitPage} onChange={e=>setSplitPage(e.target.value)}
                      style={{ width:"100%",background:"#0D1117",border:"1px solid #1E2733",color:"#F0F4FF",padding:"11px 14px",borderRadius:10,fontSize:15,boxSizing:"border-box" }} />
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="fade-in" style={{ background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.25)",color:"#FCA5A5",padding:"13px 18px",borderRadius:10,marginBottom:16,fontSize:14 }}>
                ❌ {error}
              </div>
            )}

            {files.length > 0 && !result && (
              <button className="btn-convert" onClick={handleConvert} disabled={loading}
                style={{ width:"100%",background:loading?"#1E3A5F":`linear-gradient(135deg,${activeTc},${activeTc}CC)`,color:"#fff",border:"none",padding:"15px",borderRadius:14,fontSize:16,fontWeight:700,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
                {loading ? (
                  <>
                    <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    {t('tools.converting')}
                  </>
                ) : t('tools.convertBtn')}
              </button>
            )}

            {result && (
              <div className="fade-in" style={{ textAlign:"center",padding:"40px 28px",background:"#0D1117",borderRadius:20,border:"1px solid #1E2733" }}>
                <div style={{ width:64,height:64,borderRadius:"50%",background:"rgba(16,185,129,.12)",border:"1px solid rgba(16,185,129,.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",fontSize:28 }}>
                  ✅
                </div>
                <h3 style={{ fontSize:20,fontWeight:800,marginBottom:6,color:"#F0F4FF" }}>{t('tools.success.title')}</h3>
                <p style={{ color:"#8892AA",marginBottom:26,fontSize:14 }}>{t('tools.success.desc')}</p>
                <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" }}>
                  <button onClick={handleDownload}
                    style={{ background:"linear-gradient(135deg,#10B981,#059669)",color:"#fff",border:"none",padding:"13px 28px",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer" }}>
                    {t('tools.success.download', { filename: result.filename })}
                  </button>
                  <button onClick={reset}
                    style={{ background:"#131922",color:"#8892AA",border:"1px solid #1E2733",padding:"13px 20px",borderRadius:12,fontSize:14,cursor:"pointer" }}>
                    {t('tools.success.another')}
                  </button>
                </div>
              </div>
            )}

            {!usage.isPro && !result && (
              <div style={{ marginTop:22 }}>
                {bannerAdHtml ? (
                  <div ref={bannerRef} style={{ borderRadius:12,overflow:"hidden" }} />
                ) : (
                  <div style={{ background:"#0A0E17",border:"1px solid #1E2733",borderRadius:12,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
                    <span style={{ color:"#4B5563",fontSize:12 }}>{t('tools.adBanner.text')}</span>
                    <span style={{ color:"#3B82F6",fontSize:12,cursor:"pointer" }} onClick={goUpgrade}>{t('tools.adBanner.remove')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showAd && <AdModal onComplete={handleAdComplete} onClose={()=>setShowAd(false)} />}
    </div>
  );
}
