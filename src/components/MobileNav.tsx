'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, TrendingUp, Activity, CloudRain, LayoutDashboard, Zap, Trophy, Search } from 'lucide-react';

interface MobileNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mobileNavItems: MobileNavItem[] = [
  { id: 'mobile-dashboard',  label: 'Home',     href: '/dashboard',            icon: <LayoutDashboard size={20} /> },
  { id: 'mobile-analytics',  label: 'Stats',    href: '/',                     icon: <BarChart2 size={20} /> },
  { id: 'mobile-betting',    label: 'Betting',  href: '/betting-intelligence', icon: <TrendingUp size={20} /> },
  { id: 'mobile-props',      label: 'Props',    href: '/player-props',         icon: <Activity size={20} /> },
  { id: 'mobile-matchup',    label: 'Matchup',  href: '/matchup-engine',       icon: <Zap size={20} /> },
  { id: 'mobile-analyzer',   label: 'Analyzer', href: '/prop-analyzer',        icon: <Search size={20} /> },
  { id: 'mobile-rankings',   label: 'Rankings', href: '/team-rankings',        icon: <Trophy size={20} /> },
  { id: 'mobile-weather',    label: 'Weather',  href: '/weather-park',         icon: <CloudRain size={20} /> },
];

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Show first 5 on mobile, all 8 in a scrollable row
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border safe-area-pb">
      <div className="flex items-center justify-start gap-0 px-1 py-1 overflow-x-auto scrollbar-none">
        {mobileNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-md transition-colors min-w-0 flex-shrink-0 ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-[9px] font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
