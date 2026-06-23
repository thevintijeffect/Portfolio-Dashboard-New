"use client";

export default function TopBar({
  title,
  onRefresh,
  refreshing,
  lastRefresh,
}: {
  title: string;
  onRefresh: () => void;
  refreshing: boolean;
  lastRefresh: string;
}) {
  return (
    <header
      style={{
        height: 64,
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        justifyContent: "space-between",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} />
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Live · SGD</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "monospace" }}>
          {lastRefresh}
        </div>
        <button
          onClick={onRefresh}
          style={{
            background: refreshing ? "var(--accent)" : "var(--card)",
            border: `1px solid ${refreshing ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 8,
            padding: "6px 14px",
            color: refreshing ? "var(--bg)" : "var(--text)",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>
    </header>
  );
}
