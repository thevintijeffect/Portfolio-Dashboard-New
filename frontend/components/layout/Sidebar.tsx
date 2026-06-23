"use client";

type NavItem = {
  id: string;
  label: string;
  icon: string;
};

export default function Sidebar({
  page,
  setPage,
}: {
  page: string;
  setPage: (id: string) => void;
}) {
  const nav: NavItem[] = [
    { id: "overview", label: "Overview", icon: "◈" },
    { id: "holdings", label: "Holdings", icon: "⊞" },
    { id: "analytics", label: "Analytics", icon: "◉" },
  ];

  return (
    <aside
      style={{
        width: 220,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <div style={{ padding: "0 16px 24px", display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent), var(--purple))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 800,
            color: "var(--bg)",
          }}
        >
          ◈
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: "var(--text)" }}>Portfolio</div>
          <div style={{ fontSize: 10, color: "var(--text-dim)" }}>Dashboard</div>
        </div>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "0 8px" }}>
        {nav.map((n) => (
          <button
            key={n.id}
            onClick={() => setPage(n.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: page === n.id ? "rgba(0, 212, 255, 0.08)" : "transparent",
              border: `1px solid ${page === n.id ? "var(--border-glow)" : "transparent"}`,
              color: page === n.id ? "var(--accent)" : "var(--text-dim)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.5 }}>
          Live data
          <br />
          <span style={{ color: "var(--text-dim)" }}>Connected</span>
        </div>
      </div>
    </aside>
  );
}
