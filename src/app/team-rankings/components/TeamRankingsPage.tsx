'use client';

import React, { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import type { TeamRanking } from '../../../../shared/types';

const DIVISIONS = ['All', 'AL East', 'AL Central', 'AL West', 'NL East', 'NL Central', 'NL West'];

export default function TeamRankingsPage() {
  const { data, loading, error } = useApi<TeamRanking[]>(() => apiClient.getTeamRankings(), []);
  const [division, setDivision] = useState<string>('All');

  const rankings = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(
    () => (division === 'All' ? rankings : rankings.filter((t) => t.division === division)),
    [rankings, division]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title="Team Rankings" subtitle="MLB standings & power rankings" />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
        <SectionHeader
          title="Standings"
          subtitle="Filter by division"
          actions={
            <span className="font-mono-data text-xs text-muted-foreground">
              {loading ? 'Loading…' : `${filtered.length} teams`}
            </span>
          }
        />

        {/* Division tabs */}
        <div className="flex flex-wrap gap-2">
          {DIVISIONS.map((div) => (
            <button
              key={div}
              onClick={() => setDivision(div)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                division === div
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {div}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-md border border-negative/40 bg-negative-subtle px-3 py-2 text-xs text-negative">
            {error}
          </div>
        )}

        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Team</th>
                {division === 'All' && <th className="px-4 py-3 text-left">Div</th>}
                <th className="px-4 py-3 text-center">W</th>
                <th className="px-4 py-3 text-center">L</th>
                <th className="px-4 py-3 text-center">PCT</th>
                <th className="px-4 py-3 text-center">GB</th>
                <th className="px-4 py-3 text-center">RS</th>
                <th className="px-4 py-3 text-center">RA</th>
                <th className="px-4 py-3 text-center">DIFF</th>
                <th className="px-4 py-3 text-center">STRK</th>
                <th className="px-4 py-3 text-center">L10</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRowSkeleton key={`skel-${i}`} cols={12} />
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={12}>
                    <EmptyState icon={<Trophy size={28} />} title="No teams in this division" />
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono-data text-xs text-muted-foreground">
                      {t.rank}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{t.teamName}</td>
                    {division === 'All' && (
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.division}</td>
                    )}
                    <td className="px-4 py-3 text-center font-mono-data text-xs">{t.wins}</td>
                    <td className="px-4 py-3 text-center font-mono-data text-xs">{t.losses}</td>
                    <td className="px-4 py-3 text-center font-mono-data text-xs">{t.pct}</td>
                    <td className="px-4 py-3 text-center font-mono-data text-xs text-muted-foreground">
                      {t.gamesBack}
                    </td>
                    <td className="px-4 py-3 text-center font-mono-data text-xs text-muted-foreground">
                      {t.runsScored}
                    </td>
                    <td className="px-4 py-3 text-center font-mono-data text-xs text-muted-foreground">
                      {t.runsAllowed}
                    </td>
                    <td
                      className={`px-4 py-3 text-center font-mono-data text-xs ${
                        t.runDiff > 0
                          ? 'text-positive'
                          : t.runDiff < 0
                            ? 'text-negative'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {t.runDiff > 0 ? `+${t.runDiff}` : t.runDiff}
                    </td>
                    <td className="px-4 py-3 text-center font-mono-data text-xs text-muted-foreground">
                      {t.streak ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center font-mono-data text-xs text-muted-foreground">
                      {t.lastTen ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
