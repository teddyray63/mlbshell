import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import GamesPage from './components/GamesPage';

export default function GamesRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <GamesPage />
      </ErrorBoundary>
    </AppLayout>
  );
}
