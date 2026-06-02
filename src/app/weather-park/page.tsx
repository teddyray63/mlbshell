'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Topbar from '@/components/Topbar';
import { Wind, Thermometer, Droplets, Eye, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { MOCK_GAMES } from '@/data/mlbGames';

const VENUES = [
  { id: 'yankee-stadium',   label: 'Yankee Stadium',  team: 'NYY' },
  { id: 'dodger-stadium',   label: 'Dodger Stadium',  team: 'LAD' },
  { id: 'fenway-park',      label: 'Fenway Park',     team: 'BOS' },
  { id: 'wrigley-field',    label: 'Wrigley Field',   team: 'CHC' },
  { id: 'truist-park',      label: 'Truist Park',     team: 'ATL' },
  { id: 'minute-maid-park', label: 'Minute Maid Park', team: 'HOU' },
  { id: 'oracle-park',      label: 'Oracle Park',     team: 'SF' },
  { id: 'petco-park',       label: 'Petco Park',      team: 'SD' },
  { id: 'coors-field',      label: 'Coors Field',     team: 'COL' },
  { id: 'camden-yards',     label: 'Camden Yards',    team: 'BAL' },
];

interface WeatherData {
  venue: string;
  city: string;
  temp: number;
  feelsLike: number;
  windSpeed: number;
  windDir: string;
  humidity: number;
  condition: string;
  precipitation: number;
  windAlert: boolean;
  windImpact: string;
  parkFactors?: {
    runFactor: number;
    hrFactor: number;
    hitFactor: number;
    soFactor: number;
    bbFactor: number;
    surface: string;
    roofType: string;
    dimensions: string;
  };
  fetchedAt: string;
}

export default function WeatherParkPage() {
  const [selectedVenue, setSelectedVenue] = useState('yankee-stadium');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState('');

  const loadWeather = useCallback(async (venue: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?venue=${venue}`);
      const json = await res.json();
      if (json.error && !json.fallback) throw new Error(json.error);
      setWeather(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load weather');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWeather(selectedVenue); }, [loadWeather, selectedVenue]);

  // When a game is selected, auto-select the home team's venue
  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
    if (!gameId) return;
    const game = MOCK_GAMES.find((g) => g.id === gameId);
    if (!game) return;
    const venue = VENUES.find((v) => v.team === game.homeTeam);
    if (venue) setSelectedVenue(venue.id);
  };

  const pf = weather?.parkFactors;

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Topbar title="Weather & Park" subtitle="Real-time weather conditions and park factor overlays" dataSource={loading ? 'mock' : 'live'} />
          <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-6">
            {/* Game filter */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Game:</span>
                <select
                  value={selectedGame}
                  onChange={(e) => handleGameSelect(e.target.value)}
                  className="px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select Game</option>
                  {MOCK_GAMES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.awayTeam} @ {g.homeTeam}{g.status === 'live' ? ' 🔴' : g.status === 'final' ? ' ✓' : ` · ${g.time}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Venue selector */}
            <div className="flex flex-wrap gap-2">
              {VENUES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => { setSelectedVenue(v.id); setSelectedGame(''); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    selectedVenue === v.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-negative/10 border border-negative/30 text-sm text-negative">
                <AlertTriangle size={16} className="shrink-0" />
                <span className="flex-1"><strong>Error:</strong> {error}</span>
                <button onClick={() => loadWeather(selectedVenue)} className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-negative/20 hover:bg-negative/30 text-xs font-semibold transition-colors">
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[0, 1].map((i) => (
                  <div key={i} className="card-surface p-4 animate-pulse space-y-3">
                    <div className="h-5 w-40 bg-muted rounded" />
                    <div className="grid grid-cols-4 gap-3">
                      {[0,1,2,3].map((j) => <div key={j} className="h-16 bg-muted rounded" />)}
                    </div>
                  </div>
                ))}
              </div>
            ) : weather ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Weather card */}
                <div className="card-surface p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{weather.venue}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {weather.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {weather.windAlert && <StatusBadge variant="warning" dot>Wind Alert</StatusBadge>}
                      <button onClick={() => loadWeather(selectedVenue)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <RefreshCw size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Thermometer size={13} /><span className="text-xs">Temp</span>
                      </div>
                      <span className="font-mono-data text-lg font-bold text-foreground">{weather.temp}°F</span>
                      <span className="text-xs text-muted-foreground">Feels {weather.feelsLike}°F</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Wind size={13} /><span className="text-xs">Wind</span>
                      </div>
                      <span className={`font-mono-data text-lg font-bold ${weather.windAlert ? 'text-warning' : 'text-foreground'}`}>{weather.windSpeed} mph</span>
                      <span className="text-xs text-muted-foreground">{weather.windDir}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Droplets size={13} /><span className="text-xs">Humidity</span>
                      </div>
                      <span className="font-mono-data text-lg font-bold text-foreground">{weather.humidity}%</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Eye size={13} /><span className="text-xs">Condition</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{weather.condition}</span>
                      {weather.precipitation > 0 && (
                        <span className="text-xs text-warning">{weather.precipitation}mm precip</span>
                      )}
                    </div>
                  </div>

                  {weather.windAlert && (
                    <div className="flex items-start gap-2 p-2.5 rounded-md bg-warning-subtle border border-warning/30">
                      <AlertTriangle size={13} className="text-warning flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-warning">
                        Wind blowing {weather.windSpeed} mph — {weather.windImpact === 'boost' ? 'elevated HR environment, adjust fly ball props up' : weather.windImpact === 'suppress' ? 'suppressed HR environment, adjust fly ball props down' : 'neutral wind impact'}.
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-3 font-mono-data">
                    Updated {new Date(weather.fetchedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · Open-Meteo
                  </p>
                </div>

                {/* Park factors card */}
                {pf ? (
                  <div className="card-surface p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Park Factors</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{weather.venue} · {pf.dimensions}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>{pf.surface}</span><span>·</span><span>{pf.roofType}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {[
                        { label: 'Run', value: pf.runFactor },
                        { label: 'HR',  value: pf.hrFactor  },
                        { label: 'Hit', value: pf.hitFactor },
                        { label: 'K',   value: pf.soFactor  },
                        { label: 'BB',  value: pf.bbFactor  },
                      ].map((f) => {
                        const isHigh = f.value >= 108;
                        const isLow  = f.value <= 95;
                        return (
                          <div key={f.label} className="flex flex-col items-center gap-1 p-2 rounded-md bg-muted/50">
                            <span className="text-xs text-muted-foreground">{f.label}</span>
                            <span className={`font-mono-data text-xl font-bold ${isHigh ? 'text-positive' : isLow ? 'text-negative' : 'text-foreground'}`}>{f.value}</span>
                            <span className={`text-xs font-semibold ${isHigh ? 'text-positive' : isLow ? 'text-negative' : 'text-muted-foreground'}`}>
                              {isHigh ? '▲ Hitter' : isLow ? '▼ Pitcher' : '— Neutral'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Park factors indexed to 100 (neutral). Values above 100 favor hitters, below 100 favor pitchers.
                        {pf.hrFactor > 110 && ` HR factor of ${pf.hrFactor} significantly elevates HR prop value.`}
                        {pf.hrFactor < 90 && ` HR factor of ${pf.hrFactor} suppresses HR prop value.`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="card-surface p-4 flex items-center justify-center text-muted-foreground text-sm">
                    Park factor data not available for this venue.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}