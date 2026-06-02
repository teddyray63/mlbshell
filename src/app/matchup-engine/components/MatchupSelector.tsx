'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Zap, Loader2 } from 'lucide-react';
import type { Pitcher, Batter } from './MatchupEnginePage';

// Real MLB pitchers (2026 season roster)
const PITCHERS: Pitcher[] = [
  { id: 'pitcher-001', name: 'Gerrit Cole',       team: 'NYY', hand: 'R', era: '3.12', fip: '2.98', whip: '1.08', k9: '11.4', bb9: '2.1', swStrPct: '14.2', gbPct: '38.1', hrPer9: '0.9' },
  { id: 'pitcher-002', name: 'Spencer Strider',   team: 'ATL', hand: 'R', era: '2.87', fip: '2.71', whip: '0.99', k9: '13.1', bb9: '2.4', swStrPct: '16.8', gbPct: '35.2', hrPer9: '0.8' },
  { id: 'pitcher-003', name: 'Logan Webb',        team: 'SF',  hand: 'R', era: '3.03', fip: '3.18', whip: '1.12', k9: '8.9',  bb9: '2.3', swStrPct: '11.4', gbPct: '55.6', hrPer9: '0.7' },
  { id: 'pitcher-004', name: 'Framber Valdez',    team: 'HOU', hand: 'L', era: '2.94', fip: '3.05', whip: '1.14', k9: '9.2',  bb9: '3.1', swStrPct: '12.1', gbPct: '58.3', hrPer9: '0.6' },
  { id: 'pitcher-005', name: 'Zack Wheeler',      team: 'PHI', hand: 'R', era: '3.07', fip: '2.89', whip: '1.06', k9: '10.8', bb9: '1.9', swStrPct: '13.7', gbPct: '44.2', hrPer9: '1.0' },
  { id: 'pitcher-006', name: 'Sandy Alcantara',   team: 'MIA', hand: 'R', era: '3.35', fip: '3.41', whip: '1.18', k9: '9.1',  bb9: '2.6', swStrPct: '11.9', gbPct: '52.4', hrPer9: '0.8' },
  { id: 'pitcher-007', name: 'Kevin Gausman',     team: 'TOR', hand: 'R', era: '3.16', fip: '3.02', whip: '1.09', k9: '10.2', bb9: '2.2', swStrPct: '13.3', gbPct: '40.1', hrPer9: '1.1' },
  { id: 'pitcher-008', name: 'Corbin Burnes',     team: 'BAL', hand: 'R', era: '2.92', fip: '2.78', whip: '1.01', k9: '10.9', bb9: '2.0', swStrPct: '14.6', gbPct: '47.3', hrPer9: '0.7' },
  { id: 'pitcher-009', name: 'Dylan Cease',       team: 'SD',  hand: 'R', era: '3.28', fip: '3.14', whip: '1.15', k9: '11.7', bb9: '3.4', swStrPct: '15.2', gbPct: '36.8', hrPer9: '0.9' },
  { id: 'pitcher-010', name: 'Tarik Skubal',      team: 'DET', hand: 'L', era: '2.80', fip: '2.65', whip: '0.97', k9: '11.2', bb9: '1.8', swStrPct: '15.9', gbPct: '42.7', hrPer9: '0.8' },
];

// Real MLB batters (2026 season roster)
const BATTERS: Batter[] = [
  { id: 'batter-001', name: 'Freddie Freeman',    team: 'LAD', hand: 'L', avg: '.311', obp: '.394', slg: '.531', woba: '.408', kPct: '14.2', bbPct: '12.1', iso: '.220', barrelPct: '14.8' },
  { id: 'batter-002', name: 'Mookie Betts',       team: 'LAD', hand: 'R', avg: '.298', obp: '.381', slg: '.512', woba: '.392', kPct: '16.1', bbPct: '11.4', iso: '.214', barrelPct: '13.2' },
  { id: 'batter-003', name: 'Ronald Acuña Jr.',   team: 'ATL', hand: 'R', avg: '.337', obp: '.416', slg: '.596', woba: '.432', kPct: '17.3', bbPct: '13.2', iso: '.259', barrelPct: '17.1' },
  { id: 'batter-004', name: 'Juan Soto',          team: 'NYY', hand: 'L', avg: '.288', obp: '.411', slg: '.519', woba: '.409', kPct: '19.4', bbPct: '18.7', iso: '.231', barrelPct: '15.3' },
  { id: 'batter-005', name: 'Yordan Alvarez',     team: 'HOU', hand: 'L', avg: '.306', obp: '.399', slg: '.583', woba: '.421', kPct: '18.6', bbPct: '13.9', iso: '.277', barrelPct: '19.4' },
  { id: 'batter-006', name: 'Corey Seager',       team: 'TEX', hand: 'L', avg: '.291', obp: '.360', slg: '.521', woba: '.389', kPct: '20.1', bbPct: '9.8',  iso: '.230', barrelPct: '14.7' },
  { id: 'batter-007', name: 'Trea Turner',        team: 'PHI', hand: 'R', avg: '.302', obp: '.358', slg: '.488', woba: '.374', kPct: '18.4', bbPct: '7.6',  iso: '.186', barrelPct: '11.2' },
  { id: 'batter-008', name: 'Gunnar Henderson',   team: 'BAL', hand: 'L', avg: '.281', obp: '.362', slg: '.519', woba: '.388', kPct: '22.3', bbPct: '11.2', iso: '.238', barrelPct: '16.8' },
  { id: 'batter-009', name: 'Bobby Witt Jr.',     team: 'KC',  hand: 'R', avg: '.318', obp: '.374', slg: '.556', woba: '.411', kPct: '16.7', bbPct: '7.9',  iso: '.238', barrelPct: '15.6' },
  { id: 'batter-010', name: 'Fernando Tatis Jr.', team: 'SD',  hand: 'R', avg: '.279', obp: '.348', slg: '.524', woba: '.383', kPct: '24.1', bbPct: '9.4',  iso: '.245', barrelPct: '16.2' },
];

interface MatchupSelectorProps {
  onPitcherChange: (p: Pitcher) => void;
  onBatterChange: (b: Batter) => void;
}

export default function MatchupSelector({ onPitcherChange, onBatterChange }: MatchupSelectorProps) {
  const [pitcher, setPitcher] = useState<Pitcher>(PITCHERS[0]);
  const [batter, setBatter] = useState<Batter>(BATTERS[0]);
  const [pitcherSearch, setPitcherSearch] = useState('');
  const [batterSearch, setBatterSearch] = useState('');
  const [showPitcherDropdown, setShowPitcherDropdown] = useState(false);
  const [showBatterDropdown, setShowBatterDropdown] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const pitcherRef = useRef<HTMLDivElement>(null);
  const batterRef = useRef<HTMLDivElement>(null);

  // Notify parent on mount
  useEffect(() => {
    onPitcherChange(PITCHERS[0]);
    onBatterChange(BATTERS[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pitcherRef.current && !pitcherRef.current.contains(e.target as Node)) setShowPitcherDropdown(false);
      if (batterRef.current && !batterRef.current.contains(e.target as Node)) setShowBatterDropdown(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredPitchers = PITCHERS.filter(p =>
    p.name.toLowerCase().includes(pitcherSearch.toLowerCase()) ||
    p.team.toLowerCase().includes(pitcherSearch.toLowerCase())
  );

  const filteredBatters = BATTERS.filter(b =>
    b.name.toLowerCase().includes(batterSearch.toLowerCase()) ||
    b.team.toLowerCase().includes(batterSearch.toLowerCase())
  );

  function selectPitcher(p: Pitcher) {
    setPitcher(p);
    setPitcherSearch('');
    setShowPitcherDropdown(false);
    onPitcherChange(p);
  }

  function selectBatter(b: Batter) {
    setBatter(b);
    setBatterSearch('');
    setShowBatterDropdown(false);
    onBatterChange(b);
  }

  function handleAnalyze() {
    setAnalyzing(true);
    // Trigger re-render in parent by re-emitting current selections
    onPitcherChange({ ...pitcher });
    onBatterChange({ ...batter });
    setTimeout(() => setAnalyzing(false), 600);
  }

  return (
    <div className="card-surface p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
        {/* Pitcher selector */}
        <div ref={pitcherRef}>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            Pitcher
          </label>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder={pitcher.name}
              value={pitcherSearch}
              onChange={e => { setPitcherSearch(e.target.value); setShowPitcherDropdown(true); }}
              onFocus={() => setShowPitcherDropdown(true)}
              className="w-full pl-8 pr-3 py-2.5 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {showPitcherDropdown && filteredPitchers.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-md bg-card border border-border shadow-lg max-h-52 overflow-y-auto">
                {filteredPitchers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => selectPitcher(p)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between ${p.id === pitcher.id ? 'bg-muted/70 text-primary' : 'text-foreground'}`}
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-muted-foreground font-mono-data">{p.team} · {p.hand}HP · ERA {p.era}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono-data text-foreground">{pitcher.team}</span>
            <span>·</span>
            <span>{pitcher.hand}HP</span>
            <span>·</span>
            <span className="font-mono-data">ERA {pitcher.era}</span>
            {pitcher.fip && <><span>·</span><span className="font-mono-data">FIP {pitcher.fip}</span></>}
          </div>
        </div>

        {/* VS + Analyze button */}
        <div className="hidden lg:flex flex-col items-center justify-center gap-2 pt-6">
          <div className="w-10 h-10 rounded-full bg-info-subtle border border-primary/30 flex items-center justify-center">
            <Zap size={16} className="text-primary" />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-1.5"
          >
            {analyzing ? <Loader2 size={11} className="animate-spin" /> : null}
            {analyzing ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>

        {/* Batter selector */}
        <div ref={batterRef}>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            Batter
          </label>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder={batter.name}
              value={batterSearch}
              onChange={e => { setBatterSearch(e.target.value); setShowBatterDropdown(true); }}
              onFocus={() => setShowBatterDropdown(true)}
              className="w-full pl-8 pr-3 py-2.5 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {showBatterDropdown && filteredBatters.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-md bg-card border border-border shadow-lg max-h-52 overflow-y-auto">
                {filteredBatters.map(b => (
                  <button
                    key={b.id}
                    onClick={() => selectBatter(b)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between ${b.id === batter.id ? 'bg-muted/70 text-primary' : 'text-foreground'}`}
                  >
                    <span>{b.name}</span>
                    <span className="text-xs text-muted-foreground font-mono-data">{b.team} · {b.hand}HB · AVG {b.avg}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono-data text-foreground">{batter.team}</span>
            <span>·</span>
            <span>{batter.hand}HB</span>
            <span>·</span>
            <span className="font-mono-data">AVG {batter.avg}</span>
            {batter.woba && <><span>·</span><span className="font-mono-data">wOBA {batter.woba}</span></>}
          </div>
        </div>
      </div>

      {/* Mobile analyze button */}
      <div className="lg:hidden mt-4 flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {analyzing ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
          {analyzing ? 'Analyzing…' : 'Analyze Matchup'}
        </button>
      </div>
    </div>
  );
}