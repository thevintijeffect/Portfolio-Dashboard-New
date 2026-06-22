def compute_exposure(holdings: list[dict], field: str) -> list[dict]:
    totals = {}
    palette = ["#00d4ff", "#00e5a0", "#ffb830", "#8b5cf6", "#ff4d6a", "#22c55e"]

    for h in holdings:
        key = h.get(field, "Other")
        totals[key] = totals.get(key, 0) + float(h.get("value_sgd", 0))

    grand = sum(totals.values()) or 1
    out = []
    for i, (name, value) in enumerate(sorted(totals.items(), key=lambda x: x[1], reverse=True)):
        out.append({
            "name": name,
            "value": round(value, 2),
            "pct": round((value / grand) * 100, 2),
            "color": palette[i % len(palette)],
        })
    return out
