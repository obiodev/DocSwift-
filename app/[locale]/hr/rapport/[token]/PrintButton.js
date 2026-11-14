"use client";

export default function PrintButton({ label }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-print"
      style={{ background: "#111827", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
    >
      {label}
    </button>
  );
}
