'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '../../components/ErrorBoundary';

const BettingIntelligencePage = dynamic(
  () => import('./components/BettingIntelligencePage'),
  { ssr: false }
);

export default function Page() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <BettingIntelligencePage />
      </ErrorBoundary>
    </AppLayout>
  );
}