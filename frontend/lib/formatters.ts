export function fmtMoney(n: number, digits = 0) {
  return new Intl.NumberFormat("en-SG", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function fmtSGD(n: number, digits = 0) {
  return `S$${fmtMoney(n, digits)}`;
}

export function fmtPct(n: number, sign = true) {
  return `${sign && n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
