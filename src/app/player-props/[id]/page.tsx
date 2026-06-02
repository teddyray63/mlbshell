import React from 'react';
import { notFound } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Topbar from '@/components/Topbar';
import PlayerProfile from '@/components/PlayerProfile';
import { mockPlayerProfiles, mockRecentGames } from '@/data/playerProfileData';

interface PlayerProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return mockPlayerProfiles.map((p) => ({ id: p.id }));
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { id } = await params;
  const player = mockPlayerProfiles.find((p) => p.id === id);

  if (!player) {
    notFound();
  }

  const recentGames = mockRecentGames[id] ?? [];

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Topbar
            title={player.name}
            subtitle={`${player.teamFull} · ${player.position}`}
          />
          <div className="flex-1">
            <PlayerProfile player={player} recentGames={recentGames} />
          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}
