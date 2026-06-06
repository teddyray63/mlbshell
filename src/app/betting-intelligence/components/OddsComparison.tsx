'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { AlertTriangle, RefreshCw, TrendingUp } from 'lucide-react';

interface OddsLine {
  id: string;
  player: string;
  team: string;
  opponent: string;
  prop: string;
  line: number;
  // Simulated book odds (in production, use The Odds API)
  draftkings: { over: number; under: number } | null;
  fanduel: { over: number; under: number } | null;
  betmgm: { over: number; under: number } | null;
  bestOver: { book: string; odds: number } | null;
  bestUnder: { book: string; odds: number } | null;
  edge: number;
}

function americanToDecimal(odds: number): number {
  if (odds > 0) return odds / 100 + 1;
  return 100 / Math.abs(odds) + 1;
}

function formatOdds(odds: number | null | undefined): string {
  if (odds == null) return '—';
  return odds > 0 ? `+${odds}` : String(odds);
}

function isBestOdds(odds: number | null | undefined, best: number | null | undefined): boolean {
  if (odds == null || best == null) return false;
  return odds === best;
}

export default function OddsComparison() {
  const [lines, setLines] = useState<OddsLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const date = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/player-props?date=${date}`);
      const json = await res.json();
      const props = json.props ?? [];

      // Simulate multi-book odds by applying small variance to base odds
      // In production, replace with The Odds API: https://the-odds-api.com
      const oddsLines: OddsLine[] = props.map((p: {
        id: string; player: string; team: string; opponent: string;
        prop: string; line: number; overOdds: number; underOdds: number; edge?: number;
      }) => {
        const baseOver = p.overOdds ?? -110;
        const baseUnder = p.underOdds ?? -110;

        // Simulate slight variance across books
        const dk = { over: baseOver, under: baseUnder };
        const fd = { over: baseOver + (Math.random() > 0.5 ? 5 : -5), under: baseUnder + (Math.random() > 0.5 ? 5 : -5) };
        const mgm = { over: baseOver + (Math.random() > 0.5 ? 10 : -10), under: baseUnder + (Math.random() > 0.5 ? 10 : -10) };

        const overOdds = [
          { book: 'DraftKings', odds: dk.over },
          { book: 'FanDuel', odds: fd.over },
          { book: 'BetMGM', odds: mgm.over },
        ];
        const underOdds = [
          { book: 'DraftKings', odds: dk.under },
          { book: 'FanDuel', odds: fd.under },
          { book: 'BetMGM', odds: mgm.under },
        ];

        const bestOver = overOdds.reduce((best, curr) =>
          americanToDecimal(curr.odds) > americanToDecimal(best.odds) ? curr : best
        );
        const bestUnder = underOdds.reduce((best, curr) =>
          americanToDecimal(curr.odds) > americanToDecimal(best.odds) ? curr : best
        );

        return {
          id: p.id,
          player: p.player,
          team: p.team,
          opponent: p.opponent,
          prop: p.prop,
          line: p.line,
          draftkings: dk,
          fanduel: fd,
          betmgm: mgm,
          bestOver,
          bestUnder,
          edge: p.edge ?? 0,
        };
      });

      setLines(oddsLines);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load odds');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="card-surface overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <SectionHeader
          title="Odds Comparison"
          subtitle="Best available odds across major sportsbooks"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground italic">Simulated — connect The Odds API for live data</span>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-negative/10 border-b border-negative/30 text-xs text-negative flex items-center gap-2">
          <AlertTriangle size={12} />
          <span>{error}</span>
          <button onClick={loadData} className="underline">Retry</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-left">Player</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-left">Prop / Line</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center" colSpan={2}>DraftKings</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center" colSpan={2}>FanDuel</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center" colSpan={2}>BetMGM</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Best</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Edge</th>
            </tr>
            <tr className="border-b border-border/50 bg-muted/10">
              <th className="px-3 py-1" />
              <th className="px-3 py-1" />
              <th className="px-3 py-1 text-xs text-muted-foreground/60 text-center font-normal">Over</th>
              <th className="px-3 py-1 text-xs text-muted-foreground/60 text-center font-normal">Under</th>
              <th className="px-3 py-1 text-xs text-muted-foreground/60 text-center font-normal">Over</th>
              <th className="px-3 py-1 text-xs text-muted-foreground/60 text-center font-normal">Under</th>
              <th className="px-3 py-1 text-xs text-muted-foreground/60 text-center font-normal">Over</th>
              <th className="px-3 py-1 text-xs text-muted-foreground/60 text-center font-normal">Under</th>
              <th className="px-3 py-1 text-xs text-muted-foreground/60 text-center font-normal">Over / Under</th>
              <th className="px-3 py-1" />
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={10} />)
              : lines.map((line, i) => (
                <tr key={line.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{line.player}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {line.prop} <span className="font-mono-data font-semibold text-foreground">{line.line}</span>
                  </td>
                  {/* DraftKings */}
                  <td className={`px-3 py-2.5 text-center font-mono-data text-xs ${isBestOdds(line.draftkings?.over, line.bestOver?.odds) ? 'text-positive font-bold' : 'text-muted-foreground'}`}>
                    {formatOdds(line.draftkings?.over)}
                  </td>
                  <td className={`px-3 py-2.5 text-center font-mono-data text-xs ${isBestOdds(line.draftkings?.under, line.bestUnder?.odds) ? 'text-positive font-bold' : 'text-muted-foreground'}`}>
                    {formatOdds(line.draftkings?.under)}
                  </td>
                  {/* FanDuel */}
                  <td className={`px-3 py-2.5 text-center font-mono-data text-xs ${isBestOdds(line.fanduel?.over, line.bestOver?.odds) ? 'text-positive font-bold' : 'text-muted-foreground'}`}>
                    {formatOdds(line.fanduel?.over)}
                  </td>
                  <td className={`px-3 py-2.5 text-center font-mono-data text-xs ${isBestOdds(line.fanduel?.under, line.bestUnder?.odds) ? 'text-positive font-bold' : 'text-muted-foreground'}`}>
                    {formatOdds(line.fanduel?.under)}
                  </td>
                  {/* BetMGM */}
                  <td className={`px-3 py-2.5 text-center font-mono-data text-xs ${isBestOdds(line.betmgm?.over, line.bestOver?.odds) ? 'text-positive font-bold' : 'text-muted-foreground'}`}>
                    {formatOdds(line.betmgm?.over)}
                  </td>
                  <td className={`px-3 py-2.5 text-center font-mono-data text-xs ${isBestOdds(line.betmgm?.under, line.bestUnder?.odds) ? 'text-positive font-bold' : 'text-muted-foreground'}`}>
                    {formatOdds(line.betmgm?.under)}
                  </td>
                  {/* Best odds */}
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex flex-col gap-0.5 items-center">
                      {line.bestOver && (
                        <StatusBadge variant="positive">
                          {formatOdds(line.bestOver.odds)} {line.bestOver.book.replace('DraftKings', 'DK').replace('FanDuel', 'FD').replace('BetMGM', 'MGM')}
                        </StatusBadge>
                      )}
                    </div>
                  </td>
                  {/* Edge */}
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-mono-data text-xs font-bold ${line.edge >= 3 ? 'text-positive' : line.edge <= -2 ? 'text-negative' : 'text-muted-foreground'}`}>
                      {line.edge >= 0 ? '+' : ''}{line.edge.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))
            }
            {!loading && lines.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  <TrendingUp size={24} className="mx-auto mb-2 opacity-40" />
                  No odds data available for today&apos;s slate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
