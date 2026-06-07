'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  Zap,
  ChevronLeft,
  ChevronRight,
  Activity,
  CloudRain,
  Calendar,
  Filter,
  ListChecks,
  Settings,
  Menu,
  X,
  LayoutDashboard,
  Trophy,
  Bookmark,
  Crosshair,
  UserSearch,
} from 'lucide-react';
import AppLogo from './ui/AppLogo';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  group: string;
}

const navItems: NavItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={18} />,
    group: 'Overview',
  },
  {
    id: 'nav-games',
    label: 'Games',
    href: '/games',
    icon: <Calendar size={18} />,
    group: 'Games',
  },
  {
    id: 'nav-stats',
    label: 'Stats',
    href: '/stats',
    icon: <BarChart2 size={18} />,
    group: 'Analytics',
  },
  {
    id: 'nav-matchup-engine',
    label: 'Matchup Engine',
    href: '/matchup-engine',
    icon: <Zap size={18} />,
    group: 'Analytics',
  },
  {
    id: 'nav-props',
    label: 'Props',
    href: '/props',
    icon: <Activity size={18} />,
    group: 'Props',
  },
  {
    id: 'nav-hr-targets',
    label: 'HR Targets',
    href: '/hr-targets',
    icon: <Crosshair size={18} />,
    group: 'Props',
  },
  {
    id: 'nav-gate-filter',
    label: 'Gate Filter',
    href: '/gate-filter',
    icon: <Filter size={18} />,
    group: 'Props',
  },
  {
    id: 'nav-daily-workflow',
    label: 'Daily Workflow',
    href: '/daily-workflow',
    icon: <ListChecks size={18} />,
    group: 'Props',
  },
  {
    id: 'nav-saved-edges',
    label: 'Saved Edges',
    href: '/saved-edges',
    icon: <Bookmark size={18} />,
    group: 'Tools',
  },
  {
    id: 'nav-weather-park',
    label: 'Weather & Park',
    href: '/weather-park',
    icon: <CloudRain size={18} />,
    group: 'Tools',
  },
  {
    id: 'nav-team-rankings',
    label: 'Team Rankings',
    href: '/team-rankings',
    icon: <Trophy size={18} />,
    group: 'Tools',
  },
  {
    id: 'nav-player-deepdive',
    label: 'Player Deep Dive',
    href: '/player-deepdive',
    icon: <UserSearch size={18} />,
    group: 'Tools',
  },
];

const groups = ['Overview', 'Games', 'Analytics', 'Props', 'Tools'];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 py-4 border-b border-border ${collapsed ? 'justify-center' : ''}`}
      >
        <AppLogo size={32} />
        {!collapsed && (
          <span className="font-semibold text-base text-foreground tracking-tight">MLBShell</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {groups.map((group) => {
          const items = navItems.filter((n) => n.group === group);
          return (
            <div key={`group-${group}`} className="mb-4">
              {!collapsed && (
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-1">
                  {group}
                </p>
              )}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 group relative
                          ${active ? 'nav-item-active' : 'nav-item-inactive hover:bg-muted/50 hover:text-foreground'}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span
                          className={`flex-shrink-0 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                        >
                          {item.icon}
                        </span>
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        {!collapsed && item.badge && (
                          <span className="ml-auto flex-shrink-0 text-xs font-mono-data bg-warning-subtle text-warning border border-warning rounded-full px-1.5 py-0.5 leading-none">
                            {item.badge}
                          </span>
                        )}
                        {collapsed && item.badge && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-warning" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium nav-item-inactive hover:bg-muted/50 hover:text-foreground transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
        >
          <Settings size={18} className="text-muted-foreground flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium nav-item-inactive hover:bg-muted/50 hover:text-foreground transition-all duration-150 mt-0.5"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="text-muted-foreground flex-shrink-0">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-md card-surface text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border sidebar-transition
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button
          className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-card border-r border-border sidebar-transition flex-shrink-0
          ${collapsed ? 'w-16' : 'w-56'}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
