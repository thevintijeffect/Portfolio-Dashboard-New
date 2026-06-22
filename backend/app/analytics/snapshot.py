from datetime import datetime, timezone

def build_snapshot(networth_sgd: float, holdings: list[dict]) -> dict:
    return {
        "date": datetime.now(timezone.utc).isoformat(),
        "networth_sgd": round(networth_sgd, 2),
        "holdings_count": len(holdings),
    }
