import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '../../components/ErrorBoundary';
import BettingIntelligencePage from './components/BettingIntelligencePage';

export default function Page() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <BettingIntelligencePage />
      </ErrorBoundary>
    </AppLayout>
  );
}
