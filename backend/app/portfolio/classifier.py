def classify_holding(h: dict) -> dict:
    name = (h.get("name") or "").upper()

    if h.get("type"):
        return h

    if "ETF" in name:
        h["type"] = "ETF"
    elif "GOLD" in name:
        h["type"] = "Gold"
    else:
        h["type"] = "Stock"

    return h
