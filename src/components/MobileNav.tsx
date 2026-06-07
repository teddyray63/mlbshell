'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Calendar, Activity, CloudRain, LayoutDashboard } from 'lucide-react';

interface MobileNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mobileNavItems: MobileNavItem[] = [
  {
    id: 'mobile-dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    id: 'mobile-games',
    label: 'Games',
    href: '/games',
    icon: <Calendar size={20} />,
  },
  {
    id: 'mobile-stats',
    label: 'Stats',
    href: '/stats',
    icon: <BarChart2 size={20} />,
  },
  {
    id: 'mobile-props',
    label: 'Props',
    href: '/props',
    icon: <Activity size={20} />,
  },
  {
    id: 'mobile-weather',
    label: 'Weather',
    href: '/weather-park',
    icon: <CloudRain size={20} />,
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-md transition-colors min-w-0 ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
