import { describe, expect, it } from 'vitest';
import type { TournamentDuel } from '../types';
import {
  advanceBracket,
  buildFirstBracketRound,
  compareMainDuelTotals,
  createTournament,
  getRoundLabel,
  resolveDuelWinner,
} from './tournament';
import { createEmptyRounds, isRoundComplete } from './scoring';

function completeDuelMain(
  duel: TournamentDuel,
  winnerId: string,
): TournamentDuel {
  const loserId =
    duel.playerAId === winnerId ? duel.playerBId : duel.playerAId;
  const rounds = duel.rounds.map((round, index) => ({
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
  }));

  return {
    ...duel,
    rounds,
    winnerId,
    status: 'completed',
  };
}

function fillRoundScores(
  round: ReturnType<typeof createEmptyRounds>[0],
  scoreA: number,
  scoreB: number,
  playerAId: string,
  playerBId: string,
) {
  return {
    ...round,
    scores: round.scores.map((entry) => ({
      ...entry,
      score:
        entry.playerId === playerAId
          ? scoreA
          : entry.playerId === playerBId
            ? scoreB
            : null,
    })),
  };
}

describe('buildFirstBracketRound', () => {
  it('2 players: one duel, no bye', () => {
    const round = buildFirstBracketRound(['a', 'b'], {
      shuffle: false,
      roundsPerDuel: 3,
    });
    expect(round.duels).toHaveLength(1);
    expect(round.duels[0].playerAId).toBe('a');
    expect(round.duels[0].playerBId).toBe('b');
    expect(round.byePlayerId).toBeUndefined();
    expect(round.duels[0].rounds).toHaveLength(3);
  });

  it('3 players: one duel and erőnyerő', () => {
    const round = buildFirstBracketRound(['a', 'b', 'c'], {
      shuffle: false,
      roundsPerDuel: 3,
    });
    expect(round.duels).toHaveLength(1);
    expect(round.byePlayerId).toBe('c');
  });

  it('8 players: four duels, no bye', () => {
    const ids = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
    const round = buildFirstBracketRound(ids, {
      shuffle: false,
      roundsPerDuel: 3,
    });
    expect(round.duels).toHaveLength(4);
    expect(round.byePlayerId).toBeUndefined();
    expect(getRoundLabel(8, 1)).toBe('Negyedfődöntő');
  });
});

describe('advanceBracket', () => {
  it('2 players: champion after first round', () => {
    let tournament = createTournament({
      name: 'Test',
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

    const result = advanceBracket(tournament);
    expect(result.type).toBe('champion');
    if (result.type === 'champion') {
      expect(result.championId).toBe('a');
    }
  });

  it('8 players: 4 → 2 → 1 bracket path', () => {
    const ids = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
    let tournament = createTournament({
      name: 'Bracket',
      playerIds: ids,
      roundsPerDuel: 1,
      shuffle: false,
    });

    const completeRound = (winners: string[]) => {
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

    let result = completeRound(['p1', 'p3', 'p5', 'p7']);
    expect(result.type).toBe('advanced');
    if (result.type === 'advanced') {
      tournament = result.tournament;
      expect(tournament.currentRoundIndex).toBe(2);
      expect(
        tournament.bracketRounds.find((r) => r.index === 2)?.label,
      ).toBe('Elődöntő');
    }

    result = completeRound(['p1', 'p5']);
    expect(result.type).toBe('advanced');
    if (result.type === 'advanced') {
      tournament = result.tournament;
      expect(
        tournament.bracketRounds.find((r) => r.index === 3)?.label,
      ).toBe('Döntő');
    }

    result = completeRound(['p1']);
    expect(result.type).toBe('champion');
    if (result.type === 'champion') {
      expect(result.championId).toBe('p1');
    }
  });

  it('3 players: bye advances to final', () => {
    let tournament = createTournament({
      name: 'Bye',
      playerIds: ['a', 'b', 'c'],
      roundsPerDuel: 1,
      shuffle: false,
    });

    const round1 = tournament.bracketRounds[0];
    const duel = completeDuelMain(round1.duels[0], 'a');
    tournament = {
      ...tournament,
      bracketRounds: [{ ...round1, duels: [duel] }],
    };

    const r1 = advanceBracket(tournament);
    expect(r1.type).toBe('advanced');
    if (r1.type !== 'advanced') {
      return;
    }
    tournament = r1.tournament;

    const round2 = tournament.bracketRounds.find((r) => r.index === 2);
    expect(round2?.duels).toHaveLength(1);
    expect(round2?.byePlayerId).toBeUndefined();
    expect(round2?.duels[0].playerAId).toBe('a');
    expect(round2?.duels[0].playerBId).toBe('c');
  });
});

describe('resolveDuelWinner', () => {
  it('main rounds: higher total wins', () => {
    const duel = createTournament({
      name: 'D',
      playerIds: ['a', 'b'],
      roundsPerDuel: 2,
    }).bracketRounds[0].duels[0];

    const filled = {
      ...duel,
      rounds: duel.rounds.map((round, i) =>
        fillRoundScores(round, 10 - i, 3, duel.playerAId, duel.playerBId),
      ),
    };

    expect(compareMainDuelTotals(filled)).toBe('a');
    expect(resolveDuelWinner(filled, 2)).toBe('a');
  });

  it('tie-break: latest playoff round decides', () => {
    const duel = createTournament({
      name: 'T',
      playerIds: ['a', 'b'],
      roundsPerDuel: 1,
    }).bracketRounds[0].duels[0];

    const tiedMain = {
      ...duel,
      rounds: duel.rounds.map((round) =>
        fillRoundScores(round, 5, 5, duel.playerAId, duel.playerBId),
      ),
    };
    expect(compareMainDuelTotals(tiedMain)).toBe('tie');
    expect(resolveDuelWinner(tiedMain, 1)).toBeNull();

    const tieBreak1 = fillRoundScores(
      createEmptyRounds([duel.playerAId, duel.playerBId], 1)[0],
      5,
      5,
      duel.playerAId,
      duel.playerBId,
    );
    const afterTb1 = {
      ...tiedMain,
      tieBreakRounds: [tieBreak1],
    };
    expect(resolveDuelWinner(afterTb1, 1)).toBeNull();

    const tieBreak2 = fillRoundScores(
      createEmptyRounds([duel.playerAId, duel.playerBId], 1)[0],
      8,
      3,
      duel.playerAId,
      duel.playerBId,
    );
    const afterTb2 = {
      ...tiedMain,
      tieBreakRounds: [tieBreak1, tieBreak2],
    };
    expect(isRoundComplete(tieBreak2)).toBe(true);
    expect(resolveDuelWinner(afterTb2, 1)).toBe('a');
  });
});
