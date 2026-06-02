'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Topbar from '@/components/Topbar';
import { AlertTriangle, RefreshCw, Download } from 'lucide-react';

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

const confidenceColors: Record<string, string> = {
  high: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function SavedEdgesPage() {
  const [edges, setEdges] = useState<SavedEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/saved-edges?confidence=${filter}`);
      const json = await res.json();
      setEdges(json.edges ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load edges');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleExportCSV = () => {
    const headers = ['Player', 'Prop', 'Line', 'Direction', 'Edge%', 'Confidence', 'Saved At', 'Notes'];
    const rows = edges.map((e) => [
      e.player, e.prop, e.line, e.direction, `+${e.edge}%`, e.confidence,
      new Date(e.savedAt).toLocaleString(), e.notes ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saved-edges-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/saved-edges?id=${id}`, { method: 'DELETE' });
      setEdges((prev) => prev.filter((e) => e.id !== id));
    } catch {
      // silent fail
    }
  };

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Topbar title="Saved Edges" subtitle="Your bookmarked prop edges & betting opportunities" dataSource="live" />
          <div className="flex-1 p-6 space-y-6 max-w-screen-2xl mx-auto w-full">
            <div className="flex items-center justify-between flex-wrap gap-3">
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
              <button
                onClick={handleExportCSV}
                disabled={edges.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download size={12} />
                Export CSV
              </button>
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

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card-surface rounded-lg border border-border p-4 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-40 bg-muted rounded" />
                        <div className="h-3 w-24 bg-muted rounded" />
                      </div>
                      <div className="h-8 w-16 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {edges.map((edge) => (
                  <div key={edge.id} className="card-surface rounded-lg border border-border p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{edge.player}</span>
                        <span className="text-xs text-muted-foreground">—</span>
                        <span className="text-xs text-muted-foreground">
                          {edge.prop} {edge.direction === 'over' ? '▲' : '▼'} {edge.line}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${confidenceColors[edge.confidence]}`}>
                          {edge.confidence}
                        </span>
                      </div>
                      {edge.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{edge.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(edge.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold text-positive">+{edge.edge}%</p>
                        <p className="text-xs text-muted-foreground">edge</p>
                      </div>
                      <button
                        onClick={() => handleDelete(edge.id)}
                        className="text-xs text-muted-foreground hover:text-negative transition-colors px-2 py-1 rounded hover:bg-negative/10"
                        aria-label="Remove edge"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {edges.length === 0 && !loading && (
                  <div className="card-surface rounded-lg border border-border p-8 text-center">
                    <p className="text-muted-foreground text-sm">No saved edges for this filter.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}
