import { useMemo } from 'react';
import type { Match } from '../types';
import { useAppState } from './useAppState';

export function useActiveMatch(): Match | null {
  const { state } = useAppState();

  return useMemo(() => {
    if (!state.activeMatchId) {
      return null;
    }
    return (
      state.matches.find(
        (match) =>
          match.id === state.activeMatchId && match.status === 'active',
      ) ?? null
    );
  }, [state.activeMatchId, state.matches]);
}
