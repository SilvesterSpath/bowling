import { MAX_SCORE_PER_ROUND, MIN_SCORE_PER_ROUND } from '../constants/scoring';
import { STORAGE_KEY } from '../constants/storage';
import type {
  AppState,
  Match,
  Player,
  PlayerTitle,
  Round,
  RoundScore,
  Tournament,
  TournamentBracketRound,
  TournamentDuel,
} from '../types';
import {
  MAX_TOURNAMENT_DUEL_ROUNDS,
  MIN_TOURNAMENT_DUEL_ROUNDS,
} from '../constants/tournament';
import { enforceSessionExclusivity } from '../utils/tournament';
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
    titles: normalizePlayerTitles(match.titles),
  };
}

function normalizePlayerTitles(raw: unknown): PlayerTitle[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }
  const titles: PlayerTitle[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const title = item as Partial<PlayerTitle>;
    if (
      typeof title.playerId !== 'string' ||
      typeof title.key !== 'string' ||
      typeof title.label !== 'string'
    ) {
      continue;
    }
    titles.push({
      playerId: title.playerId,
      key: title.key,
      label: title.label.trim(),
      subtitle:
        typeof title.subtitle === 'string' ? title.subtitle : undefined,
    });
  }
  return titles.length > 0 ? titles : undefined;
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

function normalizeDuelStatus(raw: unknown): TournamentDuel['status'] | null {
  if (raw === 'pending' || raw === 'active' || raw === 'completed') {
    return raw;
  }
  return null;
}

function normalizeDuel(raw: unknown): TournamentDuel | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const duel = raw as Partial<TournamentDuel>;
  const status = normalizeDuelStatus(duel.status);
  if (
    typeof duel.id !== 'string' ||
    typeof duel.playerAId !== 'string' ||
    typeof duel.playerBId !== 'string' ||
    status === null
  ) {
    return null;
  }

  const playerIds = [duel.playerAId, duel.playerBId];
  const rounds: Round[] = [];
  if (Array.isArray(duel.rounds)) {
    for (const round of duel.rounds) {
      const normalized = normalizeRound(round, playerIds);
      if (normalized) {
        rounds.push(normalized);
      }
    }
  }

  const tieBreakRounds: Round[] = [];
  if (Array.isArray(duel.tieBreakRounds)) {
    for (const round of duel.tieBreakRounds) {
      const normalized = normalizeRound(round, playerIds);
      if (normalized) {
        tieBreakRounds.push(normalized);
      }
    }
  }

  return {
    id: duel.id,
    playerAId: duel.playerAId,
    playerBId: duel.playerBId,
    rounds,
    winnerId: typeof duel.winnerId === 'string' ? duel.winnerId : null,
    status,
    tieBreakRounds: tieBreakRounds.length > 0 ? tieBreakRounds : undefined,
  };
}

function normalizeBracketRound(raw: unknown): TournamentBracketRound | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const round = raw as Partial<TournamentBracketRound>;
  if (
    typeof round.index !== 'number' ||
    typeof round.label !== 'string' ||
    !Array.isArray(round.duels)
  ) {
    return null;
  }

  const duels = round.duels
    .map(normalizeDuel)
    .filter((duel): duel is TournamentDuel => duel !== null);

  return {
    index: round.index,
    label: round.label.trim(),
    duels,
    byePlayerId:
      typeof round.byePlayerId === 'string' ? round.byePlayerId : undefined,
  };
}

function normalizeTournament(raw: unknown): Tournament | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const tournament = raw as Partial<Tournament>;
  if (
    typeof tournament.id !== 'string' ||
    typeof tournament.name !== 'string' ||
    !Array.isArray(tournament.playerIds) ||
    typeof tournament.roundsPerDuel !== 'number' ||
    (tournament.status !== 'active' && tournament.status !== 'completed') ||
    typeof tournament.currentRoundIndex !== 'number' ||
    typeof tournament.createdAt !== 'string'
  ) {
    return null;
  }

  const playerIds = tournament.playerIds.filter(
    (id): id is string => typeof id === 'string',
  );

  const bracketRounds = (
    Array.isArray(tournament.bracketRounds) ? tournament.bracketRounds : []
  )
    .map(normalizeBracketRound)
    .filter((round): round is TournamentBracketRound => round !== null);

  const roundsPerDuel = Math.min(
    MAX_TOURNAMENT_DUEL_ROUNDS,
    Math.max(MIN_TOURNAMENT_DUEL_ROUNDS, Math.round(tournament.roundsPerDuel)),
  );

  return {
    id: tournament.id,
    name: tournament.name.trim(),
    playerIds,
    roundsPerDuel,
    status: tournament.status,
    currentRoundIndex: tournament.currentRoundIndex,
    activeDuelId:
      typeof tournament.activeDuelId === 'string'
        ? tournament.activeDuelId
        : null,
    bracketRounds,
    championId:
      typeof tournament.championId === 'string'
        ? tournament.championId
        : undefined,
    createdAt: tournament.createdAt,
    completedAt:
      typeof tournament.completedAt === 'string'
        ? tournament.completedAt
        : undefined,
    titles: normalizePlayerTitles(tournament.titles),
  };
}

function normalizeState(state: AppState): AppState {
  const players = state.players
    .map(normalizePlayer)
    .filter(
      (player): player is Player => player !== null && player.name.length > 0,
    );

  const matches = state.matches
    .map(normalizeMatch)
    .filter((match): match is Match => match !== null);

  const tournaments = state.tournaments
    .map(normalizeTournament)
    .filter((tournament): tournament is Tournament => tournament !== null);

  const activeMatchId =
    state.activeMatchId &&
    matches.some(
      (match) => match.id === state.activeMatchId && match.status === 'active',
    )
      ? state.activeMatchId
      : null;

  const activeTournamentId =
    state.activeTournamentId &&
    tournaments.some(
      (tournament) =>
        tournament.id === state.activeTournamentId &&
        tournament.status === 'active',
    )
      ? state.activeTournamentId
      : null;

  const normalized: AppState = {
    schemaVersion: state.schemaVersion,
    players,
    matches,
    tournaments,
    activeMatchId,
    activeTournamentId,
  };

  return enforceSessionExclusivity(normalized);
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
