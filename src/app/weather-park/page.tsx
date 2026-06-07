import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import WeatherParkPage from './components/WeatherParkPage';

export default function WeatherParkRoute() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <WeatherParkPage />
      </ErrorBoundary>
    </AppLayout>
  );
}
