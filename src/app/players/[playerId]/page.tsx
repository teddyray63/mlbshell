import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import PlayerPageView from './components/PlayerPageView';

export default async function PlayerRoute({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;
  return (
    <AppLayout>
      <ErrorBoundary>
        <PlayerPageView playerId={playerId} />
      </ErrorBoundary>
    </AppLayout>
  );
}
