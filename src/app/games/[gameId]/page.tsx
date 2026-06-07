import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import GamePageView from './components/GamePageView';

export default async function GameRoute({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  return (
    <AppLayout>
      <ErrorBoundary>
        <GamePageView gameId={gameId} />
      </ErrorBoundary>
    </AppLayout>
  );
}
