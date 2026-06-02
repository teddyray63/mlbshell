'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Topbar from '@/components/Topbar';
import MetricCard from '@/components/ui/MetricCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { Search, TrendingUp, AlertTriangle, RefreshCw, Filter, Bookmark, BookmarkCheck } from 'lucide-react';
import Link from 'next/link';
import PlayerSearch from '@/components/filters/PlayerSearch';
import TeamFilter from '@/components/filters/TeamFilter';
import GameFilter from '@/components/filters/GameFilter';
import { fetchTodaysGames, type MLBGame } from '@/data/mlbGames';

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

export default function PropAnalyzerPage() {
  const [props, setProps] = useState<PropLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [propType, setPropType] = useState('All');
  const [minEdge, setMinEdge] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [games, setGames] = useState<MLBGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);

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

  useEffect(() => {
    loadData();
    fetchTodaysGames()
      .then(setGames)
      .catch(() => setGames([]))
      .finally(() => setGamesLoading(false));
  }, [loadData]);

  const handleSaveEdge = useCallback(async (prop: PropLine) => {
    if (savedIds.has(prop.id) || savingId) return;
    setSavingId(prop.id);
    try {
      const res = await fetch('/api/saved-edges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: prop.player,
          prop: prop.prop,
          line: prop.line,
          direction: 'over',
          edge: prop.edge ?? 0,
          confidence: (prop.edge ?? 0) >= 6 ? 'high' : (prop.edge ?? 0) >= 3 ? 'medium' : 'low',
          notes: `${prop.team} vs ${prop.opponent} — Proj: ${prop.projection?.toFixed(1) ?? '—'}, Hit Rate: ${Math.round((prop.hitRate ?? 0) * 100)}%`,
        }),
      });
      if (res.ok) {
        setSavedIds((prev) => new Set([...prev, prop.id]));
      }
    } catch {
      // silent fail
    } finally {
      setSavingId(null);
    }
  }, [savedIds, savingId]);

  const filtered = useMemo(() => {
    return props.filter((p) => {
      const matchSearch = !search || p.player.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase());
      const matchType = propType === 'All' || p.prop === propType;
      const matchEdge = (p.edge ?? 0) >= minEdge;
      const matchTeam = !selectedTeam || p.team === selectedTeam;
      const matchGame = !selectedGame || (() => {
        const game = games.find((g) => g.id === selectedGame);
        return !game || p.team === game.homeTeam || p.team === game.awayTeam;
      })();
      return matchSearch && matchType && matchEdge && matchTeam && matchGame;
    }).sort((a, b) => (b.edge ?? 0) - (a.edge ?? 0));
  }, [props, search, propType, minEdge, selectedTeam, selectedGame, games]);

  const topEdge = filtered[0];
  const evPlusCount = filtered.filter((p) => (p.edge ?? 0) > 3).length;
  const steamCount = filtered.filter((p) => p.status === 'steam').length;
  const sharpCount = filtered.filter((p) => p.sharp).length;

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Topbar title="Prop Analyzer" subtitle="Deep prop analysis and model output" dataSource={loading ? 'mock' : 'live'} />
          <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard label="EV+ Props" value={loading ? '…' : String(evPlusCount)} trend="up" trendLabel="above 3% edge" variant="positive" icon={<TrendingUp size={14} />} />
              <MetricCard label="Steam Moves" value={loading ? '…' : String(steamCount)} trend="up" trendLabel="active steam" variant="warning" />
              <MetricCard label="Sharp Plays" value={loading ? '…' : String(sharpCount)} trend="neutral" trendLabel="sharp action" />
              <MetricCard label="Total Props" value={loading ? '…' : String(props.length)} trend="neutral" trendLabel="on today's slate" />
            </div>

            {/* Filters */}
            <div className="card-surface p-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap">
                <PlayerSearch
                  value={search}
                  onChange={setSearch}
                  placeholder="Search player or team…"
                  className="w-full sm:w-56"
                />
                <TeamFilter value={selectedTeam} onChange={setSelectedTeam} showLabel />
                <GameFilter games={games} value={selectedGame} onChange={setSelectedGame} showLabel loading={gamesLoading} />
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter size={13} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Min Edge:</span>
                  {[0, 2, 4, 6].map((v) => (
                    <button
                      key={v}
                      onClick={() => setMinEdge(v)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${minEdge === v ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
                    >
                      {v === 0 ? 'All' : `+${v}%`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PROP_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setPropType(t)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all capitalize ${propType === t ? 'bg-info-subtle text-primary border-primary/40' : 'bg-muted text-muted-foreground border-border hover:border-primary/30'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Top edge highlight */}
            {!loading && topEdge && (
              <div className="card-surface p-4 border-l-2 border-positive flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Top Edge Today</p>
                  <p className="font-semibold text-foreground">{topEdge.player} — {topEdge.prop} {topEdge.line}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{topEdge.team} vs {topEdge.opponent}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-2xl font-bold font-mono-data text-positive">+{(topEdge.edge ?? 0).toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">edge</p>
                  </div>
                  <button
                    onClick={() => handleSaveEdge(topEdge)}
                    disabled={savedIds.has(topEdge.id) || savingId === topEdge.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-positive/10 hover:bg-positive/20 text-positive text-xs font-semibold transition-colors disabled:opacity-60"
                    title="Save to Saved Edges"
                  >
                    {savedIds.has(topEdge.id) ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                    {savedIds.has(topEdge.id) ? 'Saved' : 'Save Edge'}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-negative/10 border border-negative/30 text-sm text-negative">
                <AlertTriangle size={16} className="shrink-0" />
                <span className="flex-1"><strong>Error:</strong> {error}</span>
                <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-negative/20 hover:bg-negative/30 text-xs font-semibold transition-colors">
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}

            {/* Props table */}
            <div className="card-surface overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Prop Analysis</p>
                <span className="text-xs font-mono-data text-muted-foreground">{filtered.length} props</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {['Player', 'Team', 'Opp', 'Prop', 'Line', 'Proj', 'Edge', 'Hit Rate', 'Signal', ''].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={10} />)
                      : filtered.length === 0
                      ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground text-sm">
                            No props match the current filters.
                          </td>
                        </tr>
                      )
                      : filtered.map((prop, i) => (
                        <tr key={prop.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                          <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">
                            <Link href={`/player-props/${prop.id}`} className="hover:text-primary transition-colors">
                              {prop.player}
                            </Link>
                          </td>
                          <td className="px-3 py-2.5 font-mono-data text-xs text-muted-foreground">{prop.team}</td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground">{prop.opponent}</td>
                          <td className="px-3 py-2.5 text-xs text-foreground">{prop.prop}</td>
                          <td className="px-3 py-2.5 font-mono-data text-xs font-semibold">{prop.line}</td>
                          <td className="px-3 py-2.5 font-mono-data text-xs text-primary font-semibold">{prop.projection?.toFixed(1) ?? '—'}</td>
                          <td className="px-3 py-2.5">
                            <span className={`font-mono-data text-xs font-bold ${(prop.edge ?? 0) >= 3 ? 'text-positive' : (prop.edge ?? 0) <= -2 ? 'text-negative' : 'text-muted-foreground'}`}>
                              {(prop.edge ?? 0) >= 0 ? '+' : ''}{(prop.edge ?? 0).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${(prop.hitRate ?? 0) >= 0.6 ? 'bg-positive' : (prop.hitRate ?? 0) >= 0.5 ? 'bg-warning' : 'bg-negative'}`} style={{ width: `${Math.round((prop.hitRate ?? 0) * 100)}%` }} />
                              </div>
                              <span className="text-xs font-mono-data text-muted-foreground">{Math.round((prop.hitRate ?? 0) * 100)}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <StatusBadge variant={prop.status === 'steam' ? 'warning' : prop.status === 'value' ? 'positive' : prop.status === 'fade' ? 'negative' : 'neutral'}>
                              {prop.status}
                            </StatusBadge>
                          </td>
                          <td className="px-3 py-2.5">
                            <button
                              onClick={() => handleSaveEdge(prop)}
                              disabled={savedIds.has(prop.id) || savingId === prop.id}
                              className="text-muted-foreground hover:text-positive transition-colors disabled:opacity-40"
                              title="Save edge"
                            >
                              {savedIds.has(prop.id) ? <BookmarkCheck size={13} className="text-positive" /> : <Bookmark size={13} />}
                            </button>
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