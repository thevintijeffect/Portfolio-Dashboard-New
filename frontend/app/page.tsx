"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import GlowCard from "@/components/cards/GlowCard";
import StatCard from "@/components/cards/StatCard";
import MiniSparkline from "@/components/charts/MiniSparkline";
import AllocationDonut from "@/components/charts/AllocationDonut";
import ExposureBar from "@/components/charts/ExposureBar";
import HoldingsTable from "@/components/tables/HoldingsTable";
import { fetchDashboard } from "@/lib/api";
import { fmtSGD, fmtPct, fmtDateTime } from "@/lib/formatters";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";

export default function Page() {
  const [page, setPage] = useState("overview");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const res = await fetchDashboard();
      setData(res);
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar page={page} setPage={setPage} />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar
          title={page === "overview" ? "Overview" : page === "holdings" ? "Holdings" : "Analytics"}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          lastRefresh={fmtDateTime(data.meta.last_refresh)}
        />

        <div style={{ flex: 1, padding: 24, overflowY: "auto", maxWidth: 1400 }}>
          {page === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <GlowCard accent>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                      Total Net Worth · SGD
                    </div>
                    <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1 }}>
                      {fmtSGD(data.summary.networth_sgd)}
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                      <span style={{ color: "var(--green)", fontWeight: 600 }}>
                        {fmtSGD(data.summary.total_pnl_sgd)} unrealized
                      </span>
                      <span style={{ color: "var(--green)" }}>
                        {fmtPct(data.summary.pnl_pct)}
                      </span>
                    </div>
                  </div>
                  <MiniSparkline
                    data={data.history?.length ? data.history.map((h: any) => h.networth_sgd) : [1, 2, 3, 4, 5]}
                  />
                </div>
              </GlowCard>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <StatCard label="Cash" value={fmtSGD(data.summary.cash_sgd)} sub="Liquid reserves" color="var(--purple)" />
                <StatCard label="Invested" value={fmtSGD(data.summary.invested_sgd)} sub="Market value" color="var(--accent)" />
                <StatCard label="Total Cost" value={fmtSGD(data.summary.total_cost_sgd)} sub="Capital deployed" color="var(--text-dim)" />
                <StatCard label="Total P&L" value={fmtSGD(data.summary.total_pnl_sgd)} sub={fmtPct(data.summary.pnl_pct)} color="var(--green)" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <GlowCard>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Asset Allocation</div>
                  <AllocationDonut data={data.allocation} />
                </GlowCard>

                <GlowCard>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Concentration Analysis</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[
                      { label: "Top 5 Holdings", value: data.concentration.top5_pct },
                      { label: "Top 10 Holdings", value: data.concentration.top10_pct },
                    ].map((c: any) => (
                      <div key={c.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ color: "var(--text-dim)" }}>{c.label}</span>
                          <span style={{ color: c.value > 50 ? "var(--gold)" : "var(--green)" }}>
                            {c.value.toFixed(1)}%
                          </span>
                        </div>
                        <div style={{ height: 6, background: "var(--border)", borderRadius: 3 }}>
                          <div style={{ width: `${c.value}%`, height: "100%", background: c.value > 50 ? "var(--gold)" : "var(--green)", borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                      <GlowCard>
                        <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase" }}>HHI Score</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{data.concentration.hhi.toFixed(3)}</div>
                      </GlowCard>
                      <GlowCard>
                        <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase" }}>Div. Score</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--green)" }}>
                          {data.concentration.diversification_score}<span style={{ fontSize: 14 }}>/100</span>
                        </div>
                      </GlowCard>
                    </div>
                  </div>
                </GlowCard>
              </div>

              <GlowCard>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Largest Holdings</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.holdings.slice(0, 5).map((h: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          background: "var(--surface)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          color: "var(--text-dim)",
                          fontFamily: "monospace",
                        }}
                      >
                        {i + 1}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, gap: 8 }}>
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {h.name}
                          </span>
                          <span style={{ fontWeight: 700, fontFamily: "monospace" }}>{fmtSGD(h.value_sgd)}</span>
                        </div>
                        <div style={{ height: 5, background: "var(--border)", borderRadius: 3 }}>
                          <div style={{ height: "100%", width: `${Math.min(h.weight_pct * 6, 100)}%`, background: "var(--accent)", borderRadius: 3 }} />
                        </div>
                      </div>

                      <span style={{ color: h.pnl_pct >= 0 ? "var(--green)" : "var(--red)", fontFamily: "monospace", minWidth: 52, textAlign: "right" }}>
                        {fmtPct(h.pnl_pct)}
                      </span>
                    </div>
                  ))}
                </div>
              </GlowCard>
            </div>
          )}

          {page === "holdings" && (
            <GlowCard>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Holdings</div>
              <HoldingsTable holdings={data.holdings} />
            </GlowCard>
          )}

          {page === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <GlowCard>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Currency Exposure</div>
                  <ExposureBar data={data.currency_exposure} />
                </GlowCard>
                <GlowCard>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Country Exposure</div>
                  <ExposureBar data={data.country_exposure} />
                </GlowCard>
              </div>

              <GlowCard>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Net Worth History</div>
                <AllocationDonut data={[]} />
              </GlowCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
