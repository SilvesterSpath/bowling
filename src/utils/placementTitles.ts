import {
  PLACEMENT_TITLE_BY_RANK,
  PLACEMENT_TITLE_DEFAULT,
  PLACEMENT_TITLE_LAST,
} from '../constants/placementTitles';
import type { Match, PlayerTitle, Tournament } from '../types';
import { getRankings } from './scoring';
import { getTournamentEliminationRankings } from './tournament';

const LEGACY_FINALE_TITLE_KEYS = new Set([
  'champion',
  'last_place',
  'high_roller',
  'gutter_king',
  'steady_eddie',
  'roller_coaster',
  'clutch_finisher',
  'slow_starter',
  'party_animal',
  'default',
]);

/** Stored titles from the old stat-based finale (pre–placement titles). */
export function isLegacyFinaleTitles(titles: PlayerTitle[]): boolean {
  if (titles.length === 0) {
    return false;
  }
  return titles.some((title) => LEGACY_FINALE_TITLE_KEYS.has(title.key));
}

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
export function computePlacementTitles(match: Match): PlayerTitle[] {
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

/** End-of-tournament titles from bracket elimination order (all ranked entrants). */
export function computeTournamentPlacementTitles(
  tournament: Tournament,
): PlayerTitle[] {
  const rankings = getTournamentEliminationRankings(tournament);
  const lastRank = rankings.reduce(
    (max, entry) => Math.max(max, entry.rank),
    1,
  );
  const playerCount = tournament.playerIds.length;

  return rankings.map((entry) => {
    const { key, label } = labelForRank(entry.rank, lastRank, playerCount);
    return {
      playerId: entry.playerId,
      key,
      label,
    };
  });
}
