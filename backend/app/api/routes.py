from __future__ import annotations

import json
import os
import re
import time
from functools import lru_cache
from typing import Any, Dict, List, Optional

import gspread
import pandas as pd
import requests
from fastapi import APIRouter
from google.oauth2.service_account import Credentials

from app.config import settings

router = APIRouter(prefix="/api")

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
SPREADSHEET_KEY = os.getenv("GOOGLE_SHEET_ID", "1A9vTee-Jfg8lgLx18-942VuBHkQnrzqI3n2uQOCwOyA")
GOOGLE_CREDS_ENV = os.getenv("GOOGLE_CREDS") or os.getenv("GOOGLE_CREDS_JSON")

FX_CACHE = {"rates": None, "timestamp": 0, "source": None}
CACHE_DURATION = 3600


def _norm(x: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(x or "").strip().lower())


def safe_float(x):
    try:
        if x is None:
            return 0.0
        s = str(x).strip().replace(",", "")
        if s == "":
            return 0.0
        s = s.replace("S$", "").replace("$", "")
        return float(s)
    except Exception:
        return 0.0


def clean_currency(x):
    if x is None:
        return None
    x = str(x).strip().upper()
    return x or None


def invalid_asset(asset):
    if asset is None:
        return True
    text = str(asset).strip().upper()
    if text == "":
        return True
    bad = [
        "TOTAL",
        "BALANCE",
        "ACCOUNT",
        "ACCOUNTS",
        "GAIN",
        "LOSS",
        "REALISED",
        "UNREALISED",
        "CURRENCY",
    ]
    return any(k in text for k in bad)


@lru_cache(maxsize=1)
def get_client():
    if not GOOGLE_CREDS_ENV:
        raise RuntimeError("Missing GOOGLE_CREDS or GOOGLE_CREDS_JSON")
    creds_dict = json.loads(GOOGLE_CREDS_ENV)
    credentials = Credentials.from_service_account_info(creds_dict, scopes=SCOPES)
    return gspread.authorize(credentials)


@lru_cache(maxsize=1)
def get_workbook():
    return get_client().open_by_key(SPREADSHEET_KEY)


def get_sheet(name):
    ws = get_workbook().worksheet(name)
    return pd.DataFrame(ws.get_all_records())


def get_realtime_fx_rates():
    global FX_CACHE
    current_time = time.time()
    if FX_CACHE["rates"] and (current_time - FX_CACHE["timestamp"]) < CACHE_DURATION:
        return FX_CACHE["rates"], FX_CACHE["source"]

    api_endpoints = [
        {"name": "open.er-api.com", "url": "https://open.er-api.com/v6/latest/SGD", "key": "rates"},
        {"name": "exchangerate.host", "url": "https://api.exchangerate.host/latest?base=SGD", "key": "rates"},
        {"name": "frankfurter.app", "url": "https://api.frankfurter.app/latest?from=SGD", "key": "rates"},
    ]

    fx_rates = None
    source_used = None

    for api in api_endpoints:
        try:
            response = requests.get(api["url"], timeout=10)
            if response.status_code != 200:
                continue
            data = response.json()
            raw_rates = data.get(api["key"], {})
            required = ["USD", "INR", "AUD", "EUR", "GBP"]
            if not all(c in raw_rates for c in required):
                continue
            fx_rates = {
                "SGD": 1.0,
                "USD": float(raw_rates["USD"]),
                "INR": float(raw_rates["INR"]),
                "AUD": float(raw_rates["AUD"]),
                "EUR": float(raw_rates["EUR"]),
                "GBP": float(raw_rates["GBP"]),
            }
            source_used = api["name"]
            break
        except Exception:
            continue

    if not fx_rates:
        fx_rates = {
            "SGD": 1.0,
            "USD": None,
            "INR": None,
            "AUD": None,
            "EUR": None,
            "GBP": None,
        }
        source_used = "ERROR: All APIs failed"

    FX_CACHE["rates"] = fx_rates
    FX_CACHE["timestamp"] = current_time
    FX_CACHE["source"] = source_used
    return fx_rates, source_used


FX, FX_SOURCE = get_realtime_fx_rates()
VALID_CURRENCIES = set(FX.keys())


def normalize_rows(df: pd.DataFrame, tab: str):
    if df is None or df.empty:
        return []

    cols = {_norm(c): c for c in df.columns}

    def col(*names):
        for n in names:
            nn = _norm(n)
            if nn in cols:
                return cols[nn]
        for key, orig in cols.items():
            for n in names:
                nn = _norm(n)
                if nn and (nn in key or key in nn):
                    return orig
        return None

    asset_col = col("Company", "MF - SK", "MM Funds name", "Asset", "Name", "Holding", "Fund")
    ticker_col = col("Ticker", "Symbol", "Code", "ISIN")
    qty_col = col("Qty", "Quantity", "Units", "Shares")
    mv_col = col("Current Market Value", "Current Value", "Market Value", "Value")
    inv_col = col("Investment Value", "Invested Amount", "Investment Amount", "Cost", "Purchase Cost")
    price_col = col("Current Price", "Price")
    inv_price_col = col("Investment Price", "Buy Price")
    curr_col = col("Currency", " Currency ", "CCY", "Curr")

    rows = []
    for _, r in df.iterrows():
        asset = str(r.get(asset_col, "")).strip() if asset_col else ""
        if invalid_asset(asset):
            continue

        currency = clean_currency(r.get(curr_col)) if curr_col else None
        if currency is None and tab == "Cash":
            currency = "SGD"
        if currency is None:
            continue

        subtype = "Stock" if tab == "Shares" else ("Mutual Fund" if tab == "MFs" else ("Gold" if tab == "Gold" else "Cash"))
        if "ETF" in asset.upper() and tab == "Shares":
            subtype = "ETF"

        rows.append(
            {
                "asset": asset,
                "ticker": str(r.get(ticker_col, "")).strip() if ticker_col else "",
                "sub_type": subtype,
                "currency": currency,
                "qty": safe_float(r.get(qty_col, 0)) if qty_col else 0,
                "current_price": safe_float(r.get(price_col, 0)) if price_col else 0,
                "investment_price": safe_float(r.get(inv_price_col, 0)) if inv_price_col else 0,
                "market_value": safe_float(r.get(mv_col, 0)) if mv_col else 0,
                "investment_value": safe_float(r.get(inv_col, 0)) if inv_col else 0,
            }
        )
    return rows


def build_df():
    holdings = []
    holdings += normalize_rows(get_sheet("Cash"), "Cash")
    holdings += normalize_rows(get_sheet("MFs"), "MFs")
    holdings += normalize_rows(get_sheet("Shares"), "Shares")
    holdings += normalize_rows(get_sheet("Gold"), "Gold")

    df = pd.DataFrame(holdings)
    if df.empty:
        return df

    df["fx"] = df["currency"].map(FX).fillna(1.0)
    df["value_sgd"] = df["market_value"] / df["fx"].replace(0, 1)
    df["investment_sgd"] = df["investment_value"] / df["fx"].replace(0, 1)
    df["profit_sgd"] = df["value_sgd"] - df["investment_sgd"]
    df["profit_pct"] = (
        (df["market_value"] - df["investment_value"])
        / df["investment_value"].replace(0, 1)
        * 100
    )
    return df


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/fx-rates")
def fx_rates():
    global FX, FX_SOURCE
    FX, FX_SOURCE = get_realtime_fx_rates()
    return {
        "rates": FX,
        "base": "SGD",
        "source": FX_SOURCE,
        "cached": (time.time() - FX_CACHE["timestamp"]) < CACHE_DURATION,
        "last_updated": FX_CACHE["timestamp"],
    }


@router.get("/refresh-fx")
def refresh_fx_rates():
    global FX, FX_SOURCE
    FX_CACHE["timestamp"] = 0
    FX, FX_SOURCE = get_realtime_fx_rates()
    return {"status": "success", "rates": FX, "source": FX_SOURCE}


@router.get("/debug/worksheets")
def debug_worksheets():
    wb = get_workbook()
    return {"worksheets": [ws.title for ws in wb.worksheets()]}


@router.get("/debug/raw")
def debug_raw():
    return {
        "worksheets": [ws.title for ws in get_workbook().worksheets()],
        "cash": normalize_rows(get_sheet("Cash"), "Cash"),
        "mfs": normalize_rows(get_sheet("MFs"), "MFs"),
        "shares": normalize_rows(get_sheet("Shares"), "Shares"),
        "gold": normalize_rows(get_sheet("Gold"), "Gold"),
    }


@router.get("/portfolio")
def portfolio():
    df = build_df()
    if df.empty:
        return {
            "summary": {"networth_sgd": 0, "profit_sgd": 0},
            "allocation": {},
            "currency_exposure": {},
            "top_holdings": [],
            "asset_class_breakdown": [],
            "holdings": [],
            "fx_rates": FX,
            "fx_source": FX_SOURCE,
        }

    total = df["value_sgd"].sum()
    allocation = (df.groupby("sub_type")["value_sgd"].sum() / total * 100) if total > 0 else pd.Series(dtype=float)
    currency = (df.groupby("currency")["value_sgd"].sum() / total * 100) if total > 0 else pd.Series(dtype=float)
    top = df.sort_values("value_sgd", ascending=False).head(10)

    asset_class_breakdown = []
    grouped = df.groupby("sub_type").agg(
        {
            "investment_sgd": "sum",
            "value_sgd": "sum",
            "profit_sgd": "sum",
        }
    )

    for asset_class, row in grouped.iterrows():
        holdings = df[df["sub_type"] == asset_class].copy()
        holdings["portfolio_pct"] = holdings["value_sgd"] / total * 100
        holdings["unrealised_gain"] = holdings["market_value"] - holdings["investment_value"]
        holdings["unrealised_gain_pct"] = (
            holdings["unrealised_gain"] / holdings["investment_value"].replace(0, 1) * 100
        )

        asset_class_breakdown.append(
            {
                "asset_class": asset_class,
                "investment_sgd": round(float(row["investment_sgd"]), 2),
                "value_sgd": round(float(row["value_sgd"]), 2),
                "profit_sgd": round(float(row["profit_sgd"]), 2),
                "profit_pct": round(float(row["profit_sgd"]) / max(float(row["investment_sgd"]), 1) * 100, 2),
                "portfolio_pct": round(float(row["value_sgd"]) / total * 100, 2),
                "holdings": holdings.round(2).to_dict(orient="records"),
            }
        )

    return {
        "summary": {
            "networth_sgd": round(float(total), 2),
            "profit_sgd": round(float(df["profit_sgd"].sum()), 2),
        },
        "allocation": allocation.round(2).to_dict() if total > 0 else {},
        "currency_exposure": currency.round(2).to_dict() if total > 0 else {},
        "top_holdings": top[["asset", "value_sgd"]].round(2).to_dict(orient="records") if not top.empty else [],
        "asset_class_breakdown": asset_class_breakdown,
        "holdings": df.round(2).to_dict(orient="records"),
        "fx_rates": FX,
        "fx_source": FX_SOURCE,
    }


@router.get("/holdings/{asset_class}")
def holdings(asset_class: str):
    df = build_df()
    if df.empty:
        return []

    filtered = df[df["sub_type"] == asset_class].copy()
    total = df["value_sgd"].sum()

    if total > 0:
        filtered["portfolio_pct"] = filtered["value_sgd"] / total * 100
        filtered["unrealised_gain"] = filtered["market_value"] - filtered["investment_value"]
        filtered["unrealised_gain_pct"] = (
            filtered["unrealised_gain"] / filtered["investment_value"].replace(0, 1) * 100
        )

    return filtered.round(2).to_dict(orient="records")


@router.get("/analytics")
def analytics():
    df = build_df()
    if df.empty:
        return {
            "country_exposure": {},
            "concentration": {
                "largest_holding_pct": 0,
                "top5_pct": 0,
                "top10_pct": 0,
            },
            "diversification": {
                "score": 0,
                "hhi": 0,
            },
            "risk_signals": [],
            "fx_rates": FX,
        }

    total = df["value_sgd"].sum()
    if total == 0:
        return {
            "country_exposure": {},
            "concentration": {
                "largest_holding_pct": 0,
                "top5_pct": 0,
                "top10_pct": 0,
            },
            "diversification": {
                "score": 0,
                "hhi": 0,
            },
            "risk_signals": [],
            "fx_rates": FX,
        }

    country_map = {
        "USD": "US",
        "INR": "India",
        "SGD": "Singapore",
        "AUD": "Australia",
        "GBP": "UK",
        "EUR": "Europe",
    }

    df["country"] = df["currency"].map(country_map)
    country = df.groupby("country")["value_sgd"].sum() / total * 100

    weights = df["value_sgd"] / total
    largest = weights.max() * 100
    top5 = weights.nlargest(5).sum() * 100
    top10 = weights.nlargest(10).sum() * 100
    hhi = (weights.pow(2).sum()) * 10000

    score = 100
    score -= max(0, (largest - 8) * 1.5)
    score -= max(0, (top5 - 30) * 0.8)
    score -= max(0, (top10 - 50) * 0.5)
    score -= max(0, (hhi - 200) / 20)
    score = max(min(score, 100), 0)

    risks = []
    if largest > 12:
        risks.append("High single stock concentration")
    if top5 > 40:
        risks.append("Moderate portfolio concentration")
    if country.get("US", 0) > 50:
        risks.append("High USD exposure")
    if hhi > 600:
        risks.append("Low diversification")

    return {
        "country_exposure": country.round(2).to_dict(),
        "concentration": {
            "largest_holding_pct": round(float(largest), 2),
            "top5_pct": round(float(top5), 2),
            "top10_pct": round(float(top10), 2),
        },
        "diversification": {
            "score": round(float(score), 2),
            "hhi": round(float(hhi), 2),
        },
        "risk_signals": risks,
        "fx_rates": FX,
    }
