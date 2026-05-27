import { describe, expect, it } from 'vitest';
import { SCHEMA_VERSION, SCHEMA_VERSION_V1 } from '../constants/storage';
import { migrateState } from './migrate';

describe('migrateState', () => {
  it('v1 → v2 preserves players and matches', () => {
    const v1 = {
      schemaVersion: SCHEMA_VERSION_V1,
      players: [
        { id: 'p1', name: 'Anna', createdAt: '2026-01-01T00:00:00.000Z' },
      ],
      matches: [
        {
          id: 'm1',
          name: 'Régi meccs',
          playerIds: ['p1'],
          roundCount: 3,
          rounds: [],
          status: 'completed' as const,
          createdAt: '2026-01-02T00:00:00.000Z',
          completedAt: '2026-01-02T01:00:00.000Z',
        },
      ],
      activeMatchId: 'm1',
    };

    const migrated = migrateState(v1);
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(migrated.players).toEqual(v1.players);
    expect(migrated.matches).toEqual(v1.matches);
    expect(migrated.tournaments).toEqual([]);
    expect(migrated.activeMatchId).toBe('m1');
    expect(migrated.activeTournamentId).toBeNull();
  });

  it('v2 passes through tournaments and activeTournamentId', () => {
    const v2 = {
      schemaVersion: SCHEMA_VERSION,
      players: [],
      matches: [],
      tournaments: [
        {
          id: 't1',
          name: 'Cup',
          playerIds: ['a', 'b'],
          roundsPerDuel: 3,
          status: 'completed' as const,
          currentRoundIndex: 1,
          activeDuelId: null,
          bracketRounds: [],
          championId: 'a',
          createdAt: '2026-05-01T00:00:00.000Z',
          completedAt: '2026-05-01T02:00:00.000Z',
        },
      ],
      activeMatchId: null,
      activeTournamentId: null,
    };

    const migrated = migrateState(v2);
    expect(migrated.tournaments).toHaveLength(1);
    expect(migrated.tournaments[0].id).toBe('t1');
  });

  it('invalid payload returns default state', () => {
    const migrated = migrateState(null);
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(migrated.players).toEqual([]);
    expect(migrated.matches).toEqual([]);
    expect(migrated.tournaments).toEqual([]);
  });
});
