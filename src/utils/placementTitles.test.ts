import { describe, expect, it } from 'vitest';
import {
  PLACEMENT_TITLE_BY_RANK,
  PLACEMENT_TITLE_LAST,
} from '../constants/placementTitles';
import { computePlacementTitles, computeTournamentPlacementTitles } from './placementTitles';
import { defaultState } from '../storage/defaultState';
import { advanceBracket, createTournament, finalizeActiveTournament } from './tournament';
import { createEmptyRounds } from './scoring';
import type { Match, TournamentDuel } from '../types';

function completeDuelMain(duel: TournamentDuel, winnerId: string): TournamentDuel {
  const loserId = duel.playerAId === winnerId ? duel.playerBId : duel.playerAId;
  return {
    ...duel,
    rounds: duel.rounds.map((round, index) => ({
      ...round,
      scores: round.scores.map((entry) => ({
        ...entry,
        score:
          entry.playerId === winnerId
            ? 10 - index
            : entry.playerId === loserId
              ? 5 - index
              : null,
      })),
    })),
    winnerId,
    status: 'completed',
  };
}

function completedMatch(
  playerIds: string[],
  totals: Record<string, number>,
): Match {
  const rounds = createEmptyRounds(playerIds, 1).map((round) => ({
    ...round,
    scores: round.scores.map((entry) => ({
      ...entry,
      score: totals[entry.playerId] ?? 0,
    })),
  }));

  return {
    id: 'm1',
    name: 'Test',
    playerIds,
    roundCount: 1,
    rounds,
    status: 'completed',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('computePlacementTitles', () => {
  it('unchanged: ranks map to Hungarian labels', () => {
    const titles = computePlacementTitles(
      completedMatch(['a', 'b'], { a: 10, b: 5 }),
    );
    expect(titles.find((t) => t.playerId === 'a')?.label).toBe(
      PLACEMENT_TITLE_BY_RANK[1],
    );
    expect(titles.find((t) => t.playerId === 'b')?.label).toBe(
      PLACEMENT_TITLE_LAST,
    );
  });
});

describe('computeTournamentPlacementTitles', () => {
  it('maps elimination ranks to placement labels', () => {
    let tournament = createTournament({
      name: 'Cup',
      playerIds: ['a', 'b', 'c', 'd'],
      roundsPerDuel: 1,
      shuffle: false,
    });

    const finishRound = (winners: string[]) => {
      const round = tournament.bracketRounds.find(
        (r) => r.index === tournament.currentRoundIndex,
      );
      if (!round) {
        throw new Error('missing round');
      }
      const duels = round.duels.map((duel, index) =>
        completeDuelMain(duel, winners[index]),
      );
      tournament = {
        ...tournament,
        bracketRounds: tournament.bracketRounds.map((r) =>
          r.index === round.index ? { ...r, duels } : r,
        ),
      };
      return advanceBracket(tournament);
    };

    let result = finishRound(['a', 'c']);
    expect(result.type).toBe('advanced');
    if (result.type !== 'advanced') {
      return;
    }
    tournament = result.tournament;

    result = finishRound(['a']);
    expect(result.type).toBe('champion');
    if (result.type !== 'champion') {
      return;
    }
    tournament = {
      ...result.tournament,
      championId: result.championId,
      status: 'completed',
    };

    const titles = computeTournamentPlacementTitles(tournament);
    expect(titles.find((t) => t.playerId === 'a')?.label).toBe(
      PLACEMENT_TITLE_BY_RANK[1],
    );
    expect(titles.find((t) => t.playerId === 'c')?.label).toBe(
      PLACEMENT_TITLE_BY_RANK[2],
    );
    expect(titles.find((t) => t.playerId === 'b')?.label).toBe(PLACEMENT_TITLE_LAST);
    expect(titles.find((t) => t.playerId === 'd')?.label).toBe(PLACEMENT_TITLE_LAST);
  });
});

describe('finalizeActiveTournament', () => {
  it('persists placement titles on completed tournament', () => {
    let tournament = createTournament({
      name: 'Cup',
      playerIds: ['a', 'b'],
      roundsPerDuel: 1,
      shuffle: false,
    });

    const round = tournament.bracketRounds[0];
    const duel = completeDuelMain(round.duels[0], 'a');
    tournament = {
      ...tournament,
      bracketRounds: [{ ...round, duels: [duel] }],
    };

    const advanced = advanceBracket(tournament);
    expect(advanced.type).toBe('champion');
    if (advanced.type !== 'champion') {
      return;
    }

    tournament = {
      ...advanced.tournament,
      championId: advanced.championId,
    };

    const state = {
      ...defaultState(),
      activeTournamentId: tournament.id,
      tournaments: [tournament],
    };

    const next = finalizeActiveTournament(state);
    expect(next.activeTournamentId).toBeNull();

    const saved = next.tournaments.find((entry) => entry.id === tournament.id);
    expect(saved?.status).toBe('completed');
    expect(saved?.titles).toHaveLength(2);
    expect(saved?.titles?.find((t) => t.playerId === 'a')?.label).toBe(
      PLACEMENT_TITLE_BY_RANK[1],
    );
    expect(saved?.titles?.find((t) => t.playerId === 'b')?.label).toBe(
      PLACEMENT_TITLE_LAST,
    );
  });
});
