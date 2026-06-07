import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import AuthGuard from './AuthGuard';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto scrollbar-thin pb-16 lg:pb-0">{children}</main>
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
