import type { AppState, Match, Player, Tournament } from '../types';
import { displayName } from './format';
import { getRankings } from './scoring';

export type HistoryEntry =
  | {
      kind: 'match';
      id: string;
      sortDate: number;
      match: Match;
    }
  | {
      kind: 'tournament';
      id: string;
      sortDate: number;
      tournament: Tournament;
    };

export function getCompletedMatches(matches: Match[]): Match[] {
  return matches
    .filter((match) => match.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.createdAt).getTime() -
        new Date(a.completedAt ?? a.createdAt).getTime(),
    );
}

export function getCompletedTournaments(tournaments: Tournament[]): Tournament[] {
  return tournaments
    .filter((tournament) => tournament.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.createdAt).getTime() -
        new Date(a.completedAt ?? a.createdAt).getTime(),
    );
}

export function getHistoryEntries(state: AppState): HistoryEntry[] {
  const entries: HistoryEntry[] = [];

  for (const match of getCompletedMatches(state.matches)) {
    entries.push({
      kind: 'match',
      id: match.id,
      sortDate: new Date(match.completedAt ?? match.createdAt).getTime(),
      match,
    });
  }

  for (const tournament of getCompletedTournaments(state.tournaments)) {
    entries.push({
      kind: 'tournament',
      id: tournament.id,
      sortDate: new Date(tournament.completedAt ?? tournament.createdAt).getTime(),
      tournament,
    });
  }

  return entries.sort((a, b) => b.sortDate - a.sortDate);
}

export function getMatchById(state: AppState, matchId: string): Match | null {
  return state.matches.find((match) => match.id === matchId) ?? null;
}

export function getTournamentById(
  state: AppState,
  tournamentId: string,
): Tournament | null {
  return (
    state.tournaments.find((tournament) => tournament.id === tournamentId) ??
    null
  );
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

export function getTournamentChampionLabel(
  tournament: Tournament,
  players: Player[],
): string {
  if (!tournament.championId) {
    return '—';
  }
  const champion = players.find(
    (player) => player.id === tournament.championId,
  );
  return champion ? displayName(champion) : '—';
}
