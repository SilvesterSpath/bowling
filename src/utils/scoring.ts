import type { Match, PlayerId, Round } from '../types';

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
