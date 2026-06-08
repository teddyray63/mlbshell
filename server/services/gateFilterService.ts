/**
 * gateFilterService — runs today's prop slate through the Six-Gate Filter
 * System and produces a PropVerdict[] for the /gate-filter page.
 *
 * Reuses the real prop-calculation engine (propCalculationService) and live
 * Baseball Savant metrics (statcastService) for the data backbone, then defers
 * to the pure gate evaluator in shared/gateLogic.
 */

import { calculateProps } from './propCalculationService';
import { statcastService } from './statcastService';
import { enrichCalculation } from '../../shared/enrich';
import { buildGateVerdicts } from '../../shared/gateLogic';
import {
  mockPlayerPropInputs,
  mockGameList,
  mockWeatherList,
  mockPlayerEnrichment,
} from '../../shared/mockSeed';
import type { BatterStatcast, PropVerdict } from '../../shared/types';

export async function getGateVerdicts(): Promise<PropVerdict[]> {
  const calcs = calculateProps(mockPlayerPropInputs, mockGameList, mockWeatherList);

  let liveById: Record<string, BatterStatcast> = {};
  try {
    const board = await statcastService.getBatterLeaderboard();
    liveById = Object.fromEntries(board.map((b) => [b.playerId, b]));
  } catch {
    /* best-effort live enrichment */
  }

  const enriched = calcs.map((c) => {
    const enr = mockPlayerEnrichment[c.playerId];
    const live = enr ? liveById[enr.mlbId] : undefined;
    return enrichCalculation(c, enr, live);
  });

  return buildGateVerdicts(enriched, mockWeatherList, mockGameList);
}

export default { getGateVerdicts };
