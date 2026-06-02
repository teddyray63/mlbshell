'use client';
import React, { useState, useEffect } from 'react';
import { Clock, Database, Wifi } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  dataSource?: 'live' | 'mock' | 'cached';
}

export default function Topbar({ title, subtitle, actions, dataSource = 'live' }: TopbarProps) {
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    setDateStr(`${mm}/${dd}/${yy}`);
  }, []);

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-card/80 backdrop-blur-sm border-b border-border">
      <div>
        <h1 className="text-lg font-semibold text-foreground leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {actions}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Database size={12} className={dataSource === 'live' ? 'text-positive' : dataSource === 'cached' ? 'text-warning' : 'text-primary'} />
          <span className="font-mono-data">{dataSource}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wifi size={12} className="text-positive" />
          <span>live</span>
        </div>
        {dateStr && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono-data">
            <Clock size={12} />
            <span>{dateStr}</span>
          </div>
        )}
      </div>
    </div>
  );
}