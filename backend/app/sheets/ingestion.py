from app.sheets.client import open_sheet

class SheetsIngestion:
    def __init__(self):
        self.sheet = open_sheet()

    def read_tab(self, tab_name: str):
        ws = self.sheet.worksheet(tab_name)
        return ws.get_all_records()

    def get_cash(self):
        rows = self.read_tab("Cash")
        out = []
        for r in rows:
            if r.get("name"):
                out.append({
                    "name": r.get("name"),
                    "balance": float(r.get("balance", 0) or 0),
                    "currency": r.get("currency", "SGD")
                })
        return out

    def get_shares(self):
        rows = self.read_tab("Shares")
        out = []
        for r in rows:
            if r.get("name"):
                out.append({
                    "name": r.get("name"),
                    "ticker": r.get("ticker", ""),
                    "qty": float(r.get("qty", 0) or 0),
                    "value": float(r.get("value", 0) or 0),
                    "cost": float(r.get("cost", 0) or 0),
                    "currency": r.get("currency", "SGD"),
                    "type": r.get("type", "Stock"),
                })
        return out

    def get_mutual_funds(self):
        rows = self.read_tab("MFs")
        out = []
        for r in rows:
            if r.get("name"):
                out.append({
                    "name": r.get("name"),
                    "ticker": r.get("ticker", ""),
                    "qty": float(r.get("qty", 0) or 0),
                    "value": float(r.get("value", 0) or 0),
                    "cost": float(r.get("cost", 0) or 0),
                    "currency": r.get("currency", "SGD"),
                    "type": "Mutual Fund",
                })
        return out

    def get_gold(self):
        rows = self.read_tab("Gold")
        out = []
        for r in rows:
            if r.get("name"):
                out.append({
                    "name": r.get("name"),
                    "ticker": r.get("ticker", ""),
                    "qty": float(r.get("qty", 0) or 0),
                    "value": float(r.get("value", 0) or 0),
                    "cost": float(r.get("cost", 0) or 0),
                    "currency": r.get("currency", "SGD"),
                    "type": "Gold",
                })
        return out
