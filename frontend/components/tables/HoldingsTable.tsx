"use client";

import Badge from "../ui/Badge";
import { fmtSGD, fmtPct } from "@/lib/formatters";

type Holding = {
  name?: string;
  type?: string;
  ticker?: string;
  currency?: string;
  value_sgd?: number;
  cost_sgd?: number;
  pnl_sgd?: number;
  pnl_pct?: number;
  weight_pct?: number;
};

export default function HoldingsTable({ holdings = [] }: { holdings?: Holding[] }) {
  const rows = Array.isArray(holdings) ? holdings : [];

  if (!rows.length) {
    return <div style={{ color: "var(--text-dim)", padding: "12px 16px" }}>No holdings available.</div>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["Name", "Type", "Ticker", "Ccy", "Value", "Cost", "P&L", "P&L %", "Weight"].map((label) => (
              <th
                key={label}
                style={{
                  padding: "14px 16px",
                  textAlign: "left",
                  color: "var(--text-dim)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                  background: "var(--card)",
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((h, i) => {
            const pnl = typeof h.pnl_sgd === "number" ? h.pnl_sgd : 0;
            const pnlPct = typeof h.pnl_pct === "number" ? h.pnl_pct : 0;
            const weight = typeof h.weight_pct === "number" ? h.weight_pct : 0;

            return (
              <tr
                key={`${h.ticker ?? h.name ?? "row"}-${i}`}
                style={{
                  borderBottom: "1px solid var(--border)",
                  background: i % 2 === 0 ? "var(--card)" : "rgba(13,18,25,0.8)",
                }}
              >
                <td style={{ padding: "12px 16px", color: "var(--text)", fontWeight: 500 }}>
                  {h.name ?? "—"}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Badge type={h.type ?? "other"} />
                </td>
                <td style={{ padding: "12px 16px", color: "var(--accent-dim)", fontFamily: "monospace" }}>
                  {h.ticker ?? "—"}
                </td>
                <td style={{ padding: "12px 16px", color: "var(--text-dim)", fontFamily: "monospace" }}>
                  {h.currency ?? "—"}
                </td>
                <td style={{ padding: "12px 16px", color: "var(--text)", fontFamily: "monospace", textAlign: "right" }}>
                  {fmtSGD(h.value_sgd ?? 0)}
                </td>
                <td style={{ padding: "12px 16px", color: "var(--text-dim)", fontFamily: "monospace", textAlign: "right" }}>
                  {fmtSGD(h.cost_sgd ?? 0)}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    color: pnl >= 0 ? "var(--green)" : "var(--red)",
                    fontFamily: "monospace",
                    textAlign: "right",
                  }}
                >
                  {pnl >= 0 ? "+" : ""}
                  {fmtSGD(pnl)}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <span style={{ color: pnlPct >= 0 ? "var(--green)" : "var(--red)" }}>
                    {fmtPct(pnlPct)}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text-dim)" }}>
                  {weight.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
