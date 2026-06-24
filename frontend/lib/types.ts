export type Summary = {
  networth_sgd: number;
  total_cost_sgd: number;
  total_pnl_sgd: number;
  pnl_pct: number;
  cash_sgd: number;
  invested_sgd: number;
};

export type AllocationItem = {
  name: string;
  value: number;
  pct: number;
  color: string;
};

export type ExposureItem = {
  name: string;
  value: number;
  pct: number;
  color: string;
};

export type Holding = {
  name: string;
  ticker: string;
  type: string;
  currency: string;
  value_sgd: number;
  cost_sgd: number;
  pnl_sgd: number;
  pnl_pct: number;
  weight_pct: number;
  country?: string;
};

export type CashAccount = {
  name: string;
  balance: number;
  currency?: string;
};

export type Concentration = {
  top5_pct: number;
  top10_pct: number;
  hhi: number;
  diversification_score: number;
};

export type DashboardResponse = {
  summary: Summary;
  allocation: AllocationItem[];
  currency_exposure: ExposureItem[];
  country_exposure: ExposureItem[];
  holdings: Holding[];
  cash_accounts: CashAccount[];
  concentration: Concentration;
  history: { date: string; networth_sgd: number }[];
  meta: {
    last_refresh: string;
    base_currency: string;
    fx_source: string;
  };
};
