/**
 * formatters.ts — shared display formatters for MLB stats and betting lines.
 * TODO: Extend with locale-aware formatters if internationalizing.
 */

export function formatAvg(val: number | null | undefined): string {
  if (val == null) return '—';
  return val.toFixed(3).replace(/^0/, '');
}

export function formatPct(val: number | null | undefined): string {
  if (val == null) return '—';
  return `${(val * 100).toFixed(1)}%`;
}

export function formatERA(val: number | null | undefined): string {
  if (val == null) return '—';
  return val.toFixed(2);
}

export function formatOdds(val: number | null | undefined): string {
  if (val == null) return '—';
  return val > 0 ? `+${val}` : `${val}`;
}

export function formatLine(val: number | null | undefined): string {
  if (val == null) return '—';
  return val > 0 ? `o${val}` : `u${Math.abs(val)}`;
}

export function formatEV(val: number | null | undefined): string {
  if (val == null) return '—';
  const sign = val >= 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}

export function formatWOBA(val: number | null | undefined): string {
  if (val == null) return '—';
  return val.toFixed(3);
}

export function formatMPH(val: number | null | undefined): string {
  if (val == null) return '—';
  return `${val.toFixed(1)} mph`;
}