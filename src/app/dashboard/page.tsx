'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { mockGames, mockAnalyticsCards } from '@/data/mockData';

// TODO: migrate Dashboard logic from existing Vite app
// TODO: replace mock data with real API calls via apiClient

export default function DashboardPage() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="border-b border-border pb-4">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              MLB Analytics Overview — Today&apos;s Games &amp; Key Metrics
            </p>
          </div>

          {/* TODO: migrate KPI cards from existing Vite Dashboard component */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockAnalyticsCards?.map((card) => (
              <div key={card?.id} className="card-surface rounded-lg p-4 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{card?.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{card?.value}</p>
                <p className={`text-xs mt-1 ${card?.trend === 'up' ? 'text-green-400' : card?.trend === 'down' ? 'text-red-400' : 'text-muted-foreground'}`}>
                  {card?.change}
                </p>
              </div>
            ))}
          </div>

          {/* TODO: migrate Today's Games table from existing Vite app */}
          <div className="card-surface rounded-lg border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Today&apos;s Games</h2>
            </div>
            <div className="divide-y divide-border">
              {mockGames?.map((game) => (
                <div key={game?.id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground font-mono">{game?.time}</span>
                    <span className="text-sm font-medium text-foreground">
                      {game?.awayTeam} @ {game?.homeTeam}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{game?.venue}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      game?.status === 'live' ? 'bg-green-500/20 text-green-400' :
                      game?.status === 'final' ? 'bg-muted text-muted-foreground' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {game?.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TODO: migrate quick-access widgets from existing Vite Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-surface rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Top Edges Today</h3>
              <p className="text-xs text-muted-foreground">
                {/* TODO: migrate SavedEdges summary widget */}
                Paste your SavedEdges summary component here.
              </p>
            </div>
            <div className="card-surface rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Weather Alerts</h3>
              <p className="text-xs text-muted-foreground">
                {/* TODO: migrate WeatherPark alert strip */}
                Paste your WeatherPark alert strip component here.
              </p>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}
