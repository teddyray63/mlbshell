'use client';

import React, { useState } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import typedClient from '@/api/typedClient';
import { useStore } from '@/state/store';
import { toast } from './Toast';
import type { SavedEdge } from '../../../shared/types';

interface SaveEdgeButtonProps {
  edge: Omit<SavedEdge, 'id' | 'savedAt'>;
  /** Whether this prop is already saved (parent supplies from a single fetch). */
  initiallySaved?: boolean;
  onSaved?: (propId: string) => void;
  size?: 'sm' | 'md';
}

/**
 * Save-Edge button — POSTs to /api/saved-edges (JWT via apiClient), shows a
 * success toast, and disables itself once saved. Prompts unauthenticated users
 * to log in.
 */
export default function SaveEdgeButton({
  edge,
  initiallySaved = false,
  onSaved,
  size = 'sm',
}: SaveEdgeButtonProps) {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved || busy) return;
    if (!isAuthenticated) {
      toast('Log in to save edges', 'error');
      return;
    }
    setBusy(true);
    try {
      await typedClient.saveEdge(edge);
      setSaved(true);
      onSaved?.(edge.propId);
      toast(`Saved ${edge.player} ${edge.prop}`, 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save edge', 'error');
    } finally {
      setBusy(false);
    }
  };

  const pad = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';
  const iconSize = size === 'md' ? 15 : 13;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saved || busy}
      title={saved ? 'Edge saved' : 'Save this edge'}
      className={`inline-flex items-center gap-1 rounded-md border font-medium transition-colors ${pad} ${
        saved
          ? 'cursor-default border-positive/40 bg-positive/15 text-positive'
          : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary'
      }`}
    >
      {busy ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : saved ? (
        <BookmarkCheck size={iconSize} />
      ) : (
        <Bookmark size={iconSize} />
      )}
      <span>{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}
