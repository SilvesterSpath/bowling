import { MAX_SCORE_PER_ROUND, MIN_SCORE_PER_ROUND } from '../constants/scoring';
import { STORAGE_KEY } from '../constants/storage';
import type { AppState, Match, Player, Round, RoundScore } from '../types';
import { defaultState } from './defaultState';
import { migrateState } from './migrate';

function clampScore(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return null;
  }
  if (n < MIN_SCORE_PER_ROUND || n > MAX_SCORE_PER_ROUND) {
    return null;
  }
  return n;
}

function normalizeRoundScore(raw: unknown): RoundScore | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const entry = raw as Partial<RoundScore>;
  if (typeof entry.playerId !== 'string') {
    return null;
  }
  return {
    playerId: entry.playerId,
    score: clampScore(entry.score),
  };
}

function normalizeRound(raw: unknown, playerIds: string[]): Round | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const round = raw as Partial<Round>;
  if (typeof round.index !== 'number' || !Array.isArray(round.scores)) {
    return null;
  }

  const byPlayer = new Map<string, RoundScore>();
  for (const scoreEntry of round.scores) {
    const normalized = normalizeRoundScore(scoreEntry);
    if (normalized) {
      byPlayer.set(normalized.playerId, normalized);
    }
  }

  return {
    index: round.index,
    scores: playerIds.map((playerId) => {
      const existing = byPlayer.get(playerId);
      return (
        existing ?? {
          playerId,
          score: null,
        }
      );
    }),
  };
}

function normalizeMatch(raw: unknown): Match | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const match = raw as Partial<Match>;
  if (
    typeof match.id !== 'string' ||
    typeof match.name !== 'string' ||
    !Array.isArray(match.playerIds) ||
    typeof match.roundCount !== 'number' ||
    typeof match.createdAt !== 'string' ||
    (match.status !== 'active' && match.status !== 'completed')
  ) {
    return null;
  }

  const playerIds = match.playerIds.filter(
    (id): id is string => typeof id === 'string',
  );

  const rounds: Round[] = [];
  if (Array.isArray(match.rounds)) {
    for (const round of match.rounds) {
      const normalized = normalizeRound(round, playerIds);
      if (normalized) {
        rounds.push(normalized);
      }
    }
  }

  return {
    id: match.id,
    name: match.name.trim(),
    playerIds,
    roundCount: match.roundCount,
    rounds,
    status: match.status,
    createdAt: match.createdAt,
    completedAt:
      typeof match.completedAt === 'string' ? match.completedAt : undefined,
    titles: Array.isArray(match.titles) ? match.titles : undefined,
  };
}

function normalizePlayer(raw: unknown): Player | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const player = raw as Partial<Player>;
  if (
    typeof player.id !== 'string' ||
    typeof player.name !== 'string' ||
    typeof player.createdAt !== 'string'
  ) {
    return null;
  }
  return {
    id: player.id,
    name: player.name.trim(),
    createdAt: player.createdAt,
  };
}

function normalizeState(state: AppState): AppState {
  const players = state.players
    .map(normalizePlayer)
    .filter((player): player is Player => player !== null && player.name.length > 0);

  const matches = state.matches
    .map(normalizeMatch)
    .filter((match): match is Match => match !== null);

  const activeMatchId =
    state.activeMatchId &&
    matches.some(
      (match) => match.id === state.activeMatchId && match.status === 'active',
    )
      ? state.activeMatchId
      : null;

  return {
    schemaVersion: state.schemaVersion,
    players,
    matches,
    activeMatchId,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState();
    }
    const parsed: unknown = JSON.parse(raw);
    return normalizeState(migrateState(parsed));
  } catch {
    return defaultState();
  }
}
