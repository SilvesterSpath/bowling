import { TITLE_LABELS, type TitleKey } from '../constants/titles';
import type { Match, Player, PlayerId, PlayerTitle } from '../types';
import { getPlayerMisses, getRankings } from './scoring';

interface PlayerStats {
  playerId: PlayerId;
  rank: number;
  maxRound: number;
  zeros: number;
  stdDev: number;
  swing: number;
  lastRoundScore: number | null;
  improvement: number;
  scoredRoundCount: number;
}

function getScoredRounds(match: Match, playerId: PlayerId): number[] {
  return match.rounds
    .map(
      (round) =>
        round.scores.find((score) => score.playerId === playerId)?.score ?? null,
    )
    .filter((score): score is number => score !== null);
}

function calcStdDev(values: number[]): number {
  if (values.length < 2) {
    return Number.POSITIVE_INFINITY;
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function buildStats(match: Match): PlayerStats[] {
  const rankings = getRankings(match);
  const rankByPlayer = new Map(
    rankings.map((entry) => [entry.playerId, entry.rank]),
  );
  const half = Math.floor(match.roundCount / 2);

  return match.playerIds.map((playerId) => {
    const scored = getScoredRounds(match, playerId);
    const maxRound = scored.length > 0 ? Math.max(...scored) : 0;
    const minRound = scored.length > 0 ? Math.min(...scored) : 0;

    let firstHalfSum = 0;
    let secondHalfSum = 0;
    match.rounds.forEach((round, index) => {
      const score =
        round.scores.find((entry) => entry.playerId === playerId)?.score ?? 0;
      if (index < half) {
        firstHalfSum += score;
      } else {
        secondHalfSum += score;
      }
    });

    const lastRound = match.rounds[match.rounds.length - 1];
    const lastEntry = lastRound?.scores.find(
      (entry) => entry.playerId === playerId,
    );

    return {
      playerId,
      rank: rankByPlayer.get(playerId) ?? match.playerIds.length,
      maxRound,
      zeros: getPlayerMisses(match, playerId),
      stdDev: calcStdDev(scored),
      swing: scored.length > 0 ? maxRound - minRound : 0,
      lastRoundScore: lastEntry?.score ?? null,
      improvement: secondHalfSum - firstHalfSum,
      scoredRoundCount: scored.length,
    };
  });
}

function pickOne(
  stats: PlayerStats[],
  assigned: Set<PlayerId>,
  match: Match,
  predicate: (stat: PlayerStats) => boolean,
  compare: (a: PlayerStats, b: PlayerStats) => number,
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
    (a, b) => match.playerIds.indexOf(a.playerId) - match.playerIds.indexOf(b.playerId),
  );
  return tied[0]?.playerId ?? null;
}

export function computeTitles(match: Match, players: Player[]): PlayerTitle[] {
  const stats = buildStats(match);
  const rankings = getRankings(match);
  const lastRank = Math.max(...rankings.map((entry) => entry.rank), 1);
  const middleRank = Math.ceil(lastRank / 2);
  const playerCount = match.playerIds.length;

  const globalMax = Math.max(...stats.map((stat) => stat.maxRound), -1);

  const finalRound = match.rounds[match.rounds.length - 1];
  const finalScores = finalRound
    ? finalRound.scores
        .map((entry) => entry.score)
        .filter((score): score is number => score !== null)
    : [];
  const finalMax =
    finalScores.length > 0 ? Math.max(...finalScores) : -1;

  const assigned = new Set<PlayerId>();
  const titles: PlayerTitle[] = [];

  const assign = (playerId: PlayerId, key: TitleKey) => {
    if (assigned.has(playerId)) {
      return;
    }
    assigned.add(playerId);
    titles.push({
      playerId,
      key,
      label: TITLE_LABELS[key],
    });
  };

  for (const stat of stats) {
    if (stat.rank === 1) {
      assign(stat.playerId, 'champion');
    }
  }

  if (playerCount > 1) {
    for (const stat of stats) {
      if (stat.rank === lastRank) {
        assign(stat.playerId, 'last_place');
      }
    }
  }

  for (const stat of stats) {
    if (stat.maxRound === globalMax && globalMax >= 0) {
      assign(stat.playerId, 'high_roller');
    }
  }

  const gutterWinner = pickOne(
    stats,
    assigned,
    match,
    (stat) => stat.zeros > 0,
    (a, b) => b.zeros - a.zeros,
  );
  if (gutterWinner) {
    assign(gutterWinner, 'gutter_king');
  }

  const steadyWinner = pickOne(
    stats,
    assigned,
    match,
    (stat) => stat.scoredRoundCount >= 2,
    (a, b) => a.stdDev - b.stdDev,
  );
  if (steadyWinner) {
    assign(steadyWinner, 'steady_eddie');
  }

  const coasterWinner = pickOne(
    stats,
    assigned,
    match,
    (stat) => stat.scoredRoundCount >= 2,
    (a, b) => b.swing - a.swing,
  );
  if (coasterWinner) {
    assign(coasterWinner, 'roller_coaster');
  }

  if (finalRound && finalMax >= 0) {
    for (const entry of finalRound.scores) {
      if (entry.score === finalMax) {
        assign(entry.playerId, 'clutch_finisher');
      }
    }
  }

  const starterWinner = pickOne(
    stats,
    assigned,
    match,
    () => true,
    (a, b) => b.improvement - a.improvement,
  );
  if (starterWinner) {
    assign(starterWinner, 'slow_starter');
  }

  for (const stat of stats) {
    if (stat.rank === middleRank) {
      assign(stat.playerId, 'party_animal');
    }
  }

  for (const player of players) {
    if (match.playerIds.includes(player.id) && !assigned.has(player.id)) {
      assign(player.id, 'default');
    }
  }

  for (const playerId of match.playerIds) {
    if (!assigned.has(playerId)) {
      assign(playerId, 'default');
    }
  }

  return titles;
}
