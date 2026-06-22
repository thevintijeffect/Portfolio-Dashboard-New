def compute_allocation(holdings: list[dict]) -> list[dict]:
    totals = {}
    colors = {
        "Stock": "#00d4ff",
        "ETF": "#00e5a0",
        "Mutual Fund": "#ffb830",
        "Gold": "#f59e0b",
        "Cash": "#8b5cf6",
    }

    for h in holdings:
        key = h.get("type", "Stock")
        totals[key] = totals.get(key, 0) + float(h.get("value_sgd", 0))

    grand = sum(totals.values()) or 1
    out = []
    for key, value in totals.items():
        out.append({
            "name": key,
            "value": round(value, 2),
            "pct": round((value / grand) * 100, 2),
            "color": colors.get(key, "#00d4ff"),
        })
    return sorted(out, key=lambda x: x["value"], reverse=True)
