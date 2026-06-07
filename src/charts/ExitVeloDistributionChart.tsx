'use client';

import React from 'react';
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

export interface ExitVeloDatum {
  name: string;
  value: number;
}

interface ExitVeloDistributionChartProps {
  data?: ExitVeloDatum[];
  height?: number;
}

const mockData: ExitVeloDatum[] = [
  { name: 'Judge', value: 94.1 },
  { name: 'Alvarez', value: 94.8 },
  { name: 'Soto', value: 93.0 },
  { name: 'Ohtani', value: 92.4 },
  { name: 'Devers', value: 91.2 },
];

/** Color exit velocity bars green/yellow/red on the batter scale (>92 / 88-92 / <88). */
function barColor(v: number): string {
  if (v > 92) return 'var(--positive)';
  if (v >= 88) return 'var(--warning)';
  return 'var(--negative)';
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 text-muted-foreground">{label}</p>
      <p className="font-mono-data font-semibold text-foreground">
        {payload[0]?.value?.toFixed(1)} mph
      </p>
    </div>
  );
};

export default function ExitVeloDistributionChart({
  data = mockData,
  height = 180,
}: ExitVeloDistributionChartProps) {
  const rows = data.length > 0 ? data : mockData;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={48}
        />
        <YAxis
          domain={[80, 100]}
          tickFormatter={(v) => `${v}`}
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
          {rows.map((d, i) => (
            <Cell key={`ev-cell-${i}`} fill={barColor(d.value)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
