import { describe, expect, it } from 'vitest';
import type { AppState, Match, Player } from '../types';
import { SCHEMA_VERSION } from '../constants/storage';
import {
  getHistoryEntries,
  getTournamentChampionLabel,
  getWinnerLabel,
} from './history';
import { createEmptyRounds } from './scoring';

const players: Player[] = [
  { id: 'a', name: 'Alma', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'b', name: 'Béla', createdAt: '2026-01-01T00:00:00.000Z' },
];

function completedMatch(
  id: string,
  completedAt: string,
  scoresA: number[],
  scoresB: number[],
): Match {
  const rounds = createEmptyRounds(['a', 'b'], scoresA.length).map(
    (round, index) => ({
      ...round,
      scores: round.scores.map((entry) => ({
        ...entry,
        score:
          entry.playerId === 'a'
            ? scoresA[index]
            : entry.playerId === 'b'
              ? scoresB[index]
              : null,
      })),
    }),
  );

  return {
    id,
    name: `Meccs ${id}`,
    playerIds: ['a', 'b'],
    roundCount: rounds.length,
    rounds,
    status: 'completed',
    createdAt: completedAt,
    completedAt,
  };
}

describe('getHistoryEntries', () => {
  it('merges completed matches and tournaments, newest first', () => {
    const state: AppState = {
      schemaVersion: SCHEMA_VERSION,
      players,
      matches: [
        completedMatch('m-old', '2026-05-01T12:00:00.000Z', [10], [5]),
        completedMatch('m-new', '2026-05-10T12:00:00.000Z', [10], [3]),
      ],
      tournaments: [
        {
          id: 't-mid',
          name: 'Kupa',
          playerIds: ['a', 'b'],
          roundsPerDuel: 1,
          status: 'completed',
          currentRoundIndex: 1,
          activeDuelId: null,
          bracketRounds: [],
          championId: 'a',
          createdAt: '2026-05-05T00:00:00.000Z',
          completedAt: '2026-05-05T18:00:00.000Z',
        },
      ],
      activeMatchId: null,
      activeTournamentId: null,
    };

    const entries = getHistoryEntries(state);
    expect(entries).toHaveLength(3);
    expect(entries[0].id).toBe('m-new');
    expect(entries[1].id).toBe('t-mid');
    expect(entries[2].id).toBe('m-old');
    expect(entries[0].kind).toBe('match');
    expect(entries[1].kind).toBe('tournament');
  });

  it('ignores active sessions', () => {
    const state: AppState = {
      schemaVersion: SCHEMA_VERSION,
      players,
      matches: [
        {
          id: 'active',
          name: 'Folyamatban',
          playerIds: ['a', 'b'],
          roundCount: 1,
          rounds: createEmptyRounds(['a', 'b'], 1),
          status: 'active',
          createdAt: '2026-05-27T00:00:00.000Z',
        },
      ],
      tournaments: [],
      activeMatchId: 'active',
      activeTournamentId: null,
    };

    expect(getHistoryEntries(state)).toHaveLength(0);
  });
});

describe('history labels', () => {
  it('getWinnerLabel returns top player name', () => {
    const match = completedMatch('m1', '2026-05-01T00:00:00.000Z', [10, 8], [4, 3]);
    expect(getWinnerLabel(match, players)).toBe('Alma');
  });

  it('getTournamentChampionLabel returns champion display name', () => {
    const label = getTournamentChampionLabel(
      {
        id: 't1',
        name: 'Cup',
        playerIds: ['a', 'b'],
        roundsPerDuel: 1,
        status: 'completed',
        currentRoundIndex: 1,
        activeDuelId: null,
        bracketRounds: [],
        championId: 'b',
        createdAt: '2026-05-01T00:00:00.000Z',
      },
      players,
    );
    expect(label).toBe('Béla');
  });
});
