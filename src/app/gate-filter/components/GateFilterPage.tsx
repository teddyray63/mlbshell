'use client';

import React, { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import Topbar from '@/components/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChip from '@/components/ui/FilterChip';
import EmptyState from '@/components/ui/EmptyState';
import PlayerLink from '@/components/ui/PlayerLink';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import type { PropVerdict, GateResult } from '../../../../shared/types';

const GATE_NAMES = [
  'Environment',
  'Day/Night',
  'Pitcher Splits',
  'Pitch Arsenal',
  'Batter Model',
  'Savant',
];

const gateIcon = (r: GateResult) => (r === 'pass' ? '✅' : r === 'warn' ? '⚠️' : '❌');

const todayLabel = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

type StatusFilter = 'all' | 'pass' | 'fail' | 'nuclear';

export default function GateFilterPage() {
  const { data, loading, error } = useApi<PropVerdict[]>(() => apiClient.getGateVerdicts(), []);
  const verdicts = useMemo(() => data ?? [], [data]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [propFilter, setPropFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const propTypes = useMemo(
    () => Array.from(new Set(verdicts.map((v) => v.prop))).sort(),
    [verdicts]
  );
  const teams = useMemo(
    () => Array.from(new Set(verdicts.map((v) => v.team).filter(Boolean))).sort(),
    [verdicts]
  );

  const filtered = useMemo(() => {
    return verdicts.filter((v) => {
      if (statusFilter === 'nuclear' && v.verdict !== 'NUCLEAR') return false;
      if (statusFilter === 'pass' && v.verdict === 'FAIL') return false;
      if (statusFilter === 'fail' && v.verdict !== 'FAIL') return false;
      if (propFilter !== 'all' && v.prop !== propFilter) return false;
      if (teamFilter !== 'all' && v.team !== teamFilter) return false;
      return true;
    });
  }, [verdicts, statusFilter, propFilter, teamFilter]);

  const scanned = verdicts.length;
  const passed = verdicts.filter((v) => v.verdict !== 'FAIL').length;
  const nuclear = verdicts.filter((v) => v.verdict === 'NUCLEAR');

  const verdictBadge = (v: PropVerdict['verdict']) => {
    if (v === 'NUCLEAR')
      return (
        <span className="rounded bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-400">
          NUCLEAR
        </span>
      );
    if (v === 'PASS') return <StatusBadge variant="positive">PASS</StatusBadge>;
    return <StatusBadge variant="negative">FAIL</StatusBadge>;
  };

  const rowKey = (v: PropVerdict) => `${v.playerId}-${v.prop}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title="Six-Gate Filter System" subtitle="Sequential prop validation across 6 gates" />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
        {/* Header / date */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter size={16} />
            <span>{todayLabel()}</span>
          </div>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="card-surface p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Scanned</div>
            <div className="text-2xl font-bold text-foreground">{scanned}</div>
          </div>
          <div className="card-surface p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Passed</div>
            <div className="text-2xl font-bold text-emerald-400">{passed}</div>
          </div>
          <div className="card-surface p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Nuclear</div>
            <div className="text-2xl font-bold text-amber-400">{nuclear.length}</div>
          </div>
        </div>

        {/* Nuclear cards pinned at top */}
        {nuclear.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nuclear.map((v) => (
              <div
                key={`nuke-${rowKey(v)}`}
                className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-400">
                    NUCLEAR
                  </span>
                  <span className="text-xs font-semibold text-amber-300">
                    {v.unit}u · Tier {v.tier}
                  </span>
                </div>
                <div className="mt-2 text-base font-bold text-foreground">
                  <PlayerLink playerId={v.playerId} name={v.player} />
                </div>
                <div className="text-sm text-muted-foreground">
                  {v.team} · {v.prop} {v.line}
                </div>
                <div className="mt-2 flex gap-1 text-sm">{v.gates.map(gateIcon).join(' ')}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter bar */}
        <div className="card-surface flex flex-wrap items-center gap-2 p-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </span>
          {(['all', 'pass', 'fail', 'nuclear'] as StatusFilter[]).map((s) => (
            <FilterChip
              key={s}
              label={s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
            />
          ))}
          <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Prop
          </span>
          <select
            value={propFilter}
            onChange={(e) => setPropFilter(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
          >
            <option value="all">All props</option>
            {propTypes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
          >
            <option value="all">All teams</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <ChartSkeleton />
        ) : error ? (
          <EmptyState title="Couldn't load gate verdicts" description={error ?? undefined} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No props match" description="Adjust the filters above." />
        ) : (
          <div className="card-surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2 text-left">Player</th>
                  <th className="px-2 py-2 text-left">Team</th>
                  <th className="px-2 py-2 text-left">Prop</th>
                  <th className="px-2 py-2 text-right">Line</th>
                  {GATE_NAMES.map((g, i) => (
                    <th key={g} className="px-2 py-2 text-center" title={g}>
                      G{i + 1}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center">Verdict</th>
                  <th className="px-2 py-2 text-center">Tier</th>
                  <th className="px-2 py-2 text-right">Unit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => {
                  const key = rowKey(v);
                  const isOpen = expanded === key;
                  return (
                    <React.Fragment key={key}>
                      <tr
                        className={`cursor-pointer border-b border-border/50 hover:bg-muted/40 ${v.verdict === 'NUCLEAR' ? 'bg-amber-400/5' : ''}`}
                        onClick={() => setExpanded(isOpen ? null : key)}
                      >
                        <td className="whitespace-nowrap px-3 py-2 font-medium text-foreground">
                          <PlayerLink playerId={v.playerId} name={v.player} />
                        </td>
                        <td className="px-2 py-2 text-muted-foreground">{v.team}</td>
                        <td className="px-2 py-2 text-foreground">{v.prop}</td>
                        <td className="px-2 py-2 text-right tabular-nums text-foreground">{v.line}</td>
                        {v.gates.map((g, i) => (
                          <td key={i} className="px-2 py-2 text-center">
                            {gateIcon(g)}
                          </td>
                        ))}
                        <td className="px-2 py-2 text-center">{verdictBadge(v.verdict)}</td>
                        <td className="px-2 py-2 text-center font-semibold text-foreground">
                          {v.tier}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums text-foreground">
                          {v.unit}u
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-border/50 bg-muted/20">
                          <td colSpan={12} className="px-4 py-3">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {v.gateDetails.map((d) => (
                                <div
                                  key={d.gate}
                                  className="rounded-md border border-border bg-background p-2"
                                >
                                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                                    <span>
                                      Gate {d.gate} · {d.name}
                                    </span>
                                    <span>{gateIcon(d.result)}</span>
                                  </div>
                                  <div className="mt-1 text-xs text-muted-foreground">{d.reason}</div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
