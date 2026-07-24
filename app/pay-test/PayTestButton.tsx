"use client";

import { useState } from "react";

export default function PayTestButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1 }),
      });
      const data = await res.json();
      if (res.ok && data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      setError(data.error ? JSON.stringify(data.error) : "Unknown error");
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
      <button
        onClick={pay}
        disabled={loading}
        style={{
          background: "#8B2F3A",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "14px 28px",
          fontSize: 16,
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "..." : "გადაიხადე 1 ₾"}
      </button>
      {error && (
        <pre
          style={{
            maxWidth: 480,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: "#b00020",
            fontSize: 13,
            textAlign: "left",
          }}
        >
          {error}
        </pre>
      )}
    </div>
  );
}
