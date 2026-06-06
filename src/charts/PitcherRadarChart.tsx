'use client';

import React, { memo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PitcherRadarChartProps {
  data?: { stat: string; value: number }[];
  height?: number;
}

const defaultData = [
  { stat: 'K/9',    value: 78 },
  { stat: 'BB/9',   value: 62 },
  { stat: 'FIP',    value: 55 },
  { stat: 'WHIP',   value: 70 },
  { stat: 'GB%',    value: 48 },
  { stat: 'SwStr%', value: 65 },
];

const CustomTooltip = memo(function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { stat: string }; value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-surface px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">{payload[0]?.payload?.stat}</p>
      <p className="font-mono-data text-primary font-semibold">{payload[0]?.value} ptile</p>
    </div>
  );
});

const PitcherRadarChart = memo(function PitcherRadarChart({ data = defaultData, height = 220 }: PitcherRadarChartProps) {
  return (
    <div role="img" aria-label="Pitcher profile radar chart showing percentile scores for K/9, BB/9, FIP, WHIP, GB%, and SwStr%">
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
            tickCount={4}
            axisLine={false}
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
    </div>
  );
});

export default PitcherRadarChart;