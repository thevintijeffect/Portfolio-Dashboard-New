"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import GlowCard from "@/components/cards/GlowCard";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import ExposureBar from "@/components/charts/ExposureBar";
import NetWorthLine from "@/components/charts/NetWorthLine";
import { fetchDashboard } from "@/lib/api";
import { fmtDateTime } from "@/lib/formatters";

export default function AnalyticsPage() {
  const [page, setPage] = useState("analytics");
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

  const refresh = () => {
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
          title="Analytics"
          onRefresh={refresh}
          refreshing={refreshing}
          lastRefresh={fmtDateTime(data.meta.last_refresh)}
        />
        <div style={{ flex: 1, padding: 24, overflowY: "auto", maxWidth: 1440 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <GlowCard>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Currency Exposure</div>
                <ExposureBar data={data.currency_exposure || []} />
              </GlowCard>
              <GlowCard>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Country Exposure</div>
                <ExposureBar data={data.country_exposure || []} />
              </GlowCard>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <GlowCard>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Concentration</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {[
                    { label: "Top 5 Holdings", value: data.concentration.top5_pct },
                    { label: "Top 10 Holdings", value: data.concentration.top10_pct },
                    { label: "HHI", value: data.concentration.hhi },
                    { label: "Diversification Score", value: data.concentration.diversification_score },
                  ].map((c: any) => (
                    <div key={c.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ color: "var(--text-dim)" }}>{c.label}</span>
                        <span style={{ color: "var(--text)" }}>
                          {c.label === "HHI" ? c.value : `${Number(c.value).toFixed(1)}%`}
                        </span>
                      </div>
                      <div style={{ height: 6, background: "var(--border)", borderRadius: 3 }}>
                        <div
                          style={{
                            width: `${Math.min(Number(c.value), 100)}%`,
                            height: "100%",
                            background: "var(--accent)",
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlowCard>

              <GlowCard>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Net Worth History</div>
                <NetWorthLine data={data.history || []} />
              </GlowCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
