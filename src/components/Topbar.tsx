import React from 'react';
import { Clock, Database, Wifi } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || 'mock';
const IS_LIVE = API_MODE === 'fetch';

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  const today = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-card/80 backdrop-blur-sm border-b border-border">
      <div>
        <h1 className="text-lg font-semibold text-foreground leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {actions}
        {IS_LIVE ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wifi size={12} className="text-positive" />
            <span>live</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Database size={12} className="text-primary" />
            <span className="font-mono-data">mock</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono-data">
          <Clock size={12} />
          <span>{today}</span>
        </div>
      </div>
    </div>
  );
}
