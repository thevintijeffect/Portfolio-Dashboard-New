"use client";

import React from "react";

export default function GlowCard({
  children,
  accent = false,
  className = "",
}: {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "var(--card)",
        border: `1px solid ${accent ? "var(--border-glow)" : "var(--border)"}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: accent ? "0 0 32px rgba(0, 212, 255, 0.08)" : "none",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
