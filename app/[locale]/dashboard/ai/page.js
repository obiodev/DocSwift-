"use client";

export default function DashboardAI() {
  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:40,textAlign:"center",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div>
        <div style={{ fontSize:56,marginBottom:24 }}>🤖</div>
        <h1 style={{ fontSize:28,fontWeight:900,color:"#F0F4FF",marginBottom:12,letterSpacing:-1 }}>DocSwift AI</h1>
        <p style={{ color:"#6B7A99",fontSize:16,maxWidth:420,lineHeight:1.7,marginBottom:32 }}>
          Chat avec vos PDFs, extraction de clauses, résumé exécutif et traduction FR/EN/AR — en cours de développement.
        </p>
        <div style={{ display:"inline-block",background:"rgba(139,92,246,.1)",border:"1px solid rgba(139,92,246,.25)",color:"#A78BFA",padding:"8px 22px",borderRadius:20,fontSize:13,fontWeight:700 }}>
          🚀 Disponible bientôt — Plan Pro & Business
        </div>
      </div>
    </div>
  );
}
