'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';

// TODO: migrate TeamRankings logic from existing Vite app
// TODO: replace with real team rankings data via apiClient.get('/api/team-rankings')

const placeholderTeams = [
  { rank: 1, team: 'Los Angeles Dodgers', wins: 0, losses: 0, pct: '.000', gb: '-', rs: 0, ra: 0 },
  { rank: 2, team: 'Atlanta Braves', wins: 0, losses: 0, pct: '.000', gb: '0.0', rs: 0, ra: 0 },
  { rank: 3, team: 'New York Yankees', wins: 0, losses: 0, pct: '.000', gb: '0.0', rs: 0, ra: 0 },
  { rank: 4, team: 'Houston Astros', wins: 0, losses: 0, pct: '.000', gb: '0.0', rs: 0, ra: 0 },
  { rank: 5, team: 'Philadelphia Phillies', wins: 0, losses: 0, pct: '.000', gb: '0.0', rs: 0, ra: 0 },
];

export default function TeamRankingsPage() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="p-6 space-y-6">
          <div className="border-b border-border pb-4">
            <h1 className="text-2xl font-bold text-foreground">Team Rankings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              MLB Standings &amp; Power Rankings
            </p>
          </div>

          {/* TODO: migrate division selector tabs from existing Vite app */}
          <div className="flex gap-2 flex-wrap">
            {['All', 'AL East', 'AL Central', 'AL West', 'NL East', 'NL Central', 'NL West']?.map((div) => (
              <button
                key={div}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  div === 'All' ?'bg-primary text-primary-foreground border-primary' :'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {div}
              </button>
            ))}
          </div>

          {/* TODO: migrate TeamRankings table from existing Vite app */}
          <div className="card-surface rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Team</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">W</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">L</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">PCT</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">GB</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">RS</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">RA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {placeholderTeams?.map((row) => (
                  <tr key={row?.rank} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{row?.rank}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{row?.team}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground font-mono text-xs">{row?.wins}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground font-mono text-xs">{row?.losses}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground font-mono text-xs">{row?.pct}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground font-mono text-xs">{row?.gb}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground font-mono text-xs">{row?.rs}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground font-mono text-xs">{row?.ra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TODO: migrate power rankings chart from existing Vite app */}
          <div className="card-surface rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Power Rankings Chart</h3>
            <p className="text-xs text-muted-foreground">
              Paste your TeamRankings chart component here (e.g. BarChart or RadarChart from recharts).
            </p>
          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}
