import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import VisualAnalyticsPage from './components/VisualAnalyticsPage';

export default function VisualAnalyticsRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <VisualAnalyticsPage />
      </ErrorBoundary>
    </AppLayout>
  );
}
