import GlowCard from "./GlowCard";

export default function StatCard({
  label,
  value,
  sub,
  color = "var(--text)",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <GlowCard>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontSize: 11,
            color: "var(--text-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontFamily: "monospace",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {value}
        </span>
        {sub && <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{sub}</span>}
      </div>
    </GlowCard>
  );
}
