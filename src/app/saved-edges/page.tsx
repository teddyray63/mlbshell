'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';

// TODO: migrate SavedEdges logic from existing Vite app
// TODO: connect to persistent storage via apiClient.get('/api/saved-edges')
// TODO: migrate edge scoring/grading logic from existing Vite services

interface SavedEdge {
  id: string;
  player: string;
  prop: string;
  line: number;
  direction: 'over' | 'under';
  edge: number;
  confidence: 'high' | 'medium' | 'low';
  savedAt: string;
  notes?: string;
}

const mockEdges: SavedEdge[] = [
  {
    id: 'edge-1',
    player: 'Placeholder Player A',
    prop: 'Hits',
    line: 1.5,
    direction: 'over',
    edge: 8.2,
    confidence: 'high',
    savedAt: 'Today 9:15 AM',
    notes: 'TODO: replace with real edge data',
  },
  {
    id: 'edge-2',
    player: 'Placeholder Player B',
    prop: 'Strikeouts',
    line: 6.5,
    direction: 'over',
    edge: 5.7,
    confidence: 'medium',
    savedAt: 'Today 8:42 AM',
  },
  {
    id: 'edge-3',
    player: 'Placeholder Player C',
    prop: 'Total Bases',
    line: 2.5,
    direction: 'under',
    edge: 4.1,
    confidence: 'low',
    savedAt: 'Yesterday 6:30 PM',
  },
];

const confidenceColors: Record<string, string> = {
  high: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function SavedEdgesPage() {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filtered = filter === 'all' ? mockEdges : mockEdges.filter((e) => e.confidence === filter);

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="p-6 space-y-6">
          <div className="border-b border-border pb-4 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Saved Edges</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Your bookmarked prop edges &amp; betting opportunities
              </p>
            </div>
            {/* TODO: migrate export/share functionality from existing Vite app */}
            <button className="px-3 py-1.5 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              Export CSV
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {(['all', 'high', 'medium', 'low'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize ${
                  filter === f
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {f === 'all' ? 'All Edges' : `${f} Confidence`}
              </button>
            ))}
          </div>

          {/* TODO: migrate SavedEdges card list from existing Vite app */}
          <div className="space-y-3">
            {filtered.map((edge) => (
              <div key={edge.id} className="card-surface rounded-lg border border-border p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{edge.player}</span>
                    <span className="text-xs text-muted-foreground">—</span>
                    <span className="text-xs text-muted-foreground">{edge.prop} {edge.direction === 'over' ? '▲' : '▼'} {edge.line}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${confidenceColors[edge.confidence]}`}>
                      {edge.confidence}
                    </span>
                  </div>
                  {edge.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{edge.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{edge.savedAt}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-green-400">+{edge.edge}%</p>
                  <p className="text-xs text-muted-foreground">edge</p>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="card-surface rounded-lg border border-border p-8 text-center">
              <p className="text-muted-foreground text-sm">No saved edges for this filter.</p>
            </div>
          )}
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}
