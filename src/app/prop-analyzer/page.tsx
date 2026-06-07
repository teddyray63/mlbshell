import React, { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import PropAnalyzerPage from './components/PropAnalyzerPage';

export default function PropAnalyzerRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <Suspense fallback={null}>
          <PropAnalyzerPage />
        </Suspense>
      </ErrorBoundary>
    </AppLayout>
  );
}
