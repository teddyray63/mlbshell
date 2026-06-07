import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import SavedEdgesPage from './components/SavedEdgesPage';

export default function SavedEdgesRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <SavedEdgesPage />
      </ErrorBoundary>
    </AppLayout>
  );
}
