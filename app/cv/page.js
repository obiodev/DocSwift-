"use client";
import { useState } from "react";

const STEPS = ["Infos", "Expérience", "Formation", "Compétences", "Style"];

const S = {
  page:   { minHeight: "100vh", background: "#07090F", color: "#F0F4FF", fontFamily: "sans-serif" },
  card:   { background: "#0D1117", border: "1px solid #1E2733", borderRadius: 16, padding: 28 },
  input:  { width: "100%", background: "#07090F", border: "1px solid #1E2733", color: "#F0F4FF", padding: "10px 14px", borderRadius: 10, fontSize: 14, boxSizing: "border-box", outline: "none" },
  label:  { display: "block", fontSize: 12, color: "#6B7A99", marginBottom: 5, fontWeight: 600 },
  btn:    (c = "#3B82F6") => ({ background: c, color: "#fff", border: "none", padding: "11px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }),
  ghost:  { background: "transparent", border: "1px solid #1E2733", color: "#8892AA", padding: "11px 24px", borderRadius: 10, fontSize: 14, cursor: "pointer" },
  row:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  plus:   { background: "rgba(59,130,246,.1)", border: "1px dashed #1E2733", color: "#60A5FA", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", width: "100%", marginTop: 10 },
};

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={S.input} />
    </div>
  );
}
function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ ...S.input, resize: "vertical", lineHeight: 1.5 }} />
    </div>
  );
}

function StepInfos({ data, set }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={S.row}>
        <Field label="Prénom & Nom *" value={data.name} onChange={v => set("name", v)} placeholder="Jean Dupont" />
        <Field label="Titre / Poste visé" value={data.title} onChange={v => set("title", v)} placeholder="Développeur Web Senior" />
      </div>
      <div style={S.row}>
        <Field label="Email" value={data.email} onChange={v => set("email", v)} placeholder="jean@email.com" type="email" />
        <Field label="Téléphone" value={data.phone} onChange={v => set("phone", v)} placeholder="+33 6 12 34 56 78" />
      </div>
      <div style={S.row}>
        <Field label="Adresse" value={data.address} onChange={v => set("address", v)} placeholder="Paris, France" />
        <Field label="Site web / LinkedIn" value={data.website} onChange={v => set("website", v)} placeholder="linkedin.com/in/jeandupont" />
      </div>
      <TextArea label="Résumé / Profil" value={data.summary} onChange={v => set("summary", v)}
        placeholder="Développeur passionné avec 5 ans d'expérience dans le développement web full-stack..." rows={4} />
    </div>
  );
}

function StepExp({ exps, setExps }) {
  const add = () => setExps(e => [...e, { position: "", company: "", startDate: "", endDate: "", description: "" }]);
  const upd = (i, k, v) => setExps(e => e.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const del = (i) => setExps(e => e.filter((_, j) => j !== i));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {exps.map((exp, i) => (
        <div key={i} style={{ ...S.card, padding: 20, position: "relative" }}>
          <button onClick={() => del(i)} style={{ position: "absolute", top: 14, right: 14, background: "rgba(239,68,68,.1)", border: "none", color: "#FCA5A5", borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontSize: 13 }}>✕</button>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={S.row}>
              <Field label="Poste *" value={exp.position} onChange={v => upd(i, "position", v)} placeholder="Développeur Full Stack" />
              <Field label="Entreprise" value={exp.company} onChange={v => upd(i, "company", v)} placeholder="Google" />
            </div>
            <div style={S.row}>
              <Field label="Date début" value={exp.startDate} onChange={v => upd(i, "startDate", v)} placeholder="Jan 2022" />
              <Field label="Date fin" value={exp.endDate} onChange={v => upd(i, "endDate", v)} placeholder="Aujourd'hui" />
            </div>
            <TextArea label="Description" value={exp.description} onChange={v => upd(i, "description", v)}
              placeholder="Développement de l'application React, APIs REST, Docker..." />
          </div>
        </div>
      ))}
      <button style={S.plus} onClick={add}>+ Ajouter une expérience</button>
    </div>
  );
}

function StepEdu({ edus, setEdus }) {
  const add = () => setEdus(e => [...e, { degree: "", school: "", startDate: "", endDate: "" }]);
  const upd = (i, k, v) => setEdus(e => e.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const del = (i) => setEdus(e => e.filter((_, j) => j !== i));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {edus.map((edu, i) => (
        <div key={i} style={{ ...S.card, padding: 20, position: "relative" }}>
          <button onClick={() => del(i)} style={{ position: "absolute", top: 14, right: 14, background: "rgba(239,68,68,.1)", border: "none", color: "#FCA5A5", borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontSize: 13 }}>✕</button>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={S.row}>
              <Field label="Diplôme *" value={edu.degree} onChange={v => upd(i, "degree", v)} placeholder="Master Informatique" />
              <Field label="École / Université" value={edu.school} onChange={v => upd(i, "school", v)} placeholder="Université Paris-Saclay" />
            </div>
            <div style={S.row}>
              <Field label="Date début" value={edu.startDate} onChange={v => upd(i, "startDate", v)} placeholder="Sep 2018" />
              <Field label="Date fin" value={edu.endDate} onChange={v => upd(i, "endDate", v)} placeholder="Juin 2020" />
            </div>
          </div>
        </div>
      ))}
      <button style={S.plus} onClick={add}>+ Ajouter une formation</button>
    </div>
  );
}

function StepSkills({ skills, setSkills, langs, setLangs }) {
  const addSkill = () => setSkills(s => [...s, ""]);
  const updSkill = (i, v) => setSkills(s => s.map((x, j) => j === i ? v : x));
  const delSkill = (i) => setSkills(s => s.filter((_, j) => j !== i));
  const addLang  = () => setLangs(l => [...l, { lang: "", level: "" }]);
  const updLang  = (i, k, v) => setLangs(l => l.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const delLang  = (i) => setLangs(l => l.filter((_, j) => j !== i));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>Compétences</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {skills.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#131922", border: "1px solid #1E2733", borderRadius: 8, padding: "4px 10px" }}>
              <input value={s} onChange={e => updSkill(i, e.target.value)} placeholder="Ex: React" style={{ background: "transparent", border: "none", color: "#F0F4FF", fontSize: 13, outline: "none", width: 100 }} />
              <button onClick={() => delSkill(i)} style={{ background: "none", border: "none", color: "#4B5563", cursor: "pointer", fontSize: 12 }}>✕</button>
            </div>
          ))}
        </div>
        <button style={S.plus} onClick={addSkill}>+ Ajouter une compétence</button>
      </div>
      <div>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>Langues</div>
        {langs.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <input value={l.lang} onChange={e => updLang(i, "lang", e.target.value)} placeholder="Français" style={{ ...S.input, flex: 1 }} />
            <select value={l.level} onChange={e => updLang(i, "level", e.target.value)} style={{ ...S.input, width: 160 }}>
              <option value="">Niveau</option>
              {["Natif", "Courant (C1/C2)", "Avancé (B2)", "Intermédiaire (B1)", "Débutant (A1/A2)"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <button onClick={() => delLang(i)} style={{ background: "rgba(239,68,68,.1)", border: "none", color: "#FCA5A5", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}>✕</button>
          </div>
        ))}
        <button style={S.plus} onClick={addLang}>+ Ajouter une langue</button>
      </div>
    </div>
  );
}

function StepStyle({ color, setColor }) {
  const colors = ["#2563EB", "#7C3AED", "#059669", "#DC2626", "#D97706", "#0891B2", "#1D4ED8", "#111827"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>Couleur principale</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {colors.map(c => (
            <div key={c} onClick={() => setColor(c)}
              style={{ width: 40, height: 40, borderRadius: "50%", background: c, cursor: "pointer", border: `3px solid ${color === c ? "#fff" : "transparent"}`, boxShadow: color === c ? "0 0 0 2px " + c : "none", transition: "all .2s" }} />
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", cursor: "pointer", background: "none" }} />
            <span style={{ fontSize: 12, color: "#6B7A99" }}>Personnalisé</span>
          </div>
        </div>
      </div>
      <div style={{ background: "#0D1117", border: "1px solid #1E2733", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: color, padding: "20px 24px" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>Jean Dupont</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.8)", marginTop: 4 }}>Développeur Web Senior</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginTop: 6 }}>jean@email.com  ·  +33 6 12 34 56 78</div>
        </div>
        <div style={{ padding: "16px 24px" }}>
          <div style={{ background: "#f5f5f5", borderRadius: 4, padding: "8px 12px", borderLeft: `4px solid ${color}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: color, textTransform: "uppercase", letterSpacing: 1 }}>Expériences</div>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "#333", fontWeight: 700 }}>Développeur Full Stack</div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>Google  |  Jan 2022 – Aujourd'hui</div>
        </div>
      </div>
    </div>
  );
}

export default function CVPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [infos, setInfos] = useState({ name: "", title: "", email: "", phone: "", address: "", website: "", summary: "" });
  const [exps,  setExps]  = useState([{ position: "", company: "", startDate: "", endDate: "", description: "" }]);
  const [edus,  setEdus]  = useState([{ degree: "", school: "", startDate: "", endDate: "" }]);
  const [skills,setSkills]= useState(["", "", ""]);
  const [langs, setLangs] = useState([{ lang: "", level: "" }]);
  const [color, setColor] = useState("#2563EB");

  const setInfo = (k, v) => setInfos(i => ({ ...i, [k]: v }));

  const generate = async () => {
    if (!infos.name.trim()) { alert("Veuillez entrer votre nom."); setStep(0); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...infos,
          experiences: exps.filter(e => e.position || e.company),
          educations:  edus.filter(e => e.degree || e.school),
          skills:      skills.filter(Boolean),
          languages:   langs.filter(l => l.lang),
          accentColor: color,
        }),
      });
      if (!res.ok) throw new Error("Erreur génération");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement("a"), { href: url, download: `${infos.name.replace(/\s+/g, "_")}_CV.pdf` });
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors de la génération. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(7,9,15,.97)", borderBottom: "1px solid #1E2733" }}>
        <a href="/tools" style={{ fontWeight: 800, fontSize: 20, letterSpacing: -1, textDecoration: "none", color: "#F0F4FF" }}>
          Doc<span style={{ color: "#3B82F6" }}>Swift</span>
        </a>
        <span style={{ fontSize: 13, color: "#6B7A99" }}>← <a href="/tools" style={{ color: "#6B7A99", textDecoration: "none" }}>Retour aux outils</a></span>
      </nav>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "90px 24px 60px" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, marginBottom: 8 }}>Créer mon CV</h1>
          <p style={{ color: "#8892AA", fontSize: 14 }}>Remplissez les informations et téléchargez votre CV en PDF professionnel.</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 0, marginBottom: 32, borderRadius: 12, overflow: "hidden", border: "1px solid #1E2733" }}>
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)}
              style={{ flex: 1, padding: "10px 4px", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: step === i ? "#3B82F6" : step > i ? "#0D2A4A" : "#0D1117", color: step === i ? "#fff" : step > i ? "#60A5FA" : "#6B7A99", borderRight: i < STEPS.length - 1 ? "1px solid #1E2733" : "none" }}>
              {step > i ? "✓ " : ""}{s}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div style={S.card}>
          {step === 0 && <StepInfos data={infos} set={setInfo} />}
          {step === 1 && <StepExp exps={exps} setExps={setExps} />}
          {step === 2 && <StepEdu edus={edus} setEdus={setEdus} />}
          {step === 3 && <StepSkills skills={skills} setSkills={setSkills} langs={langs} setLangs={setLangs} />}
          {step === 4 && <StepStyle color={color} setColor={setColor} />}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} style={{ ...S.ghost, opacity: step === 0 ? 0 : 1, pointerEvents: step === 0 ? "none" : "auto" }}>
            ← Précédent
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} style={S.btn()}>
              Suivant →
            </button>
          ) : (
            <button onClick={generate} disabled={loading} style={{ ...S.btn(loading ? "#1E3A5F" : "#10B981"), opacity: loading ? .8 : 1 }}>
              {loading ? "⏳ Génération en cours..." : "⬇️ Télécharger mon CV PDF"}
            </button>
          )}
        </div>

        {/* Quick generate from any step */}
        {step < STEPS.length - 1 && infos.name && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={generate} disabled={loading} style={{ background: "none", border: "none", color: "#4B5563", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
              {loading ? "Génération..." : "Générer maintenant avec les infos actuelles"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
