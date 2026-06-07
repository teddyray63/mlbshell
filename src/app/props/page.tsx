import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import PropsPage from './components/PropsPage';

export default function PropsRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <PropsPage />
      </ErrorBoundary>
    </AppLayout>
  );
}
