'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

// TODO: Replace with real line movement data from bettingService
const mockData = [
  { time: 'Open', over: 7.5, under: 7.5 },
  { time: '8am', over: 7.5, under: 7.5 },
  { time: '10am', over: 8.0, under: 7.5 },
  { time: '12pm', over: 8.0, under: 8.0 },
  { time: '2pm', over: 8.5, under: 8.0 },
  { time: '4pm', over: 8.5, under: 8.5 },
  { time: 'Live', over: 9.0, under: 8.5 },
];

interface LineMovementChartProps {
  data?: typeof mockData;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-surface px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p
          key={`tip-${p.dataKey}`}
          className="font-mono-data font-semibold"
          style={{ color: p.color }}
        >
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function LineMovementChart({
  data = mockData,
  height = 200,
}: LineMovementChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={['auto', 'auto']}
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={7.5}
          stroke="var(--border)"
          strokeDasharray="4 4"
          label={{ value: 'Open', fill: 'var(--muted-foreground)', fontSize: 9 }}
        />
        <Line
          type="monotone"
          dataKey="over"
          name="Over"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="under"
          name="Under"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
