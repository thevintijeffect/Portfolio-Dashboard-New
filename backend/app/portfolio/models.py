from pydantic import BaseModel
from typing import Optional, List, Dict

class Holding(BaseModel):
    name: str
    ticker: str = ""
    type: str = "Stock"
    currency: str = "SGD"
    qty: float = 0
    value: float = 0
    cost: float = 0
    pnl: float = 0
    value_sgd: float = 0
    cost_sgd: float = 0
    pnl_sgd: float = 0
    pnl_pct: float = 0
    weight_pct: float = 0
    country: str = "Other"

class CashAccount(BaseModel):
    name: str
    balance: float = 0

class DashboardMeta(BaseModel):
    last_refresh: str
    base_currency: str = "SGD"
    fx_source: str = ""
