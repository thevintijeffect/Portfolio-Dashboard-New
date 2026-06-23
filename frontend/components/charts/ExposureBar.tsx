"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ExposureBar({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "var(--text-dim)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((e, i) => (
            <Cell key={i} fill={e.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
