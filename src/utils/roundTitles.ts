import {
  getRoundTitleLabel,
  type RoundTitleKey,
} from '../constants/roundTitles';
import type { Match, PlayerId, PlayerTitle, Round } from '../types';
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

function pickOne(
  stats: RoundPlayerStat[],
  assigned: Set<PlayerId>,
  playerIds: PlayerId[],
  predicate: (stat: RoundPlayerStat) => boolean,
  compare: (a: RoundPlayerStat, b: RoundPlayerStat) => number,
): PlayerId | null {
  const candidates = stats.filter(
    (stat) => !assigned.has(stat.playerId) && predicate(stat),
  );
  if (candidates.length === 0) {
    return null;
  }
  const sorted = [...candidates].sort(compare);
  const best = sorted[0];
  const tied = sorted.filter((stat) => compare(stat, best) === 0);
  tied.sort(
    (a, b) =>
      playerIds.indexOf(a.playerId) - playerIds.indexOf(b.playerId),
  );
  return tied[0]?.playerId ?? null;
}

function assign(
  titles: PlayerTitle[],
  assigned: Set<PlayerId>,
  playerId: PlayerId,
  key: RoundTitleKey,
  roundIndex: number,
  playerOffset = 0,
): void {
  if (assigned.has(playerId)) {
    return;
  }
  assigned.add(playerId);
  titles.push({
    playerId,
    key,
    label: getRoundTitleLabel(key, roundIndex, playerOffset),
  });
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
 * Funny titles for one completed round, based only on that round's scores.
 * Returns [] if the round is not fully scored.
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
  const playerCount = playerIds.length;

  const assigned = new Set<PlayerId>();
  const titles: PlayerTitle[] = [];

  for (const stat of stats) {
    if (stat.score === 10) {
      assign(titles, assigned, stat.playerId, 'perfect', roundIndex);
    }
  }

  for (const stat of stats) {
    if (stat.score === 0) {
      assign(titles, assigned, stat.playerId, 'gutter', roundIndex);
    }
  }

  const heroId = pickOne(
    stats,
    assigned,
    playerIds,
    (stat) => stat.score === roundMax,
    (a, b) => b.score - a.score,
  );
  if (heroId) {
    assign(titles, assigned, heroId, 'round_hero', roundIndex);
  }

  if (playerCount > 1) {
    const strugglerId = pickOne(
      stats,
      assigned,
      playerIds,
      (stat) => stat.score === roundMin,
      (a, b) => a.score - b.score,
    );
    if (strugglerId) {
      assign(titles, assigned, strugglerId, 'round_struggler', roundIndex);
    }
  }

  for (const playerId of playerIds) {
    if (!assigned.has(playerId)) {
      const offset = playerIds.indexOf(playerId);
      assign(titles, assigned, playerId, 'filler', roundIndex, offset);
    }
  }

  return titles;
}
