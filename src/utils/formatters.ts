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

/**
 * Convert an MLB game time to Eastern display time, e.g. "10:10 PM ET".
 *
 * The live MLB schedule returns `gameTime` as a UTC ISO string
 * (e.g. "2026-06-08T20:10:00Z"); the mock seed already uses display strings
 * ("1:05 PM") and status sentinels ("LIVE", "F"). This function formats ISO
 * inputs to America/New_York and passes through anything already human-readable.
 */
export function formatGameTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  // Only treat as a real timestamp if it parses AND looks ISO-like (has a 'T').
  if (value.includes('T') && !Number.isNaN(d.getTime())) {
    const t = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York',
    });
    return `${t} ET`;
  }
  return value;
}
