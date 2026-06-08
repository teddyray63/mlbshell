'use client';

import React, { useMemo, useState } from 'react';
import { Clock, Copy, Check } from 'lucide-react';
import Topbar from '@/components/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import PlayerLink from '@/components/ui/PlayerLink';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import type { Game, WeatherCondition, PropVerdict } from '../../../../shared/types';

type SectionStatus = 'PENDING' | 'READY' | 'COMPLETE';

const SECTIONS = [
  { id: 1, title: 'Environment', window: '8:00-10:00 AM', gate: 'Gate 1', unlock: 8 * 60 },
  { id: 2, title: 'Pitcher Splits', window: '11:00 AM', gate: 'Gate 3', unlock: 11 * 60 },
  { id: 3, title: 'Pitch Arsenal', window: '11:15 AM', gate: 'Gate 4', unlock: 11 * 60 + 15 },
  { id: 4, title: 'Batter Model', window: 'Post-Lineup', gate: 'Gates 2+5', unlock: 15 * 60 },
  {
    id: 5,
    title: 'Savant Confirmation',
    window: 'Final 30 Min',
    gate: 'Gate 6',
    unlock: 18 * 60 + 30,
  },
  { id: 6, title: 'Bet Placement', window: 'First Pitch', gate: 'Final', unlock: 19 * 60 },
];

const PROP_ORDER = ['RBIs', 'Total Bases', 'Hits', 'Singles', 'Doubles', 'Home Runs'];

function statusFor(unlock: number, nextUnlock: number | null, nowMin: number): SectionStatus {
  if (nowMin < unlock) return 'PENDING';
  if (nextUnlock != null && nowMin >= nextUnlock) return 'COMPLETE';
  return 'READY';
}

function StatusPill({ status }: { status: SectionStatus }) {
  if (status === 'COMPLETE') return <StatusBadge variant="positive">COMPLETE</StatusBadge>;
  if (status === 'READY') return <StatusBadge variant="info">READY</StatusBadge>;
  return <StatusBadge variant="neutral">PENDING</StatusBadge>;
}

const envStatus = (wx: WeatherCondition | undefined): { label: string; cls: string } => {
  if (!wx) return { label: 'YELLOW', cls: 'text-amber-400' };
  if (wx.temp >= 80 && wx.windImpact === 'boost')
    return { label: 'GREEN', cls: 'text-emerald-400' };
  if (wx.temp < 65 || wx.windImpact === 'suppress') return { label: 'RED', cls: 'text-red-400' };
  return { label: 'YELLOW', cls: 'text-amber-400' };
};

const gateIcon = (r: 'pass' | 'warn' | 'fail') =>
  r === 'pass' ? '✅' : r === 'warn' ? '⚠️' : '❌';

export default function DailyWorkflowPage() {
  const games = useApi<Game[]>(() => apiClient.getGames(), []);
  const weather = useApi<WeatherCondition[]>(() => apiClient.getAllWeather(), []);
  const verdicts = useApi<PropVerdict[]>(() => apiClient.getGateVerdicts(), []);
  const [copied, setCopied] = useState(false);

  const nowMin = useMemo(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }, []);

  const loading = games.loading || weather.loading || verdicts.loading;
  const error = games.error || weather.error || verdicts.error;

  const wxByVenue = useMemo(() => {
    const m: Record<string, WeatherCondition> = {};
    for (const w of weather.data ?? []) m[w.venue] = w;
    return m;
  }, [weather.data]);

  const vs = useMemo(() => verdicts.data ?? [], [verdicts.data]);

  // Section 6 — final ranked plays (not failed), ordered by prop priority then unit.
  const finalPlays = useMemo(() => {
    const order = (p: string) => {
      const i = PROP_ORDER.findIndex((x) => p.toLowerCase().includes(x.toLowerCase()));
      return i === -1 ? PROP_ORDER.length : i;
    };
    return vs
      .filter((v) => v.verdict !== 'FAIL')
      .sort((a, b) => order(a.prop) - order(b.prop) || b.unit - a.unit);
  }, [vs]);

  const copyPlays = () => {
    const text = finalPlays
      .map((v, i) => `${i + 1}. ${v.player} ${v.prop} ${v.line} — ${v.verdict} (${v.unit}u)`)
      .join('\n');
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const sectionStatuses = SECTIONS.map((s, i) =>
    statusFor(s.unlock, SECTIONS[i + 1]?.unlock ?? null, nowMin)
  );

  const gateDetail = (v: PropVerdict, gate: number) => v.gateDetails.find((d) => d.gate === gate);

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title="Daily Workflow" subtitle="Time-based prop workflow across the six gates" />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
        {loading ? (
          <ChartSkeleton />
        ) : error ? (
          <EmptyState title="Couldn't load workflow" description={error ?? undefined} />
        ) : (
          <>
            {/* Section 1 — Environment */}
            <Section
              n={1}
              title="Environment"
              window="8:00-10:00 AM"
              gate="Gate 1"
              status={sectionStatuses[0]}
            >
              <WorkflowTable
                head={['GAME', 'VENUE', 'TEMP', 'WIND', 'DIRECTION', 'PARK', 'STATUS']}
              >
                {(games.data ?? []).map((g) => {
                  const wx = wxByVenue[g.venue];
                  const st = envStatus(wx);
                  return (
                    <tr key={g.id} className="border-b border-border/50">
                      <td className="px-2 py-1.5 text-foreground">
                        {g.awayTeam} @ {g.homeTeam}
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">{g.venue}</td>
                      <td className="px-2 py-1.5 tabular-nums">{wx ? `${wx.temp}°` : '—'}</td>
                      <td className="px-2 py-1.5 tabular-nums">
                        {wx ? `${wx.windSpeed}mph` : '—'}
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">{wx?.windDir ?? '—'}</td>
                      <td className="px-2 py-1.5 tabular-nums">
                        {wx ? wx.parkFactor.toFixed(2) : '—'}
                      </td>
                      <td className={`px-2 py-1.5 font-semibold ${st.cls}`}>{st.label}</td>
                    </tr>
                  );
                })}
              </WorkflowTable>
            </Section>

            {/* Section 2 — Pitcher Splits (Gate 3) */}
            <Section
              n={2}
              title="Pitcher Splits"
              window="11:00 AM"
              gate="Gate 3"
              status={sectionStatuses[1]}
            >
              <WorkflowTable head={['PLAYER', 'TEAM', 'PROP', 'SPLIT DETAIL', 'EXPLOITABLE']}>
                {vs.map((v) => {
                  const d = gateDetail(v, 3);
                  return (
                    <tr
                      key={`${v.playerId}-${v.prop}`}
                      className={`border-b border-border/50 ${d?.result === 'pass' ? 'bg-emerald-400/5' : ''}`}
                    >
                      <td className="px-2 py-1.5 font-medium text-foreground">
                        <PlayerLink playerId={v.playerId} name={v.player} />
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">{v.team}</td>
                      <td className="px-2 py-1.5">{v.prop}</td>
                      <td className="px-2 py-1.5 text-xs text-muted-foreground">
                        {d?.reason ?? '—'}
                      </td>
                      <td className="px-2 py-1.5 text-center">{d ? gateIcon(d.result) : '—'}</td>
                    </tr>
                  );
                })}
              </WorkflowTable>
            </Section>

            {/* Section 3 — Pitch Arsenal (Gate 4) */}
            <Section
              n={3}
              title="Pitch Arsenal"
              window="11:15 AM"
              gate="Gate 4"
              status={sectionStatuses[2]}
            >
              <WorkflowTable head={['PLAYER', 'TEAM', 'PROP', 'WEAK PITCH DETAIL', 'QUALIFIES']}>
                {vs.map((v) => {
                  const d = gateDetail(v, 4);
                  return (
                    <tr key={`${v.playerId}-${v.prop}`} className="border-b border-border/50">
                      <td className="px-2 py-1.5 font-medium text-foreground">
                        <PlayerLink playerId={v.playerId} name={v.player} />
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">{v.team}</td>
                      <td className="px-2 py-1.5">{v.prop}</td>
                      <td className="px-2 py-1.5 text-xs text-muted-foreground">
                        {d?.reason ?? '—'}
                      </td>
                      <td className="px-2 py-1.5 text-center">{d ? gateIcon(d.result) : '—'}</td>
                    </tr>
                  );
                })}
              </WorkflowTable>
            </Section>

            {/* Section 4 — Batter Model (Gates 2+5) */}
            <Section
              n={4}
              title="Batter Model"
              window="Post-Lineup"
              gate="Gates 2+5"
              status={sectionStatuses[3]}
            >
              {sectionStatuses[3] === 'PENDING' ? (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  Waiting for lineups…
                </div>
              ) : (
                <WorkflowTable head={['PLAYER', 'TEAM', 'PROP TYPE', 'BATTER MODEL', 'QUALIFIES']}>
                  {[...vs]
                    .map((v) => ({ v, d: gateDetail(v, 5) }))
                    .sort(
                      (a, b) => (b.d?.result === 'pass' ? 1 : 0) - (a.d?.result === 'pass' ? 1 : 0)
                    )
                    .map(({ v, d }) => (
                      <tr key={`${v.playerId}-${v.prop}`} className="border-b border-border/50">
                        <td className="px-2 py-1.5 font-medium text-foreground">
                          <PlayerLink playerId={v.playerId} name={v.player} />
                        </td>
                        <td className="px-2 py-1.5 text-muted-foreground">{v.team}</td>
                        <td className="px-2 py-1.5">{v.prop}</td>
                        <td className="px-2 py-1.5 text-xs text-muted-foreground">
                          {d?.reason ?? '—'}
                        </td>
                        <td className="px-2 py-1.5 text-center">{d ? gateIcon(d.result) : '—'}</td>
                      </tr>
                    ))}
                </WorkflowTable>
              )}
            </Section>

            {/* Section 5 — Savant Confirmation (Gate 6) */}
            <Section
              n={5}
              title="Savant Confirmation"
              window="Final 30 Min"
              gate="Gate 6"
              status={sectionStatuses[4]}
            >
              <WorkflowTable head={['PLAYER', 'TEAM', 'PROP', 'TREND', 'CONFIRM']}>
                {vs.map((v) => {
                  const d = gateDetail(v, 6);
                  return (
                    <tr key={`${v.playerId}-${v.prop}`} className="border-b border-border/50">
                      <td className="px-2 py-1.5 font-medium text-foreground">
                        <PlayerLink playerId={v.playerId} name={v.player} />
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">{v.team}</td>
                      <td className="px-2 py-1.5">{v.prop}</td>
                      <td className="px-2 py-1.5 text-xs text-muted-foreground">
                        {d?.reason ?? '—'}
                      </td>
                      <td className="px-2 py-1.5 text-center">{d ? gateIcon(d.result) : '—'}</td>
                    </tr>
                  );
                })}
              </WorkflowTable>
            </Section>

            {/* Section 6 — Bet Placement */}
            <Section
              n={6}
              title="Bet Placement"
              window="First Pitch"
              gate="Final"
              status={sectionStatuses[5]}
              action={
                <button
                  onClick={copyPlays}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground hover:border-primary/40"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy to clipboard'}
                </button>
              }
            >
              {finalPlays.length === 0 ? (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No qualifying plays yet.
                </div>
              ) : (
                <WorkflowTable head={['#', 'PLAYER', 'TEAM', 'PROP', 'LINE', 'VERDICT', 'UNIT']}>
                  {finalPlays.map((v, i) => (
                    <tr
                      key={`${v.playerId}-${v.prop}`}
                      className={`border-b border-border/50 ${v.verdict === 'NUCLEAR' ? 'bg-amber-400/10' : ''}`}
                    >
                      <td className="px-2 py-1.5 tabular-nums text-muted-foreground">{i + 1}</td>
                      <td className="px-2 py-1.5 font-medium text-foreground">
                        <PlayerLink playerId={v.playerId} name={v.player} />
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">{v.team}</td>
                      <td className="px-2 py-1.5">{v.prop}</td>
                      <td className="px-2 py-1.5 tabular-nums">{v.line}</td>
                      <td className="px-2 py-1.5">
                        {v.verdict === 'NUCLEAR' ? (
                          <span className="rounded bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-400">
                            NUCLEAR
                          </span>
                        ) : (
                          <StatusBadge variant="positive">PASS</StatusBadge>
                        )}
                      </td>
                      <td className="px-2 py-1.5 tabular-nums font-semibold">{v.unit}u</td>
                    </tr>
                  ))}
                </WorkflowTable>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({
  n,
  title,
  window,
  gate,
  status,
  action,
  children,
}: {
  n: number;
  title: string;
  window: string;
  gate: string;
  status: SectionStatus;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Section {n} — {title}
          </span>
          <span className="text-xs text-muted-foreground">
            {window} · {gate}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {action}
          <StatusPill status={status} />
        </div>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function WorkflowTable({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
          {head.map((h) => (
            <th key={h} className="px-2 py-2 text-left">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
