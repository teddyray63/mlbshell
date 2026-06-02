'use client';

import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Topbar from '@/components/Topbar';
import { mockPlayerProps } from '@/data/mockData';
import { ChevronRightIcon, UserIcon } from '@heroicons/react/24/outline';

function EdgeBadge({ edge }: { edge?: number }) {
  if (edge === undefined) return null;
  const isPositive = edge > 0;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono-data ${
        isPositive ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'
      }`}
    >
      {isPositive ? '+' : ''}{edge.toFixed(1)}%
    </span>
  );
}

function HitRateBar({ rate }: { rate?: number }) {
  if (rate === undefined) return null;
  const pct = Math.round(rate * 100);
  const color = pct >= 60 ? 'bg-positive' : pct >= 50 ? 'bg-warning' : 'bg-negative';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[48px]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono-data text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function PlayerPropsPage() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Topbar title="Player Props" subtitle="Individual player prop lines and analysis" />
          <div className="flex-1 px-4 md:px-6 py-5 max-w-screen-2xl mx-auto w-full">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Click any player to view full profile, stats, and Statcast metrics.
              </p>
              <span className="text-xs font-mono-data text-muted-foreground">{mockPlayerProps.length} props</span>
            </div>

            {/* Desktop table */}
            <div className="card-surface overflow-x-auto hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">Player</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">Team</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">Opp</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">Prop</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">Line</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">Over</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">Under</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">Proj</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">Edge</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hit Rate</th>
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {mockPlayerProps.map((prop) => (
                    <tr
                      key={prop.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/player-props/${prop.id}`}
                          className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          </span>
                          {prop.player}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">{prop.team}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{prop.opponent}</td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground">{prop.prop}</td>
                      <td className="px-4 py-3 text-right text-xs font-mono-data font-semibold">{prop.line}</td>
                      <td className="px-4 py-3 text-right text-xs font-mono-data text-foreground">
                        {prop.overOdds > 0 ? `+${prop.overOdds}` : prop.overOdds}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-mono-data text-foreground">
                        {prop.underOdds > 0 ? `+${prop.underOdds}` : prop.underOdds}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-mono-data text-primary font-semibold">
                        {prop.projection?.toFixed(1) ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <EdgeBadge edge={prop.edge} />
                      </td>
                      <td className="px-4 py-3 min-w-[100px]">
                        <HitRateBar rate={prop.hitRate} />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/player-props/${prop.id}`}>
                          <ChevronRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {mockPlayerProps.map((prop) => (
                <Link
                  key={prop.id}
                  href={`/player-props/${prop.id}`}
                  className="card-surface p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors block"
                >
                  <span className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-foreground text-sm truncate">{prop.player}</span>
                      <EdgeBadge edge={prop.edge} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span className="font-semibold text-primary">{prop.team}</span>
                      <span>vs {prop.opponent}</span>
                      <span>·</span>
                      <span>{prop.prop}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">Line: <strong className="text-foreground font-mono-data">{prop.line}</strong></span>
                      <span className="text-muted-foreground">Proj: <strong className="text-primary font-mono-data">{prop.projection?.toFixed(1) ?? '—'}</strong></span>
                    </div>
                    <div className="mt-2">
                      <HitRateBar rate={prop.hitRate} />
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}