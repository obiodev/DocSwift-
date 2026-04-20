"use client";
import { useState, useEffect } from "react";
import { useSession, signIn }  from "next-auth/react";

const CSS = `
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fade-in{animation:fadeIn .3s ease both}
  .spinner{animation:spin 1s linear infinite}
  .tab-btn:hover{color:#F0F4FF!important}
  .tab-btn{transition:color .15s}
  .stat-card{transition:all .2s ease}
  .stat-card:hover{transform:translateY(-2px);border-color:#1E3A5F!important}
  .row-hover:hover{background:#0A0E17!important}
  .row-hover{transition:background .1s}
  .btn-action{transition:all .15s ease}
  .btn-action:hover{opacity:.8}
  input,select,textarea{font-family:inherit}
  input:focus,select:focus,textarea:focus{outline:none;border-color:#3B82F6!important;box-shadow:0 0 0 3px rgba(59,130,246,.1)}
`;

// ── Shared styles ──────────────────────────────────────────────────────────
const S = {
  card:  { background:"#0D1117", border:"1px solid #1E2733", borderRadius:14, padding:24 },
  input: { width:"100%", background:"#07090F", border:"1px solid #1E2733", color:"#F0F4FF", padding:"10px 14px", borderRadius:10, fontSize:14, boxSizing:"border-box" },
  btn:   (c="#3B82F6") => ({ background:c, color:"#fff", border:"none", padding:"9px 18px", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer" }),
};

function badge(type) {
  const map = {
    pro:      { bg:"rgba(16,185,129,.12)",  color:"#10B981", border:"rgba(16,185,129,.25)" },
    free:     { bg:"rgba(107,118,153,.1)",  color:"#6B7A99", border:"#1E2733" },
    active:   { bg:"rgba(59,130,246,.12)",  color:"#60A5FA", border:"rgba(59,130,246,.25)" },
    inactive: { bg:"rgba(239,68,68,.1)",    color:"#FCA5A5", border:"rgba(239,68,68,.25)" },
    gifted:   { bg:"rgba(245,158,11,.1)",   color:"#FCD34D", border:"rgba(245,158,11,.25)" },
    converted:{ bg:"rgba(16,185,129,.12)",  color:"#10B981", border:"rgba(16,185,129,.25)" },
    pending:  { bg:"rgba(107,118,153,.1)",  color:"#6B7A99", border:"#1E2733" },
  };
  const s = map[type] ?? map.free;
  return { background:s.bg, color:s.color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, border:`1px solid ${s.border}`, whiteSpace:"nowrap" };
}

const TH = ({ children }) => (
  <th style={{ padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"#6B7A99", textTransform:"uppercase", letterSpacing:.5, borderBottom:"1px solid #1E2733", whiteSpace:"nowrap" }}>
    {children}
  </th>
);
const TD = ({ children, style }) => (
  <td style={{ padding:"12px 16px", fontSize:13, color:"#D1E8FF", ...style }}>{children}</td>
);

function fmt(date)     { if(!date) return "—"; return new Date(date).toLocaleDateString("fr-FR"); }
function fmtMoney(n)   { return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(n??0); }
function fmtNum(n)     { return new Intl.NumberFormat("fr-FR").format(n??0); }

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ msg, ok }) {
  return (
    <div style={{ position:"fixed",bottom:28,right:28,zIndex:9999,background:ok?"#052e16":"#1f0d0d",border:`1px solid ${ok?"#10B981":"#EF4444"}`,color:ok?"#10B981":"#FCA5A5",borderRadius:12,padding:"13px 22px",fontSize:14,fontWeight:600,boxShadow:"0 8px 32px rgba(0,0,0,.6)",animation:"fadeIn .2s ease" }}>
      {ok?"✓":"✕"} {msg}
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ textAlign:"center",padding:64,color:"#6B7A99" }}>
      <svg className="spinner" width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ margin:"0 auto 12px",display:"block" }}>
        <circle cx="12" cy="12" r="10" stroke="#1E2733" strokeWidth="3"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      Chargement...
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color="#F0F4FF", sub }) {
  return (
    <div className="stat-card" style={{ ...S.card, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute",top:0,right:0,width:80,height:80,background:`radial-gradient(circle at top right, ${color}12, transparent 70%)`,pointerEvents:"none" }} />
      <div style={{ fontSize:22,marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:28,fontWeight:900,color,letterSpacing:-1,lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12,color:"#6B7A99",marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:11,color:"#4B5563",marginTop:2 }}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── OVERVIEW TAB ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab({ onNavigate }) {
  const [users,    setUsers]    = useState(null);
  const [payments, setPayments] = useState(null);
  const [affiliates,setAffs]   = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then(r=>r.json()).catch(()=>null),
      fetch("/api/admin/payments").then(r=>r.json()).catch(()=>null),
      fetch("/api/admin/affiliates").then(r=>r.json()).catch(()=>null),
    ]).then(([u,p,a]) => {
      setUsers(u); setPayments(p); setAffs(a);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  const us = users?.stats    ?? {};
  const ps = payments?.stats ?? {};
  const af = affiliates?.affiliates ?? [];

  const recentUsers    = (users?.users    ?? []).slice(0, 5);
  const recentPayments = (payments?.payments ?? []).slice(0, 5);

  return (
    <div className="fade-in">
      {/* KPI row */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:32 }}>
        <StatCard icon="👥" label="Utilisateurs total"  value={fmtNum(us.totalUsers)}      color="#F0F4FF" />
        <StatCard icon="✨" label="Abonnés Pro actifs"  value={fmtNum(ps.pro)}             color="#10B981" />
        <StatCard icon="💰" label="Revenus mensuels"    value={fmtMoney(ps.mrr)}           color="#FCD34D" sub="MRR estimé" />
        <StatCard icon="⚡" label="Conversions auj."   value={fmtNum(us.totalUsageToday)} color="#3B82F6" />
        <StatCard icon="🤝" label="Affiliés actifs"    value={af.filter(a=>a.status==="active").length} color="#8B5CF6" />
        <StatCard icon="🎁" label="Comptes offerts"    value={fmtNum(ps.gifted)}          color="#F59E0B" />
      </div>

      {/* Two columns: recent users + recent payments */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20 }}>
        {/* Recent users */}
        <div style={S.card}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
            <div style={{ fontWeight:700,fontSize:15,color:"#F0F4FF" }}>👥 Derniers utilisateurs</div>
            <button className="btn-action" onClick={()=>onNavigate("users")} style={{ background:"none",border:"1px solid #1E2733",color:"#6B7A99",padding:"5px 12px",borderRadius:7,fontSize:12,cursor:"pointer" }}>
              Voir tout →
            </button>
          </div>
          {recentUsers.length===0
            ? <div style={{ color:"#4B5563",fontSize:13,textAlign:"center",padding:"24px 0" }}>Aucun utilisateur encore</div>
            : recentUsers.map(u=>(
              <div key={u.email} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #0D1117" }}>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:"#F0F4FF" }}>{u.email}</div>
                  <div style={{ fontSize:11,color:"#6B7A99",marginTop:2 }}>Inscrit le {fmt(u.createdAt)}</div>
                </div>
                <span style={badge(u.status)}>{u.status==="pro"?"PRO ✨":"GRATUIT"}</span>
              </div>
            ))
          }
        </div>

        {/* Recent payments */}
        <div style={S.card}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
            <div style={{ fontWeight:700,fontSize:15,color:"#F0F4FF" }}>💳 Derniers paiements</div>
            <button className="btn-action" onClick={()=>onNavigate("payments")} style={{ background:"none",border:"1px solid #1E2733",color:"#6B7A99",padding:"5px 12px",borderRadius:7,fontSize:12,cursor:"pointer" }}>
              Voir tout →
            </button>
          </div>
          {recentPayments.length===0
            ? <div style={{ color:"#4B5563",fontSize:13,textAlign:"center",padding:"24px 0" }}>Aucun paiement encore</div>
            : recentPayments.map(p=>(
              <div key={p.email} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #0D1117" }}>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:"#F0F4FF" }}>{p.email}</div>
                  <div style={{ fontSize:11,color:"#6B7A99",marginTop:2 }}>Mis à jour {fmt(p.updatedAt)}</div>
                </div>
                <span style={badge(p.giftedBy?"gifted":p.stripeSubId?"converted":"pending")}>
                  {p.giftedBy?"🎁 Offert":p.stripeSubId?"💳 Stripe":"Manuel"}
                </span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ ...S.card }}>
        <div style={{ fontWeight:700,fontSize:15,color:"#F0F4FF",marginBottom:16 }}>⚡ Actions rapides</div>
        <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
          <button className="btn-action" onClick={()=>onNavigate("users")}
            style={{ ...S.btn("#3B82F6"),display:"flex",alignItems:"center",gap:8 }}>
            🎁 Offrir un compte Pro
          </button>
          <button className="btn-action" onClick={()=>onNavigate("affiliates")}
            style={{ ...S.btn("#8B5CF6"),display:"flex",alignItems:"center",gap:8 }}>
            🤝 Créer un affilié
          </button>
          <button className="btn-action" onClick={()=>onNavigate("ads")}
            style={{ ...S.btn("#F59E0B"),display:"flex",alignItems:"center",gap:8 }}>
            📺 Gérer les publicités
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── USERS TAB ────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function UsersTab() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("all");
  const [toast,       setToast]       = useState(null);
  const [giftEmail,   setGiftEmail]   = useState("");
  const [giftMonths,  setGiftMonths]  = useState("1");
  const [giftLoading, setGiftLoading] = useState(false);
  const [newUser,     setNewUser]     = useState({ name:"", email:"", password:"", plan:"free" });
  const [createLoading, setCreateLoading] = useState(false);

  const showToast = (msg,ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  const load = () => {
    setLoading(true);
    fetch("/api/admin/users").then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch(()=>setLoading(false));
  };
  useEffect(load,[]);

  const changePlan = async (email,status) => {
    await fetch("/api/admin/users",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,status})});
    showToast(`Plan de ${email} → ${status}`);
    load();
  };

  const createUser = async () => {
    if (!newUser.name.trim())              return showToast("Nom requis", false);
    if (!newUser.email.includes("@"))      return showToast("Email invalide", false);
    if (newUser.password.length < 8)       return showToast("Mot de passe trop court (8 car. min)", false);
    setCreateLoading(true);
    const r = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newUser.name.trim(), email: newUser.email.trim().toLowerCase(), password: newUser.password, plan: newUser.plan }),
    });
    const json = await r.json().catch(() => ({}));
    setCreateLoading(false);
    if (r.ok) {
      showToast(`Compte créé pour ${newUser.email}`);
      setNewUser({ name:"", email:"", password:"", plan:"free" });
      load();
    } else {
      showToast(json.error ?? "Erreur lors de la création", false);
    }
  };

  const giftPro = async () => {
    if (!giftEmail.includes("@")) return showToast("Email invalide",false);
    setGiftLoading(true);
    const r = await fetch("/api/admin/gift",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:giftEmail,months:giftMonths})});
    setGiftLoading(false);
    if (r.ok) { showToast(`Pro offert à ${giftEmail} pour ${giftMonths} mois`); setGiftEmail(""); load(); }
    else showToast("Erreur lors de l'attribution",false);
  };

  if (loading) return <Spinner />;

  const { users=[], stats={} } = data??{};
  const filtered = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="all" || (filter==="pro"&&u.status==="pro") || (filter==="free"&&u.status!=="pro");
    return matchSearch && matchFilter;
  });

  return (
    <div className="fade-in">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14,marginBottom:24 }}>
        <StatCard icon="👥" label="Total"          value={stats.totalUsers??0}      color="#F0F4FF" />
        <StatCard icon="✨" label="Pro"            value={stats.proUsers??0}        color="#10B981" />
        <StatCard icon="🆓" label="Gratuit"        value={stats.freeUsers??0}       color="#6B7A99" />
        <StatCard icon="⚡" label="Actifs auj."   value={stats.totalUsageToday??0} color="#3B82F6" />
      </div>

      {/* Gift form */}
      <div style={{ ...S.card,marginBottom:20 }}>
        <div style={{ fontWeight:700,fontSize:15,marginBottom:14,color:"#F0F4FF" }}>🎁 Offrir un compte Pro</div>
        <div style={{ display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end" }}>
          <div style={{ flex:2,minWidth:200 }}>
            <label style={{ display:"block",fontSize:12,color:"#6B7A99",marginBottom:5 }}>Email de l'utilisateur</label>
            <input value={giftEmail} onChange={e=>setGiftEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&giftPro()} placeholder="email@exemple.com" style={S.input} />
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,color:"#6B7A99",marginBottom:5 }}>Durée</label>
            <select value={giftMonths} onChange={e=>setGiftMonths(e.target.value)} style={{ ...S.input,width:130 }}>
              {[1,3,6,12].map(m=><option key={m} value={m}>{m} mois</option>)}
            </select>
          </div>
          <button className="btn-action" onClick={giftPro} disabled={giftLoading} style={{ ...S.btn("#10B981"),opacity:giftLoading?.6:1 }}>
            {giftLoading?"...":"🎁 Offrir Pro"}
          </button>
        </div>
      </div>

      {/* Create user form */}
      <div style={{ ...S.card,marginBottom:20 }}>
        <div style={{ fontWeight:700,fontSize:15,marginBottom:14,color:"#F0F4FF" }}>➕ Créer un utilisateur</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto auto",gap:10,alignItems:"flex-end",flexWrap:"wrap" }}>
          <div>
            <label style={{ display:"block",fontSize:12,color:"#6B7A99",marginBottom:5 }}>Nom complet</label>
            <input value={newUser.name} onChange={e=>setNewUser(u=>({...u,name:e.target.value}))} placeholder="Jean Dupont" style={S.input} />
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,color:"#6B7A99",marginBottom:5 }}>Email</label>
            <input type="email" value={newUser.email} onChange={e=>setNewUser(u=>({...u,email:e.target.value}))} placeholder="jean@exemple.com" style={S.input} />
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,color:"#6B7A99",marginBottom:5 }}>Mot de passe (8 car. min)</label>
            <input type="password" value={newUser.password} onChange={e=>setNewUser(u=>({...u,password:e.target.value}))} placeholder="••••••••" style={S.input} />
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,color:"#6B7A99",marginBottom:5 }}>Plan</label>
            <select value={newUser.plan} onChange={e=>setNewUser(u=>({...u,plan:e.target.value}))} style={{ ...S.input,width:120 }}>
              <option value="free">Gratuit</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
            </select>
          </div>
          <button className="btn-action" onClick={createUser} disabled={createLoading}
            style={{ ...S.btn("#6366F1"),opacity:createLoading?.6:1,whiteSpace:"nowrap" }}>
            {createLoading?"...":"👤 Créer"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par email..." style={{ ...S.input,flex:1,minWidth:180 }} />
        <div style={{ display:"flex",gap:4 }}>
          {[["all","Tous"],["pro","Pro ✨"],["free","Gratuit"]].map(([f,l])=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ padding:"8px 14px",borderRadius:8,border:`1px solid ${filter===f?"#3B82F6":"#1E2733"}`,fontSize:13,fontWeight:600,cursor:"pointer",background:filter===f?"#3B82F6":"transparent",color:filter===f?"#fff":"#6B7A99" }}>
              {l}
            </button>
          ))}
        </div>
        <span style={{ color:"#4B5563",fontSize:13 }}>{filtered.length} résultat{filtered.length!==1?"s":""}</span>
      </div>

      {/* Table */}
      {filtered.length===0
        ? <div style={{ ...S.card,textAlign:"center",padding:48,color:"#4B5563" }}>
            {users.length===0?"Aucun utilisateur. Ils apparaissent après connexion ou paiement.":"Aucun résultat pour cette recherche."}
          </div>
        : <div style={{ ...S.card,padding:0,overflow:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr><TH>Email</TH><TH>Plan</TH><TH>Conversions auj.</TH><TH>Fin abonnement</TH><TH>Inscrit</TH><TH>Actions</TH></tr>
              </thead>
              <tbody>
                {filtered.map(u=>(
                  <tr key={u.email} className="row-hover" style={{ borderBottom:"1px solid #131922" }}>
                    <TD><span style={{ fontWeight:600 }}>{u.email}</span></TD>
                    <TD><span style={badge(u.status)}>{u.status==="pro"?"PRO ✨":"GRATUIT"}</span></TD>
                    <TD style={{ color:u.usageToday>=5?"#EF4444":"#8892AA" }}>{u.usageToday??0}</TD>
                    <TD style={{ color:"#6B7A99" }}>{fmt(u.periodEnd)}</TD>
                    <TD style={{ color:"#6B7A99" }}>{fmt(u.createdAt)}</TD>
                    <TD>
                      {u.status==="pro"
                        ? <button className="btn-action" onClick={()=>changePlan(u.email,"free")} style={{ ...S.btn("transparent"),color:"#FCA5A5",border:"1px solid rgba(239,68,68,.3)",fontSize:12 }}>Rétrograder</button>
                        : <button className="btn-action" onClick={()=>changePlan(u.email,"pro")}  style={{ ...S.btn("transparent"),color:"#10B981", border:"1px solid rgba(16,185,129,.3)",fontSize:12 }}>Activer Pro</button>
                      }
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── PAYMENTS TAB ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function PaymentsTab() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(()=>{
    fetch("/api/admin/payments").then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch(()=>setLoading(false));
  },[]);

  if (loading) return <Spinner />;

  const { payments=[], stats={} } = data??{};
  const filtered = payments.filter(p=>p.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in">
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14,marginBottom:24 }}>
        <StatCard icon="✨" label="Abonnés actifs"  value={stats.pro??0}          color="#10B981" />
        <StatCard icon="💳" label="Via Stripe"       value={stats.stripe??0}      color="#3B82F6" />
        <StatCard icon="🎁" label="Comptes offerts" value={stats.gifted??0}       color="#FCD34D" />
        <StatCard icon="💰" label="MRR estimé"      value={fmtMoney(stats.mrr)}  color="#F0F4FF" sub="revenus mensuels" />
      </div>

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par email..." style={{ ...S.input,marginBottom:16 }} />

      <div style={{ ...S.card,padding:0,overflow:"auto" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead>
            <tr><TH>Email</TH><TH>Statut</TH><TH>Source</TH><TH>Stripe Customer</TH><TH>Fin période</TH><TH>Mis à jour</TH></tr>
          </thead>
          <tbody>
            {filtered.length===0
              ? <tr><td colSpan={6} style={{ textAlign:"center",padding:48,color:"#4B5563" }}>Aucun paiement enregistré.</td></tr>
              : filtered.map(p=>(
                <tr key={p.email} className="row-hover" style={{ borderBottom:"1px solid #131922" }}>
                  <TD><span style={{ fontWeight:600 }}>{p.email}</span></TD>
                  <TD><span style={badge(p.status)}>{p.status==="pro"?"PRO":"FREE"}</span></TD>
                  <TD>
                    {p.giftedBy
                      ? <span style={badge("gifted")}>🎁 Offert</span>
                      : p.stripeSubId
                        ? <span style={badge("converted")}>💳 Stripe</span>
                        : <span style={badge("pending")}>Manuel</span>
                    }
                  </TD>
                  <TD>
                    {p.stripeCustomerId
                      ? <a href={`https://dashboard.stripe.com/customers/${p.stripeCustomerId}`} target="_blank" rel="noreferrer" style={{ color:"#60A5FA",textDecoration:"none",fontFamily:"monospace",fontSize:12 }}>{p.stripeCustomerId.slice(0,18)}…</a>
                      : <span style={{ color:"#4B5563" }}>—</span>
                    }
                  </TD>
                  <TD style={{ color:"#6B7A99" }}>{fmt(p.periodEnd)}</TD>
                  <TD style={{ color:"#4B5563" }}>{fmt(p.updatedAt)}</TD>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── AFFILIATES TAB ───────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function AffiliatesTab() {
  const [affiliates, setAffiliates] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);
  const [form,       setForm]       = useState({ name:"", email:"", commissionRate:"30" });
  const [creating,   setCreating]   = useState(false);
  const [copied,     setCopied]     = useState(null);

  const showToast = (msg,ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  const load = () => {
    setLoading(true);
    fetch("/api/admin/affiliates").then(r=>r.json()).then(d=>{setAffiliates(d.affiliates??[]);setLoading(false);});
  };
  useEffect(load,[]);

  const create = async () => {
    if (!form.name||!form.email.includes("@")) return showToast("Nom et email valide requis",false);
    setCreating(true);
    const r = await fetch("/api/admin/affiliates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    setCreating(false);
    if (r.ok) { showToast("Affilié créé !"); setForm({name:"",email:"",commissionRate:"30"}); load(); }
    else showToast("Erreur à la création",false);
  };

  const toggle = async (code,currentStatus) => {
    await fetch("/api/admin/affiliates",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,status:currentStatus==="active"?"inactive":"active"})});
    showToast(currentStatus==="active"?"Affilié désactivé":"Affilié activé");
    load();
  };

  const copyLink = (code) => {
    navigator.clipboard.writeText(`${window.location.origin}/?ref=${code}`);
    setCopied(code); setTimeout(()=>setCopied(null),2000);
  };

  return (
    <div className="fade-in">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14,marginBottom:24 }}>
        <StatCard icon="🤝" label="Total affiliés"  value={affiliates.length}                                        color="#F0F4FF" />
        <StatCard icon="✅" label="Actifs"          value={affiliates.filter(a=>a.status==="active").length}         color="#10B981" />
        <StatCard icon="🔗" label="Clics totaux"   value={affiliates.reduce((s,a)=>s+a.totalReferrals,0)}           color="#3B82F6" />
        <StatCard icon="💰" label="Conversions"    value={affiliates.reduce((s,a)=>s+a.convertedReferrals,0)}       color="#FCD34D" />
      </div>

      {/* Create form */}
      <div style={{ ...S.card,marginBottom:20 }}>
        <div style={{ fontWeight:700,fontSize:15,marginBottom:14,color:"#F0F4FF" }}>➕ Nouvel affilié</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr auto auto",gap:10,alignItems:"flex-end" }}>
          <div>
            <label style={{ display:"block",fontSize:12,color:"#6B7A99",marginBottom:5 }}>Nom</label>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Jean Dupont" style={S.input} />
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,color:"#6B7A99",marginBottom:5 }}>Email</label>
            <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="jean@exemple.com" style={S.input} />
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,color:"#6B7A99",marginBottom:5 }}>Commission</label>
            <select value={form.commissionRate} onChange={e=>setForm(f=>({...f,commissionRate:e.target.value}))} style={{ ...S.input,width:110 }}>
              {[10,15,20,25,30,40,50].map(n=><option key={n} value={n}>{n}%</option>)}
            </select>
          </div>
          <button className="btn-action" onClick={create} disabled={creating} style={{ ...S.btn(),opacity:creating?.6:1 }}>
            {creating?"...":"Créer"}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? <Spinner /> : affiliates.length===0
        ? <div style={{ ...S.card,textAlign:"center",padding:48,color:"#4B5563" }}>Aucun affilié. Créez le premier ci-dessus.</div>
        : <div style={{ ...S.card,padding:0,overflow:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr><TH>Nom / Email</TH><TH>Code</TH><TH>Commission</TH><TH>Clics</TH><TH>Conversions</TH><TH>Gains</TH><TH>Statut</TH><TH>Actions</TH></tr>
              </thead>
              <tbody>
                {affiliates.map(a=>(
                  <tr key={a.code} className="row-hover" style={{ borderBottom:"1px solid #131922" }}>
                    <TD>
                      <div style={{ fontWeight:600 }}>{a.name}</div>
                      <div style={{ fontSize:11,color:"#6B7A99" }}>{a.email}</div>
                    </TD>
                    <TD><code style={{ background:"#131922",padding:"2px 8px",borderRadius:6,fontSize:13,color:"#60A5FA",letterSpacing:1 }}>{a.code}</code></TD>
                    <TD style={{ color:"#FCD34D",fontWeight:700 }}>{a.commission_rate}%</TD>
                    <TD>{a.totalReferrals}</TD>
                    <TD style={{ color:"#10B981",fontWeight:600 }}>{a.convertedReferrals}</TD>
                    <TD style={{ color:"#FCD34D",fontWeight:700 }}>{fmtMoney(a.totalEarnings)}</TD>
                    <TD><span style={badge(a.status)}>{a.status==="active"?"Actif":"Inactif"}</span></TD>
                    <TD>
                      <div style={{ display:"flex",gap:6 }}>
                        <button className="btn-action" onClick={()=>copyLink(a.code)} style={{ ...S.btn("#131922"),border:"1px solid #1E2733",color:"#60A5FA",fontSize:12 }}>
                          {copied===a.code?"✓ Copié":"🔗 Lien"}
                        </button>
                        <button className="btn-action" onClick={()=>toggle(a.code,a.status)} style={{ ...S.btn("transparent"),border:`1px solid ${a.status==="active"?"rgba(239,68,68,.3)":"rgba(16,185,129,.3)"}`,color:a.status==="active"?"#FCA5A5":"#10B981",fontSize:12 }}>
                          {a.status==="active"?"Désactiver":"Activer"}
                        </button>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }

      <div style={{ ...S.card,marginTop:14,padding:"12px 18px" }}>
        <p style={{ color:"#6B7A99",fontSize:12,margin:0 }}>
          💡 Format lien affilié : <code style={{ color:"#60A5FA" }}>{typeof window!=="undefined"?window.location.origin:"https://getdocswift.com"}/?ref=CODE</code>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── ADS TAB ──────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function AdsTab() {
  const [rewardedAdHtml, setRewardedAdHtml] = useState("");
  const [bannerAdHtml,   setBannerAdHtml]   = useState("");
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [toast,          setToast]          = useState(null);

  const showToast = (msg,ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),2500); };

  useEffect(()=>{
    fetch("/api/admin/ads").then(r=>r.json()).then(d=>{
      setRewardedAdHtml(d.rewardedAdHtml??"");
      setBannerAdHtml(d.bannerAdHtml??"");
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  const save = async () => {
    setSaving(true);
    const r = await fetch("/api/admin/ads",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({rewardedAdHtml,bannerAdHtml})});
    setSaving(false);
    showToast(r.ok?"Tags enregistrés avec succès !":"Erreur lors de la sauvegarde",r.ok);
  };

  if (loading) return <Spinner />;

  return (
    <div className="fade-in">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      <div style={{ ...S.card,marginBottom:16,padding:"14px 18px",background:"rgba(59,130,246,.05)",border:"1px solid rgba(59,130,246,.15)" }}>
        <p style={{ color:"#93C5FD",fontSize:13,margin:0,lineHeight:1.7 }}>
          💡 Collez les tags HTML/script de votre réseau publicitaire (Adsterra, PropellerAds…). Ils sont injectés dynamiquement côté utilisateur.
        </p>
      </div>

      <div style={{ ...S.card,marginBottom:20 }}>
        <label style={{ display:"block",fontWeight:700,fontSize:15,marginBottom:6,color:"#F0F4FF" }}>📺 Publicité récompensée</label>
        <p style={{ color:"#6B7A99",fontSize:13,marginBottom:12,lineHeight:1.6 }}>
          Affichée dans la modale quand l'utilisateur gratuit atteint sa limite. Doit rester visible 30 secondes pour débloquer +3 conversions.
        </p>
        <textarea
          value={rewardedAdHtml}
          onChange={e=>setRewardedAdHtml(e.target.value)}
          placeholder={"<!-- Collez votre tag publicitaire ici -->\n<script type=\"text/javascript\">\n  atOptions = { 'key': '...', 'format': 'iframe' };\n</script>"}
          rows={8}
          style={{ ...S.input,fontFamily:"monospace",resize:"vertical",lineHeight:1.6 }}
        />
      </div>

      <div style={{ ...S.card,marginBottom:24 }}>
        <label style={{ display:"block",fontWeight:700,fontSize:15,marginBottom:6,color:"#F0F4FF" }}>📢 Bannière publicitaire</label>
        <p style={{ color:"#6B7A99",fontSize:13,marginBottom:12,lineHeight:1.6 }}>
          Affichée sous la zone de conversion pour les utilisateurs en plan gratuit.
        </p>
        <textarea
          value={bannerAdHtml}
          onChange={e=>setBannerAdHtml(e.target.value)}
          placeholder="<!-- Collez votre tag bannière ici -->"
          rows={5}
          style={{ ...S.input,fontFamily:"monospace",resize:"vertical",lineHeight:1.6 }}
        />
      </div>

      <button className="btn-action" onClick={save} disabled={saving} style={{ ...S.btn(),opacity:saving?.6:1,padding:"12px 28px",fontSize:14 }}>
        {saving?"Enregistrement...":"💾 Enregistrer les tags"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// ── SETTINGS TAB ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function SettingsTab() {
  const [cfg,     setCfg]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg,ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  useEffect(()=>{
    fetch("/api/admin/settings").then(r=>r.json()).then(d=>{setCfg(d);setLoading(false);}).catch(()=>setLoading(false));
  },[]);

  const save = async () => {
    setSaving(true);
    const r = await fetch("/api/admin/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(cfg)});
    setSaving(false);
    showToast(r.ok?"Paramètres enregistrés !":"Erreur lors de la sauvegarde",r.ok);
  };

  if (loading||!cfg) return <Spinner />;

  const isPromo = cfg.promo_enabled==="true";
  const savings = ((parseFloat(cfg.normal_price||9.99)-parseFloat(cfg.promo_price||4.99))*parseInt(cfg.promo_months||3)).toFixed(2);

  return (
    <div className="fade-in">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Pricing */}
      <div style={{ ...S.card,marginBottom:20 }}>
        <div style={{ fontWeight:700,fontSize:16,marginBottom:4,color:"#F0F4FF" }}>💰 Tarification</div>
        <div style={{ color:"#6B7A99",fontSize:13,marginBottom:20 }}>
          Configurez les prix affichés sur la landing page. N'oubliez pas de mettre à jour le prix dans Stripe en parallèle.
        </div>

        {/* Promo toggle */}
        <div style={{ ...S.card,background:"#0A0E17",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
          <div>
            <div style={{ fontWeight:700,fontSize:14,color:"#F0F4FF",marginBottom:3 }}>🔥 Offre de lancement active</div>
            <div style={{ fontSize:12,color:"#6B7A99" }}>Affiche le prix promo sur la page d'accueil</div>
          </div>
          <button onClick={()=>setCfg(c=>({...c,promo_enabled:c.promo_enabled==="true"?"false":"true"}))}
            style={{ background:isPromo?"rgba(16,185,129,.12)":"rgba(239,68,68,.08)",border:`1px solid ${isPromo?"rgba(16,185,129,.3)":"rgba(239,68,68,.25)"}`,color:isPromo?"#10B981":"#FCA5A5",padding:"8px 20px",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",minWidth:80,textAlign:"center" }}>
            {isPromo?"ON ✓":"OFF"}
          </button>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14 }}>
          <div>
            <label style={{ display:"block",fontSize:12,color:"#6B7A99",marginBottom:6,fontWeight:600 }}>Prix promo (€/mois)</label>
            <input type="number" step="0.01" value={cfg.promo_price} onChange={e=>setCfg(c=>({...c,promo_price:e.target.value}))}
              style={S.input} />
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,color:"#6B7A99",marginBottom:6,fontWeight:600 }}>Durée promo (mois)</label>
            <input type="number" min="1" value={cfg.promo_months} onChange={e=>setCfg(c=>({...c,promo_months:e.target.value}))}
              style={S.input} />
          </div>
          <div>
            <label style={{ display:"block",fontSize:12,color:"#6B7A99",marginBottom:6,fontWeight:600 }}>Prix normal (€/mois)</label>
            <input type="number" step="0.01" value={cfg.normal_price} onChange={e=>setCfg(c=>({...c,normal_price:e.target.value}))}
              style={S.input} />
          </div>
        </div>

        {isPromo && (
          <div style={{ marginTop:14,background:"rgba(16,185,129,.06)",border:"1px solid rgba(16,185,129,.15)",borderRadius:10,padding:"10px 16px" }}>
            <span style={{ color:"#10B981",fontSize:13 }}>
              ✓ Aperçu : <strong>{cfg.promo_price}€/mois</strong> pendant {cfg.promo_months} mois · puis <strong>{cfg.normal_price}€/mois</strong> · Économie : <strong>{savings}€</strong>
            </span>
          </div>
        )}
      </div>

      {/* Free limit */}
      <div style={{ ...S.card,marginBottom:20 }}>
        <div style={{ fontWeight:700,fontSize:16,marginBottom:4,color:"#F0F4FF" }}>⚡ Quota gratuit</div>
        <div style={{ color:"#6B7A99",fontSize:13,marginBottom:16 }}>Nombre de conversions gratuites par utilisateur par jour.</div>
        <div style={{ maxWidth:200 }}>
          <label style={{ display:"block",fontSize:12,color:"#6B7A99",marginBottom:6,fontWeight:600 }}>Conversions / jour</label>
          <input type="number" min="1" max="50" value={cfg.free_limit} onChange={e=>setCfg(c=>({...c,free_limit:e.target.value}))}
            style={S.input} />
        </div>
        <div style={{ marginTop:10,fontSize:12,color:"#4B5563" }}>
          ✅ Cette valeur est appliquée dynamiquement côté serveur (mise en cache 5 min) — aucune redéployement nécessaire.
        </div>
      </div>

      {/* Stripe reminder */}
      <div style={{ ...S.card,marginBottom:24,background:"rgba(59,130,246,.05)",border:"1px solid rgba(59,130,246,.15)",padding:"16px 20px" }}>
        <div style={{ fontWeight:700,fontSize:14,color:"#93C5FD",marginBottom:8 }}>💳 Rappel Stripe</div>
        <p style={{ color:"#6B7A99",fontSize:13,lineHeight:1.7,margin:0 }}>
          Pour appliquer le prix promo réellement lors du paiement, configurez un <strong style={{ color:"#93C5FD" }}>coupon Stripe</strong> ou un <strong style={{ color:"#93C5FD" }}>prix trial</strong> dans le dashboard Stripe et mettez à jour la variable <code style={{ color:"#60A5FA" }}>STRIPE_PRICE_ID</code> dans Railway.
        </p>
      </div>

      <button className="btn-action" onClick={save} disabled={saving} style={{ ...S.btn(),padding:"12px 28px",fontSize:14,opacity:saving?.6:1 }}>
        {saving?"Enregistrement...":"💾 Enregistrer les paramètres"}
      </button>
    </div>
  );
}

const TABS = [
  { id:"overview",   label:"📊 Vue d'ensemble" },
  { id:"users",      label:"👥 Utilisateurs"   },
  { id:"payments",   label:"💳 Paiements"      },
  { id:"affiliates", label:"🤝 Affiliés"       },
  { id:"ads",        label:"📺 Publicités"     },
  { id:"settings",   label:"⚙️ Paramètres"     },
];

export default function AdminPage() {
  const { data:session, status } = useSession();
  const [tab, setTab] = useState("overview");

  if (status==="loading") {
    return (
      <div style={{ minHeight:"100vh",background:"#07090F",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif" }}>
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight:"100vh",background:"#07090F",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"sans-serif",color:"#F0F4FF" }}>
        <div style={{ fontSize:48 }}>🔒</div>
        <div style={{ fontWeight:700,fontSize:18 }}>Accès restreint</div>
        <p style={{ color:"#8892AA",margin:0 }}>Connexion requise pour accéder au back-office.</p>
        <button onClick={()=>signIn()} style={{ background:"#3B82F6",color:"#fff",border:"none",padding:"11px 28px",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",marginTop:4 }}>
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh",background:"#07090F",color:"#F0F4FF",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{CSS}</style>

      {/* Nav */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"14px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(7,9,15,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1E2733" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ fontWeight:900,fontSize:20,letterSpacing:-1 }}>
            Doc<span style={{ color:"#3B82F6" }}>Swift</span>
          </div>
          <span style={{ background:"rgba(239,68,68,.12)",color:"#FCA5A5",fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:6,border:"1px solid rgba(239,68,68,.2)" }}>
            ADMIN
          </span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:16 }}>
          <a href="/tools" style={{ color:"#6B7A99",textDecoration:"none",fontSize:13 }}>← Retour aux outils</a>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#3B82F6,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700 }}>
              {(session.user?.name||session.user?.email||"A")[0].toUpperCase()}
            </div>
            <span style={{ color:"#6B7A99",fontSize:13 }}>{session.user?.email}</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1200,margin:"0 auto",padding:"80px 24px 60px" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:24,fontWeight:900,letterSpacing:-0.5,marginBottom:4 }}>Back-office DocSwift</h1>
          <p style={{ color:"#6B7A99",fontSize:14,margin:0 }}>Gérez vos utilisateurs, paiements, affiliés et publicités.</p>
        </div>

        {/* Tab bar */}
        <div style={{ display:"flex",gap:0,marginBottom:32,borderBottom:"1px solid #1E2733",overflowX:"auto" }}>
          {TABS.map(t=>(
            <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)}
              style={{ padding:"10px 20px",border:"none",background:"none",cursor:"pointer",fontSize:14,fontWeight:600,whiteSpace:"nowrap",color:tab===t.id?"#3B82F6":"#6B7A99",borderBottom:`2px solid ${tab===t.id?"#3B82F6":"transparent"}`,marginBottom:-1,transition:"all .15s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab==="overview"   && <OverviewTab onNavigate={setTab} />}
        {tab==="users"      && <UsersTab />}
        {tab==="payments"   && <PaymentsTab />}
        {tab==="affiliates" && <AffiliatesTab />}
        {tab==="ads"        && <AdsTab />}
        {tab==="settings"   && <SettingsTab />}
      </div>
    </div>
  );
}
