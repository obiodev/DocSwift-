"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CSS = `
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fade-in{animation:fadeIn .3s ease both}
  .spinner{animation:spin 1s linear infinite}
  .step-btn:hover{background:#131922!important;color:#F0F4FF!important}
  .input-field:focus{border-color:#3B82F6!important;outline:none;box-shadow:0 0 0 3px rgba(59,130,246,.1)}
  .color-swatch:hover{transform:scale(1.12)!important}
  .color-swatch{transition:all .15s ease}
  .exp-card:hover{border-color:#1E3A5F!important}
  .exp-card{transition:border-color .15s}
  @media(max-width:900px){
    .cv-layout{flex-direction:column!important}
    .cv-form-panel{flex:none!important;width:100%!important;max-height:none!important;position:relative!important;top:auto!important}
    .cv-preview-panel{display:none!important}
  }
`;

const STEPS = ["Infos","Expériences","Formation","Compétences","Style"];
const COLORS = ["#2563EB","#7C3AED","#059669","#DC2626","#D97706","#0891B2","#1D4ED8","#6D28D9","#047857","#BE185D"];

// ─── Input helpers ─────────────────────────────────────────────────────────
const iStyle = { width:"100%",background:"#0D1117",border:"1px solid #1E2733",color:"#F0F4FF",padding:"10px 14px",borderRadius:10,fontSize:14,boxSizing:"border-box",fontFamily:"inherit" };
const lStyle = { display:"block",fontSize:12,color:"#6B7A99",marginBottom:5,fontWeight:600,letterSpacing:.3 };

function Field({ label, value, onChange, placeholder, type="text" }) {
  return (
    <div>
      <label style={lStyle}>{label}</label>
      <input className="input-field" type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={iStyle} />
    </div>
  );
}
function Area({ label, value, onChange, placeholder, rows=3 }) {
  return (
    <div>
      <label style={lStyle}>{label}</label>
      <textarea className="input-field" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ ...iStyle, resize:"vertical", lineHeight:1.55 }} />
    </div>
  );
}

// ─── Live CV Preview ────────────────────────────────────────────────────────
function CVPreview({ infos, exps, edus, skills, langs, color }) {
  const name    = infos.name    || "Votre Nom";
  const title   = infos.title   || "";
  const contact = [infos.email, infos.phone, infos.address, infos.website].filter(Boolean).join("  ·  ");
  const validExps = exps.filter(e=>e.position||e.company);
  const validEdus = edus.filter(e=>e.degree||e.school);
  const validSkills = skills.filter(Boolean);
  const validLangs  = langs.filter(l=>l.lang);

  const SecHeader = ({ label }) => (
    <div style={{ background:"#f3f4f6",borderLeft:`3px solid ${color}`,padding:"4px 10px",marginBottom:6,marginTop:2 }}>
      <span style={{ fontSize:9,fontWeight:900,color:color,letterSpacing:1.5,textTransform:"uppercase" }}>{label}</span>
    </div>
  );

  return (
    <div style={{ background:"#fff",color:"#111",fontFamily:"Arial,sans-serif",fontSize:10,borderRadius:8,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.5)",height:"100%" }}>
      {/* Header */}
      <div style={{ background:color,padding:"18px 20px",color:"#fff" }}>
        <div style={{ fontSize:20,fontWeight:900,letterSpacing:-0.5 }}>{name}</div>
        {title && <div style={{ fontSize:11,opacity:.9,marginTop:3,fontWeight:500 }}>{title}</div>}
        {contact && <div style={{ fontSize:9,opacity:.8,marginTop:6,letterSpacing:.2 }}>{contact}</div>}
      </div>

      <div style={{ padding:"14px 20px" }}>
        {/* Summary */}
        {infos.summary && (
          <div style={{ marginBottom:12 }}>
            <SecHeader label="Profil" />
            <p style={{ fontSize:9.5,lineHeight:1.55,color:"#333",margin:0 }}>{infos.summary.slice(0,200)}{infos.summary.length>200?"...":""}</p>
          </div>
        )}

        {/* Experiences */}
        {validExps.length>0 && (
          <div style={{ marginBottom:12 }}>
            <SecHeader label="Expériences" />
            {validExps.slice(0,3).map((exp,i)=>(
              <div key={i} style={{ marginBottom:8 }}>
                <div style={{ fontWeight:700,fontSize:10 }}>{exp.position}</div>
                <div style={{ color:"#666",fontSize:9,marginTop:1 }}>
                  {[exp.company,[exp.startDate,exp.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ")}
                </div>
                {exp.description && <p style={{ fontSize:9,color:"#444",marginTop:2,lineHeight:1.45,margin:0 }}>• {exp.description.slice(0,100)}{exp.description.length>100?"...":""}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {validEdus.length>0 && (
          <div style={{ marginBottom:12 }}>
            <SecHeader label="Formation" />
            {validEdus.slice(0,3).map((edu,i)=>(
              <div key={i} style={{ marginBottom:6 }}>
                <div style={{ fontWeight:700,fontSize:10 }}>{edu.degree}</div>
                <div style={{ color:"#666",fontSize:9,marginTop:1 }}>
                  {[edu.school,[edu.startDate,edu.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ")}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {validSkills.length>0 && (
          <div style={{ marginBottom:12 }}>
            <SecHeader label="Compétences" />
            <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginTop:4 }}>
              {validSkills.map((s,i)=>(
                <span key={i} style={{ background:color+"18",color:color,border:`1px solid ${color}30`,borderRadius:4,padding:"2px 7px",fontSize:8.5,fontWeight:600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {validLangs.length>0 && (
          <div>
            <SecHeader label="Langues" />
            {validLangs.map((l,i)=>(
              <div key={i} style={{ fontSize:9.5,marginTop:3,color:"#333" }}>
                <strong>{l.lang}</strong>{l.level ? ` — ${l.level}` : ""}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop:"1px solid #eee",padding:"6px 20px",marginTop:"auto" }}>
        <div style={{ fontSize:7.5,color:"#bbb",textAlign:"right" }}>Créé avec DocSwift — getdocswift.com</div>
      </div>
    </div>
  );
}

// ─── Step 1 — Infos ─────────────────────────────────────────────────────────
function StepInfos({ data, set }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <Field label="Prénom & Nom *" value={data.name}    onChange={v=>set("name",v)}    placeholder="Jean Dupont" />
        <Field label="Poste visé"      value={data.title}   onChange={v=>set("title",v)}   placeholder="Développeur Web" />
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <Field label="Email"     value={data.email}   onChange={v=>set("email",v)}   placeholder="jean@email.com"  type="email" />
        <Field label="Téléphone" value={data.phone}   onChange={v=>set("phone",v)}   placeholder="+33 6 12 34 56 78" />
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <Field label="Adresse"          value={data.address} onChange={v=>set("address",v)} placeholder="Paris, France" />
        <Field label="Site web / LinkedIn" value={data.website} onChange={v=>set("website",v)} placeholder="linkedin.com/in/jean" />
      </div>
      <Area label="Résumé / Profil" value={data.summary} onChange={v=>set("summary",v)}
        placeholder="Développeur passionné avec 5 ans d'expérience..." rows={4} />
    </div>
  );
}

// ─── Step 2 — Expériences ───────────────────────────────────────────────────
function StepExp({ exps, setExps }) {
  const add = ()    => setExps(e=>[...e,{position:"",company:"",startDate:"",endDate:"",description:""}]);
  const upd = (i,k,v)=> setExps(e=>e.map((x,j)=>j===i?{...x,[k]:v}:x));
  const del = (i)   => setExps(e=>e.filter((_,j)=>j!==i));
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      {exps.map((exp,i)=>(
        <div key={i} className="exp-card" style={{ background:"#0A0E17",border:"1px solid #1E2733",borderRadius:14,padding:20,position:"relative" }}>
          <button onClick={()=>del(i)} style={{ position:"absolute",top:12,right:12,background:"rgba(239,68,68,.1)",border:"none",color:"#FCA5A5",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:12 }}>✕</button>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <Field label="Poste *"    value={exp.position} onChange={v=>upd(i,"position",v)} placeholder="Développeur Full Stack" />
              <Field label="Entreprise" value={exp.company}  onChange={v=>upd(i,"company",v)}  placeholder="Google" />
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <Field label="Date début" value={exp.startDate} onChange={v=>upd(i,"startDate",v)} placeholder="Jan 2022" />
              <Field label="Date fin"   value={exp.endDate}   onChange={v=>upd(i,"endDate",v)}   placeholder="Aujourd'hui" />
            </div>
            <Area label="Description" value={exp.description} onChange={v=>upd(i,"description",v)}
              placeholder="Développement de l'application React, APIs REST..." rows={2} />
          </div>
        </div>
      ))}
      <button onClick={add} style={{ background:"rgba(59,130,246,.08)",border:"1px dashed rgba(59,130,246,.3)",color:"#60A5FA",padding:"10px",borderRadius:12,fontSize:13,cursor:"pointer",width:"100%",marginTop:4 }}>
        + Ajouter une expérience
      </button>
    </div>
  );
}

// ─── Step 3 — Formation ─────────────────────────────────────────────────────
function StepEdu({ edus, setEdus }) {
  const add = ()    => setEdus(e=>[...e,{degree:"",school:"",startDate:"",endDate:""}]);
  const upd = (i,k,v)=> setEdus(e=>e.map((x,j)=>j===i?{...x,[k]:v}:x));
  const del = (i)   => setEdus(e=>e.filter((_,j)=>j!==i));
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      {edus.map((edu,i)=>(
        <div key={i} className="exp-card" style={{ background:"#0A0E17",border:"1px solid #1E2733",borderRadius:14,padding:20,position:"relative" }}>
          <button onClick={()=>del(i)} style={{ position:"absolute",top:12,right:12,background:"rgba(239,68,68,.1)",border:"none",color:"#FCA5A5",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:12 }}>✕</button>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <Field label="Diplôme *"         value={edu.degree} onChange={v=>upd(i,"degree",v)} placeholder="Master Informatique" />
              <Field label="École / Université" value={edu.school} onChange={v=>upd(i,"school",v)} placeholder="Université Paris" />
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <Field label="Date début" value={edu.startDate} onChange={v=>upd(i,"startDate",v)} placeholder="Sep 2018" />
              <Field label="Date fin"   value={edu.endDate}   onChange={v=>upd(i,"endDate",v)}   placeholder="Juin 2020" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} style={{ background:"rgba(59,130,246,.08)",border:"1px dashed rgba(59,130,246,.3)",color:"#60A5FA",padding:"10px",borderRadius:12,fontSize:13,cursor:"pointer",width:"100%",marginTop:4 }}>
        + Ajouter une formation
      </button>
    </div>
  );
}

// ─── Step 4 — Compétences ───────────────────────────────────────────────────
function StepSkills({ skills, setSkills, langs, setLangs }) {
  const addSkill = ()     => setSkills(s=>[...s,""]);
  const updSkill = (i,v)  => setSkills(s=>s.map((x,j)=>j===i?v:x));
  const delSkill = (i)    => setSkills(s=>s.filter((_,j)=>j!==i));
  const addLang  = ()     => setLangs(l=>[...l,{lang:"",level:""}]);
  const updLang  = (i,k,v)=> setLangs(l=>l.map((x,j)=>j===i?{...x,[k]:v}:x));
  const delLang  = (i)    => setLangs(l=>l.filter((_,j)=>j!==i));

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:28 }}>
      <div>
        <div style={{ fontWeight:700,marginBottom:14,color:"#F0F4FF" }}>Compétences techniques & soft skills</div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginBottom:10 }}>
          {skills.map((s,i)=>(
            <div key={i} style={{ display:"flex",alignItems:"center",gap:6,background:"#0A0E17",border:"1px solid #1E2733",borderRadius:8,padding:"5px 10px" }}>
              <input value={s} onChange={e=>updSkill(i,e.target.value)} placeholder="Ex: React"
                style={{ background:"transparent",border:"none",color:"#F0F4FF",fontSize:13,outline:"none",width:90 }} />
              <button onClick={()=>delSkill(i)} style={{ background:"none",border:"none",color:"#4B5563",cursor:"pointer",fontSize:12 }}>✕</button>
            </div>
          ))}
        </div>
        <button onClick={addSkill} style={{ background:"rgba(59,130,246,.08)",border:"1px dashed rgba(59,130,246,.3)",color:"#60A5FA",padding:"8px 16px",borderRadius:8,fontSize:13,cursor:"pointer" }}>
          + Ajouter une compétence
        </button>
      </div>

      <div>
        <div style={{ fontWeight:700,marginBottom:14,color:"#F0F4FF" }}>Langues</div>
        {langs.map((l,i)=>(
          <div key={i} style={{ display:"flex",gap:10,alignItems:"center",marginBottom:10 }}>
            <input className="input-field" value={l.lang} onChange={e=>updLang(i,"lang",e.target.value)} placeholder="Français"
              style={{ ...iStyle,flex:1 }} />
            <select className="input-field" value={l.level} onChange={e=>updLang(i,"level",e.target.value)}
              style={{ ...iStyle,width:160 }}>
              <option value="">Niveau</option>
              {["Natif","Courant (C1/C2)","Avancé (B2)","Intermédiaire (B1)","Débutant (A1/A2)"].map(v=><option key={v} value={v}>{v}</option>)}
            </select>
            <button onClick={()=>delLang(i)} style={{ background:"rgba(239,68,68,.1)",border:"none",color:"#FCA5A5",borderRadius:6,padding:"8px 10px",cursor:"pointer" }}>✕</button>
          </div>
        ))}
        <button onClick={addLang} style={{ background:"rgba(59,130,246,.08)",border:"1px dashed rgba(59,130,246,.3)",color:"#60A5FA",padding:"8px 16px",borderRadius:8,fontSize:13,cursor:"pointer" }}>
          + Ajouter une langue
        </button>
      </div>
    </div>
  );
}

// ─── Step 5 — Style ─────────────────────────────────────────────────────────
function StepStyle({ color, setColor }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:24 }}>
      <div>
        <div style={{ fontWeight:700,marginBottom:6,color:"#F0F4FF" }}>Couleur principale</div>
        <div style={{ color:"#6B7A99",fontSize:13,marginBottom:16 }}>Cette couleur sera utilisée pour l'en-tête et les accents de votre CV.</div>
        <div style={{ display:"flex",gap:12,flexWrap:"wrap",alignItems:"center" }}>
          {COLORS.map(c=>(
            <div key={c} className="color-swatch" onClick={()=>setColor(c)}
              style={{ width:38,height:38,borderRadius:"50%",background:c,cursor:"pointer",border:`3px solid ${color===c?"#fff":"transparent"}`,boxShadow:color===c?`0 0 0 2px ${c},0 4px 12px ${c}66`:"none",flexShrink:0 }} />
          ))}
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <input type="color" value={color} onChange={e=>setColor(e.target.value)}
              style={{ width:38,height:38,borderRadius:"50%",border:"2px solid #1E2733",cursor:"pointer",background:"none",padding:0 }} />
            <span style={{ fontSize:12,color:"#6B7A99" }}>Couleur personnalisée</span>
          </div>
        </div>
      </div>

      <div style={{ background:"#0A0E17",border:"1px solid #1E2733",borderRadius:14,padding:"18px 20px" }}>
        <div style={{ fontSize:12,color:"#6B7A99",marginBottom:12,fontWeight:600 }}>APERÇU DE L'EN-TÊTE</div>
        <div style={{ borderRadius:10,overflow:"hidden" }}>
          <div style={{ background:color,padding:"18px 22px" }}>
            <div style={{ fontSize:20,fontWeight:900,color:"#fff" }}>Jean Dupont</div>
            <div style={{ fontSize:12,color:"rgba(255,255,255,.85)",marginTop:3 }}>Développeur Web Senior</div>
            <div style={{ fontSize:10,color:"rgba(255,255,255,.7)",marginTop:6 }}>jean@email.com  ·  +33 6 12 34 56 78  ·  Paris</div>
          </div>
          <div style={{ background:"#f8f9fa",padding:"14px 22px" }}>
            <div style={{ background:"#eee",borderLeft:`3px solid ${color}`,padding:"4px 10px",marginBottom:8 }}>
              <span style={{ fontSize:9,fontWeight:900,color:color,letterSpacing:1.5,textTransform:"uppercase" }}>Expériences</span>
            </div>
            <div style={{ fontSize:11,color:"#111",fontWeight:700 }}>Développeur Full Stack</div>
            <div style={{ fontSize:10,color:"#666",marginTop:2 }}>Google  |  Jan 2022 – Aujourd'hui</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function CVPage() {
  const router   = useRouter();
  const [step,    setStep]   = useState(0);
  const [loading, setLoading]= useState(false);
  const [infos,   setInfos]  = useState({ name:"",title:"",email:"",phone:"",address:"",website:"",summary:"" });
  const [exps,    setExps]   = useState([{ position:"",company:"",startDate:"",endDate:"",description:"" }]);
  const [edus,    setEdus]   = useState([{ degree:"",school:"",startDate:"",endDate:"" }]);
  const [skills,  setSkills] = useState(["","",""]);
  const [langs,   setLangs]  = useState([{ lang:"",level:"" }]);
  const [color,   setColor]  = useState("#2563EB");

  const setInfo = (k,v) => setInfos(i=>({...i,[k]:v}));

  const generate = async () => {
    if (!infos.name.trim()) { alert("Veuillez entrer votre nom."); setStep(0); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/cv",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          ...infos,
          experiences: exps.filter(e=>e.position||e.company),
          educations:  edus.filter(e=>e.degree||e.school),
          skills:      skills.filter(Boolean),
          languages:   langs.filter(l=>l.lang),
          accentColor: color,
        }),
      });
      if (!res.ok) throw new Error("Erreur génération");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement("a"),{ href:url, download:`${infos.name.replace(/\s+/g,"_")}_CV.pdf` });
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { alert("Erreur lors de la génération. Réessayez."); }
    finally { setLoading(false); }
  };

  const stepLabels = STEPS.map((s,i) => ({
    label: s,
    done:  i < step,
    active:i === step,
  }));

  return (
    <div style={{ minHeight:"100vh",background:"#07090F",color:"#F0F4FF",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"14px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(7,9,15,.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1E2733" }}>
        <div style={{ fontWeight:900,fontSize:20,letterSpacing:-1,cursor:"pointer" }} onClick={()=>router.push("/")}>
          Doc<span style={{ color:"#3B82F6" }}>Swift</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:16 }}>
          <button onClick={()=>router.push("/tools")} style={{ background:"none",border:"1px solid #1E2733",color:"#8892AA",padding:"7px 14px",borderRadius:8,fontSize:13,cursor:"pointer" }}>
            ← Retour aux outils
          </button>
          {infos.name && (
            <button onClick={generate} disabled={loading} style={{ background:loading?"#1E3A5F":"linear-gradient(135deg,#10B981,#059669)",color:"#fff",border:"none",padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:700,cursor:loading?"not-allowed":"pointer" }}>
              {loading ? "Génération..." : "⬇️ Télécharger PDF"}
            </button>
          )}
        </div>
      </nav>

      {/* Main layout */}
      <div className="cv-layout" style={{ display:"flex",gap:0,paddingTop:58,height:"100vh" }}>

        {/* ── LEFT: Form panel ── */}
        <div className="cv-form-panel" style={{ flex:"0 0 520px",overflowY:"auto",padding:"32px 32px 60px",borderRight:"1px solid #1E2733",background:"#07090F" }}>

          {/* Header */}
          <div style={{ marginBottom:28 }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:6 }}>
              <div style={{ fontSize:28 }}>📄</div>
              <div>
                <h1 style={{ fontSize:22,fontWeight:900,letterSpacing:-0.5,margin:0 }}>Créer mon CV</h1>
                <p style={{ color:"#6B7A99",fontSize:13,margin:0 }}>Aperçu en direct sur la droite</p>
              </div>
            </div>
          </div>

          {/* Step tabs */}
          <div style={{ display:"flex",gap:0,marginBottom:28,borderRadius:12,overflow:"hidden",border:"1px solid #1E2733" }}>
            {stepLabels.map((s,i)=>(
              <button key={s.label} className="step-btn" onClick={()=>setStep(i)}
                style={{ flex:1,padding:"9px 4px",border:"none",fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s",
                  background:s.active?"#3B82F6":s.done?"#0D2A4A":"#0D1117",
                  color:s.active?"#fff":s.done?"#60A5FA":"#6B7A99",
                  borderRight:i<STEPS.length-1?"1px solid #1E2733":"none" }}>
                {s.done?"✓ ":""}{s.label}
              </button>
            ))}
          </div>

          {/* Step content */}
          <div className="fade-in" key={step} style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:16,padding:24,marginBottom:20 }}>
            {step===0 && <StepInfos data={infos} set={setInfo} />}
            {step===1 && <StepExp   exps={exps}  setExps={setExps} />}
            {step===2 && <StepEdu   edus={edus}  setEdus={setEdus} />}
            {step===3 && <StepSkills skills={skills} setSkills={setSkills} langs={langs} setLangs={setLangs} />}
            {step===4 && <StepStyle color={color} setColor={setColor} />}
          </div>

          {/* Navigation */}
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",gap:12 }}>
            <button onClick={()=>setStep(s=>Math.max(0,s-1))}
              style={{ background:"transparent",border:"1px solid #1E2733",color:"#8892AA",padding:"11px 22px",borderRadius:10,fontSize:14,cursor:"pointer",opacity:step===0?0:1,pointerEvents:step===0?"none":"auto" }}>
              ← Précédent
            </button>
            {step < STEPS.length-1 ? (
              <button onClick={()=>setStep(s=>s+1)}
                style={{ background:"linear-gradient(135deg,#3B82F6,#2563EB)",color:"#fff",border:"none",padding:"11px 28px",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer" }}>
                Suivant →
              </button>
            ) : (
              <button onClick={generate} disabled={loading}
                style={{ background:loading?"#1E3A5F":"linear-gradient(135deg,#10B981,#059669)",color:"#fff",border:"none",padding:"12px 28px",borderRadius:10,fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:8 }}>
                {loading ? (
                  <><svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>Génération...</>
                ) : "⬇️ Télécharger mon CV PDF"}
              </button>
            )}
          </div>

          {step < STEPS.length-1 && infos.name && (
            <div style={{ textAlign:"center",marginTop:14 }}>
              <button onClick={generate} disabled={loading} style={{ background:"none",border:"none",color:"#4B5563",fontSize:12,cursor:"pointer",textDecoration:"underline" }}>
                {loading?"Génération...":"Générer maintenant avec les infos actuelles"}
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Live preview panel ── */}
        <div className="cv-preview-panel" style={{ flex:1,overflowY:"auto",padding:"32px",background:"#030508",display:"flex",flexDirection:"column" }}>
          <div style={{ marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div>
              <div style={{ fontWeight:700,fontSize:15,color:"#F0F4FF" }}>Aperçu en direct</div>
              <div style={{ color:"#6B7A99",fontSize:12,marginTop:2 }}>Se met à jour à chaque modification</div>
            </div>
            <div style={{ display:"flex",gap:6 }}>
              <div style={{ width:10,height:10,borderRadius:"50%",background:"#EF4444" }} />
              <div style={{ width:10,height:10,borderRadius:"50%",background:"#F59E0B" }} />
              <div style={{ width:10,height:10,borderRadius:"50%",background:"#10B981" }} />
            </div>
          </div>
          <div style={{ flex:1,maxWidth:480,margin:"0 auto",width:"100%" }}>
            <CVPreview infos={infos} exps={exps} edus={edus} skills={skills} langs={langs} color={color} />
          </div>
          <p style={{ textAlign:"center",color:"#2A3547",fontSize:11,marginTop:16 }}>
            Aperçu illustratif · Le PDF final peut légèrement différer
          </p>
        </div>
      </div>
    </div>
  );
}
