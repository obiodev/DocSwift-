"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from '../../../components/LanguageSwitcher';

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
  .tpl-card:hover{border-color:#3B82F6!important}
  .tpl-card{transition:border-color .15s,transform .15s}
  .tpl-card:hover{transform:translateY(-2px)}
  .photo-zone:hover{border-color:#3B82F6!important;background:rgba(59,130,246,.08)!important}
  .photo-zone{transition:border-color .15s,background .15s}
  @media(max-width:900px){
    .cv-layout{flex-direction:column!important}
    .cv-form-panel{flex:none!important;width:100%!important;max-height:none!important;position:relative!important;top:auto!important}
    .cv-preview-panel{display:none!important}
    .cv-nav-wrap{padding:10px 16px!important}
    .cv-form-panel{padding:20px 16px 60px!important}
    .cv-usage-bar{display:none!important}
    .cv-back-btn span{display:none!important}
  }
  @media(max-width:480px){
    .cv-nav-wrap{padding:8px 12px!important}
  }
`;

const COLORS = ["#2563EB","#7C3AED","#059669","#DC2626","#D97706","#0891B2","#1D4ED8","#6D28D9","#047857","#BE185D"];

const iStyle = { width:"100%",background:"#0D1117",border:"1px solid #1E2733",color:"#F0F4FF",padding:"10px 14px",borderRadius:10,fontSize:14,boxSizing:"border-box",fontFamily:"inherit" };
const lStyle = { display:"block",fontSize:12,color:"#6B7A99",marginBottom:5,fontWeight:600,letterSpacing:.3 };

function Field({ label, value, onChange, placeholder, type="text" }) {
  return (
    <div>
      {label && <label style={lStyle}>{label}</label>}
      <input className="input-field" type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={iStyle} />
    </div>
  );
}
function Area({ label, value, onChange, placeholder, rows=3 }) {
  return (
    <div>
      {label && <label style={lStyle}>{label}</label>}
      <textarea className="input-field" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ ...iStyle, resize:"vertical", lineHeight:1.55 }} />
    </div>
  );
}

// ─── Live CV Preview ─────────────────────────────────────────────────────────
function CVPreview({ infos, exps, edus, skills, langs, color, photo, projects, certifications, interests, template, sections }) {
  const name       = infos.name  || sections.yourName;
  const titleText  = infos.title || "";
  const contact    = [infos.email, infos.phone, infos.address, infos.website].filter(Boolean).join("  ·  ");
  const validExps  = exps.filter(e=>e.position||e.company);
  const validEdus  = edus.filter(e=>e.degree||e.school);
  const validSkills= skills.filter(Boolean);
  const validLangs = langs.filter(l=>l.lang);
  const validProjs = projects.filter(p=>p.name);
  const validCerts = certifications.filter(c=>c.title);
  const interestTags = interests ? interests.split(",").map(s=>s.trim()).filter(Boolean) : [];

  const s = sections;

  if (template === "moderne") {
    return (
      <div style={{ background:"#fff",color:"#111",fontFamily:"Arial,sans-serif",fontSize:10,borderRadius:8,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.5)",height:"100%",display:"flex" }}>
        <div style={{ width:"35%",background:color,padding:"18px 14px",color:"#fff",display:"flex",flexDirection:"column",gap:10,flexShrink:0 }}>
          {photo && (
            <div style={{ width:60,height:60,borderRadius:"50%",overflow:"hidden",margin:"0 auto 6px",border:"2px solid rgba(255,255,255,.4)",flexShrink:0 }}>
              <img src={photo} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} />
            </div>
          )}
          <div style={{ fontSize:13,fontWeight:900,textAlign:"center",letterSpacing:-0.3 }}>{name}</div>
          {titleText && <div style={{ fontSize:9,opacity:.85,textAlign:"center",marginTop:-6 }}>{titleText}</div>}
          <div style={{ borderBottom:"1px solid rgba(255,255,255,.3)",paddingBottom:8 }}>
            {[infos.email,infos.phone,infos.address,infos.website].filter(Boolean).map((c,i)=>(
              <div key={i} style={{ fontSize:8,opacity:.85,marginTop:3 }}>· {c}</div>
            ))}
          </div>
          {validSkills.length>0 && (
            <div>
              <div style={{ fontSize:8,fontWeight:900,letterSpacing:1.2,opacity:.7,marginBottom:5,textTransform:"uppercase" }}>{s.skills}</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:3 }}>
                {validSkills.slice(0,8).map((sk,i)=>(
                  <span key={i} style={{ background:"rgba(255,255,255,.18)",borderRadius:3,padding:"2px 6px",fontSize:8,fontWeight:600 }}>{sk}</span>
                ))}
              </div>
            </div>
          )}
          {validLangs.length>0 && (
            <div>
              <div style={{ fontSize:8,fontWeight:900,letterSpacing:1.2,opacity:.7,marginBottom:5,textTransform:"uppercase" }}>{s.languages}</div>
              {validLangs.map((l,i)=>(
                <div key={i} style={{ fontSize:8.5,marginTop:2 }}>{l.lang}{l.level?` — ${l.level}`:""}</div>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex:1,padding:"14px 16px",overflowY:"auto" }}>
          {infos.summary && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:8,fontWeight:900,color:color,letterSpacing:1.2,textTransform:"uppercase",borderLeft:`3px solid ${color}`,paddingLeft:6,marginBottom:5 }}>{s.profile}</div>
              <p style={{ fontSize:9,lineHeight:1.5,color:"#444",margin:0 }}>{infos.summary.slice(0,180)}{infos.summary.length>180?"...":""}</p>
            </div>
          )}
          {validExps.length>0 && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:8,fontWeight:900,color:color,letterSpacing:1.2,textTransform:"uppercase",borderLeft:`3px solid ${color}`,paddingLeft:6,marginBottom:5 }}>{s.experience}</div>
              {validExps.slice(0,3).map((exp,i)=>(
                <div key={i} style={{ marginBottom:7 }}>
                  <div style={{ fontWeight:700,fontSize:10 }}>{exp.position}</div>
                  <div style={{ color:"#777",fontSize:8.5,marginTop:1 }}>{[exp.company,[exp.startDate,exp.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ")}</div>
                  {exp.description && <p style={{ fontSize:8.5,color:"#555",marginTop:2,lineHeight:1.4,margin:0 }}>• {exp.description.slice(0,90)}{exp.description.length>90?"...":""}</p>}
                </div>
              ))}
            </div>
          )}
          {validEdus.length>0 && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:8,fontWeight:900,color:color,letterSpacing:1.2,textTransform:"uppercase",borderLeft:`3px solid ${color}`,paddingLeft:6,marginBottom:5 }}>{s.education}</div>
              {validEdus.slice(0,3).map((edu,i)=>(
                <div key={i} style={{ marginBottom:6 }}>
                  <div style={{ fontWeight:700,fontSize:10 }}>{edu.degree}</div>
                  <div style={{ color:"#777",fontSize:8.5,marginTop:1 }}>{[edu.school,[edu.startDate,edu.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ")}</div>
                </div>
              ))}
            </div>
          )}
          {validProjs.length>0 && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:8,fontWeight:900,color:color,letterSpacing:1.2,textTransform:"uppercase",borderLeft:`3px solid ${color}`,paddingLeft:6,marginBottom:5 }}>{s.projects}</div>
              {validProjs.slice(0,2).map((p,i)=>(
                <div key={i} style={{ marginBottom:5 }}>
                  <div style={{ fontWeight:700,fontSize:9.5 }}>{p.name}</div>
                  {p.tech && <div style={{ color:"#777",fontSize:8 }}>{p.tech}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ position:"absolute",bottom:0,right:0,padding:"5px 14px",borderTop:"1px solid #eee",width:"65%",boxSizing:"border-box" }}>
          <div style={{ fontSize:7,color:"#ccc",textAlign:"right" }}>{s.createdWith}</div>
        </div>
      </div>
    );
  }

  if (template === "minimaliste") {
    const SecHeader = ({ label }) => (
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5,marginTop:2 }}>
        <div style={{ height:1,width:16,background:color }} />
        <span style={{ fontSize:9,fontWeight:900,color:color,letterSpacing:1.5,textTransform:"uppercase" }}>{label}</span>
        <div style={{ flex:1,height:1,background:"#eee" }} />
      </div>
    );
    return (
      <div style={{ background:"#fff",color:"#111",fontFamily:"Arial,sans-serif",fontSize:10,borderRadius:8,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.5)",height:"100%" }}>
        <div style={{ padding:"18px 20px 0",position:"relative" }}>
          {photo && (
            <div style={{ position:"absolute",top:16,right:20,width:50,height:50,overflow:"hidden",border:"1px solid #eee" }}>
              <img src={photo} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} />
            </div>
          )}
          <div style={{ fontSize:22,fontWeight:900,letterSpacing:-0.5,color:"#111" }}>{name}</div>
          {titleText && <div style={{ fontSize:11,color:"#888",marginTop:2 }}>{titleText}</div>}
          <div style={{ height:2,background:color,marginTop:8,marginBottom:5,width:"100%" }} />
          {contact && <div style={{ fontSize:8.5,color:"#888",marginBottom:12 }}>{contact}</div>}
        </div>
        <div style={{ padding:"0 20px 14px" }}>
          {infos.summary && (
            <div style={{ marginBottom:10 }}>
              <SecHeader label={s.profile} />
              <p style={{ fontSize:9.5,lineHeight:1.55,color:"#444",margin:0 }}>{infos.summary.slice(0,200)}{infos.summary.length>200?"...":""}</p>
            </div>
          )}
          {validExps.length>0 && (
            <div style={{ marginBottom:10 }}>
              <SecHeader label={s.experience} />
              {validExps.slice(0,3).map((exp,i)=>(
                <div key={i} style={{ marginBottom:7 }}>
                  <div style={{ fontWeight:700,fontSize:10 }}>{exp.position}</div>
                  <div style={{ color:"#999",fontSize:9,marginTop:1 }}>{[exp.company,[exp.startDate,exp.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ")}</div>
                  {exp.description && <p style={{ fontSize:9,color:"#555",marginTop:2,lineHeight:1.4,margin:0 }}>• {exp.description.slice(0,90)}{exp.description.length>90?"...":""}</p>}
                </div>
              ))}
            </div>
          )}
          {validEdus.length>0 && (
            <div style={{ marginBottom:10 }}>
              <SecHeader label={s.education} />
              {validEdus.slice(0,2).map((edu,i)=>(
                <div key={i} style={{ marginBottom:5 }}>
                  <div style={{ fontWeight:700,fontSize:10 }}>{edu.degree}</div>
                  <div style={{ color:"#999",fontSize:9,marginTop:1 }}>{[edu.school,[edu.startDate,edu.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ")}</div>
                </div>
              ))}
            </div>
          )}
          {validSkills.length>0 && (
            <div style={{ marginBottom:10 }}>
              <SecHeader label={s.skills} />
              <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginTop:4 }}>
                {validSkills.slice(0,8).map((sk,i)=>(
                  <span key={i} style={{ border:`1px solid ${color}`,borderRadius:3,padding:"2px 7px",fontSize:8.5,color:color,fontWeight:600 }}>{sk}</span>
                ))}
              </div>
            </div>
          )}
          {validProjs.length>0 && (
            <div style={{ marginBottom:10 }}>
              <SecHeader label={s.projects} />
              {validProjs.slice(0,2).map((p,i)=>(
                <div key={i} style={{ marginBottom:5 }}>
                  <span style={{ fontWeight:700,fontSize:9.5 }}>{p.name}</span>
                  {p.tech && <span style={{ color:"#888",fontSize:8.5 }}> — {p.tech}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ borderTop:"1px solid #eee",padding:"5px 20px" }}>
          <div style={{ fontSize:7.5,color:"#ccc",textAlign:"right" }}>{s.createdWith}</div>
        </div>
      </div>
    );
  }

  // Default: classique
  const SecHeader = ({ label }) => (
    <div style={{ background:"#f3f4f6",borderLeft:`3px solid ${color}`,padding:"4px 10px",marginBottom:6,marginTop:2 }}>
      <span style={{ fontSize:9,fontWeight:900,color:color,letterSpacing:1.5,textTransform:"uppercase" }}>{label}</span>
    </div>
  );

  return (
    <div style={{ background:"#fff",color:"#111",fontFamily:"Arial,sans-serif",fontSize:10,borderRadius:8,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.5)",height:"100%" }}>
      <div style={{ background:color,padding:"18px 20px",color:"#fff",position:"relative" }}>
        {photo && (
          <div style={{ position:"absolute",top:14,right:16,width:54,height:54,overflow:"hidden",border:"2px solid rgba(255,255,255,.4)" }}>
            <img src={photo} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} />
          </div>
        )}
        <div style={{ fontSize:20,fontWeight:900,letterSpacing:-0.5,paddingRight:photo?60:0 }}>{name}</div>
        {titleText && <div style={{ fontSize:11,opacity:.9,marginTop:3,fontWeight:500 }}>{titleText}</div>}
        {contact && <div style={{ fontSize:9,opacity:.8,marginTop:6,letterSpacing:.2 }}>{contact}</div>}
      </div>

      <div style={{ padding:"14px 20px" }}>
        {infos.summary && (
          <div style={{ marginBottom:12 }}>
            <SecHeader label={s.profile} />
            <p style={{ fontSize:9.5,lineHeight:1.55,color:"#333",margin:0 }}>{infos.summary.slice(0,200)}{infos.summary.length>200?"...":""}</p>
          </div>
        )}
        {validExps.length>0 && (
          <div style={{ marginBottom:12 }}>
            <SecHeader label={s.experience} />
            {validExps.slice(0,3).map((exp,i)=>(
              <div key={i} style={{ marginBottom:8 }}>
                <div style={{ fontWeight:700,fontSize:10 }}>{exp.position}</div>
                <div style={{ color:"#666",fontSize:9,marginTop:1 }}>{[exp.company,[exp.startDate,exp.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ")}</div>
                {exp.description && <p style={{ fontSize:9,color:"#444",marginTop:2,lineHeight:1.45,margin:0 }}>• {exp.description.slice(0,100)}{exp.description.length>100?"...":""}</p>}
              </div>
            ))}
          </div>
        )}
        {validEdus.length>0 && (
          <div style={{ marginBottom:12 }}>
            <SecHeader label={s.education} />
            {validEdus.slice(0,3).map((edu,i)=>(
              <div key={i} style={{ marginBottom:6 }}>
                <div style={{ fontWeight:700,fontSize:10 }}>{edu.degree}</div>
                <div style={{ color:"#666",fontSize:9,marginTop:1 }}>{[edu.school,[edu.startDate,edu.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ")}</div>
              </div>
            ))}
          </div>
        )}
        {validSkills.length>0 && (
          <div style={{ marginBottom:12 }}>
            <SecHeader label={s.skills} />
            <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginTop:4 }}>
              {validSkills.map((sk,i)=>(
                <span key={i} style={{ background:color+"18",color:color,border:`1px solid ${color}30`,borderRadius:4,padding:"2px 7px",fontSize:8.5,fontWeight:600 }}>{sk}</span>
              ))}
            </div>
          </div>
        )}
        {validLangs.length>0 && (
          <div style={{ marginBottom:12 }}>
            <SecHeader label={s.languages} />
            {validLangs.map((l,i)=>(
              <div key={i} style={{ fontSize:9.5,marginTop:3,color:"#333" }}><strong>{l.lang}</strong>{l.level?` — ${l.level}`:""}</div>
            ))}
          </div>
        )}
        {validProjs.length>0 && (
          <div style={{ marginBottom:12 }}>
            <SecHeader label={s.projects} />
            {validProjs.slice(0,3).map((p,i)=>(
              <div key={i} style={{ marginBottom:6 }}>
                <div style={{ fontWeight:700,fontSize:10 }}>{p.name}</div>
                {p.tech && <div style={{ color:"#888",fontSize:8.5 }}>{p.tech}</div>}
                {p.description && <p style={{ fontSize:9,color:"#555",marginTop:1,lineHeight:1.4,margin:0 }}>{p.description.slice(0,80)}{p.description.length>80?"...":""}</p>}
              </div>
            ))}
          </div>
        )}
        {validCerts.length>0 && (
          <div style={{ marginBottom:12 }}>
            <SecHeader label={s.certifications} />
            {validCerts.slice(0,3).map((c,i)=>(
              <div key={i} style={{ fontSize:9.5,marginTop:3,color:"#333" }}><strong>{c.title}</strong>{c.org?` — ${c.org}`:""}  {c.year?`(${c.year})`:""}</div>
            ))}
          </div>
        )}
        {interestTags.length>0 && (
          <div>
            <SecHeader label={s.interests} />
            <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginTop:4 }}>
              {interestTags.map((tag,i)=>(
                <span key={i} style={{ background:"#f3f4f6",borderRadius:4,padding:"2px 7px",fontSize:8.5,color:"#555" }}>{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop:"1px solid #eee",padding:"6px 20px",marginTop:"auto" }}>
        <div style={{ fontSize:7.5,color:"#bbb",textAlign:"right" }}>{s.createdWith}</div>
      </div>
    </div>
  );
}

const AD_BONUS    = 3;
const AD_DURATION = 30;
const FREE_LIMIT  = 5;

function AdModal({ onComplete, onClose }) {
  const t = useTranslations('cv');
  const [seconds, setSeconds] = useState(AD_DURATION);
  const [done,    setDone]    = useState(false);
  const [adHtml,  setAdHtml]  = useState(null);
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
      if (orig.src){s.src=orig.src;s.async=true;}else{s.textContent=orig.textContent;}
      orig.replaceWith(s);
    });
  }, [adHtml]);
  useEffect(() => {
    if (seconds<=0){setDone(true);return;}
    const timer = setTimeout(()=>setSeconds(s=>s-1),1000);
    return ()=>clearTimeout(timer);
  }, [seconds]);

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:24,padding:"36px 32px",maxWidth:480,width:"100%",textAlign:"center" }}>
        <div style={{ fontSize:44,marginBottom:14 }}>📺</div>
        <h3 style={{ fontSize:22,fontWeight:800,marginBottom:8,color:"#F0F4FF" }}>{t('adModal.title')}</h3>
        <p style={{ color:"#8892AA",fontSize:14,marginBottom:24,lineHeight:1.6 }}>
          {t('adModal.desc', { bonus: AD_BONUS })}
        </p>
        <div style={{ background:"#131922",border:"1px dashed #1E2733",borderRadius:14,minHeight:160,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,position:"relative",overflow:"hidden" }}>
          {adHtml===null ? <span style={{ color:"#4B5563",fontSize:13 }}>{t('generating')}</span>
            : adHtml==="" ? <div style={{ textAlign:"center",color:"#4B5563" }}><div style={{ fontSize:30,marginBottom:8 }}>🎬</div><div style={{ fontSize:13 }}>Ad</div></div>
            : <div ref={zoneRef} style={{ width:"100%" }} />}
          <div style={{ position:"absolute",top:10,right:10,background:"rgba(0,0,0,.7)",color:"#fff",borderRadius:8,padding:"4px 10px",fontSize:13,fontWeight:700 }}>
            {done?"✓":`${seconds}s`}
          </div>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          {done
            ? <button onClick={onComplete} style={{ flex:1,background:"#10B981",color:"#fff",border:"none",padding:13,borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer" }}>{t('adModal.generateBtn')}</button>
            : <button disabled style={{ flex:1,background:"#1E3A5F",color:"#60A5FA",border:"none",padding:13,borderRadius:10,fontSize:15,cursor:"not-allowed" }}>{seconds}s...</button>
          }
          <button onClick={onClose} style={{ background:"none",border:"1px solid #1E2733",color:"#6B7A99",padding:"13px 16px",borderRadius:10,cursor:"pointer" }}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ─── Step components ─────────────────────────────────────────────────────────
function StepInfos({ data, set, photo, setPhoto }) {
  const t = useTranslations('cv.fields');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      <div>
        <label style={lStyle}>{t('photo')}</label>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          <div className="photo-zone" onClick={()=>fileRef.current?.click()}
            style={{ width:80,height:80,borderRadius:10,border:"2px dashed #1E2733",cursor:"pointer",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"#0A0E17",flexShrink:0 }}>
            {photo
              ? <img src={photo} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} />
              : <span style={{ fontSize:28,color:"#3B5070" }}>+</span>}
          </div>
          <div style={{ fontSize:12,color:"#6B7A99",lineHeight:1.6 }}>
            {t('photoHint').split('\n').map((line, i) => <span key={i}>{line}{i === 0 ? <br/> : null}</span>)}
            {photo && (
              <button onClick={()=>setPhoto(null)} style={{ display:"block",marginTop:6,background:"rgba(239,68,68,.1)",border:"none",color:"#FCA5A5",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:11 }}>
                {t('photoRemove')}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <Field label={t('name')}  value={data.name}  onChange={v=>set("name",v)}  placeholder="Jean Dupont" />
        <Field label={t('title')} value={data.title} onChange={v=>set("title",v)} placeholder="Développeur Web" />
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <Field label={t('email')} value={data.email} onChange={v=>set("email",v)} placeholder="jean@email.com" type="email" />
        <Field label={t('phone')} value={data.phone} onChange={v=>set("phone",v)} placeholder="+33 6 12 34 56 78" />
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <Field label={t('address')} value={data.address} onChange={v=>set("address",v)} placeholder="Paris, France" />
        <Field label={t('website')} value={data.website} onChange={v=>set("website",v)} placeholder="linkedin.com/in/jean" />
      </div>
      <Area label={t('summary')} value={data.summary} onChange={v=>set("summary",v)} placeholder={t('summaryPlaceholder')} rows={4} />
    </div>
  );
}

function StepExp({ exps, setExps }) {
  const t = useTranslations('cv.fields');
  const add = ()      => setExps(e=>[...e,{position:"",company:"",startDate:"",endDate:"",description:""}]);
  const upd = (i,k,v) => setExps(e=>e.map((x,j)=>j===i?{...x,[k]:v}:x));
  const del = (i)     => setExps(e=>e.filter((_,j)=>j!==i));
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      {exps.map((exp,i)=>(
        <div key={i} className="exp-card" style={{ background:"#0A0E17",border:"1px solid #1E2733",borderRadius:14,padding:20,position:"relative" }}>
          <button onClick={()=>del(i)} style={{ position:"absolute",top:12,right:12,background:"rgba(239,68,68,.1)",border:"none",color:"#FCA5A5",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:12 }}>✕</button>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <Field label={t('position')} value={exp.position} onChange={v=>upd(i,"position",v)} placeholder="Développeur Full Stack" />
              <Field label={t('company')}  value={exp.company}  onChange={v=>upd(i,"company",v)}  placeholder="Google" />
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <Field label={t('startDate')} value={exp.startDate} onChange={v=>upd(i,"startDate",v)} placeholder="Jan 2022" />
              <Field label={t('endDate')}   value={exp.endDate}   onChange={v=>upd(i,"endDate",v)}   placeholder="2024" />
            </div>
            <Area label={t('description')} value={exp.description} onChange={v=>upd(i,"description",v)} placeholder="" rows={2} />
          </div>
        </div>
      ))}
      <button onClick={add} style={{ background:"rgba(59,130,246,.08)",border:"1px dashed rgba(59,130,246,.3)",color:"#60A5FA",padding:"10px",borderRadius:12,fontSize:13,cursor:"pointer",width:"100%",marginTop:4 }}>
        {t('addExp')}
      </button>
    </div>
  );
}

function StepEdu({ edus, setEdus }) {
  const t = useTranslations('cv.fields');
  const add = ()      => setEdus(e=>[...e,{degree:"",school:"",startDate:"",endDate:""}]);
  const upd = (i,k,v) => setEdus(e=>e.map((x,j)=>j===i?{...x,[k]:v}:x));
  const del = (i)     => setEdus(e=>e.filter((_,j)=>j!==i));
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      {edus.map((edu,i)=>(
        <div key={i} className="exp-card" style={{ background:"#0A0E17",border:"1px solid #1E2733",borderRadius:14,padding:20,position:"relative" }}>
          <button onClick={()=>del(i)} style={{ position:"absolute",top:12,right:12,background:"rgba(239,68,68,.1)",border:"none",color:"#FCA5A5",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:12 }}>✕</button>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <Field label={t('degree')} value={edu.degree} onChange={v=>upd(i,"degree",v)} placeholder="Master" />
              <Field label={t('school')} value={edu.school} onChange={v=>upd(i,"school",v)} placeholder="Université Paris" />
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <Field label={t('startDate')} value={edu.startDate} onChange={v=>upd(i,"startDate",v)} placeholder="Sep 2018" />
              <Field label={t('endDate')}   value={edu.endDate}   onChange={v=>upd(i,"endDate",v)}   placeholder="Juin 2020" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} style={{ background:"rgba(59,130,246,.08)",border:"1px dashed rgba(59,130,246,.3)",color:"#60A5FA",padding:"10px",borderRadius:12,fontSize:13,cursor:"pointer",width:"100%",marginTop:4 }}>
        {t('addEdu')}
      </button>
    </div>
  );
}

function StepSkills({ skills, setSkills, langs, setLangs }) {
  const t = useTranslations('cv.fields');
  const addSkill  = ()      => setSkills(s=>[...s,""]);
  const updSkill  = (i,v)   => setSkills(s=>s.map((x,j)=>j===i?v:x));
  const delSkill  = (i)     => setSkills(s=>s.filter((_,j)=>j!==i));
  const addLang   = ()      => setLangs(l=>[...l,{lang:"",level:""}]);
  const updLang   = (i,k,v) => setLangs(l=>l.map((x,j)=>j===i?{...x,[k]:v}:x));
  const delLang   = (i)     => setLangs(l=>l.filter((_,j)=>j!==i));
  const levels    = t.raw('languageLevels');

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:28 }}>
      <div>
        <div style={{ fontWeight:700,marginBottom:14,color:"#F0F4FF" }}>{t('skills')}</div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginBottom:10 }}>
          {skills.map((s,i)=>(
            <div key={i} style={{ display:"flex",alignItems:"center",gap:6,background:"#0A0E17",border:"1px solid #1E2733",borderRadius:8,padding:"5px 10px" }}>
              <input value={s} onChange={e=>updSkill(i,e.target.value)} placeholder={t('skillPlaceholder')}
                style={{ background:"transparent",border:"none",color:"#F0F4FF",fontSize:13,outline:"none",width:90 }} />
              <button onClick={()=>delSkill(i)} style={{ background:"none",border:"none",color:"#4B5563",cursor:"pointer",fontSize:12 }}>✕</button>
            </div>
          ))}
        </div>
        <button onClick={addSkill} style={{ background:"rgba(59,130,246,.08)",border:"1px dashed rgba(59,130,246,.3)",color:"#60A5FA",padding:"8px 16px",borderRadius:8,fontSize:13,cursor:"pointer" }}>
          {t('addSkill')}
        </button>
      </div>

      <div>
        <div style={{ fontWeight:700,marginBottom:14,color:"#F0F4FF" }}>{t('languages')}</div>
        {langs.map((l,i)=>(
          <div key={i} style={{ display:"flex",gap:10,alignItems:"center",marginBottom:10 }}>
            <input className="input-field" value={l.lang} onChange={e=>updLang(i,"lang",e.target.value)} placeholder={t('langPlaceholder')}
              style={{ ...iStyle,flex:1 }} />
            <select className="input-field" value={l.level} onChange={e=>updLang(i,"level",e.target.value)}
              style={{ ...iStyle,width:160 }}>
              <option value="">{t('levelPlaceholder')}</option>
              {(Array.isArray(levels) ? levels : []).map(v=>(
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <button onClick={()=>delLang(i)} style={{ background:"rgba(239,68,68,.1)",border:"none",color:"#FCA5A5",borderRadius:6,padding:"8px 10px",cursor:"pointer" }}>✕</button>
          </div>
        ))}
        <button onClick={addLang} style={{ background:"rgba(59,130,246,.08)",border:"1px dashed rgba(59,130,246,.3)",color:"#60A5FA",padding:"8px 16px",borderRadius:8,fontSize:13,cursor:"pointer" }}>
          {t('addLanguage')}
        </button>
      </div>
    </div>
  );
}

function StepExtras({ projects, setProjects, certifications, setCertifications, interests, setInterests }) {
  const t = useTranslations('cv.fields');
  const addProj  = ()      => setProjects(p=>[...p,{name:"",description:"",tech:"",url:""}]);
  const updProj  = (i,k,v) => setProjects(p=>p.map((x,j)=>j===i?{...x,[k]:v}:x));
  const delProj  = (i)     => setProjects(p=>p.filter((_,j)=>j!==i));
  const addCert  = ()      => setCertifications(c=>[...c,{title:"",org:"",year:""}]);
  const updCert  = (i,k,v) => setCertifications(c=>c.map((x,j)=>j===i?{...x,[k]:v}:x));
  const delCert  = (i)     => setCertifications(c=>c.filter((_,j)=>j!==i));

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:28 }}>
      <div>
        <div style={{ fontWeight:700,marginBottom:14,color:"#F0F4FF" }}>{t('projects')}</div>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {projects.map((p,i)=>(
            <div key={i} className="exp-card" style={{ background:"#0A0E17",border:"1px solid #1E2733",borderRadius:14,padding:18,position:"relative" }}>
              <button onClick={()=>delProj(i)} style={{ position:"absolute",top:12,right:12,background:"rgba(239,68,68,.1)",border:"none",color:"#FCA5A5",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:12 }}>✕</button>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                  <Field label={t('projectName')} value={p.name} onChange={v=>updProj(i,"name",v)} placeholder="DocSwift App" />
                  <Field label={t('technologies')} value={p.tech} onChange={v=>updProj(i,"tech",v)} placeholder="React, Node.js" />
                </div>
                <Field label={t('projectUrl')} value={p.url} onChange={v=>updProj(i,"url",v)} placeholder="https://github.com/..." />
                <Area label={t('description')} value={p.description} onChange={v=>updProj(i,"description",v)} placeholder="" rows={2} />
              </div>
            </div>
          ))}
        </div>
        <button onClick={addProj} style={{ background:"rgba(59,130,246,.08)",border:"1px dashed rgba(59,130,246,.3)",color:"#60A5FA",padding:"10px",borderRadius:12,fontSize:13,cursor:"pointer",width:"100%",marginTop:10 }}>
          {t('addProject')}
        </button>
      </div>

      <div>
        <div style={{ fontWeight:700,marginBottom:14,color:"#F0F4FF" }}>{t('certifications')}</div>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {certifications.map((c,i)=>(
            <div key={i} className="exp-card" style={{ background:"#0A0E17",border:"1px solid #1E2733",borderRadius:14,padding:18,position:"relative" }}>
              <button onClick={()=>delCert(i)} style={{ position:"absolute",top:12,right:12,background:"rgba(239,68,68,.1)",border:"none",color:"#FCA5A5",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:12 }}>✕</button>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 100px",gap:12 }}>
                <Field label={t('certTitle')} value={c.title} onChange={v=>updCert(i,"title",v)} placeholder="AWS Solutions Architect" />
                <Field label={t('certOrg')}   value={c.org}   onChange={v=>updCert(i,"org",v)}   placeholder="Amazon Web Services" />
                <Field label={t('certYear')}  value={c.year}  onChange={v=>updCert(i,"year",v)}  placeholder="2023" />
              </div>
            </div>
          ))}
        </div>
        <button onClick={addCert} style={{ background:"rgba(59,130,246,.08)",border:"1px dashed rgba(59,130,246,.3)",color:"#60A5FA",padding:"10px",borderRadius:12,fontSize:13,cursor:"pointer",width:"100%",marginTop:10 }}>
          {t('addCert')}
        </button>
      </div>

      <div>
        <div style={{ fontWeight:700,marginBottom:6,color:"#F0F4FF" }}>{t('interests')}</div>
        <div style={{ color:"#6B7A99",fontSize:12,marginBottom:10 }}>{t('interestsHint')}</div>
        <Field label="" value={interests} onChange={setInterests} placeholder={t('interestsPlaceholder')} />
      </div>
    </div>
  );
}

function StepStyle({ color, setColor, template, setTemplate }) {
  const t = useTranslations('cv');
  const templates = [
    {
      id: "classique",
      label: t('templates.classique'),
      desc: t('templates.classiqueDesc'),
      preview: (c) => (
        <div style={{ width:"100%",height:72,overflow:"hidden",borderRadius:5,fontFamily:"Arial,sans-serif",fontSize:6 }}>
          <div style={{ background:c,padding:"6px 8px",color:"#fff" }}>
            <div style={{ fontWeight:900,fontSize:9 }}>Jean Dupont</div>
            <div style={{ opacity:.8,fontSize:6.5 }}>Développeur Web</div>
          </div>
          <div style={{ background:"#fff",padding:"5px 8px" }}>
            <div style={{ background:"#f3f4f6",borderLeft:`2px solid ${c}`,padding:"2px 5px",marginBottom:3 }}>
              <span style={{ fontSize:5.5,fontWeight:900,color:c,letterSpacing:1 }}>EXPÉRIENCES</span>
            </div>
            <div style={{ fontSize:6,fontWeight:700,color:"#111" }}>Dev Full Stack</div>
            <div style={{ fontSize:5.5,color:"#777" }}>Google  |  2022 – 2024</div>
          </div>
        </div>
      ),
    },
    {
      id: "moderne",
      label: t('templates.moderne'),
      desc: t('templates.moderneDesc'),
      preview: (c) => (
        <div style={{ width:"100%",height:72,overflow:"hidden",borderRadius:5,fontFamily:"Arial,sans-serif",display:"flex" }}>
          <div style={{ width:"34%",background:c,padding:"6px 5px",color:"#fff" }}>
            <div style={{ width:18,height:18,borderRadius:"50%",background:"rgba(255,255,255,.3)",margin:"0 auto 4px" }} />
            <div style={{ fontSize:7,fontWeight:900,textAlign:"center" }}>J. Dupont</div>
            <div style={{ borderBottom:"1px solid rgba(255,255,255,.3)",margin:"4px 0" }} />
            <div style={{ fontSize:5,opacity:.8 }}>· jean@email.com</div>
            <div style={{ fontSize:5,opacity:.8,marginTop:2 }}>· Paris</div>
          </div>
          <div style={{ flex:1,background:"#fff",padding:"6px 7px" }}>
            <div style={{ borderLeft:`2px solid ${c}`,paddingLeft:4,marginBottom:4 }}>
              <span style={{ fontSize:5.5,fontWeight:900,color:c,letterSpacing:1 }}>EXPÉRIENCES</span>
            </div>
            <div style={{ fontSize:6,fontWeight:700,color:"#111" }}>Dev Full Stack</div>
            <div style={{ fontSize:5.5,color:"#777" }}>Google  |  2022 – 2024</div>
          </div>
        </div>
      ),
    },
    {
      id: "minimaliste",
      label: t('templates.minimaliste'),
      desc: t('templates.minimalisteDesc'),
      preview: (c) => (
        <div style={{ width:"100%",height:72,overflow:"hidden",borderRadius:5,fontFamily:"Arial,sans-serif",background:"#fff",padding:"8px 10px" }}>
          <div style={{ fontSize:12,fontWeight:900,color:"#111",letterSpacing:-0.5 }}>Jean Dupont</div>
          <div style={{ fontSize:6.5,color:"#888",marginTop:1 }}>Développeur Web</div>
          <div style={{ height:2,background:c,margin:"4px 0" }} />
          <div style={{ display:"flex",alignItems:"center",gap:3,marginBottom:5 }}>
            <div style={{ height:1,width:8,background:c }} />
            <span style={{ fontSize:5.5,fontWeight:900,color:c,letterSpacing:1 }}>EXPÉRIENCES</span>
            <div style={{ flex:1,height:1,background:"#eee" }} />
          </div>
          <div style={{ fontSize:6,fontWeight:700,color:"#111" }}>Dev Full Stack</div>
          <div style={{ fontSize:5.5,color:"#999" }}>Google  |  2022 – 2024</div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:24 }}>
      <div>
        <div style={{ fontWeight:700,marginBottom:6,color:"#F0F4FF" }}>{t('fields.template')}</div>
        <div style={{ color:"#6B7A99",fontSize:13,marginBottom:16 }}>{t('fields.templateHint')}</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
          {templates.map(tpl=>(
            <div key={tpl.id} className="tpl-card" onClick={()=>setTemplate(tpl.id)}
              style={{ background:"#0A0E17",border:`2px solid ${template===tpl.id?color:"#1E2733"}`,borderRadius:12,padding:12,cursor:"pointer",position:"relative" }}>
              {template===tpl.id && (
                <div style={{ position:"absolute",top:8,right:8,background:color,color:"#fff",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,lineHeight:1 }}>✓</div>
              )}
              {tpl.preview(color)}
              <div style={{ marginTop:8,fontWeight:700,fontSize:12,color:"#F0F4FF" }}>{tpl.label}</div>
              <div style={{ fontSize:10,color:"#6B7A99",marginTop:2 }}>{tpl.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontWeight:700,marginBottom:6,color:"#F0F4FF" }}>{t('fields.color')}</div>
        <div style={{ color:"#6B7A99",fontSize:13,marginBottom:16 }}>{t('fields.colorHint')}</div>
        <div style={{ display:"flex",gap:12,flexWrap:"wrap",alignItems:"center" }}>
          {COLORS.map(c=>(
            <div key={c} className="color-swatch" onClick={()=>setColor(c)}
              style={{ width:38,height:38,borderRadius:"50%",background:c,cursor:"pointer",border:`3px solid ${color===c?"#fff":"transparent"}`,boxShadow:color===c?`0 0 0 2px ${c},0 4px 12px ${c}66`:"none",flexShrink:0 }} />
          ))}
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <input type="color" value={color} onChange={e=>setColor(e.target.value)}
              style={{ width:38,height:38,borderRadius:"50%",border:"2px solid #1E2733",cursor:"pointer",background:"none",padding:0 }} />
            <span style={{ fontSize:12,color:"#6B7A99" }}>{t('fields.customColor')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main CV Page ─────────────────────────────────────────────────────────────
export default function CVPage() {
  const t      = useTranslations('cv');
  const tCommon = useTranslations('common');
  const tNav   = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const { data: session } = useSession();

  const localePrefix = locale === 'fr' ? '' : `/${locale}`;

  const [step,    setStep]   = useState(0);
  const [loading, setLoading]= useState(false);
  const [showAd,  setShowAd] = useState(false);
  const [bonusUses, setBonusUses] = useState(0);
  const [usage,   setUsage]  = useState({ used:0, limit:FREE_LIMIT, isPro:false, remaining:FREE_LIMIT });

  const [infos,          setInfos]          = useState({ name:"",title:"",email:"",phone:"",address:"",website:"",summary:"" });
  const [exps,           setExps]           = useState([{ position:"",company:"",startDate:"",endDate:"",description:"" }]);
  const [edus,           setEdus]           = useState([{ degree:"",school:"",startDate:"",endDate:"" }]);
  const [skills,         setSkills]         = useState(["","",""]);
  const [langs,          setLangs]          = useState([{ lang:"",level:"" }]);
  const [photo,          setPhoto]          = useState(null);
  const [template,       setTemplate]       = useState("classique");
  const [projects,       setProjects]       = useState([{ name:"",description:"",tech:"",url:"" }]);
  const [certifications, setCertifications] = useState([{ title:"",org:"",year:"" }]);
  const [interests,      setInterests]      = useState("");
  const [color,          setColor]          = useState("#2563EB");

  const setInfo = (k,v) => setInfos(i=>({...i,[k]:v}));

  // PDF section labels in the current locale
  const pdfSections = {
    profile:        t('pdfSections.profile'),
    experience:     t('pdfSections.experience'),
    education:      t('pdfSections.education'),
    skills:         t('pdfSections.skills'),
    languages:      t('pdfSections.languages'),
    projects:       t('pdfSections.projects'),
    certifications: t('pdfSections.certifications'),
    interests:      t('pdfSections.interests'),
    yourName:       t('yourName'),
    createdWith:    t('createdWith'),
  };

  useEffect(() => {
    fetch("/api/usage").then(r=>r.json()).then(d=>setUsage(d)).catch(()=>{});
    const key = "docswift_bonus_" + new Date().toISOString().slice(0,10);
    setBonusUses(parseInt(localStorage.getItem(key)??"0"));
  }, []);

  const effectiveRemaining = usage.isPro ? Infinity : Math.max(0,(usage.remaining??0)+bonusUses);

  const handleAdComplete = () => {
    const key  = "docswift_bonus_" + new Date().toISOString().slice(0,10);
    const next = parseInt(localStorage.getItem(key)??"0") + AD_BONUS;
    localStorage.setItem(key, String(next));
    setBonusUses(next);
    setShowAd(false);
    doGenerate();
  };

  const goUpgrade = async () => {
    if (!session) { signIn(); return; }
    const res  = await fetch("/api/stripe/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({affiliateCode:localStorage.getItem("docswift_ref")})});
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const doGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cv",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          ...infos,
          photo,
          experiences:   exps.filter(e=>e.position||e.company),
          educations:    edus.filter(e=>e.degree||e.school),
          skills:        skills.filter(Boolean),
          languages:     langs.filter(l=>l.lang),
          projects:      projects.filter(p=>p.name),
          certifications:certifications.filter(c=>c.title),
          interests,
          accentColor:   color,
          template,
          locale,
          sectionLabels: pdfSections,
        }),
      });
      if (res.status===429) {
        setShowAd(true);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Generation error");
      if (!usage.isPro) {
        const key = "docswift_used_"+new Date().toISOString().slice(0,10);
        localStorage.setItem(key, String(parseInt(localStorage.getItem(key)??"0")+1));
        if (bonusUses>0) {
          const bk = "docswift_bonus_"+new Date().toISOString().slice(0,10);
          localStorage.setItem(bk, String(bonusUses-1));
          setBonusUses(b=>Math.max(0,b-1));
        }
        fetch("/api/usage").then(r=>r.json()).then(d=>setUsage(d)).catch(()=>{});
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement("a"),{ href:url, download:`${infos.name.replace(/\s+/g,"_") || "cv"}_CV.pdf` });
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { alert(t('errorGenerate')); }
    finally { setLoading(false); }
  };

  const generate = () => {
    if (!infos.name.trim()) { alert(t('validationName')); setStep(0); return; }
    doGenerate();
  };

  const STEPS = [
    t('steps.infos'), t('steps.experience'), t('steps.formation'),
    t('steps.skills'), t('steps.extras'), t('steps.style')
  ];

  const stepLabels = STEPS.map((s,i) => ({ label:s, done:i<step, active:i===step }));

  return (
    <div style={{ minHeight:"100vh",background:"#07090F",color:"#F0F4FF",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav className="cv-nav-wrap" style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"14px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(7,9,15,.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1E2733" }}>
        <div style={{ fontWeight:900,fontSize:20,letterSpacing:-1,cursor:"pointer" }} onClick={()=>router.push(`${localePrefix}/`)}>
          Doc<span style={{ color:"#3B82F6" }}>Swift</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          {!usage.isPro && (
            <div className="cv-usage-bar" style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ width:80,height:5,background:"#1E2733",borderRadius:99,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${Math.min(100,(usage.used/((usage.limit??FREE_LIMIT)+bonusUses))*100)}%`,background:effectiveRemaining===0?"#EF4444":"#14B8A6",borderRadius:99,transition:"width .4s" }} />
              </div>
              <span style={{ fontSize:12,color:"#6B7A99",whiteSpace:"nowrap" }}>
                {effectiveRemaining===0 ? t('limitReached') : `${effectiveRemaining} restante${effectiveRemaining!==1?"s":""}`}
              </span>
            </div>
          )}
          {usage.isPro && (
            <span style={{ background:"rgba(16,185,129,.12)",color:"#10B981",fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:20,border:"1px solid rgba(16,185,129,.25)" }}>✓ PRO</span>
          )}
          <LanguageSwitcher />
          <button className="cv-back-btn" onClick={()=>router.push(`${localePrefix}/tools`)} style={{ background:"none",border:"1px solid #1E2733",color:"#8892AA",padding:"7px 14px",borderRadius:8,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap" }}>
            ← <span>{tNav('backToTools')}</span>
          </button>
          {infos.name && (
            <button onClick={generate} disabled={loading} style={{ background:loading?"#1E3A5F":"linear-gradient(135deg,#10B981,#059669)",color:"#fff",border:"none",padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:700,cursor:loading?"not-allowed":"pointer" }}>
              {loading ? t('generating') : t('generate')}
            </button>
          )}
        </div>
      </nav>

      {/* Main layout */}
      <div className="cv-layout" style={{ display:"flex",gap:0,paddingTop:58,height:"100vh" }}>

        {/* ── LEFT: Form panel ── */}
        <div className="cv-form-panel" style={{ flex:"0 0 520px",overflowY:"auto",padding:"32px 32px 60px",borderRight:"1px solid #1E2733",background:"#07090F",boxSizing:"border-box" }}>

          <div style={{ marginBottom:28 }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:6 }}>
              <div style={{ fontSize:28 }}>📄</div>
              <div>
                <h1 style={{ fontSize:22,fontWeight:900,letterSpacing:-0.5,margin:0 }}>{t('title')}</h1>
                <p style={{ color:"#6B7A99",fontSize:13,margin:0 }}>{t('subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Step tabs */}
          <div style={{ display:"flex",gap:0,marginBottom:28,borderRadius:12,overflow:"hidden",border:"1px solid #1E2733" }}>
            {stepLabels.map((s,i)=>(
              <button key={s.label} className="step-btn" onClick={()=>setStep(i)}
                style={{ flex:1,padding:"9px 4px",border:"none",fontSize:10,fontWeight:700,cursor:"pointer",transition:"all .15s",
                  background:s.active?"#3B82F6":s.done?"#0D2A4A":"#0D1117",
                  color:s.active?"#fff":s.done?"#60A5FA":"#6B7A99",
                  borderRight:i<STEPS.length-1?"1px solid #1E2733":"none" }}>
                {s.done?"✓ ":""}{s.label}
              </button>
            ))}
          </div>

          {/* Step content */}
          <div className="fade-in" key={step} style={{ background:"#0D1117",border:"1px solid #1E2733",borderRadius:16,padding:24,marginBottom:20 }}>
            {step===0 && <StepInfos data={infos} set={setInfo} photo={photo} setPhoto={setPhoto} />}
            {step===1 && <StepExp   exps={exps}  setExps={setExps} />}
            {step===2 && <StepEdu   edus={edus}  setEdus={setEdus} />}
            {step===3 && <StepSkills skills={skills} setSkills={setSkills} langs={langs} setLangs={setLangs} />}
            {step===4 && <StepExtras projects={projects} setProjects={setProjects} certifications={certifications} setCertifications={setCertifications} interests={interests} setInterests={setInterests} />}
            {step===5 && <StepStyle color={color} setColor={setColor} template={template} setTemplate={setTemplate} />}
          </div>

          {/* Navigation */}
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",gap:12 }}>
            <button onClick={()=>setStep(s=>Math.max(0,s-1))}
              style={{ background:"transparent",border:"1px solid #1E2733",color:"#8892AA",padding:"11px 22px",borderRadius:10,fontSize:14,cursor:"pointer",opacity:step===0?0:1,pointerEvents:step===0?"none":"auto" }}>
              {tCommon('previous')}
            </button>
            {step < STEPS.length-1 ? (
              <button onClick={()=>setStep(s=>s+1)}
                style={{ background:"linear-gradient(135deg,#3B82F6,#2563EB)",color:"#fff",border:"none",padding:"11px 28px",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer" }}>
                {tCommon('next')}
              </button>
            ) : (
              <button onClick={generate} disabled={loading}
                style={{ background:loading?"#1E3A5F":"linear-gradient(135deg,#10B981,#059669)",color:"#fff",border:"none",padding:"12px 28px",borderRadius:10,fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:8 }}>
                {loading ? (
                  <><svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>{t('generating')}</>
                ) : t('generate')}
              </button>
            )}
          </div>

          {step < STEPS.length-1 && infos.name && (
            <div style={{ textAlign:"center",marginTop:14 }}>
              <button onClick={generate} disabled={loading} style={{ background:"none",border:"none",color:"#4B5563",fontSize:12,cursor:"pointer",textDecoration:"underline" }}>
                {loading ? t('generating') : t('generateNow')}
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Live preview panel ── */}
        <div className="cv-preview-panel" style={{ flex:1,overflowY:"auto",padding:"32px",background:"#030508",display:"flex",flexDirection:"column" }}>
          <div style={{ marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div>
              <div style={{ fontWeight:700,fontSize:15,color:"#F0F4FF" }}>{t('preview.title')}</div>
              <div style={{ color:"#6B7A99",fontSize:12,marginTop:2 }}>{t('preview.subtitle')}</div>
            </div>
            <div style={{ display:"flex",gap:6 }}>
              <div style={{ width:10,height:10,borderRadius:"50%",background:"#EF4444" }} />
              <div style={{ width:10,height:10,borderRadius:"50%",background:"#F59E0B" }} />
              <div style={{ width:10,height:10,borderRadius:"50%",background:"#10B981" }} />
            </div>
          </div>
          <div style={{ flex:1,maxWidth:480,margin:"0 auto",width:"100%" }}>
            <CVPreview
              infos={infos} exps={exps} edus={edus} skills={skills} langs={langs}
              color={color} photo={photo} template={template}
              projects={projects} certifications={certifications} interests={interests}
              sections={pdfSections}
            />
          </div>
          <p style={{ textAlign:"center",color:"#2A3547",fontSize:11,marginTop:16 }}>
            {t('subtitle')}
          </p>
        </div>
      </div>

      {showAd && <AdModal onComplete={handleAdComplete} onClose={()=>setShowAd(false)} />}
    </div>
  );
}
