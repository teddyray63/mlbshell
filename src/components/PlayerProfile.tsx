'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import { ChartBarIcon, BoltIcon, ClockIcon } from '@heroicons/react/24/solid';
import MetricCard from '@/components/ui/MetricCard';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import type { PlayerProfile as PlayerProfileType, RecentGame } from '@/data/playerProfileData';

interface PlayerProfileProps {
  player: PlayerProfileType;
  recentGames: RecentGame[];
  loading?: boolean;
  backHref?: string;
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-sm font-mono-data font-semibold text-foreground">{value}</span>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-primary">{icon}</span>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>
    </div>
  );
}

function isPitcher(player: PlayerProfileType) {
  return player.position === 'SP' || player.position === 'RP' || player.position === 'CL';
}

export default function PlayerProfile({ player, recentGames, loading = false, backHref = '/player-props' }: PlayerProfileProps) {
  if (loading) {
    return (
      <div className="px-4 md:px-6 py-5 max-w-screen-xl mx-auto w-full space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="card-surface p-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card-surface p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const pitcher = isPitcher(player);

  return (
    <div className="px-4 md:px-6 py-5 max-w-screen-xl mx-auto w-full space-y-6">
      {/* Back nav */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        Back to Player Props
      </Link>

      {/* Player header */}
      <div className="card-surface p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <UserIcon className="w-7 h-7 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-foreground">{player.name}</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              #{player.number}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {player.position}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{player.teamFull} · {player.team}</p>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
            <span>Age: <strong className="text-foreground">{player.age}</strong></span>
            <span>B/T: <strong className="text-foreground">{player.bats}/{player.throws}</strong></span>
            <span>Ht: <strong className="text-foreground">{player.height}</strong></span>
            <span>Wt: <strong className="text-foreground">{player.weight}</strong></span>
          </div>
        </div>
      </div>

      {/* Season stats */}
      <div>
        <SectionTitle icon={<ChartBarIcon className="w-4 h-4" />} title="2025 Season Stats" />
        {pitcher ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="ERA" value={player.era?.toFixed(2) ?? '—'} />
            <MetricCard label="WHIP" value={player.whip?.toFixed(2) ?? '—'} />
            <MetricCard label="IP" value={player.ip?.toFixed(1) ?? '—'} />
            <MetricCard label="K" value={player.strikeouts ?? '—'} />
            <MetricCard label="BB" value={player.walks ?? '—'} />
            <MetricCard label="FIP" value={player.fip?.toFixed(2) ?? '—'} />
            <MetricCard label="xFIP" value={player.xfip?.toFixed(2) ?? '—'} />
            <MetricCard label="Spin Rate" value={player.spinRate ? `${player.spinRate}` : '—'} subvalue="rpm" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="AVG" value={player.avg.toFixed(3)} />
            <MetricCard label="OBP" value={player.obp.toFixed(3)} />
            <MetricCard label="SLG" value={player.slg.toFixed(3)} />
            <MetricCard label="OPS" value={player.ops.toFixed(3)} />
            <MetricCard label="HR" value={player.hr} />
            <MetricCard label="RBI" value={player.rbi} />
            <MetricCard label="SB" value={player.sb} />
            <MetricCard label="PA" value={player.pa} />
          </div>
        )}
      </div>

      {/* Statcast metrics */}
      <div>
        <SectionTitle icon={<BoltIcon className="w-4 h-4" />} title="Statcast Metrics" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="card-surface p-4 space-y-1">
            <SectionTitle icon={null} title="" />
            <div className="space-y-0">
              <StatRow label="Exit Velocity (avg)" value={`${player.exitVelocityAvg} mph`} />
              <StatRow label="Barrel Rate" value={`${player.barrelRate}%`} />
              <StatRow label="Hard Hit %" value={`${player.hardHitPct}%`} />
              <StatRow label="Launch Angle" value={`${player.launchAngle}°`} />
              {!pitcher && <StatRow label="Sprint Speed" value={`${player.sprintSpeed} ft/s`} />}
            </div>
          </div>
          <div className="card-surface p-4 space-y-0">
            <StatRow label="wOBA" value={player.woba.toFixed(3)} />
            <StatRow label="xwOBA" value={player.xwoba.toFixed(3)} />
            {!pitcher && (
              <>
                <StatRow label="K%" value={`${player.kPct}%`} />
                <StatRow label="BB%" value={`${player.bbPct}%`} />
              </>
            )}
            {pitcher && (
              <>
                <StatRow label="Spin Rate" value={`${player.spinRate ?? '—'} rpm`} />
              </>
            )}
          </div>
          {/* xwOBA vs wOBA delta */}
          <div className="card-surface p-4 flex flex-col justify-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">xwOBA vs wOBA</span>
            {(() => {
              const delta = player.xwoba - player.woba;
              const isPositive = delta > 0;
              return (
                <>
                  <div className={`text-2xl font-bold font-mono-data ${isPositive ? 'text-positive' : delta < 0 ? 'text-negative' : 'text-foreground'}`}>
                    {isPositive ? '+' : ''}{delta.toFixed(3)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isPositive
                      ? 'Outperforming expected — regression risk'
                      : delta < 0
                      ? 'Underperforming expected — breakout candidate'
                      : 'Performing at expected level'}
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Recent games */}
      <div>
        <SectionTitle icon={<ClockIcon className="w-4 h-4" />} title="Recent Games" />
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">Date</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">Opp</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">Result</th>
                {pitcher ? (
                  <>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">IP</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">ER</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">K</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">Dec</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">AB</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">H</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">HR</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">RBI</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">BB</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">SO</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {recentGames.map((game, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2.5 text-xs font-mono-data text-muted-foreground">{game.date}</td>
                  <td className="px-3 py-2.5 text-xs font-semibold text-foreground">{game.opponent}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{game.result}</td>
                  {pitcher ? (
                    <>
                      <td className="px-3 py-2.5 text-right text-xs font-mono-data">{game.ip?.toFixed(1) ?? '—'}</td>
                      <td className="px-3 py-2.5 text-right text-xs font-mono-data">{game.er ?? '—'}</td>
                      <td className="px-3 py-2.5 text-right text-xs font-mono-data font-semibold text-primary">{game.k ?? '—'}</td>
                      <td className="px-3 py-2.5 text-right text-xs font-semibold">
                        <span className={game.gameResult === 'W' ? 'text-positive' : 'text-negative'}>
                          {game.gameResult ?? '—'}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2.5 text-right text-xs font-mono-data">{game.ab}</td>
                      <td className="px-3 py-2.5 text-right text-xs font-mono-data font-semibold">{game.hits}</td>
                      <td className="px-3 py-2.5 text-right text-xs font-mono-data">{game.hr}</td>
                      <td className="px-3 py-2.5 text-right text-xs font-mono-data">{game.rbi}</td>
                      <td className="px-3 py-2.5 text-right text-xs font-mono-data">{game.bb}</td>
                      <td className="px-3 py-2.5 text-right text-xs font-mono-data">{game.so}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
