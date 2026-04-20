"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useLocale } from "next-intl";

const CSS = `
  .dash-sidebar { transition: transform .25s cubic-bezier(.4,0,.2,1); }
  .nav-item { transition: all .15s ease; }
  .nav-item:hover { background: rgba(59,130,246,.08) !important; color: #F0F4FF !important; }
  .nav-item.active { background: rgba(59,130,246,.12) !important; color: #60A5FA !important; }
  .nav-item.active .nav-dot { opacity:1 !important; }
  @media(max-width:768px) {
    .dash-sidebar { position:fixed!important; left:0!important; top:0!important; bottom:0!important; z-index:300!important; transform:translateX(-100%); width:240px!important; }
    .dash-sidebar.open { transform:translateX(0)!important; }
    .dash-overlay { display:block!important; }
    .dash-main { margin-left:0!important; }
    .dash-topbar { display:flex!important; }
  }
`;

const LINKS = [
  { href:"/dashboard",     icon:"🏠", label:"Vue d'ensemble" },
  { href:"/dashboard/hr",  icon:"👥", label:"DocSwift HR",   badge:"⭐", color:"#F97316" },
  { href:"/dashboard/ai",  icon:"🤖", label:"DocSwift AI",   badge:"Bientôt", badgeBg:"#6B7A99" },
  { href:"/dashboard/pdf", icon:"📄", label:"PDF Essentials" },
];

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router   = useRouter();
  const pathname = usePathname();
  const locale   = useLocale();

  const prefix = locale === "fr" ? "" : `/${locale}`;

  useEffect(() => {
    if (status === "unauthenticated") signIn();
  }, [status]);

  if (status === "loading" || !session) {
    return (
      <div style={{ minHeight:"100vh",background:"#07090F",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <div style={{ color:"#6B7A99",fontSize:14 }}>Chargement…</div>
      </div>
    );
  }

  const go = (href) => router.push(`${prefix}${href}`);

  const isActive = (href) => {
    const full = `${prefix}${href}`;
    if (href === "/dashboard") return pathname === full;
    return pathname.startsWith(full);
  };

  return (
    <div style={{ minHeight:"100vh",background:"#07090F",color:"#F0F4FF",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",display:"flex" }}>
      <style>{CSS}</style>

      {/* ── Sidebar ── */}
      <aside className="dash-sidebar" style={{ width:220,background:"#0A0D14",borderRight:"1px solid #1E2733",display:"flex",flexDirection:"column",flexShrink:0,minHeight:"100vh" }}>

        {/* Logo */}
        <div style={{ padding:"22px 20px 16px",borderBottom:"1px solid #1E2733" }}>
          <div style={{ fontWeight:900,fontSize:20,letterSpacing:-0.8,cursor:"pointer" }} onClick={() => go("/")}>
            Doc<span style={{ color:"#3B82F6" }}>Swift</span>
            <span style={{ fontSize:10,fontWeight:700,color:"#F97316",marginLeft:5,background:"rgba(249,115,22,.12)",border:"1px solid rgba(249,115,22,.3)",padding:"2px 6px",borderRadius:5 }}>B2B</span>
          </div>
          <div style={{ fontSize:11,color:"#4B5563",marginTop:4 }}>Dashboard</div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",gap:2 }}>
          {LINKS.map(link => (
            <button key={link.href}
              className={`nav-item${isActive(link.href) ? " active" : ""}`}
              onClick={() => go(link.href)}
              style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"none",cursor:"pointer",background:"transparent",color:"#8892AA",fontSize:13,fontWeight:600,textAlign:"left",width:"100%",position:"relative" }}>
              <span className="nav-dot" style={{ position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:3,height:18,background:"#3B82F6",borderRadius:99,opacity:0 }} />
              <span style={{ fontSize:16 }}>{link.icon}</span>
              <span style={{ flex:1 }}>{link.label}</span>
              {link.badge && (
                <span style={{ fontSize:9,fontWeight:700,background:link.badgeBg ?? `${link.color}20`,color:link.color ?? "#F97316",border:`1px solid ${link.color ?? "#F97316"}40`,padding:"2px 5px",borderRadius:6 }}>
                  {link.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:"14px 16px",borderTop:"1px solid #1E2733",display:"flex",alignItems:"center",gap:10 }}>
          {session.user?.image
            ? <img src={session.user.image} alt="" style={{ width:32,height:32,borderRadius:"50%",flexShrink:0 }} />
            : <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#3B82F6,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#fff",flexShrink:0 }}>
                {session.user?.name?.[0] ?? session.user?.email?.[0] ?? "?"}
              </div>
          }
          <div style={{ flex:1,overflow:"hidden" }}>
            <div style={{ fontSize:12,fontWeight:700,color:"#F0F4FF",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
              {session.user?.name ?? session.user?.email?.split("@")[0]}
            </div>
            <div style={{ fontSize:10,color:"#4B5563",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
              {session.user?.email}
            </div>
          </div>
          <button onClick={() => go("/")} style={{ background:"none",border:"none",color:"#4B5563",cursor:"pointer",fontSize:16,padding:4 }} title="Retour site">↗</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main" style={{ flex:1,overflow:"auto" }}>
        {children}
      </main>
    </div>
  );
}
