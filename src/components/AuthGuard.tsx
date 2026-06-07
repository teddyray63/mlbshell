'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/state/store';

/**
 * AuthGuard — redirects unauthenticated users to /login. Waits for the
 * persisted store to finish hydrating before deciding, to avoid SSR/CSR
 * mismatches and redirect flicker on reload.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(useStore.persist.hasHydrated());
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="text-xs text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
