'use client';
import React, { useEffect, useState } from 'react';
import { Wind, Thermometer, Eye, Droplets, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

interface WeatherData {
  venue: string;
  city: string;
  temp: number;
  feelsLike?: number;
  windSpeed: number;
  windDir: string;
  humidity: number;
  condition: string;
  precipitation?: number;
  windAlert: boolean;
  windImpact?: string;
  parkFactors?: {
    runFactor: number;
    hrFactor: number;
    hitFactor: number;
    soFactor: number;
    bbFactor: number;
    surface: string;
    roofType: string;
    dimensions: string;
  } | null;
  fallback?: boolean;
  error?: string;
}

interface MatchupWeatherStripProps {
  venueId?: string;
}

const VENUE_OPTIONS = [
  { id: 'yankee-stadium',   label: 'Yankee Stadium (NYY)' },
  { id: 'dodger-stadium',   label: 'Dodger Stadium (LAD)' },
  { id: 'fenway-park',      label: 'Fenway Park (BOS)' },
  { id: 'wrigley-field',    label: 'Wrigley Field (CHC)' },
  { id: 'truist-park',      label: 'Truist Park (ATL)' },
  { id: 'minute-maid-park', label: 'Minute Maid Park (HOU)' },
  { id: 'oracle-park',      label: 'Oracle Park (SF)' },
  { id: 'petco-park',       label: 'Petco Park (SD)' },
  { id: 'coors-field',      label: 'Coors Field (COL)' },
  { id: 'camden-yards',     label: 'Camden Yards (BAL)' },
];

export default function MatchupWeatherStrip({ venueId = 'yankee-stadium' }: MatchupWeatherStripProps) {
  const [selectedVenue, setSelectedVenue] = useState(venueId);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchWeather(venue: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?venue=${venue}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: WeatherData = await res.json();
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchWeather(selectedVenue); }, [selectedVenue]);

  return (
    <div className="space-y-3">
      {/* Venue selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          Venue
        </label>
        <select
          value={selectedVenue}
          onChange={e => setSelectedVenue(e.target.value)}
          className="flex-1 max-w-xs px-3 py-1.5 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {VENUE_OPTIONS.map(v => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </select>
        <button
          onClick={() => fetchWeather(selectedVenue)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Refresh weather"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <div className="card-surface p-4 flex items-center gap-3 text-sm text-negative">
          <AlertTriangle size={16} />
          <span>Weather unavailable: {error}</span>
          <button onClick={() => fetchWeather(selectedVenue)} className="ml-auto text-xs underline">Retry</button>
        </div>
      ) : weather ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Weather card */}
          <div className="card-surface p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{weather.venue}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin size={11} /> {weather.city}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {weather.fallback && (
                  <StatusBadge variant="default">Estimated</StatusBadge>
                )}
                {weather.windAlert && (
                  <StatusBadge variant="warning" dot>Wind Alert</StatusBadge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Thermometer size={13} />
                  <span className="text-xs">Temp</span>
                </div>
                <span className="font-mono-data text-lg font-bold text-foreground">{weather.temp}°F</span>
                {weather.feelsLike && (
                  <span className="text-xs text-muted-foreground">Feels {weather.feelsLike}°F</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Wind size={13} />
                  <span className="text-xs">Wind</span>
                </div>
                <span className={`font-mono-data text-lg font-bold ${weather.windAlert ? 'text-warning' : 'text-foreground'}`}>
                  {weather.windSpeed} mph
                </span>
                <span className="text-xs text-muted-foreground">{weather.windDir}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Droplets size={13} />
                  <span className="text-xs">Humidity</span>
                </div>
                <span className="font-mono-data text-lg font-bold text-foreground">{weather.humidity}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Eye size={13} />
                  <span className="text-xs">Condition</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{weather.condition}</span>
              </div>
            </div>

            {weather.windAlert && (
              <div className="mt-3 flex items-start gap-2 p-2.5 rounded-md bg-warning-subtle border border-warning/30">
                <AlertTriangle size={13} className="text-warning flex-shrink-0 mt-0.5" />
                <p className="text-xs text-warning">
                  Wind blowing {weather.windSpeed} mph {weather.windDir} —{' '}
                  {weather.windImpact === 'boost' ?'elevated HR environment. Adjust fly ball props upward.' :'suppressed HR environment. Adjust fly ball props downward.'}
                </p>
              </div>
            )}
          </div>

          {/* Park factors card */}
          {weather.parkFactors ? (
            <div className="card-surface p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Park Factors</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {weather.venue} · {weather.parkFactors.dimensions}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{weather.parkFactors.surface}</span>
                  <span>·</span>
                  <span>{weather.parkFactors.roofType}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: 'Run',  value: weather.parkFactors.runFactor  },
                  { label: 'HR',   value: weather.parkFactors.hrFactor   },
                  { label: 'Hit',  value: weather.parkFactors.hitFactor  },
                  { label: 'K',    value: weather.parkFactors.soFactor   },
                  { label: 'BB',   value: weather.parkFactors.bbFactor   },
                ].map((f) => {
                  const isHigh = f.value >= 108;
                  const isLow  = f.value <= 95;
                  return (
                    <div key={f.label} className="flex flex-col items-center gap-1 p-2 rounded-md bg-muted/50">
                      <span className="text-xs text-muted-foreground">{f.label}</span>
                      <span className={`font-mono-data text-xl font-bold ${isHigh ? 'text-positive' : isLow ? 'text-negative' : 'text-foreground'}`}>
                        {f.value}
                      </span>
                      <span className={`text-xs font-semibold ${isHigh ? 'text-positive' : isLow ? 'text-negative' : 'text-muted-foreground'}`}>
                        {isHigh ? '▲ Hitter' : isLow ? '▼ Pitcher' : '— Neutral'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Park factors indexed to 100 (neutral). Values above 100 favor hitters, below 100 favor pitchers.
                  {weather.parkFactors.hrFactor >= 108 && (
                    <> HR factor of <span className="font-mono-data text-positive font-semibold">{weather.parkFactors.hrFactor}</span> significantly elevates HR prop value.</>
                  )}
                  {weather.parkFactors.hrFactor <= 95 && (
                    <> HR factor of <span className="font-mono-data text-negative font-semibold">{weather.parkFactors.hrFactor}</span> suppresses HR prop value.</>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="card-surface p-4 flex items-center justify-center text-sm text-muted-foreground">
              Park factor data unavailable for this venue.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}