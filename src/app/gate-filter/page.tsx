import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import GateFilterPage from './components/GateFilterPage';

export default function GateFilterRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <GateFilterPage />
      </ErrorBoundary>
    </AppLayout>
  );
}
