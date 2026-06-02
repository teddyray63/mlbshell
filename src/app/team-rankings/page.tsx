'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Topbar from '@/components/Topbar';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface TeamRecord {
  rank: number;
  team: string;
  abbrev: string;
  division: string;
  wins: number;
  losses: number;
  pct: string;
  gb: string;
  rs: number;
  ra: number;
  streak: string;
  last10: string;
}

const DIVISIONS = ['All', 'AL East', 'AL Central', 'AL West', 'NL East', 'NL Central', 'NL West'];

export default function TeamRankingsPage() {
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [division, setDivision] = useState('All');
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const season = new Date().getFullYear().toString();
      const res = await fetch(`/api/team-rankings?season=${season}`);
      const json = await res.json();
      setTeams(json.teams ?? []);
      setFetchedAt(json.fetchedAt);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load standings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = division === 'All' ? teams : teams.filter((t) => t.division === division);

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Topbar
            title="Team Rankings"
            subtitle="MLB Standings & Power Rankings"
            dataSource={loading ? 'mock' : 'live'}
          />
          <div className="flex-1 p-6 space-y-6 max-w-screen-2xl mx-auto w-full">
            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-negative/10 border border-negative/30 text-sm text-negative">
                <AlertTriangle size={16} className="shrink-0" />
                <span className="flex-1"><strong>Data unavailable:</strong> {error}</span>
                <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-negative/20 hover:bg-negative/30 text-xs font-semibold transition-colors">
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}

            {/* Division filter tabs */}
            <div className="flex gap-2 flex-wrap">
              {DIVISIONS.map((div) => (
                <button
                  key={div}
                  onClick={() => setDivision(div)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    division === div
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>

            {/* Standings table */}
            <div className="card-surface rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  {division === 'All' ? 'MLB Standings' : division}
                </h2>
                {fetchedAt && (
                  <span className="text-xs text-muted-foreground font-mono-data">
                    Updated {new Date(fetchedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">#</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Team</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Division</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">W</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">L</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">PCT</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">GB</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">RS</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">RA</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Streak</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">L10</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      Array.from({ length: 7 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {Array.from({ length: 11 }).map((__, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="h-3 bg-muted rounded w-full" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground text-sm">
                          No teams found for this division.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((row) => (
                        <tr key={row.rank} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{row.rank}</td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            <span className="hidden sm:inline">{row.team}</span>
                            <span className="sm:hidden font-mono-data">{row.abbrev}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{row.division}</td>
                          <td className="px-4 py-3 text-center font-mono-data text-xs font-semibold text-positive">{row.wins}</td>
                          <td className="px-4 py-3 text-center font-mono-data text-xs text-muted-foreground">{row.losses}</td>
                          <td className="px-4 py-3 text-center font-mono-data text-xs">{row.pct}</td>
                          <td className="px-4 py-3 text-center font-mono-data text-xs text-muted-foreground">{row.gb}</td>
                          <td className="px-4 py-3 text-center font-mono-data text-xs text-muted-foreground hidden sm:table-cell">{row.rs}</td>
                          <td className="px-4 py-3 text-center font-mono-data text-xs text-muted-foreground hidden sm:table-cell">{row.ra}</td>
                          <td className="px-4 py-3 text-center font-mono-data text-xs hidden lg:table-cell">
                            <span className={row.streak?.startsWith('W') ? 'text-positive' : 'text-negative'}>
                              {row.streak}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono-data text-xs text-muted-foreground hidden lg:table-cell">{row.last10}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}
