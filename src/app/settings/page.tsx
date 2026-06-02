import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Topbar from '@/components/Topbar';
import TodoMarker from '@/components/ui/TodoMarker';

export default function SettingsPage() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Topbar title="Settings" subtitle="API configuration and environment options" />
          <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-5">
            <TodoMarker
              pageName="Settings"
              description="Add app-level settings here — API mode toggle, API key inputs, display preferences."
            />

            <div className="card-surface p-5 space-y-4">
              <h2 className="text-sm font-semibold text-foreground">API Configuration</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'API Mode',          key: 'NEXT_PUBLIC_API_MODE',          value: process.env.NEXT_PUBLIC_API_MODE || 'mock'  },
                  { label: 'API Base URL',       key: 'NEXT_PUBLIC_API_BASE_URL',      value: process.env.NEXT_PUBLIC_API_BASE_URL || '(not set)' },
                  { label: 'MLB API Key',        key: 'NEXT_PUBLIC_MLB_API_KEY',       value: process.env.NEXT_PUBLIC_MLB_API_KEY ? '••••••••' : '(not set)' },
                  { label: 'Weather API Key',    key: 'NEXT_PUBLIC_WEATHER_API_KEY',   value: process.env.NEXT_PUBLIC_WEATHER_API_KEY ? '••••••••' : '(not set)' },
                ]?.map((env) => (
                  <div key={`env-${env.key}`} className="flex flex-col gap-1 p-3 rounded-md bg-muted/50 border border-border/50">
                    <span className="text-xs text-muted-foreground">{env.label}</span>
                    <span className="font-mono-data text-xs text-foreground">{env.key}</span>
                    <span className="font-mono-data text-xs text-primary">{env.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Set these values in <code className="font-mono-data text-primary">.env.local</code>. See <code className="font-mono-data text-primary">.env.example</code> for the full list.
              </p>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}