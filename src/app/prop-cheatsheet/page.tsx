'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Topbar from '@/components/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { AlertTriangle, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface PropLine {
  id: string;
  player: string;
  team: string;
  opponent: string;
  prop: string;
  line: number;
  overOdds: number;
  underOdds: number;
  projection?: number;
  edge?: number;
  hitRate?: number;
  status: string;
  sharp: boolean;
  consensus: number;
}

const PROP_TYPES = ['All', 'Strikeouts', 'Hits', 'Home Runs', 'Total Bases', 'RBIs'];

export default function PropCheatsheetPage() {
  const [props, setProps] = useState<PropLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propType, setPropType] = useState('All');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const date = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/player-props?date=${date}`);
      const json = await res.json();
      setProps(json.props ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load props');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    const base = propType === 'All' ? props : props.filter((p) => p.prop === propType);
    return [...base].sort((a, b) => (b.edge ?? 0) - (a.edge ?? 0));
  }, [props, propType]);

  const plays = filtered.filter((p) => (p.edge ?? 0) > 3);
  const fades = filtered.filter((p) => (p.edge ?? 0) < -2);
  const neutral = filtered.filter((p) => (p.edge ?? 0) >= -2 && (p.edge ?? 0) <= 3);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Topbar title="Prop Cheatsheet" subtitle={`Quick-reference prop summary — ${today}`} dataSource={loading ? 'mock' : 'live'} />
          <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-6">
            {/* Prop type filter */}
            <div className="flex flex-wrap gap-2">
              {PROP_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setPropType(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${propType === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-negative/10 border border-negative/30 text-sm text-negative">
                <AlertTriangle size={16} className="shrink-0" />
                <span className="flex-1"><strong>Error:</strong> {error}</span>
                <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-negative/20 hover:bg-negative/30 text-xs font-semibold transition-colors">
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}

            {/* Three-column cheatsheet */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Plays (EV+) */}
              <div className="card-surface overflow-hidden">
                <div className="p-3 border-b border-border flex items-center gap-2 bg-positive/5">
                  <TrendingUp size={14} className="text-positive" />
                  <span className="text-sm font-semibold text-positive">Plays ({plays.length})</span>
                  <span className="text-xs text-muted-foreground ml-auto">EV &gt; +3%</span>
                </div>
                <div className="divide-y divide-border">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={3} />)
                  ) : plays.length === 0 ? (
                    <p className="px-3 py-4 text-xs text-muted-foreground text-center">No EV+ plays for this filter.</p>
                  ) : plays.map((p) => (
                    <div key={p.id} className="px-3 py-2.5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{p.player}</p>
                        <p className="text-xs text-muted-foreground">{p.prop} {p.line} · {p.team}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {p.sharp && <StatusBadge variant="sharp" dot>S</StatusBadge>}
                        <span className="font-mono-data text-xs font-bold text-positive">+{(p.edge ?? 0).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Neutral */}
              <div className="card-surface overflow-hidden">
                <div className="p-3 border-b border-border flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                  <span className="text-sm font-semibold text-foreground">Neutral ({neutral.length})</span>
                  <span className="text-xs text-muted-foreground ml-auto">-2% to +3%</span>
                </div>
                <div className="divide-y divide-border">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={3} />)
                  ) : neutral.length === 0 ? (
                    <p className="px-3 py-4 text-xs text-muted-foreground text-center">No neutral props.</p>
                  ) : neutral.map((p) => (
                    <div key={p.id} className="px-3 py-2.5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{p.player}</p>
                        <p className="text-xs text-muted-foreground">{p.prop} {p.line} · {p.team}</p>
                      </div>
                      <span className="font-mono-data text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {(p.edge ?? 0) >= 0 ? '+' : ''}{(p.edge ?? 0).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fades */}
              <div className="card-surface overflow-hidden">
                <div className="p-3 border-b border-border flex items-center gap-2 bg-negative/5">
                  <TrendingDown size={14} className="text-negative" />
                  <span className="text-sm font-semibold text-negative">Fades ({fades.length})</span>
                  <span className="text-xs text-muted-foreground ml-auto">EV &lt; -2%</span>
                </div>
                <div className="divide-y divide-border">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={3} />)
                  ) : fades.length === 0 ? (
                    <p className="px-3 py-4 text-xs text-muted-foreground text-center">No fade props.</p>
                  ) : fades.map((p) => (
                    <div key={p.id} className="px-3 py-2.5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{p.player}</p>
                        <p className="text-xs text-muted-foreground">{p.prop} {p.line} · {p.team}</p>
                      </div>
                      <span className="font-mono-data text-xs font-bold text-negative flex-shrink-0 ml-2">
                        {(p.edge ?? 0).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Full table */}
            <div className="card-surface overflow-hidden">
              <div className="p-4 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Full Slate — {filtered.length} Props</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {['Player', 'Team', 'Prop', 'Line', 'Over', 'Under', 'Proj', 'Edge', 'Signal'].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={9} />)
                      : filtered.map((p, i) => (
                        <tr key={p.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                          <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{p.player}</td>
                          <td className="px-3 py-2.5 font-mono-data text-xs text-muted-foreground">{p.team}</td>
                          <td className="px-3 py-2.5 text-xs text-foreground">{p.prop}</td>
                          <td className="px-3 py-2.5 font-mono-data text-xs font-semibold">{p.line}</td>
                          <td className="px-3 py-2.5 font-mono-data text-xs text-muted-foreground">{p.overOdds > 0 ? `+${p.overOdds}` : p.overOdds}</td>
                          <td className="px-3 py-2.5 font-mono-data text-xs text-muted-foreground">{p.underOdds > 0 ? `+${p.underOdds}` : p.underOdds}</td>
                          <td className="px-3 py-2.5 font-mono-data text-xs text-primary font-semibold">{p.projection?.toFixed(1) ?? '—'}</td>
                          <td className="px-3 py-2.5">
                            <span className={`font-mono-data text-xs font-bold ${(p.edge ?? 0) >= 3 ? 'text-positive' : (p.edge ?? 0) <= -2 ? 'text-negative' : 'text-muted-foreground'}`}>
                              {(p.edge ?? 0) >= 0 ? '+' : ''}{(p.edge ?? 0).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <StatusBadge variant={p.status === 'steam' ? 'warning' : p.status === 'value' ? 'positive' : p.status === 'fade' ? 'negative' : 'neutral'}>
                              {p.status}
                            </StatusBadge>
                          </td>
                        </tr>
                      ))
                    }
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