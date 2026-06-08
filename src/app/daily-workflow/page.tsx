import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import DailyWorkflowPage from './components/DailyWorkflowPage';

export default function DailyWorkflowRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <DailyWorkflowPage />
      </ErrorBoundary>
    </AppLayout>
  );
}
