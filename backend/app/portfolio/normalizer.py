COUNTRY_MAP = {
    "USD": "USA",
    "SGD": "Singapore",
    "INR": "India",
    "GBP": "UK",
    "EUR": "Europe",
    "JPY": "Japan",
    "AUD": "Australia",
    "HKD": "Hong Kong",
}

class FXNormalizer:
    def __init__(self, rates: dict):
        self.rates = rates or {"SGD": 1.0}

    def to_sgd(self, amount: float, currency: str) -> float:
        if not amount:
            return 0.0
        if currency == "SGD":
            return float(amount)
        rate = self.rates.get(currency, 1.0)
        if rate == 0:
            return float(amount)
        return float(amount) / float(rate)

    def normalize_holding(self, h: dict) -> dict:
        value = float(h.get("value", 0) or 0)
        cost = float(h.get("cost", 0) or 0)
        currency = h.get("currency", "SGD")

        h["value_sgd"] = self.to_sgd(value, currency)
        h["cost_sgd"] = self.to_sgd(cost, currency)
        h["pnl_sgd"] = h["value_sgd"] - h["cost_sgd"]
        h["pnl_pct"] = round(((h["pnl_sgd"] / h["cost_sgd"]) * 100), 2) if h["cost_sgd"] else 0
        h["country"] = COUNTRY_MAP.get(currency, "Other")
        return h
