import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import StatsPageView from './components/StatsPageView';

export default function StatsRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <StatsPageView />
      </ErrorBoundary>
    </AppLayout>
  );
}
