'use client';

import React, { useMemo, useState } from 'react';
import { Bookmark, Download, Trash2 } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import { useStore } from '@/state/store';
import { formatEV } from '@/utils/formatters';
import type { SavedEdge } from '../../../../shared/types';

type ConfFilter = 'all' | 'high' | 'medium' | 'low';

const CONF_BADGE: Record<SavedEdge['confidence'], 'positive' | 'warning' | 'negative'> = {
  high: 'positive',
  medium: 'warning',
  low: 'negative',
};

function toCsv(edges: SavedEdge[]): string {
  const header = ['player', 'prop', 'direction', 'line', 'edge', 'confidence', 'savedAt', 'notes'];
  const rows = edges.map((e) =>
    [e.player, e.prop, e.direction, e.line, e.edge, e.confidence, e.savedAt, e.notes ?? '']
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

export default function SavedEdgesPage() {
  const currentUser = useStore((s) => s.currentUser);
  const { data, loading, error, reload } = useApi<SavedEdge[]>(
    () => apiClient.getSavedEdges(),
    [currentUser?.id]
  );
  const [filter, setFilter] = useState<ConfFilter>('all');

  const edges = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(
    () => (filter === 'all' ? edges : edges.filter((e) => e.confidence === filter)),
    [edges, filter]
  );

  const handleExport = () => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saved-edges-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteEdge(id);
      reload();
    } catch (e) {
      console.error('[SavedEdges] delete failed', e);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title="Saved Edges" subtitle="Your bookmarked prop edges & betting opportunities" />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
        <SectionHeader
          title="Saved Edges"
          subtitle={currentUser ? `Signed in as ${currentUser.email}` : 'Your edges'}
          actions={
            <button
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download size={13} /> Export CSV
            </button>
          }
        />

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'high', 'medium', 'low'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All Edges' : `${f} Confidence`}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-md border border-negative/40 bg-negative-subtle px-3 py-2 text-xs text-negative">
            {error}
          </div>
        )}

        {loading ? (
          <ChartSkeleton height={200} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Bookmark size={28} />}
            title="No saved edges"
            description="Save edges from the prop board and they'll show up here, scoped to your account."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((edge) => (
              <div
                key={edge.id}
                className="card-surface flex items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{edge.player}</span>
                    <span className="text-xs text-muted-foreground">
                      {edge.prop} {edge.direction === 'over' ? '▲' : '▼'} {edge.line}
                    </span>
                    <StatusBadge variant={CONF_BADGE[edge.confidence]}>
                      {edge.confidence}
                    </StatusBadge>
                  </div>
                  {edge.notes && (
                    <p className="mt-1 text-xs italic text-muted-foreground">{edge.notes}</p>
                  )}
                  <p className="mt-1 font-mono-data text-xs text-muted-foreground">
                    {edge.savedAt}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono-data text-sm font-bold ${
                      edge.edge >= 0 ? 'text-positive' : 'text-negative'
                    }`}
                  >
                    {formatEV(edge.edge)}
                  </span>
                  <button
                    onClick={() => handleDelete(edge.id)}
                    aria-label="Delete edge"
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-negative-subtle hover:text-negative"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
