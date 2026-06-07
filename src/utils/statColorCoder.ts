/**
 * statColorCoder — global green/yellow/red heat-mapping for stat cells, matching
 * the propfinder.app style. Reused across matchup-engine, prop-analyzer,
 * player-props, prop-cheatsheet and visual-analytics.
 *
 *   getStatColor('barrelPct', 14, 'batter') → 'stat-green'
 *
 * "green" always means *good for the named perspective*:
 *   - type 'batter'  → green = good for the hitter (high wOBA, barrel%, …)
 *   - type 'pitcher' → green = good for the pitcher (low wOBA, high K%, …)
 */

export type StatColor = 'stat-green' | 'stat-yellow' | 'stat-red' | 'stat-neutral';
export type StatPerspective = 'batter' | 'pitcher';

/** Direction: 'high' → higher is greener; 'low' → lower is greener. */
interface Threshold {
  good: number; // >= good (for 'high') or <= good (for 'low') → green
  ok: number; // between ok and good → yellow; worse than ok → red
  dir: 'high' | 'low';
}

const BATTER: Record<string, Threshold> = {
  woba: { good: 0.37, ok: 0.32, dir: 'high' },
  xwoba: { good: 0.37, ok: 0.32, dir: 'high' },
  slg: { good: 0.5, ok: 0.4, dir: 'high' },
  ba: { good: 0.28, ok: 0.24, dir: 'high' },
  avg: { good: 0.28, ok: 0.24, dir: 'high' },
  iso: { good: 0.2, ok: 0.15, dir: 'high' },
  barrelpct: { good: 12, ok: 6, dir: 'high' },
  exitvelo: { good: 92, ok: 88, dir: 'high' },
  hardhitpct: { good: 45, ok: 35, dir: 'high' },
  whiffpct: { good: 20, ok: 30, dir: 'low' }, // low whiff = good for batter
  kpct: { good: 18, ok: 25, dir: 'low' },
  swstrpct: { good: 10, ok: 14, dir: 'low' },
  bbpct: { good: 10, ok: 7, dir: 'high' },
  obp: { good: 0.35, ok: 0.31, dir: 'high' },
  // HR-target oriented (green = juicier target for the hitter)
  hr9: { good: 1.4, ok: 1.0, dir: 'high' },
  absperhr: { good: 12, ok: 18, dir: 'low' },
  hrfbpct: { good: 14, ok: 11, dir: 'high' },
  flyballpct: { good: 40, ok: 33, dir: 'high' },
  pulledairpct: { good: 40, ok: 32, dir: 'high' },
};

const PITCHER: Record<string, Threshold> = {
  woba: { good: 0.29, ok: 0.34, dir: 'low' },
  baa: { good: 0.22, ok: 0.26, dir: 'low' },
  ba: { good: 0.22, ok: 0.26, dir: 'low' },
  slg: { good: 0.36, ok: 0.42, dir: 'low' },
  iso: { good: 0.13, ok: 0.17, dir: 'low' },
  kpct: { good: 28, ok: 22, dir: 'high' },
  whiffpct: { good: 32, ok: 24, dir: 'high' },
  bbpct: { good: 6, ok: 9, dir: 'low' },
  hr9: { good: 0.8, ok: 1.2, dir: 'low' },
  swstrpct: { good: 14, ok: 10, dir: 'high' },
  putawaypct: { good: 22, ok: 17, dir: 'high' },
  whip: { good: 1.1, ok: 1.3, dir: 'low' },
  k9: { good: 9.5, ok: 7.5, dir: 'high' },
  era: { good: 3.2, ok: 4.2, dir: 'low' },
  oba: { good: 0.22, ok: 0.26, dir: 'low' },
  brlpct: { good: 6, ok: 9, dir: 'low' },
};

/**
 * Returns the heat class for a stat value. `stat` is matched case-insensitively
 * and ignores non-alphanumerics, so 'Barrel%', 'barrelPct' and 'barrel_pct'
 * all resolve to the same threshold.
 */
export function getStatColor(
  stat: string,
  value: number | null | undefined,
  type: StatPerspective = 'batter'
): StatColor {
  if (value == null || Number.isNaN(value)) return 'stat-neutral';
  const key = stat.toLowerCase().replace(/[^a-z0-9]/g, '');
  const table = type === 'pitcher' ? PITCHER : BATTER;
  const t = table[key];
  if (!t) return 'stat-neutral';

  if (t.dir === 'high') {
    if (value >= t.good) return 'stat-green';
    if (value >= t.ok) return 'stat-yellow';
    return 'stat-red';
  }
  // dir === 'low'
  if (value <= t.good) return 'stat-green';
  if (value <= t.ok) return 'stat-yellow';
  return 'stat-red';
}

export default getStatColor;
