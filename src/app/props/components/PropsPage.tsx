'use client';

import React, { useState } from 'react';
import PlayerPropsPage from '../../player-props/components/PlayerPropsPage';
import PropCheatsheetPage from '../../prop-cheatsheet/components/PropCheatsheetPage';

type Tab = 'props' | 'cheatsheet';

export default function PropsPage() {
  const [tab, setTab] = useState<Tab>('props');
  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-30 flex gap-1 border-b border-border bg-card/80 px-6 pt-2 backdrop-blur-sm">
        <button
          onClick={() => setTab('props')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'props'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Player Props
        </button>
        <button
          onClick={() => setTab('cheatsheet')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'cheatsheet'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Prop Cheatsheet
        </button>
      </div>
      {tab === 'props' ? <PlayerPropsPage /> : <PropCheatsheetPage />}
    </div>
  );
}
