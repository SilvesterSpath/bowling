import { MAX_COMPLETED_MATCHES } from '../constants/storage';
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

export function pruneCompletedMatches(matches: Match[]): Match[] {
  const active = matches.filter((match) => match.status === 'active');
  const completed = matches
    .filter((match) => match.status === 'completed')
    .sort(
      (a, b) =>
        new Date(a.completedAt ?? a.createdAt).getTime() -
        new Date(b.completedAt ?? b.createdAt).getTime(),
    );

  if (completed.length <= MAX_COMPLETED_MATCHES) {
    return [...active, ...completed];
  }

  const kept = completed.slice(completed.length - MAX_COMPLETED_MATCHES);
  return [...active, ...kept];
}
