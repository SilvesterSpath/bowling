import { useMemo } from 'react';
import type { PlayerId, Round, RoundTitleDisplay } from '../types';
import { computeRoundTitles, toRoundTitleDisplayMap } from '../utils/roundTitles';

export function useRoundTitleDisplayMap(
  round: Round | undefined,
  roundIndex: number,
  playerIds: PlayerId[],
): Map<string, RoundTitleDisplay> {
  return useMemo(() => {
    if (!round) {
      return new Map();
    }
    return toRoundTitleDisplayMap(
      computeRoundTitles(round, roundIndex, playerIds),
    );
  }, [round, roundIndex, playerIds]);
}
