import React from 'react';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import TodoMarker from '@/components/ui/TodoMarker';
import Topbar from '@/components/Topbar';

// TODO: Paste your existing PlayerProps page logic here
export default function PlayerPropsPage() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Topbar title="Player Props" subtitle="Individual player prop lines and analysis" />
          <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full">
            <TodoMarker
              pageName="PlayerProps"
              description="Drop in your existing PlayerProps component here. Import from your Vite project and update import paths."
            />
            <div className="mt-6 card-surface p-8 flex flex-col items-center justify-center min-h-[400px] border-dashed border-2 border-border">
              <p className="text-muted-foreground text-sm font-semibold mb-1">PlayerProps — Shell Ready</p>
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Paste your existing Vite React PlayerProps component here. API calls should route through <code className="font-mono-data text-primary">@/api/client</code>.
              </p>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}