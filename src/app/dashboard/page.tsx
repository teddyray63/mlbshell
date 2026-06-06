'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Topbar from '@/components/Topbar';
import MetricCard from '@/components/ui/MetricCard';
import { AlertTriangle, RefreshCw, Activity, TrendingUp, Cloud, Bookmark } from 'lucide-react';
import Link from 'next/link';
import PlayerSearch from '@/components/filters/PlayerSearch';
import GameFilter from '@/components/filters/GameFilter';
import TeamFilter from '@/components/filters/TeamFilter';
import { fetchTodaysGames, type MLBGame } from '@/data/mlbGames';
import type { MLBPlayer } from '@/data/mlbPlayers';

interface DashboardState {
  games: MLBGame[];
  loading: boolean;
  error: string | null;
  fetchedAt: string | null;
}

const TOP_EDGES = [
  { player: 'Aaron Judge', playerId: 'p-aaron-judge', prop: 'HR o0.5', edge: '+8.2%', confidence: 'high' },
  { player: 'Freddie Freeman', playerId: 'p-freddie-freeman', prop: 'Hits o1.5', edge: '+6.4%', confidence: 'high' },
  { player: 'Yordan Alvarez', playerId: 'p-yordan-alvarez', prop: 'TB o1.5', edge: '+7.1%', confidence: 'high' },
];

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>({
    games: [],
    loading: true,
    error: null,
    fetchedAt: null,
  });
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<MLBPlayer | null>(null);

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const games = await fetchTodaysGames();
      setState({
        games,
        loading: false,
        error: null,
        fetchedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load games',
      }));
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Apply filters
  const filteredGames = state.games.filter((g) => {
    if (selectedGame && g.id !== selectedGame) return false;
    if (selectedTeam && g.homeTeam !== selectedTeam && g.awayTeam !== selectedTeam) return false;
    return true;
  });

  const filteredEdges = TOP_EDGES.filter((e) => {
    if (playerSearch && !e.player.toLowerCase().includes(playerSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Topbar
            title="Dashboard"
            subtitle={`MLB Analytics Overview — ${today}`}
            dataSource={state.loading ? 'mock' : 'live'}
          />
          <div className="flex-1 p-6 space-y-6 max-w-screen-2xl mx-auto w-full">
            {/* Filters row */}
            <div className="flex flex-wrap gap-3 items-center">
              <PlayerSearch
                value={playerSearch}
                onChange={setPlayerSearch}
                onPlayerSelect={setSelectedPlayer}
                placeholder="Search player…"
                className="w-48"
              />
              <GameFilter
                games={state.games}
                value={selectedGame}
                onChange={setSelectedGame}
                loading={state.loading}
                showLabel
              />
              <TeamFilter
                value={selectedTeam}
                onChange={setSelectedTeam}
                showLabel
              />
              {(selectedGame || selectedTeam || playerSearch) && (
                <button
                  onClick={() => { setSelectedGame(''); setSelectedTeam(''); setPlayerSearch(''); setSelectedPlayer(null); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:bg-muted/50"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Today's Games"
                value={state.loading ? '…' : String(filteredGames.length)}
                trend="neutral"
                trendLabel="on today's slate"
                icon={<Activity size={14} />}
              />
              <MetricCard
                label="Live Games"
                value={state.loading ? '…' : String(filteredGames.filter((g) => g.status === 'live').length)}
                trend="up"
                trendLabel="in progress"
                variant="positive"
                icon={<TrendingUp size={14} />}
              />
              <MetricCard
                label="EV+ Props"
                value="14"
                trend="up"
                trendLabel="4 more than yesterday"
                variant="positive"
                icon={<Bookmark size={14} />}
              />
              <MetricCard
                label="Weather Alerts"
                value="2"
                trend="neutral"
                trendLabel="wind advisories"
                variant="warning"
                icon={<Cloud size={14} />}
              />
            </div>

            {/* Error banner */}
            {state.error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-negative/10 border border-negative/30 text-sm text-negative">
                <AlertTriangle size={16} className="shrink-0" />
                <span className="flex-1"><strong>Data unavailable:</strong> {state.error}</span>
                <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-negative/20 hover:bg-negative/30 text-xs font-semibold transition-colors">
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}

            {/* Today's Games */}
            <div className="card-surface rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Today&apos;s Games
                  {(selectedGame || selectedTeam) && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      ({filteredGames.length} of {state.games.length})
                    </span>
                  )}
                </h2>
                {state.fetchedAt && (
                  <span className="text-xs text-muted-foreground font-mono-data">
                    Updated {new Date(state.fetchedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                )}
              </div>
              {state.loading ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="h-3 w-16 bg-muted rounded" />
                        <div className="h-4 w-32 bg-muted rounded" />
                      </div>
                      <div className="h-3 w-20 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : filteredGames.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  {selectedGame || selectedTeam ? 'No games match the current filters.' : 'No games scheduled for today.'}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredGames.map((game) => (
                    <Link
                      key={game.id}
                      href={`/matchup-engine?game=${game.id}`}
                      className="px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer block"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground font-mono w-20">{game.time}</span>
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            {game.awayTeam} @ {game.homeTeam}
                            {game.status === 'live' && game.awayScore !== undefined && (
                              <span className="ml-2 text-xs font-mono-data text-muted-foreground">
                                {game.awayScore}–{game.homeScore} {game.inning}
                              </span>
                            )}
                            {game.status === 'final' && game.awayScore !== undefined && (
                              <span className="ml-2 text-xs font-mono-data text-muted-foreground">
                                Final: {game.awayScore}–{game.homeScore}
                              </span>
                            )}
                          </span>
                          {(game.homePitcher || game.awayPitcher) && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {game.awayPitcher} vs {game.homePitcher}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground hidden sm:block">{game.venue}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          game.status === 'live' ? 'bg-positive/20 text-positive' :
                          game.status === 'final' ? 'bg-muted text-muted-foreground' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {game.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links + Top Edges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card-surface rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Quick Access</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Player Props', href: '/player-props' },
                    { label: 'Betting Intelligence', href: '/betting-intelligence' },
                    { label: 'Matchup Engine', href: '/matchup-engine' },
                    { label: 'Saved Edges', href: '/saved-edges' },
                    { label: 'Team Rankings', href: '/team-rankings' },
                    { label: 'Weather & Park', href: '/weather-park' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-3 py-2 rounded-md bg-muted/50 hover:bg-muted text-xs font-medium text-foreground hover:text-primary transition-colors text-center"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="card-surface rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Top Edges Today</h3>
                <div className="space-y-2">
                  {filteredEdges.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No edges match the current player filter.</p>
                  ) : filteredEdges.map((edge, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div>
                        <Link
                          href={`/player-props/${edge.playerId}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {edge.player}
                        </Link>
                        <span className="text-muted-foreground ml-2">{edge.prop}</span>
                      </div>
                      <span className="font-mono-data font-bold text-positive">{edge.edge}</span>
                    </div>
                  ))}
                </div>
                <Link href="/saved-edges" className="mt-3 block text-xs text-primary hover:underline">
                  View all saved edges →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}
