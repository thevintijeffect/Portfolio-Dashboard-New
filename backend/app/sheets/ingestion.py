from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

from app.sheets.client import open_sheet


def _norm(s: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(s or "").strip().lower())


def _clean_number(x: Any) -> float:
    if x is None or x == "":
        return 0.0
    if isinstance(x, (int, float)):
        return float(x)
    s = str(x).strip().replace(",", "").replace("S$", "").replace("$", "")
    s = s.replace("(", "-").replace(")", "")
    if s.endswith("%"):
        s = s[:-1]
    try:
        return float(s)
    except Exception:
        return 0.0


def _clean_text(x: Any, default: str = "") -> str:
    if x is None:
        return default
    s = str(x).strip()
    return s if s else default


def _unique_headers(headers: List[Any]) -> List[str]:
    seen: Dict[str, int] = {}
    out: List[str] = []
    for i, h in enumerate(headers):
        base = _norm(h) or f"col{i+1}"
        n = seen.get(base, 0)
        seen[base] = n + 1
        out.append(base if n == 0 else f"{base}_{n+1}")
    return out


class SheetsIngestion:
    def __init__(self):
        self.sheet = open_sheet()

    def list_tabs(self) -> List[str]:
        return [ws.title for ws in self.sheet.worksheets()]

    def _pick_tab(self, candidates: List[str]) -> Optional[str]:
        tabs = self.list_tabs()
        norm_tabs = { _norm(t): t for t in tabs }

        for cand in candidates:
            key = _norm(cand)
            if key in norm_tabs:
                return norm_tabs[key]

        for tab in tabs:
            nt = _norm(tab)
            for cand in candidates:
                ck = _norm(cand)
                if ck and (ck in nt or nt in ck):
                    return tab

        return tabs[0] if tabs else None

    def _read_tab(self, tab_name: str) -> List[Dict[str, Any]]:
        ws = self.sheet.worksheet(tab_name)

        values = ws.get_all_values()
        if not values or len(values) < 2:
            return []

        headers = _unique_headers(values[0])
        rows: List[Dict[str, Any]] = []

        for row in values[1:]:
            row = list(row) + [""] * (len(headers) - len(row))
            record = {headers[i]: row[i] if i < len(row) else "" for i in range(len(headers))}
            if any(_clean_text(v) for v in record.values()):
                rows.append(record)

        return rows

    def _normalize_row(self, row: Dict[str, Any]) -> Dict[str, Any]:
        nrow = {_norm(k): v for k, v in row.items()}

        def pick(*keys, default=""):
            for k in keys:
                nk = _norm(k)
                if nk in nrow and _clean_text(nrow[nk]) != "":
                    return nrow[nk]
            return default

        return {
            "name": _clean_text(pick("name", "holdingname", "assetname", "stockname", "fundname", "accountname")),
            "ticker": _clean_text(pick("ticker", "symbol", "code", "isin")),
            "qty": _clean_number(pick("qty", "quantity", "units", "shares", "noofshares")),
            "value": _clean_number(pick("value", "marketvalue", "currentvalue", "navvalue", "amount", "balance")),
            "cost": _clean_number(pick("cost", "purchasecost", "buycost", "invested", "principal")),
            "currency": _clean_text(pick("currency", "ccy", "curr", "fxcurrency"), "SGD").upper(),
            "type": _clean_text(pick("type", "assettype", "category", "class"), "Unknown"),
            "country": _clean_text(pick("country", "region", "market"), ""),
        }

    def _read_any(self, candidates: List[str]) -> List[Dict[str, Any]]:
        tab = self._pick_tab(candidates)
        if not tab:
            return []
        return self._read_tab(tab)

    def get_cash(self) -> List[Dict[str, Any]]:
        raw = self._read_any(["Cash", "Cash Accounts", "Bank", "Banks", "Cash Balances"])
        out = []
        for row in raw:
            nrow = {_norm(k): v for k, v in row.items()}

            def pick(*keys, default=""):
                for k in keys:
                    nk = _norm(k)
                    if nk in nrow and _clean_text(nrow[nk]) != "":
                        return nrow[nk]
                return default

            name = _clean_text(pick("name", "accountname", "bankname", "account", "wallet"))
            balance = _clean_number(pick("balance", "amount", "cash", "value", "currentbalance"))
            currency = _clean_text(pick("currency", "ccy", "curr"), "SGD").upper()

            if name or balance:
                out.append({"name": name or "Cash", "balance": balance, "currency": currency})
        return out

    def get_shares(self) -> List[Dict[str, Any]]:
        raw = self._read_any(["Shares", "Stocks", "Equities", "Holdings", "Equity"])
        return [self._normalize_row(r) | {"type": self._normalize_row(r)["type"] if self._normalize_row(r)["type"] != "Unknown" else "Stock"} for r in raw if any(_clean_text(v) for v in r.values())]

    def get_mutual_funds(self) -> List[Dict[str, Any]]:
        raw = self._read_any(["MFs", "Mutual Funds", "Funds", "Unit Trust", "UT", "Fund"])
        return [self._normalize_row(r) | {"type": self._normalize_row(r)["type"] if self._normalize_row(r)["type"] != "Unknown" else "Mutual Fund"} for r in raw if any(_clean_text(v) for v in r.values())]

    def get_gold(self) -> List[Dict[str, Any]]:
        raw = self._read_any(["Gold", "Precious Metals", "Metal", "Metals"])
        return [self._normalize_row(r) | {"type": self._normalize_row(r)["type"] if self._normalize_row(r)["type"] != "Unknown" else "Gold"} for r in raw if any(_clean_text(v) for v in r.values())]

    def debug_worksheets(self) -> List[str]:
        return self.list_tabs()

    def debug_raw(self) -> Dict[str, Any]:
        return {
            "tabs": self.list_tabs(),
            "cash_tab": self._pick_tab(["Cash", "Cash Accounts", "Bank", "Banks", "Cash Balances"]),
            "shares_tab": self._pick_tab(["Shares", "Stocks", "Equities", "Holdings", "Equity"]),
            "mfs_tab": self._pick_tab(["MFs", "Mutual Funds", "Funds", "Unit Trust", "UT", "Fund"]),
            "gold_tab": self._pick_tab(["Gold", "Precious Metals", "Metal", "Metals"]),
            "cash": self.get_cash(),
            "shares": self.get_shares(),
            "mfs": self.get_mutual_funds(),
            "gold": self.get_gold(),
        }
