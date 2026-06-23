export default function Badge({ type }: { type: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    Stock: { bg: "#00d4ff18", color: "var(--accent)", label: "Stock" },
    ETF: { bg: "#00e5a018", color: "var(--green)", label: "ETF" },
    "Mutual Fund": { bg: "#ffb83018", color: "var(--gold)", label: "MF" },
    Gold: { bg: "#f59e0b18", color: "#f59e0b", label: "Gold" },
    Cash: { bg: "#8b5cf618", color: "var(--purple)", label: "Cash" },
  };

  const s = map[type] || map.Stock;

  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: 11,
        fontFamily: "monospace",
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}
