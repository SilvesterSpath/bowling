import {
  getRoundFunnyLabel,
  getRoundGapLabel,
  type RoundTitleKey,
} from '../constants/roundTitles';
import type {
  Match,
  PlayerId,
  PlayerTitle,
  Round,
  RoundTitleDisplay,
} from '../types';
import { isRoundComplete } from './scoring';

interface RoundPlayerStat {
  playerId: PlayerId;
  score: number;
}

function buildRoundStats(
  round: Round,
  playerIds: PlayerId[],
): RoundPlayerStat[] {
  return playerIds.map((playerId) => {
    const entry = round.scores.find((score) => score.playerId === playerId);
    return {
      playerId,
      score: entry?.score ?? 0,
    };
  });
}

function sortByPlayerOrder(
  group: RoundPlayerStat[],
  playerIds: PlayerId[],
): RoundPlayerStat[] {
  return [...group].sort(
    (a, b) =>
      playerIds.indexOf(a.playerId) - playerIds.indexOf(b.playerId),
  );
}

function secondHighestScore(stats: RoundPlayerStat[], roundMax: number): number {
  const below = stats
    .map((stat) => stat.score)
    .filter((score) => score < roundMax);
  return below.length > 0 ? Math.max(...below) : roundMax;
}

function secondLowestScore(stats: RoundPlayerStat[], roundMin: number): number {
  const above = stats
    .map((stat) => stat.score)
    .filter((score) => score > roundMin);
  return above.length > 0 ? Math.min(...above) : roundMin;
}

function classifyRoundPlayer(
  stat: RoundPlayerStat,
  stats: RoundPlayerStat[],
  roundMax: number,
  roundMin: number,
): RoundTitleKey {
  const { score } = stat;
  if (score === 10) {
    return 'perfect';
  }
  if (score === 0) {
    return 'gutter';
  }

  const spread = roundMax - roundMin;
  const gapFromMax = roundMax - score;
  const aboveMin = score - roundMin;

  if (spread === 0) {
    return 'all_equal';
  }

  const tiedAtTop = stats.filter((s) => s.score === roundMax).length > 1;
  const tiedAtBottom = stats.filter((s) => s.score === roundMin).length > 1;
  const leadMargin = roundMax - secondHighestScore(stats, roundMax);
  const trailMargin = secondLowestScore(stats, roundMin) - roundMin;

  if (gapFromMax === 0) {
    if (tiedAtTop) {
      return 'lead_tied';
    }
    if (leadMargin >= 3) {
      return 'lead_dominant';
    }
    if (leadMargin === 2) {
      return 'lead_comfort';
    }
    return 'lead_narrow';
  }

  if (gapFromMax === 1) {
    return 'one_behind';
  }

  if (gapFromMax === 2) {
    return 'two_behind';
  }

  if (aboveMin === 0) {
    if (tiedAtBottom) {
      return 'last_tied';
    }
    if (trailMargin >= 2) {
      return 'last_clear';
    }
    if (trailMargin === 1) {
      return 'last_narrow';
    }
    return 'last_solo';
  }

  if (gapFromMax >= 4 || spread >= 6) {
    return 'far_behind';
  }

  if (gapFromMax === 3) {
    return 'chasing';
  }

  return 'mid_pack';
}

function variantIndexForTie(
  stat: RoundPlayerStat,
  stats: RoundPlayerStat[],
  playerIds: PlayerId[],
): number {
  const sameScore = sortByPlayerOrder(
    stats.filter((s) => s.score === stat.score),
    playerIds,
  );
  return Math.max(
    0,
    sameScore.findIndex((s) => s.playerId === stat.playerId),
  );
}

/** Latest round (highest index) that has every score filled, or null. */
export function getLatestCompleteRound(match: Match): Round | null {
  for (let i = match.rounds.length - 1; i >= 0; i -= 1) {
    const round = match.rounds[i];
    if (isRoundComplete(round)) {
      return round;
    }
  }
  return null;
}

/**
 * Round titles: whimsical nickname + score-gap description.
 * Equal scores get different variant lines for each line.
 */
export function computeRoundTitles(
  round: Round,
  roundIndex: number,
  playerIds: PlayerId[],
): PlayerTitle[] {
  if (!isRoundComplete(round)) {
    return [];
  }

  const stats = buildRoundStats(round, playerIds);
  const scores = stats.map((stat) => stat.score);
  const roundMax = Math.max(...scores);
  const roundMin = Math.min(...scores);

  return sortByPlayerOrder(stats, playerIds).map((stat) => {
    const key = classifyRoundPlayer(stat, stats, roundMax, roundMin);
    const offset = variantIndexForTie(stat, stats, playerIds);
    return {
      playerId: stat.playerId,
      key,
      label: getRoundFunnyLabel(key, roundIndex, offset),
      subtitle: getRoundGapLabel(key, roundIndex, offset),
    };
  });
}

export function toRoundTitleDisplayMap(
  titles: PlayerTitle[],
): Map<string, RoundTitleDisplay> {
  return new Map(
    titles.map((title) => [
      title.playerId,
      {
        funny: title.label,
        descriptive: title.subtitle ?? '',
      },
    ]),
  );
}
