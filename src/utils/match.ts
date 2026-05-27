import { MAX_COMPLETED_MATCHES } from '../constants/storage';
import {
  DEFAULT_ROUND_COUNT,
  MAX_ROUND_COUNT,
  MIN_ROUND_COUNT,
} from '../constants/scoring';
import type { AppState, Match, PlayerId } from '../types';
import { hasAnyScoresEntered } from './scoring';
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

export function abandonActiveMatch(state: AppState): AppState {
  if (!state.activeMatchId) {
    return state;
  }

  const active = state.matches.find(
    (match) => match.id === state.activeMatchId && match.status === 'active',
  );

  if (!active) {
    return { ...state, activeMatchId: null };
  }

  if (!hasAnyScoresEntered(active)) {
    return {
      ...state,
      matches: state.matches.filter((match) => match.id !== active.id),
      activeMatchId: null,
    };
  }

  const completedAt = new Date().toISOString();
  const matches = state.matches.map((match) =>
    match.id === active.id
      ? {
          ...match,
          status: 'completed' as const,
          completedAt,
          name: `${match.name} (megszakítva)`,
        }
      : match,
  );

  return {
    ...state,
    matches: pruneCompletedMatches(matches),
    activeMatchId: null,
  };
}
