import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import TeamRankingsPage from './components/TeamRankingsPage';

export default function TeamRankingsRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <TeamRankingsPage />
      </ErrorBoundary>
    </AppLayout>
  );
}
