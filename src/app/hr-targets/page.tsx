import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import HRTargetsPage from './components/HRTargetsPage';

export default function HRTargetsRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <HRTargetsPage />
      </ErrorBoundary>
    </AppLayout>
  );
}
