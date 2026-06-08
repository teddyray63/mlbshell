'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, ArrowUpDown, Activity } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChip from '@/components/ui/FilterChip';
import EmptyState from '@/components/ui/EmptyState';
import StatCell from '@/components/ui/StatCell';
import SaveEdgeButton from '@/components/ui/SaveEdgeButton';
import PlayerLink from '@/components/ui/PlayerLink';
import PlayerPhoto from '@/components/ui/PlayerPhoto';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import { formatEV, formatOdds, formatAvg } from '@/utils/formatters';
import type { PropCalculation } from '../../../../shared/types';
import type { ConfidenceLevel } from '../../../../shared/constants';

type SortKey =
  | 'player'
  | 'prop'
  | 'line'
  | 'projectedValue'
  | 'edge'
  | 'hitRate'
  | 'ev'
  | 'exitVelo'
  | 'barrelPct'
  | 'hardHitPct'
  | 'xwoba'
  | 'edgeVsRHP'
  | 'edgeVsLHP'
  | 'whiffPct'
  | 'l5PaPerG'
  | 'nearHr'
  | 'hrFbPct'
  | 'pulledAirPct';
type SortDir = 'asc' | 'desc';

const PITCH_CHIPS = ['4-Seam Fastball', 'Slider', 'Curveball', 'Changeup', 'Sinker'];

const CONFIDENCE_BADGE: Record<
  ConfidenceLevel,
  { variant: 'positive' | 'warning' | 'negative'; label: string }
> = {
  high: { variant: 'positive', label: 'High' },
  medium: { variant: 'warning', label: 'Med' },
  low: { variant: 'negative', label: 'Low' },
};

const COLUMNS: { key: SortKey; label: string; align: 'left' | 'center' | 'right' }[] = [
  { key: 'player', label: 'Player', align: 'left' },
  { key: 'prop', label: 'Prop', align: 'left' },
  { key: 'line', label: 'Line', align: 'center' },
  { key: 'projectedValue', label: 'Proj', align: 'right' },
  { key: 'edge', label: 'Edge%', align: 'right' },
  { key: 'hitRate', label: 'Hit Rate', align: 'right' },
  { key: 'ev', label: 'EV', align: 'right' },
  { key: 'exitVelo', label: 'Exit Velo', align: 'right' },
  { key: 'barrelPct', label: 'Barrel%', align: 'right' },
  { key: 'hardHitPct', label: 'Hard Hit%', align: 'right' },
  { key: 'xwoba', label: 'xwOBA', align: 'right' },
  { key: 'edgeVsRHP', label: 'vs RHP', align: 'right' },
  { key: 'edgeVsLHP', label: 'vs LHP', align: 'right' },
  { key: 'whiffPct', label: 'Whiff%', align: 'right' },
  { key: 'l5PaPerG', label: 'L5 PA/G', align: 'right' },
  { key: 'nearHr', label: 'Near HR', align: 'right' },
  { key: 'hrFbPct', label: 'HR/FB%', align: 'right' },
  { key: 'pulledAirPct', label: 'Pulled-Air%', align: 'right' },
];

export default function PlayerPropsPage() {
  const router = useRouter();
  const { data, loading, error } = useApi<PropCalculation[]>(
    () => apiClient.getPropCalculations(),
    []
  );

  const [team, setTeam] = useState<string>('all');
  const [prop, setProp] = useState<string>('all');
  const [side, setSide] = useState<'all' | 'rhp' | 'lhp'>('all');
  const [pitches, setPitches] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('edge');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    apiClient
      .getSavedEdges()
      .then((edges) => {
        if (active) setSavedIds(new Set(edges.map((e) => e.propId)));
      })
      .catch(() => {
        /* not logged in / no edges */
      });
    return () => {
      active = false;
    };
  }, []);

  const togglePitch = (p: string) =>
    setPitches((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  const props = useMemo(() => data ?? [], [data]);

  const teams = useMemo(
    () => ['all', ...Array.from(new Set(props.map((p) => p.team).filter(Boolean) as string[]))],
    [props]
  );
  const propTypes = useMemo(
    () => ['all', ...Array.from(new Set(props.map((p) => p.statType)))],
    [props]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'player' || key === 'prop' ? 'asc' : 'desc');
    }
  };

  const filtered = useMemo(() => {
    return props.filter((p) => {
      if (team !== 'all' && p.team !== team) return false;
      if (prop !== 'all' && p.statType !== prop) return false;
      if (side === 'rhp' && p.handedness === 'R') return false; // RHB sit vs RHP less favorably; keep platoon-friendly
      if (side === 'lhp' && p.handedness === 'L') return false;
      if (pitches.length > 0) {
        const vuln = p.pitchVulnerability ?? [];
        const struggles = vuln.some(
          (v) => pitches.includes(v.pitchType) && v.verdict === 'struggles'
        );
        if (!struggles) return false;
      }
      return true;
    });
  }, [props, team, prop, side, pitches]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sortKey) {
        case 'player':
          av = a.player ?? '';
          bv = b.player ?? '';
          break;
        case 'prop':
          av = a.statType;
          bv = b.statType;
          break;
        case 'line':
          av = a.line ?? 0;
          bv = b.line ?? 0;
          break;
        case 'projectedValue':
          av = a.projectedValue;
          bv = b.projectedValue;
          break;
        case 'edge':
          av = a.edge;
          bv = b.edge;
          break;
        case 'hitRate':
          av = a.hitRate ?? 0;
          bv = b.hitRate ?? 0;
          break;
        case 'ev':
          av = a.ev ?? 0;
          bv = b.ev ?? 0;
          break;
        case 'exitVelo':
          av = a.exitVelo ?? 0;
          bv = b.exitVelo ?? 0;
          break;
        case 'barrelPct':
          av = a.barrelPct ?? 0;
          bv = b.barrelPct ?? 0;
          break;
        case 'hardHitPct':
          av = a.hardHitPct ?? 0;
          bv = b.hardHitPct ?? 0;
          break;
        case 'xwoba':
          av = a.xwoba ?? 0;
          bv = b.xwoba ?? 0;
          break;
        case 'edgeVsRHP':
          av = a.edgeVsRHP ?? 0;
          bv = b.edgeVsRHP ?? 0;
          break;
        case 'edgeVsLHP':
          av = a.edgeVsLHP ?? 0;
          bv = b.edgeVsLHP ?? 0;
          break;
        case 'whiffPct':
          av = a.whiffPct ?? 0;
          bv = b.whiffPct ?? 0;
          break;
        case 'l5PaPerG':
          av = a.l5PaPerG ?? 0;
          bv = b.l5PaPerG ?? 0;
          break;
        case 'nearHr':
          av = a.nearHr ?? 0;
          bv = b.nearHr ?? 0;
          break;
        case 'hrFbPct':
          av = a.hrFbPct ?? 0;
          bv = b.hrFbPct ?? 0;
          break;
        case 'pulledAirPct':
          av = a.pulledAirPct ?? 0;
          bv = b.pulledAirPct ?? 0;
          break;
      }
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title="Player Props" subtitle="Individual player prop lines and analysis" />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
        <SectionHeader
          title="Prop Board"
          subtitle="Edges computed from projection vs. line, sorted by edge%"
          actions={
            <span className="font-mono-data text-xs text-muted-foreground">
              {loading ? 'Loading…' : `${sorted.length} props`}
            </span>
          }
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold text-muted-foreground">Team</span>
            {teams.map((t) => (
              <FilterChip
                key={t}
                label={t === 'all' ? 'All' : t}
                active={team === t}
                onClick={() => setTeam(t)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold text-muted-foreground">Prop</span>
            {propTypes.map((t) => (
              <FilterChip
                key={t}
                label={t === 'all' ? 'All' : t}
                active={prop === t}
                onClick={() => setProp(t)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold text-muted-foreground">Matchup</span>
            {(['all', 'rhp', 'lhp'] as const).map((s) => (
              <FilterChip
                key={s}
                label={s === 'all' ? 'All' : s === 'rhp' ? 'vs RHP' : 'vs LHP'}
                active={side === s}
                onClick={() => setSide(s)}
              />
            ))}
          </div>
        </div>

        {/* Pitch type filter chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-muted-foreground">Struggles vs</span>
          {PITCH_CHIPS.map((pt) => (
            <FilterChip
              key={pt}
              label={pt}
              active={pitches.includes(pt)}
              onClick={() => togglePitch(pt)}
            />
          ))}
        </div>

        {error && (
          <div className="rounded-md border border-negative/40 bg-negative-subtle px-3 py-2 text-xs text-negative">
            {error}
          </div>
        )}

        <div className="card-surface overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`cursor-pointer select-none whitespace-nowrap px-3 py-2 font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUp size={10} className="text-primary" />
                        ) : (
                          <ArrowDown size={10} className="text-primary" />
                        )
                      ) : (
                        <ArrowUpDown size={10} className="text-muted-foreground/40" />
                      )}
                    </span>
                  </th>
                ))}
                <th className="px-3 py-2 text-center font-semibold uppercase tracking-wider text-muted-foreground">
                  Conf
                </th>
                <th className="px-3 py-2 text-center font-semibold uppercase tracking-wider text-muted-foreground">
                  Save
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRowSkeleton key={`skel-${i}`} cols={COLUMNS.length + 2} />
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length + 2}>
                    <EmptyState
                      icon={<Activity size={28} />}
                      title="No props match these filters"
                      description="Try clearing the team or prop filters."
                    />
                  </td>
                </tr>
              ) : (
                sorted.map((p) => {
                  const conf = CONFIDENCE_BADGE[p.confidence];
                  const edgeColor =
                    p.edge >= 5
                      ? 'text-positive font-bold'
                      : p.edge < 0
                        ? 'text-negative'
                        : 'text-muted-foreground';
                  const odds = p.direction === 'under' ? p.underOdds : p.overOdds;
                  return (
                    <tr
                      key={p.playerId}
                      onClick={() => router.push(`/players/${p.mlbId ?? p.playerId}`)}
                      className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/20"
                    >
                      <td className="whitespace-nowrap px-3 py-2 font-medium text-foreground">
                        <span className="inline-flex items-center gap-2">
                          <PlayerPhoto
                            playerId={p.mlbId ?? p.playerId}
                            alt={p.player ?? ''}
                            size={32}
                          />
                          <span>
                            <PlayerLink playerId={p.mlbId ?? p.playerId} name={p.player ?? ''} />
                            <span className="ml-1.5 font-normal text-muted-foreground">
                              {p.team}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {p.statType}
                        <span className="ml-1 text-[10px] uppercase text-muted-foreground/60">
                          {p.direction}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center font-mono-data">
                        {p.line} <span className="text-muted-foreground">{formatOdds(odds)}</span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono-data">{p.projectedValue}</td>
                      <td className={`px-3 py-2 text-right font-mono-data ${edgeColor}`}>
                        {formatEV(p.edge)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono-data text-muted-foreground">
                        {p.hitRateHits != null && p.hitRateGames ? (
                          <span>
                            <span className="text-foreground">
                              {p.hitRateHits}/{p.hitRateGames}
                            </span>{' '}
                            <span className="text-[10px]">
                              {Math.round((p.hitRateHits / p.hitRateGames) * 100)}%
                            </span>
                          </span>
                        ) : p.hitRate != null ? (
                          `${Math.round(p.hitRate * 100)}%`
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono-data text-muted-foreground">
                        {p.ev != null ? p.ev.toFixed(2) : '—'}
                      </td>
                      <StatCell
                        stat="exitVelo"
                        value={p.exitVelo}
                        type="batter"
                        format={(v) => (v == null ? '—' : v.toFixed(1))}
                      />
                      <StatCell
                        stat="barrelPct"
                        value={p.barrelPct}
                        type="batter"
                        format={(v) => (v == null ? '—' : `${v.toFixed(1)}%`)}
                      />
                      <StatCell
                        stat="hardHitPct"
                        value={p.hardHitPct}
                        type="batter"
                        format={(v) => (v == null ? '—' : `${v.toFixed(1)}%`)}
                      />
                      <StatCell stat="xwoba" value={p.xwoba} type="batter" format={formatAvg} />
                      <td
                        className={`px-3 py-2 text-right font-mono-data ${(p.edgeVsRHP ?? 0) >= 5 ? 'text-positive font-bold' : (p.edgeVsRHP ?? 0) < 0 ? 'text-negative' : 'text-muted-foreground'}`}
                      >
                        {p.edgeVsRHP != null ? formatEV(p.edgeVsRHP) : '—'}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-mono-data ${(p.edgeVsLHP ?? 0) >= 5 ? 'text-positive font-bold' : (p.edgeVsLHP ?? 0) < 0 ? 'text-negative' : 'text-muted-foreground'}`}
                      >
                        {p.edgeVsLHP != null ? formatEV(p.edgeVsLHP) : '—'}
                      </td>
                      <StatCell
                        stat="whiffPct"
                        value={p.whiffPct}
                        type="batter"
                        format={(v) => (v == null ? '—' : `${v.toFixed(1)}%`)}
                      />
                      <td className="px-3 py-2 text-right font-mono-data text-muted-foreground">
                        {p.l5PaPerG != null ? p.l5PaPerG.toFixed(1) : '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono-data text-foreground">
                        {p.nearHr ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono-data text-muted-foreground">
                        {p.hrFbPct != null ? `${p.hrFbPct.toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono-data text-muted-foreground">
                        {p.pulledAirPct != null ? `${p.pulledAirPct.toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <StatusBadge variant={conf.variant}>{conf.label}</StatusBadge>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <SaveEdgeButton
                          edge={{
                            propId: `${p.playerId}:${p.statType}`,
                            player: p.player ?? '',
                            prop: p.statType,
                            line: p.line ?? 0,
                            direction: p.direction ?? 'over',
                            edge: p.edge,
                            confidence: p.confidence,
                          }}
                          initiallySaved={savedIds.has(`${p.playerId}:${p.statType}`)}
                          onSaved={(id) => setSavedIds((s) => new Set(s).add(id))}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {!loading && sorted.length > 0 && (
            <div className="flex items-center justify-between border-t border-border px-3 py-2.5 text-xs text-muted-foreground">
              <span className="font-mono-data">
                {sorted.length} props — sorted by {sortKey} {sortDir}
              </span>
              <span>Click any row to open in Prop Analyzer</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
