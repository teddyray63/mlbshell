'use client';

import React, { memo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// TODO: Replace with real pitcher profile data from matchupService
const mockData = [
  { stat: 'K/9',    value: 78 },
  { stat: 'BB/9',   value: 62 },
  { stat: 'FIP',    value: 55 },
  { stat: 'WHIP',   value: 70 },
  { stat: 'GB%',    value: 48 },
  { stat: 'SwStr%', value: 65 },
];

interface PitcherRadarChartProps {
  data?: typeof mockData;
  height?: number;
}

const CustomTooltip = memo(function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-surface px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">{payload[0]?.payload?.stat}</p>
      <p className="font-mono-data text-primary font-semibold">{payload[0]?.value} ptile</p>
    </div>
  );
});

const PitcherRadarChart = memo(function PitcherRadarChart({ data = mockData, height = 220 }: PitcherRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="stat"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          dataKey="value"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
});

export default PitcherRadarChart;