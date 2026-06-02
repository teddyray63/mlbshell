import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Topbar from '@/components/Topbar';

export default function SettingsPage() {
  const envVars = [
    { label: 'API Mode',          key: 'NEXT_PUBLIC_API_MODE',          value: process.env.NEXT_PUBLIC_API_MODE || 'mock'  },
    { label: 'Site URL',          key: 'NEXT_PUBLIC_SITE_URL',          value: process.env.NEXT_PUBLIC_SITE_URL || '(not set)' },
    { label: 'MLB API Key',       key: 'NEXT_PUBLIC_MLB_API_KEY',       value: process.env.NEXT_PUBLIC_MLB_API_KEY ? '••••••••' : '(not set)' },
    { label: 'Odds API Key',      key: 'NEXT_PUBLIC_ODDS_API_KEY',      value: process.env.NEXT_PUBLIC_ODDS_API_KEY ? '••••••••' : '(not set)' },
    { label: 'Weather API Key',   key: 'NEXT_PUBLIC_WEATHER_API_KEY',   value: process.env.NEXT_PUBLIC_WEATHER_API_KEY ? '••••••••' : '(not set)' },
    { label: 'Supabase URL',      key: 'NEXT_PUBLIC_SUPABASE_URL',      value: process.env.NEXT_PUBLIC_SUPABASE_URL ? '••••••••' : '(not set)' },
  ];

  const apiRoutes = [
    { path: '/api/games', description: 'Today\'s MLB schedule (MLB Stats API + fallback)', free: true },
    { path: '/api/player-props', description: 'Player prop lines (MLB Stats API + fallback)', free: true },
    { path: '/api/weather', description: 'Real-time weather (Open-Meteo — no key required)', free: true },
    { path: '/api/team-rankings', description: 'MLB standings (MLB Stats API + fallback)', free: true },
    { path: '/api/saved-edges', description: 'Saved prop edges (in-memory store)', free: true },
    { path: '/api/statcast/leaderboard', description: 'Statcast leaderboard (Baseball Savant proxy)', free: true },
  ];

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Topbar title="Settings" subtitle="API configuration and environment options" />
          <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-6">

            {/* API Mode Banner */}
            <div className="card-surface p-4 border-l-2 border-primary">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">API Mode: <span className="text-primary font-mono-data">{process.env.NEXT_PUBLIC_API_MODE || 'mock'}</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {process.env.NEXT_PUBLIC_API_MODE === 'fetch' ?'Live mode — fetching from MLB Stats API and Open-Meteo' :'Mock mode — using built-in fallback data. Set NEXT_PUBLIC_API_MODE=fetch to enable live data.'}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${process.env.NEXT_PUBLIC_API_MODE === 'fetch' ? 'bg-positive/20 text-positive' : 'bg-muted text-muted-foreground'}`}>
                  {process.env.NEXT_PUBLIC_API_MODE === 'fetch' ? '● Live' : '○ Mock'}
                </span>
              </div>
            </div>

            {/* Environment Variables */}
            <div className="card-surface p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Environment Variables</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {envVars?.map((env) => (
                  <div key={env.key} className="flex flex-col gap-1 p-3 rounded-md bg-muted/50 border border-border/50">
                    <span className="text-xs text-muted-foreground">{env.label}</span>
                    <span className="font-mono-data text-xs text-foreground">{env.key}</span>
                    <span className={`font-mono-data text-xs ${env.value === '(not set)' ? 'text-muted-foreground' : 'text-primary'}`}>{env.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Set these values in <code className="font-mono-data text-primary">.env.local</code>. See <code className="font-mono-data text-primary">.env.example</code> for the full list.
              </p>
            </div>

            {/* API Routes */}
            <div className="card-surface p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Internal API Routes</h2>
              <div className="space-y-2">
                {apiRoutes?.map((route) => (
                  <div key={route?.path} className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/30 border border-border/50">
                    <div className="flex-1 min-w-0">
                      <code className="text-xs font-mono-data text-primary">{route?.path}</code>
                      <p className="text-xs text-muted-foreground mt-0.5">{route?.description}</p>
                    </div>
                    {route?.free && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-positive/10 text-positive font-semibold flex-shrink-0">Free</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div className="card-surface p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Data Sources</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div className="p-3 rounded-md bg-muted/30 border border-border/50">
                  <p className="font-semibold text-foreground mb-1">MLB Stats API</p>
                  <p>Free public API — no key required. Provides schedules, standings, and player data.</p>
                  <code className="text-primary mt-1 block">statsapi.mlb.com/api/v1</code>
                </div>
                <div className="p-3 rounded-md bg-muted/30 border border-border/50">
                  <p className="font-semibold text-foreground mb-1">Open-Meteo</p>
                  <p>Free weather API — no key required. Provides real-time conditions for all MLB venues.</p>
                  <code className="text-primary mt-1 block">api.open-meteo.com</code>
                </div>
                <div className="p-3 rounded-md bg-muted/30 border border-border/50">
                  <p className="font-semibold text-foreground mb-1">Baseball Savant</p>
                  <p>Free Statcast data — no key required. Provides exit velocity, barrel rate, and advanced metrics.</p>
                  <code className="text-primary mt-1 block">baseballsavant.mlb.com</code>
                </div>
                <div className="p-3 rounded-md bg-muted/30 border border-border/50">
                  <p className="font-semibold text-foreground mb-1">The Odds API (Optional)</p>
                  <p>Paid API for live betting odds comparison. Set NEXT_PUBLIC_ODDS_API_KEY to enable.</p>
                  <code className="text-primary mt-1 block">the-odds-api.com</code>
                </div>
              </div>
            </div>

          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}