"use client";

export default function MiniSparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const norm = data.map((v) => ((v - min) / (max - min)) * 48);
  const w = 120;
  const h = 52;
  const points = norm.map((y, i) => `${(i / (data.length - 1)) * w},${h - y - 2}`).join(" ");

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#sg)" />
      <polyline
        points={points}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
