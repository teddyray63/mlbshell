import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import PropCheatsheetPage from './components/PropCheatsheetPage';

export default function PropCheatsheetRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <PropCheatsheetPage />
      </ErrorBoundary>
    </AppLayout>
  );
}
