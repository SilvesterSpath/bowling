import { useMemo } from 'react';
import type { Tournament } from '../types';
import { useAppState } from './useAppState';

export function useActiveTournament(): Tournament | null {
  const { state } = useAppState();

  return useMemo(() => {
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
  }, [state.activeTournamentId, state.tournaments]);
}
