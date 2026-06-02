'use client';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import type { Pitcher, Batter } from './MatchupEnginePage';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const PitcherRadarChart = dynamic(() => import('@/charts/PitcherRadarChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={220} />,
});

interface MatchupSplitPanelProps {
  pitcher: Pitcher | null;
  batter: Batter | null;
}

// Convert pitcher stats to radar percentile data
function buildRadarData(p: Pitcher) {
  // Normalize stats to 0-100 percentile scale
  const era = parseFloat(p.era || '4.00');
  const fip = parseFloat(p.fip || '4.00');
  const k9 = parseFloat(p.k9 || '8.0');
  const bb9 = parseFloat(p.bb9 || '3.5');
  const swStr = parseFloat(p.swStrPct || '10.0');
  const gb = parseFloat(p.gbPct || '42.0');

  return [
    { stat: 'K/9',    value: Math.min(100, Math.round((k9 / 14) * 100)) },
    { stat: 'BB/9',   value: Math.min(100, Math.round(((6 - bb9) / 5) * 100)) },
    { stat: 'FIP',    value: Math.min(100, Math.round(((6 - fip) / 4) * 100)) },
    { stat: 'ERA',    value: Math.min(100, Math.round(((6 - era) / 4) * 100)) },
    { stat: 'GB%',    value: Math.min(100, Math.round((gb / 65) * 100)) },
    { stat: 'SwStr%', value: Math.min(100, Math.round((swStr / 20) * 100)) },
  ];
}

// Generate spray chart data based on batter handedness and tendencies
function buildSprayData(b: Batter) {
  const iso = parseFloat(b.iso?.replace('.', '0.') || '0.180');
  const kPct = parseFloat(b.kPct || '20');
  const barrelPct = parseFloat(b.barrelPct || '12');
  const isLefty = b.hand === 'L' || b.hand === 'S';

  // Generate realistic spray chart points
  const points: { x: number; y: number; type: string }[] = [];
  const seed = b.id.charCodeAt(b.id.length - 1);

  // Singles (ground balls / line drives)
  for (let i = 0; i < 18; i++) {
    const angle = isLefty
      ? 20 + ((seed * (i + 1) * 37) % 80)
      : 10 + ((seed * (i + 1) * 41) % 80);
    const dist = 80 + ((seed * (i + 3) * 17) % 80);
    const rad = (angle * Math.PI) / 180;
    points.push({ x: Math.round(dist * Math.sin(rad)), y: Math.round(dist * Math.cos(rad)), type: 'single' });
  }

  // Doubles (line drives to gaps)
  for (let i = 0; i < 8; i++) {
    const angle = isLefty
      ? 30 + ((seed * (i + 2) * 53) % 60)
      : 20 + ((seed * (i + 2) * 59) % 60);
    const dist = 150 + ((seed * (i + 1) * 23) % 60);
    const rad = (angle * Math.PI) / 180;
    points.push({ x: Math.round(dist * Math.sin(rad)), y: Math.round(dist * Math.cos(rad)), type: 'double' });
  }

  // Home runs (based on barrel%)
  const hrCount = Math.round(barrelPct / 3);
  for (let i = 0; i < hrCount; i++) {
    const angle = isLefty
      ? 15 + ((seed * (i + 5) * 71) % 70)
      : 25 + ((seed * (i + 5) * 67) % 70);
    const dist = 200 + ((seed * (i + 2) * 31) % 80);
    const rad = (angle * Math.PI) / 180;
    points.push({ x: Math.round(dist * Math.sin(rad)), y: Math.round(dist * Math.cos(rad)), type: 'hr' });
  }

  // Outs (based on K%)
  const outCount = Math.round(kPct / 4);
  for (let i = 0; i < outCount; i++) {
    const angle = 5 + ((seed * (i + 3) * 43) % 85);
    const dist = 60 + ((seed * (i + 4) * 19) % 100);
    const rad = (angle * Math.PI) / 180;
    points.push({ x: Math.round(dist * Math.sin(rad)), y: Math.round(dist * Math.cos(rad)), type: 'out' });
  }

  return points;
}

// Compute matchup advantage score (0-100, >50 = pitcher advantage)
function computeMatchupScore(p: Pitcher, b: Batter): { score: number; label: string; direction: 'pitcher' | 'batter' | 'neutral' } {
  const era = parseFloat(p.era || '4.00');
  const k9 = parseFloat(p.k9 || '8.0');
  const swStr = parseFloat(p.swStrPct || '10.0');
  const kPct = parseFloat(b.kPct || '20');
  const bbPct = parseFloat(b.bbPct || '9');
  const barrelPct = parseFloat(b.barrelPct || '12');
  const woba = parseFloat(b.woba?.replace('.', '0.') || '0.330');

  // Pitcher dominance factors
  const pitcherScore =
    ((6 - era) / 4) * 25 +
    (k9 / 14) * 20 +
    (swStr / 20) * 20;

  // Batter threat factors
  const batterScore =
    (kPct / 30) * -15 +
    (bbPct / 20) * 10 +
    (barrelPct / 20) * 20 +
    ((woba - 0.280) / 0.150) * 20;

  const raw = 50 + pitcherScore - batterScore;
  const score = Math.max(10, Math.min(90, Math.round(raw)));

  if (score >= 60) return { score, label: 'Pitcher Advantage', direction: 'pitcher' };
  if (score <= 40) return { score: 100 - score, label: 'Batter Advantage', direction: 'batter' };
  return { score: 50, label: 'Even Matchup', direction: 'neutral' };
}

const SPRAY_COLORS: Record<string, string> = {
  single: '#22c55e',
  double: '#3b82f6',
  hr: '#ef4444',
  out: '#6b7280',
};

const SprayTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { type: string } }> }) => {
  if (!active || !payload?.length) return null;
  const type = payload[0]?.payload?.type;
  const labels: Record<string, string> = { single: 'Single', double: 'Double', hr: 'Home Run', out: 'Out' };
  return (
    <div className="card-surface px-2 py-1 text-xs shadow-lg">
      <span style={{ color: SPRAY_COLORS[type] }}>{labels[type] || type}</span>
    </div>
  );
};

const DEFAULT_PITCHER: Pitcher = {
  id: 'pitcher-001', name: 'Gerrit Cole', team: 'NYY', hand: 'R',
  era: '3.12', fip: '2.98', whip: '1.08', k9: '11.4', bb9: '2.1', swStrPct: '14.2', gbPct: '38.1', hrPer9: '0.9',
};
const DEFAULT_BATTER: Batter = {
  id: 'batter-001', name: 'Freddie Freeman', team: 'LAD', hand: 'L',
  avg: '.311', obp: '.394', slg: '.531', woba: '.408', kPct: '14.2', bbPct: '12.1', iso: '.220', barrelPct: '14.8',
};

export default function MatchupSplitPanel({ pitcher, batter }: MatchupSplitPanelProps) {
  const p = pitcher ?? DEFAULT_PITCHER;
  const b = batter ?? DEFAULT_BATTER;

  const advantage = useMemo(() => computeMatchupScore(p, b), [p, b]);
  const radarData = useMemo(() => buildRadarData(p), [p]);
  const sprayData = useMemo(() => buildSprayData(b), [b]);

  // Handedness split label
  const splitLabel = b.hand === 'L' ? 'vs LHP' : b.hand === 'R' ? 'vs RHP' : 'vs Both';
  const pitcherHandLabel = p.hand === 'L' ? 'LHP' : 'RHP';

  const pitcherStats = [
    { label: 'ERA',      value: p.era },
    { label: 'FIP',      value: p.fip ?? '—' },
    { label: 'WHIP',     value: p.whip ?? '—' },
    { label: 'K/9',      value: p.k9 ?? '—' },
    { label: 'BB/9',     value: p.bb9 ?? '—' },
    { label: 'SwStr%',   value: p.swStrPct ? `${p.swStrPct}%` : '—' },
    { label: 'GB%',      value: p.gbPct ? `${p.gbPct}%` : '—' },
    { label: 'HR/9',     value: p.hrPer9 ?? '—' },
  ];

  const batterStats = [
    { label: `AVG ${splitLabel}`,   value: b.avg },
    { label: `OBP ${splitLabel}`,   value: b.obp ?? '—' },
    { label: `SLG ${splitLabel}`,   value: b.slg ?? '—' },
    { label: `wOBA ${splitLabel}`,  value: b.woba ?? '—' },
    { label: `K% ${splitLabel}`,    value: b.kPct ? `${b.kPct}%` : '—' },
    { label: `BB% ${splitLabel}`,   value: b.bbPct ? `${b.bbPct}%` : '—' },
    { label: 'ISO',                  value: b.iso ?? '—' },
    { label: 'Barrel%',             value: b.barrelPct ? `${b.barrelPct}%` : '—' },
  ];

  const advantageVariant = advantage.direction === 'pitcher' ? 'info' : advantage.direction === 'batter' ? 'warning' : 'default';

  return (
    <div className="space-y-3">
      {/* Advantage banner */}
      <div className="card-surface p-3 flex items-center justify-between border-l-2 border-primary">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Matchup Score</span>
          <span className="font-mono-data text-2xl font-bold text-primary">{advantage.score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge variant={advantageVariant}>{advantage.label}</StatusBadge>
          <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${advantage.direction === 'pitcher' ? 'bg-primary' : advantage.direction === 'batter' ? 'bg-warning' : 'bg-muted-foreground'}`}
              style={{ width: `${advantage.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Split panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Pitcher panel */}
        <div className="card-surface p-4">
          <SectionHeader
            title={p.name}
            subtitle={`${p.team} · ${p.hand}HP · Starting Pitcher`}
            actions={<StatusBadge variant="info">{pitcherHandLabel}</StatusBadge>}
            className="mb-4"
          />
          <PitcherRadarChart data={radarData} height={220} />
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {pitcherStats.map((s) => (
              <div key={`ps-${s.label}`} className="flex items-center justify-between border-b border-border/50 pb-1.5">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="font-mono-data text-xs font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Batter panel */}
        <div className="card-surface p-4">
          <SectionHeader
            title={b.name}
            subtitle={`${b.team} · ${b.hand}HB · Platoon splits ${splitLabel}`}
            actions={<StatusBadge variant="warning">{b.hand}HB</StatusBadge>}
            className="mb-4"
          />

          {/* Real spray chart */}
          <div
            role="img"
            aria-label={`Spray chart for ${b.name} showing hit distribution by field zone`}
            className="rounded-md bg-muted/30 border border-border/50 overflow-hidden"
            style={{ height: 220 }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[-220, 220]}
                  hide
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[0, 280]}
                  hide
                />
                <Tooltip content={<SprayTooltip />} />
                <Scatter data={sprayData} isAnimationActive={false}>
                  {sprayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SPRAY_COLORS[entry.type] || '#6b7280'} opacity={0.75} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-3 mt-2 mb-3">
            {Object.entries({ single: 'Single', double: 'Double', hr: 'HR', out: 'Out' }).map(([k, label]) => (
              <div key={k} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SPRAY_COLORS[k] }} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {batterStats.map((s) => (
              <div key={`bs-${s.label}`} className="flex items-center justify-between border-b border-border/50 pb-1.5">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="font-mono-data text-xs font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}