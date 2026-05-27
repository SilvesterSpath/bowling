import type { AppState, Match, Player } from '../types';
import { displayName } from './format';
import { getRankings } from './scoring';

export function getCompletedMatches(matches: Match[]): Match[] {
  return matches
    .filter((match) => match.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.createdAt).getTime() -
        new Date(a.completedAt ?? a.createdAt).getTime(),
    );
}

export function getMatchById(state: AppState, matchId: string): Match | null {
  return state.matches.find((match) => match.id === matchId) ?? null;
}

export function getWinnerLabel(match: Match, players: Player[]): string {
  const rankings = getRankings(match);
  const winners = rankings.filter((entry) => entry.rank === 1);
  if (winners.length === 0) {
    return '—';
  }
  const names = winners
    .map((entry) => {
      const player = players.find((p) => p.id === entry.playerId);
      return player ? displayName(player) : null;
    })
    .filter((name): name is string => name !== null);
  return names.join(', ') || '—';
}
