import React from 'react';
import { notFound } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Topbar from '@/components/Topbar';
import PlayerProfile from '@/components/PlayerProfile';
import { mockPlayerProfiles, mockRecentGames } from '@/data/playerProfileData';
import { ALL_MLB_PLAYERS } from '@/data/mlbPlayers';

interface PlayerProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  // Generate params for all mock profiles + all MLB players
  const mockIds = mockPlayerProfiles.map((p) => ({ id: p.id }));
  const playerIds = ALL_MLB_PLAYERS.map((p) => ({ id: p.id }));
  // Deduplicate
  const allIds = [...mockIds];
  for (const p of playerIds) {
    if (!allIds.find((m) => m.id === p.id)) allIds.push(p);
  }
  return allIds;
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { id } = await params;

  // First try mock profiles (have full stats)
  let player = mockPlayerProfiles.find((p) => p.id === id);

  // If not found in mock profiles, try to build a profile from mlbPlayers dataset
  if (!player) {
    const mlbPlayer = ALL_MLB_PLAYERS.find((p) => p.id === id);
    if (mlbPlayer) {
      // Build a minimal profile from the player data
      player = {
        id: mlbPlayer.id,
        name: mlbPlayer.name,
        team: mlbPlayer.team,
        teamFull: mlbPlayer.teamFull,
        position: mlbPlayer.position,
        number: mlbPlayer.number,
        bats: mlbPlayer.bats,
        throws: mlbPlayer.throws,
        age: 27,
        height: '6\'1"',
        weight: '200 lbs',
        avg: 0.265,
        obp: 0.335,
        slg: 0.445,
        ops: 0.780,
        hr: 14,
        rbi: 52,
        sb: 8,
        pa: 280,
        ab: 248,
        hits: 66,
        doubles: 14,
        triples: 2,
        runs: 42,
        bb: 28,
        so: 68,
        exitVelocityAvg: 89.8,
        barrelRate: 9.4,
        hardHitPct: 41.2,
        woba: 0.338,
        xwoba: 0.344,
        kPct: 24.3,
        bbPct: 10.0,
        launchAngle: 13.8,
        sprintSpeed: 27.2,
        ...(mlbPlayer.type === 'pitcher' ? {
          era: 3.85,
          whip: 1.22,
          ip: 88.1,
          strikeouts: 92,
          walks: 28,
          fip: 3.94,
          xfip: 3.88,
          spinRate: 2280,
        } : {}),
      };
    }
  }

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
