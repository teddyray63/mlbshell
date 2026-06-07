import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import PlayerDeepDivePage from './components/PlayerDeepDivePage';

export default function PlayerDeepDiveRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <PlayerDeepDivePage />
      </ErrorBoundary>
    </AppLayout>
  );
}
