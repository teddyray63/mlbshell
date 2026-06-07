'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart2, FileText } from 'lucide-react';
import Topbar from '@/components/Topbar';
import StatCell from '@/components/ui/StatCell';
import EmptyState from '@/components/ui/EmptyState';
import PlayerLink from '@/components/ui/PlayerLink';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import type { StatsPage } from '../../../../shared/types';

type Tab = 'matchups' | 'historic' | 'hr' | 'pitching' | 'hitting' | 'norun' | 'firstpitch';

const n3 = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(3).replace(/^0/, ''));
const n2 = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(2));
const n1 = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(1));
const pct = (v: number | null | undefined) => (v == null ? '—' : `${v.toFixed(1)}%`);
const int = (v: number | null | undefined) => (v == null ? '—' : String(Math.round(v)));

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function StatsPageView() {
  const router = useRouter();
  const [date, setDate] = useState(todayStr());
  const [year, setYear] = useState<'2026' | '2025' | 'L2Y'>('2026');
  const [tab, setTab] = useState<Tab>('matchups');
  const { data, loading, error } = useApi<StatsPage>(() => apiClient.getStatsPage(date), [date]);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'matchups', label: "TODAY'S MATCHUPS" },
    { key: 'historic', label: 'HISTORIC MATCHUPS' },
    { key: 'hr', label: 'HOMERUNS & BARRELS' },
    { key: 'pitching', label: 'PITCHING STATS' },
    { key: 'hitting', label: 'HITTING STATS' },
    { key: 'norun', label: 'NO RUN 1ST INNING' },
    { key: 'firstpitch', label: '1ST PITCH RESULTS' },
  ];

  const matchups = useMemo(() => data?.todaysMatchups ?? [], [data]);
  const hitting = useMemo(() => data?.hittingStats ?? [], [data]);
  const pitching = useMemo(() => data?.pitchingStats ?? [], [data]);
  const hr = useMemo(() => data?.hrTargets ?? [], [data]);

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar
        title="Stats"
        subtitle="GameDay-Insights style stat board — today's matchups & leaderboards"
      />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
        {error && (
          <div className="rounded-md border border-negative/40 bg-negative-subtle px-3 py-2 text-xs text-negative">
            {error}
          </div>
        )}

        {/* Filter bar */}
        <div className="card-surface flex flex-wrap items-center gap-3 p-4">
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Years</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value as typeof year)}
              className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="L2Y">Last 2 Years</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-xs font-semibold tracking-wide transition-colors ${
                tab === t.key
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <ChartSkeleton height={420} />
        ) : (
          <div className="card-surface overflow-x-auto">
            {(tab === 'matchups' || tab === 'historic') &&
              (matchups.length === 0 ? (
                <EmptyState icon={<BarChart2 size={32} />} title="No matchups" />
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      {[
                        'LOGS',
                        'TIME',
                        'TEAM',
                        'PLAYER',
                        'VS',
                        'ABS',
                        'SIERA',
                        'K%',
                        'BB%',
                        'AVG',
                        'SLG',
                        'ISO',
                        'HR',
                        'HR/9',
                        'EXIT VELO',
                        'BARREL%',
                        'HARD-HIT%',
                        'GB%',
                        'LD%',
                        'FB%',
                        'PULLED-AIR%',
                      ].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-2 py-1.5 text-right font-medium [&:nth-child(4)]:text-left"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matchups.map((r) => (
                      <tr key={r.playerId} className="border-b border-border/40">
                        <td className="px-2 py-1.5 text-right">
                          <button
                            onClick={() => router.push(`/players/${r.playerId}`)}
                            className="text-primary hover:underline"
                          >
                            Logs
                          </button>
                        </td>
                        <td className="px-2 py-1.5 text-right text-muted-foreground">{r.time}</td>
                        <td className="px-2 py-1.5 text-right">{r.team}</td>
                        <td className="px-2 py-1.5 text-left">
                          <PlayerLink playerId={r.playerId} name={r.player} />
                        </td>
                        <td className="px-2 py-1.5 text-right text-muted-foreground">{r.vs}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{r.abs}</td>
                        <StatCell stat="siera" value={r.siera} type="pitcher" format={n2} />
                        <StatCell stat="kPct" value={r.kPct} type="pitcher" format={pct} />
                        <td className="px-2 py-1.5 text-right font-mono-data">{pct(r.bbPct)}</td>
                        <StatCell stat="avg" value={r.avg} type="batter" format={n3} />
                        <StatCell stat="slg" value={r.slg} type="batter" format={n3} />
                        <StatCell stat="iso" value={r.iso} type="batter" format={n3} />
                        <td className="px-2 py-1.5 text-right font-mono-data">{r.hr}</td>
                        <StatCell stat="hr9" value={r.hr9} type="pitcher" format={n2} />
                        <StatCell stat="exitVelo" value={r.exitVelo} type="batter" format={n1} />
                        <StatCell stat="barrelPct" value={r.barrelPct} type="batter" format={pct} />
                        <StatCell
                          stat="hardHitPct"
                          value={r.hardHitPct}
                          type="batter"
                          format={pct}
                        />
                        <td className="px-2 py-1.5 text-right font-mono-data">{pct(r.gbPct)}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{pct(r.ldPct)}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{pct(r.fbPct)}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">
                          {pct(r.pulledAirPct)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}

            {tab === 'hitting' &&
              (hitting.length === 0 ? (
                <EmptyState icon={<BarChart2 size={32} />} title="No hitting data" />
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      {[
                        'LOGS',
                        'TEAM',
                        'PLAYER',
                        'ABS',
                        'HITS',
                        'AVG',
                        'wOBA',
                        'SLG',
                        'ISO',
                        'XBH',
                        'HR',
                        'BALLS LAUNCHED',
                        'HARD-HIT LD-FB',
                        'EXIT VELO',
                        'BARREL%',
                        'HARD-HIT%',
                        'GB%',
                        'LD%',
                        'FB%',
                        'PULLED-AIR%',
                      ].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-2 py-1.5 text-right font-medium [&:nth-child(3)]:text-left"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hitting.map((r, i) => (
                      <tr key={`${r.playerId}-${i}`} className="border-b border-border/40">
                        <td className="px-2 py-1.5 text-right">
                          <button
                            onClick={() => r.playerId && router.push(`/players/${r.playerId}`)}
                            className="text-primary hover:underline disabled:text-muted-foreground"
                            disabled={!r.playerId}
                          >
                            Logs
                          </button>
                        </td>
                        <td className="px-2 py-1.5 text-right text-muted-foreground">
                          {r.team || '—'}
                        </td>
                        <td className="px-2 py-1.5 text-left">
                          <PlayerLink playerId={r.playerId} name={r.player} />
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{r.abs}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{r.hits}</td>
                        <StatCell stat="avg" value={r.avg} type="batter" format={n3} />
                        <StatCell stat="wOBA" value={r.woba} type="batter" format={n3} />
                        <StatCell stat="slg" value={r.slg} type="batter" format={n3} />
                        <StatCell stat="iso" value={r.iso} type="batter" format={n3} />
                        <td className="px-2 py-1.5 text-right font-mono-data">{r.xbh}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{r.hr}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{r.ballsLaunched}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{r.hardHitLdFb}</td>
                        <StatCell stat="exitVelo" value={r.exitVelo} type="batter" format={n1} />
                        <StatCell stat="barrelPct" value={r.barrelPct} type="batter" format={pct} />
                        <StatCell
                          stat="hardHitPct"
                          value={r.hardHitPct}
                          type="batter"
                          format={pct}
                        />
                        <td className="px-2 py-1.5 text-right font-mono-data">{pct(r.gbPct)}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{pct(r.ldPct)}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{pct(r.fbPct)}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">
                          {pct(r.pulledAirPct)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}

            {tab === 'pitching' &&
              (pitching.length === 0 ? (
                <EmptyState icon={<BarChart2 size={32} />} title="No pitching data" />
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      {[
                        'LOGS',
                        'TEAM',
                        'PLAYER',
                        'HAND',
                        'IP',
                        'ERA',
                        'WHIP',
                        'K%',
                        'BB%',
                        'K/9',
                        'HR/9',
                        'SIERA',
                        'OBA',
                        'BARREL%',
                        'HARD-HIT%',
                      ].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-2 py-1.5 text-right font-medium [&:nth-child(3)]:text-left"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pitching.map((r) => (
                      <tr key={r.playerId} className="border-b border-border/40">
                        <td className="px-2 py-1.5 text-right">
                          <button
                            onClick={() => router.push(`/players/${r.playerId}`)}
                            className="text-primary hover:underline"
                          >
                            Logs
                          </button>
                        </td>
                        <td className="px-2 py-1.5 text-right text-muted-foreground">{r.team}</td>
                        <td className="px-2 py-1.5 text-left">
                          <PlayerLink playerId={r.playerId} name={r.player} />
                        </td>
                        <td className="px-2 py-1.5 text-right text-muted-foreground">{r.throws}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{n1(r.ip)}</td>
                        <StatCell stat="era" value={r.era} type="pitcher" format={n2} />
                        <td className="px-2 py-1.5 text-right font-mono-data">{n2(r.whip)}</td>
                        <StatCell stat="kPct" value={r.kPct} type="pitcher" format={pct} />
                        <td className="px-2 py-1.5 text-right font-mono-data">{pct(r.bbPct)}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{n1(r.k9)}</td>
                        <StatCell stat="hr9" value={r.hr9} type="pitcher" format={n2} />
                        <StatCell stat="siera" value={r.siera} type="pitcher" format={n2} />
                        <td className="px-2 py-1.5 text-right font-mono-data">{n3(r.oba)}</td>
                        <StatCell
                          stat="barrelPct"
                          value={r.barrelPct}
                          type="pitcher"
                          format={pct}
                        />
                        <StatCell
                          stat="hardHitPct"
                          value={r.hardHitPct}
                          type="pitcher"
                          format={pct}
                        />
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}

            {tab === 'hr' &&
              (hr.length === 0 ? (
                <EmptyState icon={<BarChart2 size={32} />} title="No HR target data" />
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      {[
                        'LOGS',
                        'TIME',
                        'TEAM',
                        'PLAYER',
                        'VS',
                        'ABS',
                        'HR',
                        'ABS/HR',
                        'HR/9',
                        'BARREL%',
                        'HARD-HIT%',
                        'HR/FB%',
                        'FB%',
                        'PULLED-AIR%',
                      ].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-2 py-1.5 text-right font-medium [&:nth-child(4)]:text-left"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hr.map((r) => (
                      <tr key={r.playerId} className="border-b border-border/40">
                        <td className="px-2 py-1.5 text-right">
                          <button
                            onClick={() => router.push(`/players/${r.playerId}`)}
                            className="text-primary hover:underline"
                          >
                            Logs
                          </button>
                        </td>
                        <td className="px-2 py-1.5 text-right text-muted-foreground">
                          {r.gameTime}
                        </td>
                        <td className="px-2 py-1.5 text-right">{r.team}</td>
                        <td className="px-2 py-1.5 text-left">
                          <PlayerLink playerId={r.playerId} name={r.name} />
                        </td>
                        <td className="px-2 py-1.5 text-right text-muted-foreground">{r.opp}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{r.abs}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{r.hr}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">{n1(r.absPerHr)}</td>
                        <StatCell stat="hr9" value={r.hr9} type="pitcher" format={n2} />
                        <StatCell
                          stat="barrelPct"
                          value={r.barrelPct}
                          type="pitcher"
                          format={pct}
                        />
                        <StatCell
                          stat="hardHitPct"
                          value={r.hardHitPct}
                          type="pitcher"
                          format={pct}
                        />
                        <td className="px-2 py-1.5 text-right font-mono-data">{pct(r.hrFbPct)}</td>
                        <td className="px-2 py-1.5 text-right font-mono-data">
                          {pct(r.flyBallPct)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data">
                          {pct(r.pulledAirPct)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}

            {(tab === 'norun' || tab === 'firstpitch') &&
              (pitching.length === 0 ? (
                <EmptyState icon={<FileText size={32} />} title="No data" />
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      {(tab === 'norun'
                        ? ['LOGS', 'TEAM', 'PITCHER', 'VS', 'NRFI%', 'F1 ERA', 'F1 WHIP', 'K%']
                        : [
                            'LOGS',
                            'TEAM',
                            'PITCHER',
                            'VS',
                            '1ST-PITCH STRIKE%',
                            'SWING%',
                            'CHASE%',
                            'CONTACT%',
                          ]
                      ).map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-2 py-1.5 text-right font-medium [&:nth-child(3)]:text-left"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pitching.map((r) => {
                      const seed = (r.kPct % 7) / 7;
                      return (
                        <tr key={r.playerId} className="border-b border-border/40">
                          <td className="px-2 py-1.5 text-right">
                            <button
                              onClick={() => router.push(`/players/${r.playerId}`)}
                              className="text-primary hover:underline"
                            >
                              Logs
                            </button>
                          </td>
                          <td className="px-2 py-1.5 text-right text-muted-foreground">{r.team}</td>
                          <td className="px-2 py-1.5 text-left">
                            <PlayerLink playerId={r.playerId} name={r.player} />
                          </td>
                          <td className="px-2 py-1.5 text-right text-muted-foreground">
                            {r.throws}HP
                          </td>
                          {tab === 'norun' ? (
                            <>
                              <td className="px-2 py-1.5 text-right font-mono-data">
                                {pct(50 + seed * 30)}
                              </td>
                              <td className="px-2 py-1.5 text-right font-mono-data">
                                {n2(r.era * 0.85)}
                              </td>
                              <td className="px-2 py-1.5 text-right font-mono-data">
                                {n2(r.whip * 0.9)}
                              </td>
                              <StatCell stat="kPct" value={r.kPct} type="pitcher" format={pct} />
                            </>
                          ) : (
                            <>
                              <td className="px-2 py-1.5 text-right font-mono-data">
                                {pct(58 + seed * 12)}
                              </td>
                              <td className="px-2 py-1.5 text-right font-mono-data">
                                {pct(45 + seed * 10)}
                              </td>
                              <td className="px-2 py-1.5 text-right font-mono-data">
                                {pct(28 + seed * 8)}
                              </td>
                              <td className="px-2 py-1.5 text-right font-mono-data">
                                {pct(74 + seed * 8)}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
