export type Summary = {
  networth_sgd: number;
  profit_sgd: number;
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
  asset: string;
  ticker?: string;
  sub_type: string;
  currency: string;
  qty: number;
  current_price: number;
  investment_price: number;
  market_value: number;
  investment_value: number;
  fx?: number;
  value_sgd?: number;
  investment_sgd?: number;
  profit_sgd?: number;
  profit_pct?: number;
  portfolio_pct?: number;
  unrealised_gain?: number;
  unrealised_gain_pct?: number;
  country?: string;
};

export type CashAccount = {
  name: string;
  balance: number;
  currency?: string;
};

export type Concentration = {
  largest_holding_pct: number;
  top5_pct: number;
  top10_pct: number;
  hhi: number;
  diversification_score: number;
};

export type AssetClassBreakdown = {
  asset_class: string;
  investment_sgd: number;
  value_sgd: number;
  profit_sgd: number;
  profit_pct: number;
  portfolio_pct: number;
  holdings: Holding[];
};

export type DashboardResponse = {
  summary: Summary;
  allocation: Record<string, number> | AllocationItem[];
  currency_exposure: Record<string, number> | ExposureItem[];
  top_holdings?: Array<{
    asset: string;
    value_sgd: number;
  }>;
  asset_class_breakdown?: AssetClassBreakdown[];
  holdings: Holding[];
  cash_accounts?: CashAccount[];
  concentration?: Concentration;
  history?: { date: string; networth_sgd: number }[];
  fx_rates: Record<string, number | null>;
  fx_source: string;
  meta?: {
    last_refresh: string;
    base_currency: string;
    fx_source: string;
  };
};
