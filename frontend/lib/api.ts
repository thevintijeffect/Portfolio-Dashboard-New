import type { DashboardResponse } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await fetch(`${API}/api/portfolio`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard: ${res.status}`);
  }

  return res.json();
}

export async function fetchDebugRaw(): Promise<unknown> {
  const res = await fetch(`${API}/api/debug/raw`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch debug raw: ${res.status}`);
  }

  return res.json();
}
