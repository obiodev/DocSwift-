"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signIn }          from "next-auth/react";

// ─── Shared styles ─────────────────────────────────────────────────────────
const card  = { background: "#0D1117", border: "1px solid #1E2733", borderRadius: 14, padding: 24 };
const input = { width: "100%", background: "#07090F", border: "1px solid #1E2733", color: "#F0F4FF", padding: "10px 14px", borderRadius: 10, fontSize: 14, boxSizing: "border-box" };
const btn   = (color = "#3B82F6") => ({ background: color, color: "#fff", border: "none", padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer" });
const badge = (type) => {
  const map = {
    pro:      { bg: "rgba(16,185,129,.15)",  color: "#10B981", border: "rgba(16,185,129,.3)" },
    free:     { bg: "rgba(107,118,153,.1)",  color: "#6B7A99", border: "#1E2733" },
    active:   { bg: "rgba(59,130,246,.15)",  color: "#60A5FA", border: "rgba(59,130,246,.3)" },
    inactive: { bg: "rgba(239,68,68,.1)",    color: "#FCA5A5", border: "rgba(239,68,68,.3)" },
    gifted:   { bg: "rgba(245,158,11,.1)",   color: "#FCD34D", border: "rgba(245,158,11,.3)" },
    converted:{ bg: "rgba(16,185,129,.15)",  color: "#10B981", border: "rgba(16,185,129,.3)" },
    pending:  { bg: "rgba(107,118,153,.1)",  color: "#6B7A99", border: "#1E2733" },
  };
  const s = map[type] ?? map.free;
  return { background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: `1px solid ${s.border}` };
};
const TH = ({ children }) => <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7A99", textTransform: "uppercase", letterSpacing: .5, borderBottom: "1px solid #1E2733" }}>{children}</th>;
const TD = ({ children, style }) => <td style={{ padding: "12px 16px", fontSize: 13, color: "#D1E8FF", ...style }}>{children}</td>;

function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR");
}
function fmtMoney(n) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n ?? 0);
}

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ msg, ok }) {
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, background: ok ? "#052e16" : "#1f0d0d", border: `1px solid ${ok ? "#10B981" : "#EF4444"}`, color: ok ? "#10B981" : "#FCA5A5", borderRadius: 12, padding: "13px 22px", fontSize: 14, fontWeight: 600, boxShadow: "0 4px 24px rgba(0,0,0,.5)" }}>
      {ok ? "✓" : "✕"} {msg}
    </div>
  );
}

// ─── Users Tab ─────────────────────────────────────────────────────────────
function UsersTab() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");
  const [toast,   setToast]   = useState(null);
  // Gift form
  const [giftEmail,  setGiftEmail]  = useState("");
  const [giftMonths, setGiftMonths] = useState("1");
  const [giftLoading, setGiftLoading] = useState(false);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const load = () => {
    setLoading(true);
    fetch("/api/admin/users").then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const changePlan = async (email, status) => {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, status }) });
    showToast(`Plan de ${email} changé en ${status}`);
    load();
  };

  const giftPro = async () => {
    if (!giftEmail.includes("@")) return showToast("Email invalide", false);
    setGiftLoading(true);
    const r = await fetch("/api/admin/gift", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: giftEmail, months: giftMonths }) });
    setGiftLoading(false);
    if (r.ok) { showToast(`Compte Pro offert à ${giftEmail} pour ${giftMonths} mois`); setGiftEmail(""); load(); }
    else showToast("Erreur lors de l'attribution", false);
  };

  if (loading) return <div style={{ textAlign: "center", padding: 48, color: "#6B7A99" }}>Chargement...</div>;

  const { users = [], stats = {} } = data ?? {};
  const filtered = users.filter(u => {
    const s = u.email.toLowerCase().includes(search.toLowerCase());
    const f = filter === "all" || u.status === filter || (filter === "free" && u.status !== "pro");
    return s && f;
  });

  return (
    <div>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total",      value: stats.totalUsers ?? 0,      icon: "👥", color: "#F0F4FF" },
          { label: "Pro",        value: stats.proUsers ?? 0,        icon: "✨", color: "#10B981" },
          { label: "Gratuit",    value: stats.freeUsers ?? 0,       icon: "🆓", color: "#6B7A99" },
          { label: "Aujourd'hui",value: stats.totalUsageToday ?? 0, icon: "⚡", color: "#3B82F6" },
        ].map(s => (
          <div key={s.label} style={card}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6B7A99", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Gift Pro form */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#F0F4FF" }}>🎁 Offrir un compte Pro</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={giftEmail} onChange={e => setGiftEmail(e.target.value)} placeholder="email@exemple.com" style={{ ...input, flex: 2, minWidth: 200 }} />
          <select value={giftMonths} onChange={e => setGiftMonths(e.target.value)} style={{ ...input, width: 140 }}>
            {[1,3,6,12].map(m => <option key={m} value={m}>{m} mois</option>)}
          </select>
          <button onClick={giftPro} disabled={giftLoading} style={{ ...btn("#10B981"), opacity: giftLoading ? .6 : 1 }}>
            {giftLoading ? "..." : "🎁 Offrir Pro"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." style={{ ...input, flex: 1, minWidth: 180 }} />
        {["all", "pro", "free"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${filter === f ? "#3B82F6" : "#1E2733"}`, fontSize: 13, fontWeight: 600, cursor: "pointer", background: filter === f ? "#3B82F6" : "transparent", color: filter === f ? "#fff" : "#6B7A99" }}>
            {f === "all" ? "Tous" : f === "pro" ? "Pro ✨" : "Gratuit"}
          </button>
        ))}
        <span style={{ color: "#4B5563", fontSize: 13 }}>{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: 48, color: "#4B5563" }}>
          {users.length === 0 ? "Aucun utilisateur. Ils apparaissent après le premier paiement Stripe." : "Aucun résultat."}
        </div>
      ) : (
        <div style={{ ...card, padding: 0, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><TH>Email</TH><TH>Plan</TH><TH>Utilisations</TH><TH>Fin abonnement</TH><TH>Inscrit</TH><TH>Actions</TH></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.email} style={{ borderBottom: "1px solid #0D1117" }}>
                  <TD>{u.email}</TD>
                  <TD><span style={badge(u.status)}>{u.status === "pro" ? "PRO ✨" : "GRATUIT"}</span></TD>
                  <TD style={{ color: u.usageToday >= 5 ? "#EF4444" : "#8892AA" }}>{u.usageToday}</TD>
                  <TD>{fmt(u.periodEnd)}</TD>
                  <TD>{fmt(u.createdAt)}</TD>
                  <TD>
                    {u.status === "pro"
                      ? <button onClick={() => changePlan(u.email, "free")} style={{ ...btn("transparent"), color: "#FCA5A5", border: "1px solid rgba(239,68,68,.3)" }}>Rétrograder</button>
                      : <button onClick={() => changePlan(u.email, "pro")}  style={{ ...btn("transparent"), color: "#10B981",  border: "1px solid rgba(16,185,129,.3)" }}>Activer Pro</button>}
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Payments Tab ──────────────────────────────────────────────────────────
function PaymentsTab() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    fetch("/api/admin/payments").then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 48, color: "#6B7A99" }}>Chargement...</div>;

  const { payments = [], stats = {} } = data ?? {};
  const filtered = payments.filter(p => p.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Abonnés actifs", value: stats.pro ?? 0,        icon: "✨", color: "#10B981" },
          { label: "Via Stripe",     value: stats.stripe ?? 0,     icon: "💳", color: "#3B82F6" },
          { label: "Comptes offerts",value: stats.gifted ?? 0,     icon: "🎁", color: "#FCD34D" },
          { label: "MRR estimé",     value: fmtMoney(stats.mrr),   icon: "💰", color: "#F0F4FF" },
        ].map(s => (
          <div key={s.label} style={card}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: s.label === "MRR estimé" ? 18 : 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6B7A99", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par email..." style={{ ...input, marginBottom: 16 }} />

      <div style={{ ...card, padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><TH>Email</TH><TH>Statut</TH><TH>Source</TH><TH>ID client Stripe</TH><TH>Fin période</TH><TH>Dernière mise à jour</TH></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 48, color: "#4B5563" }}>Aucun paiement enregistré.</td></tr>
            ) : filtered.map(p => (
              <tr key={p.email} style={{ borderBottom: "1px solid #0D1117" }}>
                <TD>{p.email}</TD>
                <TD><span style={badge(p.status)}>{p.status === "pro" ? "PRO" : "FREE"}</span></TD>
                <TD>
                  {p.giftedBy
                    ? <span style={badge("gifted")}>🎁 Offert</span>
                    : p.stripeSubId
                      ? <span style={badge("converted")}>💳 Stripe</span>
                      : <span style={badge("pending")}>Manuel</span>}
                </TD>
                <TD>
                  {p.stripeCustomerId
                    ? <a href={`https://dashboard.stripe.com/customers/${p.stripeCustomerId}`} target="_blank" rel="noreferrer" style={{ color: "#60A5FA", textDecoration: "none", fontFamily: "monospace", fontSize: 12 }}>{p.stripeCustomerId.slice(0, 18)}…</a>
                    : "—"}
                </TD>
                <TD>{fmt(p.periodEnd)}</TD>
                <TD style={{ color: "#6B7A99" }}>{fmt(p.updatedAt)}</TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Affiliates Tab ────────────────────────────────────────────────────────
function AffiliatesTab() {
  const [affiliates, setAffiliates] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);
  const [form, setForm] = useState({ name: "", email: "", commissionRate: "30" });
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(null);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const load = () => {
    setLoading(true);
    fetch("/api/admin/affiliates").then(r => r.json()).then(d => { setAffiliates(d.affiliates ?? []); setLoading(false); });
  };
  useEffect(load, []);

  const create = async () => {
    if (!form.name || !form.email.includes("@")) return showToast("Nom et email valide requis", false);
    setCreating(true);
    const r = await fetch("/api/admin/affiliates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setCreating(false);
    if (r.ok) { showToast("Affilié créé !"); setForm({ name: "", email: "", commissionRate: "30" }); load(); }
    else showToast("Erreur à la création", false);
  };

  const toggle = async (code, currentStatus) => {
    await fetch("/api/admin/affiliates", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, status: currentStatus === "active" ? "inactive" : "active" }) });
    load();
  };

  const copyLink = (code) => {
    const url = `${window.location.origin}/?ref=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "https://votresite.com";

  return (
    <div>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
        <div style={card}><div style={{ fontSize: 20, marginBottom: 6 }}>🤝</div><div style={{ fontSize: 26, fontWeight: 800 }}>{affiliates.length}</div><div style={{ fontSize: 12, color: "#6B7A99" }}>Affiliés total</div></div>
        <div style={card}><div style={{ fontSize: 20, marginBottom: 6 }}>✅</div><div style={{ fontSize: 26, fontWeight: 800, color: "#10B981" }}>{affiliates.filter(a => a.status === "active").length}</div><div style={{ fontSize: 12, color: "#6B7A99" }}>Actifs</div></div>
        <div style={card}><div style={{ fontSize: 20, marginBottom: 6 }}>🔗</div><div style={{ fontSize: 26, fontWeight: 800, color: "#3B82F6" }}>{affiliates.reduce((s, a) => s + a.totalReferrals, 0)}</div><div style={{ fontSize: 12, color: "#6B7A99" }}>Clics totaux</div></div>
        <div style={card}><div style={{ fontSize: 20, marginBottom: 6 }}>💰</div><div style={{ fontSize: 26, fontWeight: 800, color: "#FCD34D" }}>{affiliates.reduce((s, a) => s + a.convertedReferrals, 0)}</div><div style={{ fontSize: 12, color: "#6B7A99" }}>Conversions</div></div>
      </div>

      {/* Create form */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#F0F4FF" }}>➕ Nouvel affilié</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 10, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 12, color: "#6B7A99", display: "block", marginBottom: 5 }}>Nom</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jean Dupont" style={input} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#6B7A99", display: "block", marginBottom: 5 }}>Email</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jean@exemple.com" style={input} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#6B7A99", display: "block", marginBottom: 5 }}>Commission %</label>
            <select value={form.commissionRate} onChange={e => setForm(f => ({ ...f, commissionRate: e.target.value }))} style={{ ...input, width: 100 }}>
              {[10,15,20,25,30,40,50].map(n => <option key={n} value={n}>{n}%</option>)}
            </select>
          </div>
          <button onClick={create} disabled={creating} style={{ ...btn(), marginTop: 20, opacity: creating ? .6 : 1 }}>
            {creating ? "..." : "Créer"}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#6B7A99" }}>Chargement...</div>
      ) : affiliates.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: 48, color: "#4B5563" }}>Aucun affilié. Créez le premier ci-dessus.</div>
      ) : (
        <div style={{ ...card, padding: 0, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><TH>Nom / Email</TH><TH>Code</TH><TH>Commission</TH><TH>Clics</TH><TH>Conversions</TH><TH>Gains</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
            <tbody>
              {affiliates.map(a => (
                <tr key={a.code} style={{ borderBottom: "1px solid #0D1117" }}>
                  <TD>
                    <div style={{ fontWeight: 600 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: "#6B7A99" }}>{a.email}</div>
                  </TD>
                  <TD>
                    <code style={{ background: "#131922", padding: "2px 8px", borderRadius: 6, fontSize: 13, color: "#60A5FA", letterSpacing: 1 }}>{a.code}</code>
                  </TD>
                  <TD style={{ color: "#FCD34D" }}>{a.commission_rate}%</TD>
                  <TD>{a.totalReferrals}</TD>
                  <TD style={{ color: "#10B981" }}>{a.convertedReferrals}</TD>
                  <TD style={{ color: "#FCD34D" }}>{fmtMoney(a.totalEarnings)}</TD>
                  <TD><span style={badge(a.status)}>{a.status === "active" ? "Actif" : "Inactif"}</span></TD>
                  <TD>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button onClick={() => copyLink(a.code)} style={{ ...btn("#131922"), border: "1px solid #1E2733", color: "#60A5FA", fontSize: 12 }}>
                        {copied === a.code ? "✓ Copié" : "🔗 Lien"}
                      </button>
                      <button onClick={() => toggle(a.code, a.status)} style={{ ...btn("transparent"), border: `1px solid ${a.status === "active" ? "rgba(239,68,68,.3)" : "rgba(16,185,129,.3)"}`, color: a.status === "active" ? "#FCA5A5" : "#10B981", fontSize: 12 }}>
                        {a.status === "active" ? "Désactiver" : "Activer"}
                      </button>
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 16, ...card, padding: "12px 18px" }}>
        <p style={{ color: "#6B7A99", fontSize: 12, margin: 0 }}>
          💡 Lien affilié format : <code style={{ color: "#60A5FA" }}>{origin}/?ref=CODE</code> — le code est stocké et transmis lors du checkout Stripe.
        </p>
      </div>
    </div>
  );
}

// ─── Ads Tab ───────────────────────────────────────────────────────────────
function AdsTab() {
  const [rewardedAdHtml, setRewardedAdHtml] = useState("");
  const [bannerAdHtml,   setBannerAdHtml]   = useState("");
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [toast,          setToast]          = useState(null);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  useEffect(() => {
    fetch("/api/admin/ads").then(r => r.json()).then(d => {
      setRewardedAdHtml(d.rewardedAdHtml ?? "");
      setBannerAdHtml(d.bannerAdHtml ?? "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    const r = await fetch("/api/admin/ads", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rewardedAdHtml, bannerAdHtml }) });
    setSaving(false);
    showToast(r.ok ? "Tags enregistrés !" : "Erreur lors de la sauvegarde", r.ok);
  };

  if (loading) return <div style={{ textAlign: "center", padding: 48, color: "#6B7A99" }}>Chargement...</div>;

  return (
    <div>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      <p style={{ color: "#8892AA", fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
        Collez les tags HTML/script de votre réseau publicitaire (Adsterra, PropellerAds…).<br />
        Ils sont injectés dynamiquement côté utilisateur.
      </p>

      <div style={{ ...card, marginBottom: 24 }}>
        <label style={{ display: "block", fontWeight: 700, fontSize: 15, marginBottom: 6, color: "#F0F4FF" }}>📺 Pub récompensée (+3 conversions)</label>
        <p style={{ color: "#6B7A99", fontSize: 13, marginBottom: 10 }}>Affichée dans la modale quand l'utilisateur gratuit atteint la limite. Doit rester visible 30 secondes.</p>
        <textarea
          value={rewardedAdHtml}
          onChange={e => setRewardedAdHtml(e.target.value)}
          placeholder={"<!-- Collez votre tag publicitaire ici -->\n<script type=\"text/javascript\">\n  atOptions = { 'key': '...', 'format': 'iframe' };\n</script>"}
          rows={8}
          style={{ ...input, fontFamily: "monospace", resize: "vertical", lineHeight: 1.6 }}
        />
      </div>

      <div style={{ ...card, marginBottom: 24 }}>
        <label style={{ display: "block", fontWeight: 700, fontSize: 15, marginBottom: 6, color: "#F0F4FF" }}>📢 Bannière (outils)</label>
        <p style={{ color: "#6B7A99", fontSize: 13, marginBottom: 10 }}>Affichée sous la zone de conversion pour les utilisateurs gratuits.</p>
        <textarea
          value={bannerAdHtml}
          onChange={e => setBannerAdHtml(e.target.value)}
          placeholder="<!-- Collez votre tag bannière ici -->"
          rows={5}
          style={{ ...input, fontFamily: "monospace", resize: "vertical", lineHeight: 1.6 }}
        />
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <button onClick={save} disabled={saving} style={{ ...btn(), opacity: saving ? .6 : 1, padding: "11px 28px" }}>
          {saving ? "Enregistrement..." : "💾 Enregistrer les tags"}
        </button>
      </div>

      <div style={{ ...card, marginTop: 24, padding: "14px 18px" }}>
        <p style={{ color: "#6B7A99", fontSize: 12, margin: 0, lineHeight: 1.7 }}>
          ⚠️ <strong style={{ color: "#8892AA" }}>SQL requis</strong> (une seule fois dans Supabase) :<br />
          <code style={{ color: "#60A5FA", fontFamily: "monospace" }}>CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT);</code>
        </p>
      </div>
    </div>
  );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────
const TABS = [
  { id: "users",      label: "👥 Utilisateurs" },
  { id: "payments",   label: "💳 Paiements" },
  { id: "affiliates", label: "🤝 Affiliés" },
  { id: "ads",        label: "📺 Publicités" },
];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState("users");

  if (status === "loading") {
    return <div style={{ minHeight: "100vh", background: "#07090F", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7A99" }}>Chargement...</div>;
  }

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", background: "#07090F", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "sans-serif", color: "#F0F4FF" }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <p style={{ color: "#8892AA" }}>Connexion requise pour accéder au back-office.</p>
        <button onClick={() => signIn()} style={{ background: "#3B82F6", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#07090F", color: "#F0F4FF", fontFamily: "sans-serif" }}>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(7,9,15,.97)", borderBottom: "1px solid #1E2733" }}>
        <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: -1 }}>
          Doc<span style={{ color: "#3B82F6" }}>Swift</span>
          <span style={{ color: "#EF4444", fontSize: 11, fontWeight: 700, marginLeft: 10, background: "rgba(239,68,68,.15)", padding: "3px 8px", borderRadius: 6 }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a href="/tools" style={{ color: "#8892AA", textDecoration: "none", fontSize: 13 }}>← Outils</a>
          <span style={{ color: "#6B7A99", fontSize: 13 }}>{session.user?.email}</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "90px 24px 60px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, marginBottom: 4 }}>Back-office</h1>
        <p style={{ color: "#6B7A99", fontSize: 14, marginBottom: 24 }}>Gérez vos utilisateurs, paiements et affiliés.</p>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 2, marginBottom: 32, borderBottom: "1px solid #1E2733" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: tab === t.id ? "#3B82F6" : "#6B7A99", borderBottom: `2px solid ${tab === t.id ? "#3B82F6" : "transparent"}`, marginBottom: -1, transition: "color .15s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "users"      && <UsersTab />}
        {tab === "payments"   && <PaymentsTab />}
        {tab === "affiliates" && <AffiliatesTab />}
        {tab === "ads"        && <AdsTab />}
      </div>
    </div>
  );
}
