import {
  DEFAULT_TOURNAMENT_DUEL_ROUNDS,
  MAX_TOURNAMENT_DUEL_ROUNDS,
  MIN_TOURNAMENT_DUEL_ROUNDS,
} from '../constants/tournament';
import { MAX_COMPLETED_TOURNAMENTS } from '../constants/storage';
import type {
  AppState,
  DuelId,
  PlayerId,
  Round,
  Tournament,
  TournamentBracketRound,
  TournamentDuel,
} from '../types';
import { createId } from './ids';
import {
  createEmptyRounds,
  isRoundComplete,
  type RankingEntry,
} from './scoring';

export interface BuildFirstBracketRoundOptions {
  shuffle?: boolean;
  roundsPerDuel: number;
}

export interface TournamentProgress {
  roundLabel: string;
  remainingPlayerCount: number;
  remainingPlayerIds: PlayerId[];
  remainingDuelCount: number;
  advancedPlayerIds: PlayerId[];
  currentDuel: TournamentDuel | null;
  byePlayerId: PlayerId | null;
}

export type AdvanceBracketResult =
  | { type: 'incomplete' }
  | { type: 'champion'; championId: PlayerId; tournament: Tournament }
  | { type: 'advanced'; tournament: Tournament };

export type DuelOutcome = 'a' | 'b' | 'tie' | 'incomplete';

export function defaultTournamentName(): string {
  return `Bajnokság — ${new Date().toLocaleDateString('hu-HU')}`;
}

export function clampTournamentDuelRounds(value: number): number {
  return Math.min(
    MAX_TOURNAMENT_DUEL_ROUNDS,
    Math.max(MIN_TOURNAMENT_DUEL_ROUNDS, Math.round(value)),
  );
}

export function shufflePlayerIds(ids: PlayerId[]): PlayerId[] {
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRoundLabel(
  remainingPlayers: number,
  roundIndex: number,
): string {
  if (remainingPlayers === 2) {
    return 'Döntő';
  }
  if (remainingPlayers === 4) {
    return 'Elődöntő';
  }
  if (remainingPlayers === 8) {
    return 'Negyedfődöntő';
  }
  return `${roundIndex}. forduló`;
}

export function createDuel(
  playerAId: PlayerId,
  playerBId: PlayerId,
  roundsPerDuel: number,
): TournamentDuel {
  return {
    id: createId(),
    playerAId,
    playerBId,
    rounds: createEmptyRounds([playerAId, playerBId], roundsPerDuel),
    winnerId: null,
    status: 'pending',
  };
}

export function createTieBreakRound(
  playerAId: PlayerId,
  playerBId: PlayerId,
): Round {
  return createEmptyRounds([playerAId, playerBId], 1)[0];
}

export function buildBracketRoundFromPool(
  pool: PlayerId[],
  roundIndex: number,
  roundsPerDuel: number,
): TournamentBracketRound {
  const duels: TournamentDuel[] = [];
  let byePlayerId: PlayerId | undefined;

  for (let i = 0; i < pool.length; i += 2) {
    if (i + 1 < pool.length) {
      duels.push(createDuel(pool[i], pool[i + 1], roundsPerDuel));
    } else {
      byePlayerId = pool[i];
    }
  }

  return {
    index: roundIndex,
    label: getRoundLabel(pool.length, roundIndex),
    duels,
    byePlayerId,
  };
}

export function buildFirstBracketRound(
  entrantIds: PlayerId[],
  options: BuildFirstBracketRoundOptions,
): TournamentBracketRound {
  const pool = options.shuffle
    ? shufflePlayerIds(entrantIds)
    : [...entrantIds];
  return buildBracketRoundFromPool(
    pool,
    1,
    clampTournamentDuelRounds(options.roundsPerDuel),
  );
}

export function createTournament(params: {
  name: string;
  playerIds: PlayerId[];
  roundsPerDuel?: number;
  shuffle?: boolean;
}): Tournament {
  const roundsPerDuel = clampTournamentDuelRounds(
    params.roundsPerDuel ?? DEFAULT_TOURNAMENT_DUEL_ROUNDS,
  );
  const name = params.name.trim() || defaultTournamentName();
  const firstRound = buildFirstBracketRound(params.playerIds, {
    shuffle: params.shuffle,
    roundsPerDuel,
  });

  return {
    id: createId(),
    name,
    playerIds: [...params.playerIds],
    roundsPerDuel,
    status: 'active',
    currentRoundIndex: 1,
    activeDuelId: null,
    bracketRounds: [firstRound],
    createdAt: new Date().toISOString(),
  };
}

export function getBracketRoundByIndex(
  tournament: Tournament,
  index: number,
): TournamentBracketRound | undefined {
  return tournament.bracketRounds.find((round) => round.index === index);
}

export function getCurrentBracketRound(
  tournament: Tournament,
): TournamentBracketRound | undefined {
  return getBracketRoundByIndex(tournament, tournament.currentRoundIndex);
}

export function isBracketRoundComplete(
  round: TournamentBracketRound,
): boolean {
  return round.duels.every(
    (duel) => duel.status === 'completed' && duel.winnerId !== null,
  );
}

function getRoundsTotal(rounds: Round[], playerId: PlayerId): number {
  return rounds.reduce((total, round) => {
    const entry = round.scores.find((score) => score.playerId === playerId);
    return total + (entry?.score ?? 0);
  }, 0);
}

export function isDuelMainComplete(
  duel: TournamentDuel,
  roundsPerDuel: number,
): boolean {
  return (
    duel.rounds.length === roundsPerDuel &&
    duel.rounds.every((round) => isRoundComplete(round))
  );
}

export function compareMainDuelTotals(duel: TournamentDuel): DuelOutcome {
  const totalA = getRoundsTotal(duel.rounds, duel.playerAId);
  const totalB = getRoundsTotal(duel.rounds, duel.playerBId);
  if (totalA > totalB) {
    return 'a';
  }
  if (totalB > totalA) {
    return 'b';
  }
  return 'tie';
}

export function getLatestCompleteTieBreakRound(
  duel: TournamentDuel,
): Round | null {
  const rounds = duel.tieBreakRounds ?? [];
  for (let i = rounds.length - 1; i >= 0; i -= 1) {
    if (isRoundComplete(rounds[i])) {
      return rounds[i];
    }
  }
  return null;
}

export function compareTieBreakRound(duel: TournamentDuel, round: Round): DuelOutcome {
  const totalA = getRoundsTotal([round], duel.playerAId);
  const totalB = getRoundsTotal([round], duel.playerBId);
  if (totalA > totalB) {
    return 'a';
  }
  if (totalB > totalA) {
    return 'b';
  }
  return 'tie';
}

export function needsTieBreak(
  duel: TournamentDuel,
  roundsPerDuel: number,
): boolean {
  return (
    isDuelMainComplete(duel, roundsPerDuel) &&
    compareMainDuelTotals(duel) === 'tie'
  );
}

export function needsAnotherTieBreakRound(duel: TournamentDuel): boolean {
  const latest = getLatestCompleteTieBreakRound(duel);
  if (!latest) {
    return true;
  }
  return compareTieBreakRound(duel, latest) === 'tie';
}

export function resolveDuelWinner(
  duel: TournamentDuel,
  roundsPerDuel: number,
): PlayerId | null {
  if (!isDuelMainComplete(duel, roundsPerDuel)) {
    return null;
  }

  const main = compareMainDuelTotals(duel);
  if (main === 'a') {
    return duel.playerAId;
  }
  if (main === 'b') {
    return duel.playerBId;
  }

  const latest = getLatestCompleteTieBreakRound(duel);
  if (!latest) {
    return null;
  }

  const tieBreak = compareTieBreakRound(duel, latest);
  if (tieBreak === 'a') {
    return duel.playerAId;
  }
  if (tieBreak === 'b') {
    return duel.playerBId;
  }

  return null;
}

export function getEliminatedPlayerIds(tournament: Tournament): Set<PlayerId> {
  const eliminated = new Set<PlayerId>();
  for (const round of tournament.bracketRounds) {
    for (const duel of round.duels) {
      if (duel.status === 'completed' && duel.winnerId) {
        const loser =
          duel.winnerId === duel.playerAId
            ? duel.playerBId
            : duel.playerAId;
        eliminated.add(loser);
      }
    }
  }
  return eliminated;
}

/** First placement rank assigned to losers eliminated in this bracket round. */
export function eliminationRankForBracketRound(
  round: TournamentBracketRound,
): number {
  const poolSize = round.duels.length * 2 + (round.byePlayerId ? 1 : 0);
  return poolSize - round.duels.length + 1;
}

/**
 * Final standings from single-elimination bracket (not pin totals).
 * Losers in the same round share the same rank band.
 */
export function getTournamentEliminationRankings(
  tournament: Tournament,
): RankingEntry[] {
  const rankByPlayer = new Map<PlayerId, number>();

  if (tournament.championId) {
    rankByPlayer.set(tournament.championId, 1);
  }

  for (const round of tournament.bracketRounds) {
    const eliminationRank = eliminationRankForBracketRound(round);
    for (const duel of round.duels) {
      if (duel.status !== 'completed' || !duel.winnerId) {
        continue;
      }
      const loser =
        duel.winnerId === duel.playerAId ? duel.playerBId : duel.playerAId;
      if (!rankByPlayer.has(loser)) {
        rankByPlayer.set(loser, eliminationRank);
      }
    }
  }

  const playerOrder = new Map(
    tournament.playerIds.map((id, index) => [id, index]),
  );

  return [...rankByPlayer.entries()]
    .map(([playerId, rank]) => ({
      playerId,
      total: 0,
      misses: 0,
      rank,
    }))
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        (playerOrder.get(a.playerId) ?? 0) - (playerOrder.get(b.playerId) ?? 0),
    );
}

export function getRemainingContenderIds(
  tournament: Tournament,
): PlayerId[] {
  if (tournament.championId) {
    return [tournament.championId];
  }
  const eliminated = getEliminatedPlayerIds(tournament);
  return tournament.playerIds.filter((id) => !eliminated.has(id));
}

export function getAdvancedPlayerIds(
  round: TournamentBracketRound,
): PlayerId[] {
  const advanced: PlayerId[] = [];
  if (round.byePlayerId) {
    advanced.push(round.byePlayerId);
  }
  for (const duel of round.duels) {
    if (duel.status === 'completed' && duel.winnerId) {
      advanced.push(duel.winnerId);
    }
  }
  return advanced;
}

export function getCurrentDuel(tournament: Tournament): TournamentDuel | null {
  const round = getCurrentBracketRound(tournament);
  if (!round) {
    return null;
  }
  if (tournament.activeDuelId) {
    return (
      round.duels.find((duel) => duel.id === tournament.activeDuelId) ?? null
    );
  }
  return (
    round.duels.find(
      (duel) => duel.status === 'pending' || duel.status === 'active',
    ) ?? null
  );
}

export function getTournamentProgress(tournament: Tournament): TournamentProgress {
  const round = getCurrentBracketRound(tournament);
  const remainingPlayerIds = getRemainingContenderIds(tournament);
  const remainingDuelCount = round
    ? round.duels.filter((duel) => duel.status !== 'completed').length
    : 0;

  return {
    roundLabel: round?.label ?? '',
    remainingPlayerCount: remainingPlayerIds.length,
    remainingPlayerIds,
    remainingDuelCount,
    advancedPlayerIds: round ? getAdvancedPlayerIds(round) : [],
    currentDuel: getCurrentDuel(tournament),
    byePlayerId: round?.byePlayerId ?? null,
  };
}

export function advanceBracket(tournament: Tournament): AdvanceBracketResult {
  const current = getCurrentBracketRound(tournament);
  if (!current || !isBracketRoundComplete(current)) {
    return { type: 'incomplete' };
  }

  const pool: PlayerId[] = [];
  for (const duel of current.duels) {
    if (duel.winnerId) {
      pool.push(duel.winnerId);
    }
  }
  if (current.byePlayerId) {
    pool.push(current.byePlayerId);
  }

  if (pool.length === 1) {
    return {
      type: 'champion',
      championId: pool[0],
      tournament: {
        ...tournament,
        championId: pool[0],
      },
    };
  }

  const nextIndex = tournament.currentRoundIndex + 1;
  const nextRound = buildBracketRoundFromPool(
    pool,
    nextIndex,
    tournament.roundsPerDuel,
  );

  return {
    type: 'advanced',
    tournament: {
      ...tournament,
      currentRoundIndex: nextIndex,
      bracketRounds: [...tournament.bracketRounds, nextRound],
      activeDuelId: null,
    },
  };
}

export function pruneCompletedTournaments(
  tournaments: Tournament[],
): Tournament[] {
  const active = tournaments.filter(
    (tournament) => tournament.status === 'active',
  );
  const completed = tournaments
    .filter((tournament) => tournament.status === 'completed')
    .sort(
      (a, b) =>
        new Date(a.completedAt ?? a.createdAt).getTime() -
        new Date(b.completedAt ?? b.createdAt).getTime(),
    );

  if (completed.length <= MAX_COMPLETED_TOURNAMENTS) {
    return [...active, ...completed];
  }

  const kept = completed.slice(
    completed.length - MAX_COMPLETED_TOURNAMENTS,
  );
  return [...active, ...kept];
}

export function hasActiveMatch(state: AppState): boolean {
  return (
    state.activeMatchId !== null &&
    state.matches.some(
      (match) =>
        match.id === state.activeMatchId && match.status === 'active',
    )
  );
}

export function hasActiveTournament(state: AppState): boolean {
  return (
    state.activeTournamentId !== null &&
    state.tournaments.some(
      (tournament) =>
        tournament.id === state.activeTournamentId &&
        tournament.status === 'active',
    )
  );
}

export function canStartMatch(state: AppState): boolean {
  return !hasActiveMatch(state) && !hasActiveTournament(state);
}

export function canStartTournament(state: AppState): boolean {
  return !hasActiveMatch(state) && !hasActiveTournament(state);
}

export function enforceSessionExclusivity(state: AppState): AppState {
  if (state.activeMatchId && state.activeTournamentId) {
    return { ...state, activeTournamentId: null };
  }
  return state;
}

function duelHasAnyScores(duel: TournamentDuel): boolean {
  for (const round of duel.rounds) {
    if (round.scores.some((entry) => entry.score !== null)) {
      return true;
    }
  }
  for (const round of duel.tieBreakRounds ?? []) {
    if (round.scores.some((entry) => entry.score !== null)) {
      return true;
    }
  }
  return false;
}

export function hasAnyTournamentScoresEntered(tournament: Tournament): boolean {
  return tournament.bracketRounds.some((round) =>
    round.duels.some((duel) => duelHasAnyScores(duel)),
  );
}

export function getActiveTournament(state: AppState): Tournament | null {
  if (!state.activeTournamentId) {
    return null;
  }
  return (
    state.tournaments.find(
      (tournament) =>
        tournament.id === state.activeTournamentId &&
        tournament.status === 'active',
    ) ?? null
  );
}

export function updateActiveTournament(
  state: AppState,
  updater: (tournament: Tournament) => Tournament,
): AppState {
  const activeId = state.activeTournamentId;
  if (!activeId) {
    return state;
  }
  return {
    ...state,
    tournaments: state.tournaments.map((tournament) =>
      tournament.id === activeId ? updater(tournament) : tournament,
    ),
  };
}

export function activateDuel(
  tournament: Tournament,
  duelId: DuelId,
): Tournament {
  return {
    ...tournament,
    activeDuelId: duelId,
    bracketRounds: tournament.bracketRounds.map((round) => ({
      ...round,
      duels: round.duels.map((duel) => {
        if (duel.id === duelId) {
          return { ...duel, status: 'active' as const };
        }
        if (duel.status === 'active') {
          return { ...duel, status: 'pending' as const };
        }
        return duel;
      }),
    })),
  };
}

export function abandonActiveTournament(state: AppState): AppState {
  if (!state.activeTournamentId) {
    return state;
  }
  return {
    ...state,
    tournaments: state.tournaments.filter(
      (tournament) => tournament.id !== state.activeTournamentId,
    ),
    activeTournamentId: null,
  };
}

export function findDuelById(
  tournament: Tournament,
  duelId: DuelId,
): TournamentDuel | null {
  for (const round of tournament.bracketRounds) {
    const duel = round.duels.find((entry) => entry.id === duelId);
    if (duel) {
      return duel;
    }
  }
  return null;
}

export function getActiveDuel(tournament: Tournament): TournamentDuel | null {
  if (!tournament.activeDuelId) {
    return null;
  }
  return findDuelById(tournament, tournament.activeDuelId);
}

export function updateDuelById(
  tournament: Tournament,
  duelId: DuelId,
  updater: (duel: TournamentDuel) => TournamentDuel,
): Tournament {
  return {
    ...tournament,
    bracketRounds: tournament.bracketRounds.map((round) => ({
      ...round,
      duels: round.duels.map((duel) =>
        duel.id === duelId ? updater(duel) : duel,
      ),
    })),
  };
}

export function finishDuel(
  tournament: Tournament,
  duelId: DuelId,
  winnerId: PlayerId,
): Tournament {
  const updated = updateDuelById(tournament, duelId, (duel) => ({
    ...duel,
    winnerId,
    status: 'completed',
  }));
  return {
    ...updated,
    activeDuelId:
      updated.activeDuelId === duelId ? null : updated.activeDuelId,
  };
}

export function getDuelMainTotals(duel: TournamentDuel): {
  totalA: number;
  totalB: number;
} {
  return {
    totalA: getRoundsTotal(duel.rounds, duel.playerAId),
    totalB: getRoundsTotal(duel.rounds, duel.playerBId),
  };
}

export function getDuelCurrentRoundIndex(duel: TournamentDuel): number {
  const incomplete = duel.rounds.find((round) => !isRoundComplete(round));
  return incomplete?.index ?? duel.rounds.length;
}

export function getDuelRoundByIndex(
  duel: TournamentDuel,
  index: number,
): Round | undefined {
  return duel.rounds.find((round) => round.index === index);
}

export function canAdvanceFromDuelRound(
  duel: TournamentDuel,
  roundIndex: number,
): boolean {
  const round = getDuelRoundByIndex(duel, roundIndex);
  return round ? isRoundComplete(round) : false;
}

export function getIncompleteTieBreakRound(
  duel: TournamentDuel,
): { round: Round; index: number } | null {
  const rounds = duel.tieBreakRounds ?? [];
  const index = rounds.findIndex((round) => !isRoundComplete(round));
  if (index < 0) {
    return null;
  }
  return { round: rounds[index], index };
}

export function appendTieBreakRound(duel: TournamentDuel): TournamentDuel {
  const newRound = createTieBreakRound(duel.playerAId, duel.playerBId);
  return {
    ...duel,
    tieBreakRounds: [...(duel.tieBreakRounds ?? []), newRound],
  };
}

export function winnerIdFromOutcome(
  duel: TournamentDuel,
  outcome: Exclude<DuelOutcome, 'tie' | 'incomplete'>,
): PlayerId {
  return outcome === 'a' ? duel.playerAId : duel.playerBId;
}

export function finalizeActiveTournament(state: AppState): AppState {
  const activeId = state.activeTournamentId;
  if (!activeId) {
    return state;
  }

  const completedAt = new Date().toISOString();
  const tournaments = state.tournaments.map((tournament) =>
    tournament.id === activeId
      ? {
          ...tournament,
          status: 'completed' as const,
          completedAt,
        }
      : tournament,
  );

  return {
    ...state,
    tournaments: pruneCompletedTournaments(tournaments),
    activeTournamentId: null,
  };
}
