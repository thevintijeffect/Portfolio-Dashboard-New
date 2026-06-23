from app.sheets.client import open_sheet

def clean_number(x):
    if x is None or x == "":
        return 0.0
    if isinstance(x, (int, float)):
        return float(x)
    s = str(x).replace(",", "").replace("S$", "").replace("$", "").strip()
    try:
        return float(s)
    except:
        return 0.0

class SheetsIngestion:
    def __init__(self):
        self.sheet = open_sheet()

    def read_tab(self, tab_name: str):
        ws = self.sheet.worksheet(tab_name)
        rows = ws.get_all_records()
        return rows

    def get_cash(self):
        rows = self.read_tab("Cash")
        out = []
        for r in rows:
            name = r.get("name") or r.get("Name") or r.get("account") or ""
            if name:
                out.append({
                    "name": name,
                    "balance": clean_number(r.get("balance") or r.get("Balance") or r.get("amount")),
                    "currency": (r.get("currency") or r.get("Currency") or "SGD").strip(),
                })
        return out

    def get_holdings_from_tab(self, tab_name: str, default_type: str):
        rows = self.read_tab(tab_name)
        out = []
        for r in rows:
            name = r.get("name") or r.get("Name") or ""
            if not name:
                continue
            out.append({
                "name": name,
                "ticker": r.get("ticker") or r.get("Ticker") or "",
                "qty": clean_number(r.get("qty") or r.get("Qty") or r.get("quantity")),
                "value": clean_number(r.get("value") or r.get("Value") or r.get("market_value")),
                "cost": clean_number(r.get("cost") or r.get("Cost") or r.get("purchase_value")),
                "currency": (r.get("currency") or r.get("Currency") or "SGD").strip(),
                "type": r.get("type") or r.get("Type") or default_type,
            })
        return out

    def get_shares(self):
        return self.get_holdings_from_tab("Shares", "Stock")

    def get_mutual_funds(self):
        return self.get_holdings_from_tab("MFs", "Mutual Fund")

    def get_gold(self):
        return self.get_holdings_from_tab("Gold", "Gold")
