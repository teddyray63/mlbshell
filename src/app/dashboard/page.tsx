import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import DashboardPage from './components/DashboardPage';

export default function DashboardRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <DashboardPage />
      </ErrorBoundary>
    </AppLayout>
  );
}
