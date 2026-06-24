"use client";

type Props = {
  data?: number[];
};

export default function MiniSparkline({ data = [] }: Props) {
  const values = Array.isArray(data) ? data : [];
  if (!values.length) {
    return <div style={{ height: 60, display: "flex", alignItems: "center" }}>No data</div>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 160;
  const height = 60;
  const pad = 4;

  const points = values.map((v, i) => {
    const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * (width - pad * 2) + pad;
    const y =
      max === min
        ? height / 2
        : height - pad - ((v - min) / (max - min)) * (height - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(" ")}
      />
    </svg>
  );
}
