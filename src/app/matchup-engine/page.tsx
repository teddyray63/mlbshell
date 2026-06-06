'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';

const MatchupEnginePage = dynamic(
  () => import('./components/MatchupEnginePage'),
  { ssr: false }
);

export default function Page() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <MatchupEnginePage />
      </ErrorBoundary>
    </AppLayout>
  );
}