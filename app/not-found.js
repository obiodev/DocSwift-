"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07090F",
      color: "#F0F4FF",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
      textAlign: "center",
      padding: 24,
    }}>
      <div style={{ fontSize: 80, lineHeight: 1 }}>📄</div>
      <div style={{ fontSize: "clamp(64px,10vw,120px)", fontWeight: 900, color: "#1E2733", letterSpacing: -4, lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, letterSpacing: -0.5, margin: "0 0 8px" }}>
        Page introuvable
      </h1>
      <p style={{ color: "#6B7A99", fontSize: 15, maxWidth: 380, lineHeight: 1.6, margin: 0 }}>
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
        <button
          onClick={() => router.push("/")}
          style={{ background: "#3B82F6", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
        >
          Retour à l&apos;accueil
        </button>
        <button
          onClick={() => router.push("/tools")}
          style={{ background: "none", color: "#8892AA", border: "1px solid #1E2733", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
        >
          Voir les outils
        </button>
      </div>
    </div>
  );
}
