import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import AdvancedAnalyticsPage from './components/AdvancedAnalyticsPage';

// Advanced Analytics is the entry screen at src/app/page.tsx
export default function Page() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <AdvancedAnalyticsPage />
      </ErrorBoundary>
    </AppLayout>
  );
}
