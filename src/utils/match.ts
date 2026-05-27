import {
  DEFAULT_ROUND_COUNT,
  MAX_ROUND_COUNT,
  MIN_ROUND_COUNT,
} from '../constants/scoring';
import type { Match, PlayerId } from '../types';
import { defaultMatchName } from './format';
import { createId } from './ids';
import { createEmptyRounds } from './scoring';

export function clampRoundCount(value: number): number {
  return Math.min(
    MAX_ROUND_COUNT,
    Math.max(MIN_ROUND_COUNT, Math.round(value)),
  );
}

export function createMatch(params: {
  name: string;
  playerIds: PlayerId[];
  roundCount: number;
}): Match {
  const roundCount = clampRoundCount(params.roundCount);
  const name = params.name.trim() || defaultMatchName();

  return {
    id: createId(),
    name,
    playerIds: params.playerIds,
    roundCount,
    rounds: createEmptyRounds(params.playerIds, roundCount),
    status: 'active',
    createdAt: new Date().toISOString(),
  };
}

export function getDefaultRoundCount(): number {
  return DEFAULT_ROUND_COUNT;
}
