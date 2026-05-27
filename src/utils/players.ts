import type { AppState, Player, PlayerId } from '../types';

export function isPlayerInActiveMatch(
  state: AppState,
  playerId: PlayerId,
): boolean {
  if (!state.activeMatchId) {
    return false;
  }
  const active = state.matches.find(
    (match) =>
      match.id === state.activeMatchId && match.status === 'active',
  );
  return active?.playerIds.includes(playerId) ?? false;
}

export function sortPlayersByName(players: Player[]): Player[] {
  return [...players].sort((a, b) =>
    a.name.localeCompare(b.name, 'hu'),
  );
}
