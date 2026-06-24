"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import GlowCard from "@/components/cards/GlowCard";
import StatCard from "@/components/cards/StatCard";
import MiniSparkline from "@/components/charts/MiniSparkline";
import AllocationDonut from "@/components/charts/AllocationDonut";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import { fetchDashboard } from "@/lib/api";
import { fmtDateTime, fmtSGD, fmtPct } from "@/lib/formatters";
import type { DashboardResponse } from "@/lib/types";

const emptyData: DashboardResponse = {
  summary: {
    networth_sgd: 0,
    total_cost_sgd: 0,
    total_pnl_sgd: 0,
    pnl_pct: 0,
    cash_sgd: 0,
    invested_sgd: 0,
  },
  allocation: [],
  currency_exposure: [],
  country_exposure: [],
  holdings: [],
  cash_accounts: [],
  concentration: {
    top5_pct: 0,
    top10_pct: 0,
    hhi: 0,
    diversification_score: 0,
  },
  history: [],
  meta: {
    last_refresh: "",
    base_currency: "SGD",
    fx_source: "",
  },
};

export default function Page() {
  const [page, setPage] = useState("overview");
  const [data, setData] = useState<DashboardResponse>(emptyData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const res = await fetchDashboard();
      setData({
        ...emptyData,
        ...res,
        summary: { ...emptyData.summary, ...res.summary },
        concentration: { ...emptyData.concentration, ...res.concentration },
        meta: { ...emptyData.meta, ...res.meta },
        allocation: Array.isArray(res.allocation) ? res.allocation : [],
        currency_exposure: Array.isArray(res.currency_exposure) ? res.currency_exposure : [],
        country_exposure: Array.isArray(res.country_exposure) ? res.country_exposure : [],
        holdings: Array.isArray(res.holdings) ? res.holdings : [],
        cash_accounts: Array.isArray(res.cash_accounts) ? res.cash_accounts : [],
        history: Array.isArray(res.history) ? res.history : [],
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
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

  const sparkData = Array.isArray(data.history) && data.history.length
    ? data.history.map((h) => h.networth_sgd)
    : [1, 2, 3, 4, 5];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar page={page} setPage={setPage} />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar
          title={page === "overview" ? "Overview" : page === "holdings" ? "Holdings" : "Analytics"}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          lastRefresh={data.meta.last_refresh ? fmtDateTime(data.meta.last_refresh) : "—"}
        />

        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <StatCard label="Cash" value={fmtSGD(data.summary.cash_sgd)} sub="Liquid reserves" color="var(--purple)" />
            <StatCard label="Invested" value={fmtSGD(data.summary.invested_sgd)} sub="Market value" color="var(--accent)" />
            <StatCard label="Total Cost" value={fmtSGD(data.summary.total_cost_sgd)} sub="Capital deployed" color="var(--text-dim)" />
            <StatCard label="Total P&L" value={fmtSGD(data.summary.total_pnl_sgd)} sub={fmtPct(data.summary.pnl_pct)} color="var(--green)" />
          </div>

          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <GlowCard>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    Total Net Worth · SGD
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1 }}>
                    {fmtSGD(data.summary.networth_sgd)}
                  </div>
                  <div style={{ marginTop: 8, color: "var(--green)" }}>
                    {fmtPct(data.summary.pnl_pct)} total return
                  </div>
                </div>

                <div style={{ minWidth: 160 }}>
                  <MiniSparkline data={sparkData} />
                </div>
              </div>
            </GlowCard>

            <GlowCard>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Asset Allocation</div>
              <AllocationDonut data={data.allocation} />
            </GlowCard>
          </div>
        </div>
      </main>
    </div>
  );
}
