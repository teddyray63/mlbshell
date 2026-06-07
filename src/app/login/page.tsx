'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { useStore } from '@/state/store';

export default function LoginPage() {
  const router = useRouter();
  const login = useStore((s) => s.login);
  const authError = useStore((s) => s.authError);
  const authLoading = useStore((s) => s.authLoading);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const clearAuthError = useStore((s) => s.clearAuthError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) router.replace('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <AppLogo size={44} />
          <div>
            <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your MLBShell account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>

          {authError && (
            <p className="rounded-md border border-negative/40 bg-negative-subtle px-3 py-2 text-xs text-negative">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <LogIn size={16} />
            {authLoading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
