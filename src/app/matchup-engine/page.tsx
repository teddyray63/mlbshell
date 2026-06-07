import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import MatchupEnginePage from './components/MatchupEnginePage';

export default function Page() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <MatchupEnginePage />
      </ErrorBoundary>
    </AppLayout>
  );
}
