'use client';

import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Percent } from 'lucide-react';

interface EdgeCalcResult {
  impliedProb: number;
  fairOdds: number;
  ev: number;
  kellyPct: number;
  recommendation: string;
  variant: 'positive' | 'negative' | 'neutral';
}

function americanToDecimal(odds: number): number {
  if (odds > 0) return odds / 100 + 1;
  return 100 / Math.abs(odds) + 1;
}

function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) return Math.round((decimal - 1) * 100);
  return Math.round(-100 / (decimal - 1));
}

function calcEdge(modelProb: number, bookOdds: number): EdgeCalcResult {
  const decimal = americanToDecimal(bookOdds);
  const impliedProb = 1 / decimal;
  const ev = (modelProb - impliedProb) / impliedProb * 100;
  const fairDecimal = 1 / modelProb;
  const fairOdds = decimalToAmerican(fairDecimal);
  // Kelly criterion: f = (bp - q) / b where b = decimal-1, p = modelProb, q = 1-p
  const b = decimal - 1;
  const kelly = (b * modelProb - (1 - modelProb)) / b;
  const kellyPct = Math.max(0, kelly * 100);

  let recommendation = 'No edge';
  let variant: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (ev >= 5) { recommendation = 'Strong play'; variant = 'positive'; }
  else if (ev >= 2) { recommendation = 'Lean play'; variant = 'positive'; }
  else if (ev <= -5) { recommendation = 'Strong fade'; variant = 'negative'; }
  else if (ev <= -2) { recommendation = 'Lean fade'; variant = 'negative'; }

  return { impliedProb: impliedProb * 100, fairOdds, ev, kellyPct, recommendation, variant };
}

export default function EdgeCalculator() {
  const [modelProb, setModelProb] = useState('55');
  const [bookOdds, setBookOdds] = useState('-110');
  const [bankroll, setBankroll] = useState('1000');
  const [result, setResult] = useState<EdgeCalcResult | null>(null);

  const calculate = () => {
    const prob = parseFloat(modelProb) / 100;
    const odds = parseInt(bookOdds, 10);
    if (isNaN(prob) || isNaN(odds) || prob <= 0 || prob >= 1) return;
    setResult(calcEdge(prob, odds));
  };

  const betSize = result && bankroll ? (result.kellyPct / 100 * parseFloat(bankroll) * 0.25).toFixed(2) : null;

  return (
    <div className="card-surface p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Calculator size={16} className="text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Edge Calculator</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Model Win Prob %
          </label>
          <input
            type="number"
            value={modelProb}
            onChange={(e) => setModelProb(e.target.value)}
            min="1" max="99" step="0.5"
            placeholder="55"
            className="w-full px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Book Odds (American)
          </label>
          <input
            type="number"
            value={bookOdds}
            onChange={(e) => setBookOdds(e.target.value)}
            placeholder="-110"
            className="w-full px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Bankroll ($)
          </label>
          <input
            type="number"
            value={bankroll}
            onChange={(e) => setBankroll(e.target.value)}
            placeholder="1000"
            className="w-full px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full sm:w-auto px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        Calculate Edge
      </button>

      {result && (
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border ${result.variant === 'positive' ? 'bg-positive/5 border-positive/20' : result.variant === 'negative' ? 'bg-negative/5 border-negative/20' : 'bg-muted/30 border-border'}`}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Percent size={12} /><span className="text-xs">Implied Prob</span>
            </div>
            <span className="font-mono-data text-lg font-bold text-foreground">{result.impliedProb.toFixed(1)}%</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp size={12} /><span className="text-xs">EV%</span>
            </div>
            <span className={`font-mono-data text-lg font-bold ${result.variant === 'positive' ? 'text-positive' : result.variant === 'negative' ? 'text-negative' : 'text-foreground'}`}>
              {result.ev >= 0 ? '+' : ''}{result.ev.toFixed(1)}%
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calculator size={12} /><span className="text-xs">Fair Odds</span>
            </div>
            <span className="font-mono-data text-lg font-bold text-foreground">
              {result.fairOdds > 0 ? '+' : ''}{result.fairOdds}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign size={12} /><span className="text-xs">Kelly Bet</span>
            </div>
            <span className="font-mono-data text-lg font-bold text-foreground">
              {betSize ? `$${betSize}` : '—'}
            </span>
            <span className="text-xs text-muted-foreground">25% Kelly</span>
          </div>
          <div className="col-span-2 sm:col-span-4 pt-2 border-t border-border/50">
            <span className={`text-sm font-semibold ${result.variant === 'positive' ? 'text-positive' : result.variant === 'negative' ? 'text-negative' : 'text-muted-foreground'}`}>
              {result.recommendation}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              Kelly: {result.kellyPct.toFixed(1)}% of bankroll
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
