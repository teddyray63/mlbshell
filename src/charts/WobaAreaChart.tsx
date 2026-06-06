'use client';

import React, { memo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WobaAreaChartProps {
  data?: { date: string; woba: number }[];
  height?: number;
}

const defaultData = [
  { date: 'Apr 1',  woba: 0.298 },
  { date: 'Apr 15', woba: 0.315 },
  { date: 'May 1',  woba: 0.341 },
  { date: 'May 15', woba: 0.328 },
  { date: 'Jun 1',  woba: 0.355 },
  { date: 'Jun 15', woba: 0.342 },
  { date: 'Jul 1',  woba: 0.368 },
  { date: 'Jul 15', woba: 0.361 },
];

const CustomTooltip = memo(function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-surface px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-mono-data text-primary font-semibold">
        wOBA: {payload[0]?.value?.toFixed(3)}
      </p>
    </div>
  );
});

const WobaAreaChart = memo(function WobaAreaChart({ data = defaultData, height = 180 }: WobaAreaChartProps) {
  return (
    <div role="img" aria-label="wOBA trend area chart showing league-average weighted on-base average over time">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="wobaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0.25, 0.42]}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(3)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="woba"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#wobaGrad)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export default WobaAreaChart;