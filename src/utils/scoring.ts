import type { Match, PlayerId, Round } from '../types';

export interface RankingEntry {
  playerId: PlayerId;
  total: number;
  rank: number;
  misses: number;
}

export function createEmptyRounds(
  playerIds: PlayerId[],
  roundCount: number,
): Round[] {
  return Array.from({ length: roundCount }, (_, index) => ({
    index: index + 1,
    scores: playerIds.map((playerId) => ({
      playerId,
      score: null,
    })),
  }));
}

export function getPlayerTotal(match: Match, playerId: PlayerId): number {
  return match.rounds.reduce((total, round) => {
    const entry = round.scores.find((score) => score.playerId === playerId);
    return total + (entry?.score ?? 0);
  }, 0);
}

export function isRoundComplete(round: Round): boolean {
  return round.scores.every((entry) => entry.score !== null);
}

export function getPlayerMisses(match: Match, playerId: PlayerId): number {
  return match.rounds.reduce((count, round) => {
    const entry = round.scores.find((score) => score.playerId === playerId);
    return entry?.score === 0 ? count + 1 : count;
  }, 0);
}

export function getRankings(match: Match): RankingEntry[] {
  const entries = match.playerIds.map((playerId) => ({
    playerId,
    total: getPlayerTotal(match, playerId),
    misses: getPlayerMisses(match, playerId),
    rank: 0,
  }));

  entries.sort((a, b) => b.total - a.total);

  let rank = 0;
  return entries.map((entry, index) => {
    if (index === 0 || entry.total < entries[index - 1].total) {
      rank = index + 1;
    }
    return { ...entry, rank };
  });
}
