import { NextRequest, NextResponse } from 'next/server';

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data as T;
  return null;
}
function setCached(key: string, data: unknown) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

// Open-Meteo free weather API (no key required)
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// MLB venue coordinates
const VENUE_COORDS: Record<string, { lat: number; lon: number; name: string; city: string }> = {
  'yankee-stadium':    { lat: 40.8296, lon: -73.9262, name: 'Yankee Stadium',    city: 'Bronx, NY' },
  'dodger-stadium':    { lat: 34.0739, lon: -118.2400, name: 'Dodger Stadium',   city: 'Los Angeles, CA' },
  'fenway-park':       { lat: 42.3467, lon: -71.0972, name: 'Fenway Park',       city: 'Boston, MA' },
  'wrigley-field':     { lat: 41.9484, lon: -87.6553, name: 'Wrigley Field',     city: 'Chicago, IL' },
  'truist-park':       { lat: 33.8908, lon: -84.4678, name: 'Truist Park',       city: 'Cumberland, GA' },
  'minute-maid-park':  { lat: 29.7573, lon: -95.3555, name: 'Minute Maid Park', city: 'Houston, TX' },
  'oracle-park':       { lat: 37.7786, lon: -122.3893, name: 'Oracle Park',      city: 'San Francisco, CA' },
  'petco-park':        { lat: 32.7076, lon: -117.1570, name: 'Petco Park',       city: 'San Diego, CA' },
  'coors-field':       { lat: 39.7559, lon: -104.9942, name: 'Coors Field',      city: 'Denver, CO' },
  'camden-yards':      { lat: 39.2838, lon: -76.6218, name: 'Camden Yards',      city: 'Baltimore, MD' },
};

// Park factors (3-year averages, indexed to 100)
const PARK_FACTORS: Record<string, { runFactor: number; hrFactor: number; hitFactor: number; soFactor: number; bbFactor: number; surface: string; roofType: string; dimensions: string }> = {
  'yankee-stadium':   { runFactor: 108, hrFactor: 121, hitFactor: 103, soFactor: 97,  bbFactor: 101, surface: 'Natural Grass', roofType: 'Open',   dimensions: 'LF 318 · CF 408 · RF 314' },
  'dodger-stadium':   { runFactor: 96,  hrFactor: 91,  hitFactor: 98,  soFactor: 103, bbFactor: 98,  surface: 'Natural Grass', roofType: 'Open',   dimensions: 'LF 330 · CF 395 · RF 330' },
  'fenway-park':      { runFactor: 104, hrFactor: 98,  hitFactor: 108, soFactor: 96,  bbFactor: 102, surface: 'Natural Grass', roofType: 'Open',   dimensions: 'LF 310 · CF 420 · RF 302' },
  'wrigley-field':    { runFactor: 112, hrFactor: 118, hitFactor: 106, soFactor: 94,  bbFactor: 103, surface: 'Natural Grass', roofType: 'Open',   dimensions: 'LF 355 · CF 400 · RF 353' },
  'truist-park':      { runFactor: 102, hrFactor: 105, hitFactor: 101, soFactor: 99,  bbFactor: 100, surface: 'Natural Grass', roofType: 'Open',   dimensions: 'LF 335 · CF 400 · RF 325' },
  'minute-maid-park': { runFactor: 102, hrFactor: 108, hitFactor: 101, soFactor: 99,  bbFactor: 100, surface: 'Natural Grass', roofType: 'Retractable', dimensions: 'LF 315 · CF 435 · RF 326' },
  'oracle-park':      { runFactor: 91,  hrFactor: 82,  hitFactor: 94,  soFactor: 105, bbFactor: 97,  surface: 'Natural Grass', roofType: 'Open',   dimensions: 'LF 339 · CF 399 · RF 309' },
  'petco-park':       { runFactor: 93,  hrFactor: 88,  hitFactor: 96,  soFactor: 104, bbFactor: 98,  surface: 'Natural Grass', roofType: 'Open',   dimensions: 'LF 336 · CF 396 · RF 322' },
  'coors-field':      { runFactor: 121, hrFactor: 116, hitFactor: 118, soFactor: 91,  bbFactor: 106, surface: 'Natural Grass', roofType: 'Open',   dimensions: 'LF 347 · CF 415 · RF 350' },
  'camden-yards':     { runFactor: 105, hrFactor: 112, hitFactor: 103, soFactor: 98,  bbFactor: 101, surface: 'Natural Grass', roofType: 'Open',   dimensions: 'LF 333 · CF 400 · RF 318' },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venue = searchParams.get('venue') || 'yankee-stadium';
  const cacheKey = `weather:${venue}`;

  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json({ ...cached as object, cached: true });

  const coords = VENUE_COORDS[venue];
  const parkData = PARK_FACTORS[venue];

  if (!coords) {
    return NextResponse.json({ error: `Unknown venue: ${venue}` }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${WEATHER_API}?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,precipitation&wind_speed_unit=mph&temperature_unit=fahrenheit&timezone=auto`,
      { next: { revalidate: 900 } }
    );
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
    const json = await res.json();
    const cur = json.current ?? {};

    const windDeg = cur.wind_direction_10m ?? 0;
    const windDirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const windDir = windDirs[Math.round(windDeg / 45) % 8];
    const windSpeed = Math.round(cur.wind_speed_10m ?? 0);
    const temp = Math.round(cur.temperature_2m ?? 72);
    const humidity = cur.relative_humidity_2m ?? 50;
    const precip = cur.precipitation ?? 0;

    const wmoToCondition: Record<number, string> = {
      0: 'Clear', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Foggy', 51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
      61: 'Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Snow', 73: 'Snow',
      80: 'Showers', 81: 'Showers', 82: 'Heavy Showers', 95: 'Thunderstorm',
    };
    const condition = wmoToCondition[cur.weather_code ?? 0] ?? 'Clear';

    const windImpact = windSpeed >= 12 ? (windDir.includes('N') || windDir === 'NE' ? 'boost' : 'suppress') : 'neutral';

    const result = {
      venue: coords.name,
      city: coords.city,
      temp,
      feelsLike: temp - Math.round(windSpeed * 0.1),
      windSpeed,
      windDir: `${windDir} at ${windSpeed} mph`,
      humidity,
      condition,
      precipitation: precip,
      windAlert: windSpeed >= 12,
      parkFactors: parkData ?? null,
      windImpact,
      fetchedAt: new Date().toISOString(),
    };

    setCached(cacheKey, result);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({
      venue: coords.name,
      city: coords.city,
      temp: 72,
      feelsLike: 70,
      windSpeed: 8,
      windDir: 'SW at 8 mph',
      humidity: 55,
      condition: 'Partly Cloudy',
      precipitation: 0,
      windAlert: false,
      parkFactors: parkData ?? null,
      windImpact: 'neutral',
      fetchedAt: new Date().toISOString(),
      error: message,
      fallback: true,
    });
  }
}
