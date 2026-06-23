"use client";

import Badge from "../ui/Badge";
import { fmtSGD, fmtPct } from "@/lib/formatters";

export default function HoldingsTable({ holdings }: { holdings: any[] }) {
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
          {holdings.map((h, i) => (
            <tr
              key={i}
              style={{
                borderBottom: "1px solid var(--border)",
                background: i % 2 === 0 ? "var(--card)" : "rgba(13,18,25,0.8)",
              }}
            >
              <td style={{ padding: "12px 16px", color: "var(--text)", fontWeight: 500 }}>{h.name}</td>
              <td style={{ padding: "12px 16px" }}><Badge type={h.type} /></td>
              <td style={{ padding: "12px 16px", color: "var(--accent-dim)", fontFamily: "monospace" }}>{h.ticker}</td>
              <td style={{ padding: "12px 16px", color: "var(--text-dim)", fontFamily: "monospace" }}>{h.currency}</td>
              <td style={{ padding: "12px 16px", color: "var(--text)", fontFamily: "monospace", textAlign: "right" }}>
                {fmtSGD(h.value_sgd)}
              </td>
              <td style={{ padding: "12px 16px", color: "var(--text-dim)", fontFamily: "monospace", textAlign: "right" }}>
                {fmtSGD(h.cost_sgd)}
              </td>
              <td style={{ padding: "12px 16px", color: h.pnl_sgd >= 0 ? "var(--green)" : "var(--red)", fontFamily: "monospace", textAlign: "right" }}>
                {h.pnl_sgd >= 0 ? "+" : ""}{fmtSGD(h.pnl_sgd)}
              </td>
              <td style={{ padding: "12px 16px", textAlign: "right" }}>
                <span style={{ color: h.pnl_pct >= 0 ? "var(--green)" : "var(--red)" }}>
                  {fmtPct(h.pnl_pct)}
                </span>
              </td>
              <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text-dim)" }}>
                {h.weight_pct.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
