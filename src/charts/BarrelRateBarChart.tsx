'use client';

import React, { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['var(--muted-foreground)', 'var(--primary)', 'var(--accent)', 'var(--negative)'];

interface BarrelRateBarChartProps {
  data?: { name: string; pct: number }[];
  height?: number;
}

const defaultData = [
  { name: 'Groundball', pct: 0.38 },
  { name: 'Line Drive', pct: 0.24 },
  { name: 'Fly Ball',   pct: 0.29 },
  { name: 'Pop Up',     pct: 0.09 },
];

const CustomTooltip = memo(function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; fill: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-surface px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-mono-data font-semibold" style={{ color: payload[0]?.fill }}>
        {(payload[0]?.value * 100).toFixed(1)}%
      </p>
    </div>
  );
});

const BarrelRateBarChart = memo(function BarrelRateBarChart({ data = defaultData, height = 180 }: BarrelRateBarChartProps) {
  return (
    <div role="img" aria-label="Batted ball profile bar chart showing distribution of groundballs, line drives, fly balls, and pop ups">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="pct" radius={[3, 3, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={`barrel-cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default BarrelRateBarChart;