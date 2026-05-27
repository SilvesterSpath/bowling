import {
  PLACEMENT_TITLE_BY_RANK,
  PLACEMENT_TITLE_DEFAULT,
  PLACEMENT_TITLE_LAST,
} from '../constants/placementTitles';
import type { Match, Player, PlayerTitle } from '../types';
import { getRankings } from './scoring';

function labelForRank(
  rank: number,
  lastRank: number,
  playerCount: number,
): { key: string; label: string } {
  if (rank === 1) {
    return {
      key: 'placement_first',
      label: PLACEMENT_TITLE_BY_RANK[1],
    };
  }

  if (playerCount > 1 && rank === lastRank) {
    return {
      key: 'placement_last',
      label: PLACEMENT_TITLE_LAST,
    };
  }

  const byRank = PLACEMENT_TITLE_BY_RANK[rank];
  if (byRank) {
    return {
      key: `placement_rank_${rank}`,
      label: byRank,
    };
  }

  return {
    key: 'placement_default',
    label: PLACEMENT_TITLE_DEFAULT,
  };
}

/**
 * End-of-match titles from each player's final standing (getRankings).
 * Tied totals share the same rank and the same title.
 */
export function computePlacementTitles(
  match: Match,
  _players: Player[],
): PlayerTitle[] {
  const rankings = getRankings(match);
  const lastRank = rankings.reduce(
    (max, entry) => Math.max(max, entry.rank),
    1,
  );
  const playerCount = match.playerIds.length;

  return rankings.map((entry) => {
    const { key, label } = labelForRank(entry.rank, lastRank, playerCount);
    return {
      playerId: entry.playerId,
      key,
      label,
    };
  });
}
