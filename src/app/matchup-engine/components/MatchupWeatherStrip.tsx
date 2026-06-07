import React from 'react';
import { Wind, Thermometer, Eye, Droplets, MapPin, AlertTriangle } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

// TODO: Replace with real weather/park data from analyticsService.fetchWeatherAndPark()
const mockWeather = {
  venue: 'Yankee Stadium',
  city: 'Bronx, NY',
  temp: 74,
  windSpeed: 14,
  windDir: 'Out to LF',
  humidity: 58,
  visibility: 10,
  condition: 'Partly Cloudy',
  windAlert: true,
};

const mockPark = {
  name: 'Yankee Stadium',
  parkId: 'nyy',
  runFactor: 108,
  hrFactor: 121,
  hitFactor: 103,
  soFactor: 97,
  bbFactor: 101,
  surface: 'Natural Grass',
  roofType: 'Open',
  dimensions: 'LF 318 · CF 408 · RF 314',
};

export default function MatchupWeatherStrip() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Weather card */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{mockWeather?.venue}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin size={11} /> {mockWeather?.city}
              </p>
            </div>
            {mockWeather?.windAlert && (
              <StatusBadge variant="warning" dot>
                Wind Alert
              </StatusBadge>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Thermometer size={13} />
                <span className="text-xs">Temp</span>
              </div>
              <span className="font-mono-data text-lg font-bold text-foreground">
                {mockWeather?.temp}°F
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wind size={13} />
                <span className="text-xs">Wind</span>
              </div>
              <span className="font-mono-data text-lg font-bold text-warning">
                {mockWeather?.windSpeed} mph
              </span>
              <span className="text-xs text-muted-foreground">{mockWeather?.windDir}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Droplets size={13} />
                <span className="text-xs">Humidity</span>
              </div>
              <span className="font-mono-data text-lg font-bold text-foreground">
                {mockWeather?.humidity}%
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Eye size={13} />
                <span className="text-xs">Visibility</span>
              </div>
              <span className="font-mono-data text-lg font-bold text-foreground">
                {mockWeather?.visibility} mi
              </span>
            </div>
          </div>

          {mockWeather?.windAlert && (
            <div className="mt-3 flex items-start gap-2 p-2.5 rounded-md bg-warning-subtle border border-warning/30">
              <AlertTriangle size={13} className="text-warning flex-shrink-0 mt-0.5" />
              <p className="text-xs text-warning">
                Wind blowing {mockWeather?.windSpeed} mph {mockWeather?.windDir} — elevated HR
                environment. Adjust fly ball props accordingly.
              </p>
            </div>
          )}
        </div>

        {/* Park factors card */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Park Factors</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mockPark?.name} · {mockPark?.dimensions}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{mockPark?.surface}</span>
              <span>·</span>
              <span>{mockPark?.roofType}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Run', value: mockPark?.runFactor, key: 'pf-run' },
              { label: 'HR', value: mockPark?.hrFactor, key: 'pf-hr' },
              { label: 'Hit', value: mockPark?.hitFactor, key: 'pf-hit' },
              { label: 'K', value: mockPark?.soFactor, key: 'pf-so' },
              { label: 'BB', value: mockPark?.bbFactor, key: 'pf-bb' },
            ]?.map((f) => {
              const isHigh = f?.value >= 108;
              const isLow = f?.value <= 95;
              return (
                <div
                  key={f?.key}
                  className="flex flex-col items-center gap-1 p-2 rounded-md bg-muted/50"
                >
                  <span className="text-xs text-muted-foreground">{f?.label}</span>
                  <span
                    className={`font-mono-data text-xl font-bold ${isHigh ? 'text-positive' : isLow ? 'text-negative' : 'text-foreground'}`}
                  >
                    {f?.value}
                  </span>
                  <span
                    className={`text-xs font-semibold ${isHigh ? 'text-positive' : isLow ? 'text-negative' : 'text-muted-foreground'}`}
                  >
                    {isHigh ? '▲ Hitter' : isLow ? '▼ Pitcher' : '— Neutral'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Park factors indexed to 100 (neutral). Values above 100 favor hitters, below 100 favor
              pitchers. HR factor of{' '}
              <span className="font-mono-data text-positive font-semibold">
                {mockPark?.hrFactor}
              </span>{' '}
              at Yankee Stadium significantly elevates HR prop value.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
