'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

const EVENT = 'mlbshell:toast';

/** Fire a toast from anywhere (no provider needed). */
export function toast(message: string, kind: ToastKind = 'success'): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<Omit<ToastItem, 'id'>>(EVENT, { detail: { message, kind } })
  );
}

/** Mount once near the app root; renders stacked toasts bottom-right. */
export default function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const detail = (e as CustomEvent<Omit<ToastItem, 'id'>>).detail;
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, ...detail }]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3000);
    }
    window.addEventListener(EVENT, onToast as EventListener);
    return () => window.removeEventListener(EVENT, onToast as EventListener);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {items.map((t) => {
        const Icon = t.kind === 'success' ? CheckCircle2 : t.kind === 'error' ? XCircle : Info;
        const tone =
          t.kind === 'success'
            ? 'border-positive/40 bg-positive/15 text-positive'
            : t.kind === 'error'
              ? 'border-negative/40 bg-negative/15 text-negative'
              : 'border-primary/40 bg-primary/15 text-primary';
        return (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-lg backdrop-blur-sm ${tone}`}
            role="status"
          >
            <Icon size={16} />
            <span className="text-foreground">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
