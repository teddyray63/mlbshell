'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import apiClient from '@/api/client';
import { formatEV, formatAvg } from '@/utils/formatters';
import { mockPlayerProps, mockWeather } from '@/data/mockData';
import type { PlayerProp, WeatherCondition } from '../../../../shared/types';
import type { ConfidenceLevel } from '../../../../shared/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = 'player' | 'prop' | 'line' | 'edge' | 'hitRate' | 'windImpact' | 'confidence';
type SortDir = 'asc' | 'desc';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive confidence tier from edge value — no new utility, inline only. */
function deriveConfidence(edge: number | undefined): ConfidenceLevel | null {
  if (edge == null) return null;
  if (edge >= 8) return 'high';
  if (edge >= 4) return 'medium';
  return 'low';
}

const CONFIDENCE_BADGE: Record<
  ConfidenceLevel,
  { variant: 'positive' | 'warning' | 'negative'; label: string }
> = {
  high: { variant: 'positive', label: 'High' },
  medium: { variant: 'warning', label: 'Med' },
  low: { variant: 'negative', label: 'Low' },
};

const WIND_IMPACT_BADGE: Record<
  'boost' | 'suppress' | 'neutral',
  { variant: 'positive' | 'negative' | 'neutral'; label: string }
> = {
  boost: { variant: 'positive', label: 'HR Boost' },
  suppress: { variant: 'negative', label: 'HR Suppress' },
  neutral: { variant: 'neutral', label: 'Neutral' },
};

const COLUMNS: { key: SortKey; label: string; align: 'left' | 'center' | 'right' }[] = [
  { key: 'player', label: 'Player', align: 'left' },
  { key: 'prop', label: 'Prop', align: 'left' },
  { key: 'line', label: 'Line', align: 'center' },
  { key: 'edge', label: 'Edge%', align: 'right' },
  { key: 'hitRate', label: 'Hit Rate', align: 'right' },
  { key: 'windImpact', label: 'Weather Impact', align: 'center' },
  { key: 'confidence', label: 'Confidence', align: 'center' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PropCheatsheetPage() {
  const router = useRouter();

  const [props, setProps] = useState<PlayerProp[]>([]);
  const [weatherMap, setWeatherMap] = useState<Record<string, 'boost' | 'suppress' | 'neutral'>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('edge');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch props
      const rawProps = await apiClient.getPropLines('');
      const propsData: PlayerProp[] =
        Array.isArray(rawProps) && rawProps.length > 0
          ? rawProps
          : (mockPlayerProps as unknown as PlayerProp[]);

      // Fetch weather for each unique venue — build gameId → windImpact map
      // mockWeather already has gameId, so use it as fallback directly
      const weatherResults = await Promise.all(
        mockWeather.map((wx) => apiClient.getWeather(wx.venue))
      );
      const liveWeather: WeatherCondition[] = weatherResults.filter(Boolean) as WeatherCondition[];
      const weatherSource: { gameId: string; windImpact: 'boost' | 'suppress' | 'neutral' }[] =
        liveWeather.length > 0 ? liveWeather : mockWeather;

      const map: Record<string, 'boost' | 'suppress' | 'neutral'> = {};
      for (const wx of weatherSource) {
        map[wx.gameId] = wx.windImpact;
      }

      setProps(propsData);
      setWeatherMap(map);
    } catch (err) {
      console.error('[PropCheatsheetPage] fetch error:', err);
      setProps(mockPlayerProps as unknown as PlayerProp[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Sort ───────────────────────────────────────────────────────────────────

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'edge' ? 'desc' : 'asc');
    }
  };

  const sorted = useMemo(() => {
    return [...props].sort((a, b) => {
      let aVal: string | number | null = null;
      let bVal: string | number | null = null;

      switch (sortKey) {
        case 'player':
          aVal = a.player;
          bVal = b.player;
          break;
        case 'prop':
          aVal = a.prop;
          bVal = b.prop;
          break;
        case 'line':
          aVal = a.line;
          bVal = b.line;
          break;
        case 'edge':
          aVal = a.edge ?? -999;
          bVal = b.edge ?? -999;
          break;
        case 'hitRate':
          aVal = a.hitRate ?? 0;
          bVal = b.hitRate ?? 0;
          break;
        case 'windImpact': {
          const order = { boost: 2, neutral: 1, suppress: 0 };
          aVal = order[weatherMap[a.gameId] ?? 'neutral'] ?? 1;
          bVal = order[weatherMap[b.gameId] ?? 'neutral'] ?? 1;
          break;
        }
        case 'confidence': {
          const order = { high: 2, medium: 1, low: 0 };
          const ac = deriveConfidence(a.edge);
          const bc = deriveConfidence(b.edge);
          aVal = ac ? order[ac] : -1;
          bVal = bc ? order[bc] : -1;
          break;
        }
      }

      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [props, sortKey, sortDir, weatherMap]);

  // ── Row click ──────────────────────────────────────────────────────────────

  const handleRowClick = (prop: PlayerProp) => {
    router.push(`/prop-analyzer?player=${prop.playerId}`);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Prop Cheatsheet" subtitle="Quick-reference prop summary for today's slate" />
      <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-4">
        <SectionHeader
          title="Today's Prop Cheatsheet"
          subtitle={today}
          actions={
            <span className="text-xs text-muted-foreground font-mono-data">
              {loading ? 'Loading…' : `${sorted.length} props`}
            </span>
          }
        />

        <div className="card-surface overflow-hidden">
          <table className="w-full text-xs">
            {/* Header */}
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`px-2 py-2 font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground transition-colors select-none
                      ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUp size={10} className="text-primary" />
                        ) : (
                          <ArrowDown size={10} className="text-primary" />
                        )
                      ) : (
                        <ArrowUpDown size={10} className="text-muted-foreground/40" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                // Skeleton rows
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="border-b border-border/50">
                    {COLUMNS.map((col) => (
                      <td key={col.key} className="px-2 py-2">
                        <div
                          className="h-3 bg-muted rounded animate-pulse"
                          style={{ width: col.key === 'player' ? '120px' : '60px' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No props available for today&apos;s slate.
                  </td>
                </tr>
              ) : (
                sorted.map((p) => {
                  const windImpact = weatherMap[p.gameId] ?? 'neutral';
                  const windBadge = WIND_IMPACT_BADGE[windImpact];
                  const confidence = deriveConfidence(p.edge);
                  const confBadge = confidence ? CONFIDENCE_BADGE[confidence] : null;
                  const edgeColor =
                    (p.edge ?? 0) >= 5
                      ? 'text-positive font-bold'
                      : (p.edge ?? 0) < 0
                        ? 'text-negative'
                        : 'text-muted-foreground';

                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleRowClick(p)}
                      className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
                    >
                      {/* Player */}
                      <td className="px-2 py-2 font-medium text-foreground whitespace-nowrap">
                        {p.player}
                        <span className="ml-1.5 text-muted-foreground font-normal">{p.team}</span>
                      </td>

                      {/* Prop */}
                      <td className="px-2 py-2 text-muted-foreground">{p.prop}</td>

                      {/* Line */}
                      <td className="px-2 py-2 text-center font-mono-data">{p.line}</td>

                      {/* Edge% */}
                      <td className={`px-2 py-2 text-right font-mono-data ${edgeColor}`}>
                        {formatEV(p.edge)}
                      </td>

                      {/* Hit Rate */}
                      <td className="px-2 py-2 text-right font-mono-data text-muted-foreground">
                        {formatAvg(p.hitRate)}
                      </td>

                      {/* Weather Impact */}
                      <td className="px-2 py-2 text-center">
                        <StatusBadge variant={windBadge.variant}>{windBadge.label}</StatusBadge>
                      </td>

                      {/* Confidence */}
                      <td className="px-2 py-2 text-center">
                        {confBadge ? (
                          <StatusBadge variant={confBadge.variant}>{confBadge.label}</StatusBadge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Footer */}
          {!loading && (
            <div className="px-3 py-2.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono-data">
                {sorted.length} props — sorted by {sortKey} {sortDir}
              </span>
              <span>Click any row to open in Prop Analyzer</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
