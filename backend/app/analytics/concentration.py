def compute_concentration(holdings: list[dict]) -> dict:
    values = sorted([float(h.get("value_sgd", 0)) for h in holdings], reverse=True)
    total = sum(values) or 1

    weights = [v / total for v in values]
    top5 = sum(weights[:5]) * 100
    top10 = sum(weights[:10]) * 100
    hhi = sum(w * w for w in weights)

    score = max(0, min(100, round(100 - (top5 * 0.5) - (hhi * 1000), 2)))

    return {
        "top5_pct": round(top5, 2),
        "top10_pct": round(top10, 2),
        "hhi": round(hhi, 3),
        "diversification_score": score,
    }
