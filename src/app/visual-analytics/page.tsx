'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Topbar from '@/components/Topbar';
import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import {
  fetchStatcastLeaderboard,
  buildWobaTrendFromLeaderboard,
  buildBattedBallProfile,
  type StatcastPlayer,
  type WobaTrendPoint,
  type BattedBallPoint,
} from '@/services/statcastService';

const WobaAreaChart = dynamic(() => import('@/charts/WobaAreaChart'), { ssr: false, loading: () => <ChartSkeleton height={200} /> });
const BarrelRateBarChart = dynamic(() => import('@/charts/BarrelRateBarChart'), { ssr: false, loading: () => <ChartSkeleton height={200} /> });
const PitcherRadarChart = dynamic(() => import('@/charts/PitcherRadarChart'), { ssr: false, loading: () => <ChartSkeleton height={220} /> });

const YEARS = ['2026', '2025', '2024', '2023'];

export default function VisualAnalyticsPage() {
  const [players, setPlayers] = useState<StatcastPlayer[]>([]);
  const [wobaTrend, setWobaTrend] = useState<WobaTrendPoint[]>([]);
  const [battedBall, setBattedBall] = useState<BattedBallPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const loadData = useCallback(async (y: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchStatcastLeaderboard({ year: y, min: '50', type: 'batter' });
      setPlayers(result.players);
      setWobaTrend(buildWobaTrendFromLeaderboard(result.players));
      setBattedBall(buildBattedBallProfile(result.players));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(year); }, [loadData, year]);

  // Top 10 by barrel rate for radar
  const topBarrel = players.slice(0, 10);
  const avgBarrel = topBarrel.length > 0
    ? topBarrel.reduce((s, p) => s + (p.barrelRate ?? 0), 0) / topBarrel.length
    : 8;
  const avgEV = topBarrel.length > 0
    ? topBarrel.reduce((s, p) => s + (p.exitVelocityAvg ?? 0), 0) / topBarrel.length
    : 90;
  const avgHH = topBarrel.length > 0
    ? topBarrel.reduce((s, p) => s + (p.hardHitPct ?? 0), 0) / topBarrel.length
    : 38;
  const avgK = topBarrel.length > 0
    ? topBarrel.reduce((s, p) => s + (p.kPct ?? 0), 0) / topBarrel.length
    : 22;
  const avgBB = topBarrel.length > 0
    ? topBarrel.reduce((s, p) => s + (p.bbPct ?? 0), 0) / topBarrel.length
    : 8;
  const avgWoba = topBarrel.length > 0
    ? topBarrel.reduce((s, p) => s + (p.woba ?? 0), 0) / topBarrel.length
    : 0.340;

  const radarData = [
    { stat: 'Barrel%', value: Math.round(Math.min(avgBarrel * 5, 100)) },
    { stat: 'EV',      value: Math.round(Math.min((avgEV - 80) * 5, 100)) },
    { stat: 'HH%',     value: Math.round(Math.min(avgHH * 2, 100)) },
    { stat: 'K%',      value: Math.round(Math.max(100 - avgK * 2.5, 0)) },
    { stat: 'BB%',     value: Math.round(Math.min(avgBB * 5, 100)) },
    { stat: 'wOBA',    value: Math.round(Math.min((avgWoba - 0.250) * 500, 100)) },
  ];

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Topbar title="Visual Analytics" subtitle="Charts, spray charts, and visual breakdowns" dataSource={loading ? 'mock' : 'live'} />
          <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-6">
            {/* Year filter */}
            <div className="flex gap-2">
              {YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${year === y ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  {y}
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-negative/10 border border-negative/30 text-sm text-negative">
                <AlertTriangle size={16} className="shrink-0" />
                <span className="flex-1"><strong>Statcast data unavailable:</strong> {error}</span>
                <button onClick={() => loadData(year)} className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-negative/20 hover:bg-negative/30 text-xs font-semibold transition-colors">
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}

            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* wOBA Trend */}
              <div className="card-surface p-4">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-foreground">wOBA Trend — {year}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">League-average wOBA across the season</p>
                </div>
                {loading ? <ChartSkeleton height={200} /> : <WobaAreaChart data={wobaTrend} height={200} />}
              </div>

              {/* Batted Ball Profile */}
              <div className="card-surface p-4">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-foreground">Batted Ball Profile — {year}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Distribution of contact types (min 50 PA)</p>
                </div>
                {loading ? <ChartSkeleton height={200} /> : <BarrelRateBarChart data={battedBall} height={200} />}
              </div>

              {/* Statcast Radar */}
              <div className="card-surface p-4">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-foreground">Statcast Profile — Top Barrel% Hitters</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Percentile scores for top barrel rate hitters</p>
                </div>
                {loading ? <ChartSkeleton height={220} /> : <PitcherRadarChart data={radarData} height={220} />}
              </div>

              {/* Leaderboard summary */}
              <div className="card-surface p-4">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-foreground">Exit Velocity Leaders — {year}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Top 10 by average exit velocity</p>
                </div>
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between animate-pulse">
                        <div className="h-3 w-32 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {[...players]
                      .filter((p) => p.exitVelocityAvg !== null)
                      .sort((a, b) => (b.exitVelocityAvg ?? 0) - (a.exitVelocityAvg ?? 0))
                      .slice(0, 10)
                      .map((p, i) => (
                        <div key={p.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono-data text-muted-foreground w-4">{i + 1}</span>
                            <span className="font-medium text-foreground">{p.name}</span>
                            <span className="text-muted-foreground">{p.team}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${Math.min(((p.exitVelocityAvg ?? 0) - 85) / 15 * 100, 100)}%` }}
                              />
                            </div>
                            <span className="font-mono-data font-semibold text-foreground w-14 text-right">
                              {p.exitVelocityAvg?.toFixed(1)} mph
                            </span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}