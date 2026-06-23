from fastapi import APIRouter
from app.sheets.ingestion import SheetsIngestion
from app.analytics.allocation import compute_allocation
from app.analytics.exposure import compute_exposure
from app.analytics.concentration import compute_concentration
from app.portfolio.normalizer import FXNormalizer
from app.config import settings
from datetime import datetime, timezone

router = APIRouter(prefix="/api")

def get_fx_rates():
    return {
        "SGD": 1.0,
        "USD": 1.35,
        "INR": 0.016,
        "EUR": 1.55,
        "GBP": 1.82,
        "AUD": 0.88,
        "JPY": 0.009,
        "HKD": 0.17,
    }

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/fx/rates")
def fx_rates():
    return {
        "source": "manual_fallback",
        "base_currency": "SGD",
        "rates": get_fx_rates(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }

@router.get("/portfolio/dashboard")
def dashboard():
    sheets = SheetsIngestion()
    fx = FXNormalizer(get_fx_rates())

    cash = sheets.get_cash()
    shares = sheets.get_shares()
    mfs = sheets.get_mutual_funds()
    gold = sheets.get_gold()

    raw_holdings = shares + mfs + gold

    holdings = [fx.normalize_holding(h) for h in raw_holdings]
    total_value = sum(h["value_sgd"] for h in holdings)
    total_cost = sum(h["cost_sgd"] for h in holdings)
    total_pnl = total_value - total_cost
    pnl_pct = round((total_pnl / total_cost) * 100, 2) if total_cost else 0

    cash_sgd = sum(fx.to_sgd(float(c["balance"]), c.get("currency", "SGD")) for c in cash)
    invested_sgd = total_value
    networth_sgd = cash_sgd + invested_sgd

    for h in holdings:
        h["weight_pct"] = round((h["value_sgd"] / invested_sgd) * 100, 2) if invested_sgd else 0

    allocation = compute_allocation(holdings)
    currency_exposure = compute_exposure(holdings, "currency")
    country_exposure = compute_exposure(holdings, "country")
    concentration = compute_concentration(holdings)

    holdings_sorted = sorted(holdings, key=lambda x: x["value_sgd"], reverse=True)

    return {
        "summary": {
            "networth_sgd": round(networth_sgd, 2),
            "total_cost_sgd": round(total_cost, 2),
            "total_pnl_sgd": round(total_pnl, 2),
            "pnl_pct": pnl_pct,
            "cash_sgd": round(cash_sgd, 2),
            "invested_sgd": round(invested_sgd, 2),
        },
        "allocation": allocation,
        "currency_exposure": currency_exposure,
        "country_exposure": country_exposure,
        "holdings": holdings_sorted,
        "cash_accounts": cash,
        "concentration": concentration,
        "history": [],
        "meta": {
            "last_refresh": datetime.now(timezone.utc).isoformat(),
            "base_currency": settings.BASE_CURRENCY,
            "fx_source": "manual_fallback",
        },
    }
    
    @router.get("/api/debug/raw")
def debug_raw():
    sheets = SheetsIngestion()
    return {
        "cash": sheets.get_cash(),
        "shares": sheets.get_shares(),
        "mfs": sheets.get_mutual_funds(),
        "gold": sheets.get_gold(),
    }
