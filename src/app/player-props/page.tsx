import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import PlayerPropsPage from './components/PlayerPropsPage';

export default function PlayerPropsRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <PlayerPropsPage />
      </ErrorBoundary>
    </AppLayout>
  );
}
