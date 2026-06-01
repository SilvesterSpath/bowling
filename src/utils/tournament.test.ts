import { describe, expect, it } from 'vitest';
import type { TournamentDuel } from '../types';
import {
  advanceBracket,
  buildFirstBracketRound,
  compareMainDuelTotals,
  createTournament,
  eliminationRankForBracketRound,
  ensureIncompleteTieBreakRound,
  getIncompleteTieBreakRound,
  getRoundLabel,
  getTournamentEliminationRankings,
  resolveDuelWinner,
} from './tournament';
import { createEmptyRounds, isRoundComplete } from './scoring';

function completeDuelMain(
  duel: TournamentDuel,
  winnerId: string,
): TournamentDuel {
  const loserId = duel.playerAId === winnerId ? duel.playerBId : duel.playerAId;
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

  it('4 players: two semifinal duels, no bye', () => {
    const round = buildFirstBracketRound(['a', 'b', 'c', 'd'], {
      shuffle: false,
      roundsPerDuel: 1,
    });
    expect(round.duels).toHaveLength(2);
    expect(round.byePlayerId).toBeUndefined();
    expect(round.label).toBe('Elődöntő');
  });

  it('5 players: two duels and erőnyerő', () => {
    const round = buildFirstBracketRound(['a', 'b', 'c', 'd', 'e'], {
      shuffle: false,
      roundsPerDuel: 1,
    });
    expect(round.duels).toHaveLength(2);
    expect(round.byePlayerId).toBe('e');
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
      expect(tournament.bracketRounds.find((r) => r.index === 2)?.label).toBe(
        'Elődöntő',
      );
    }

    result = completeRound(['p1', 'p5']);
    expect(result.type).toBe('advanced');
    if (result.type === 'advanced') {
      tournament = result.tournament;
      expect(tournament.bracketRounds.find((r) => r.index === 3)?.label).toBe(
        'Döntő',
      );
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

function tournamentAtChampion(
  playerIds: string[],
  roundWinnerIds: string[][],
) {
  let tournament = createTournament({
    name: 'Rank test',
    playerIds,
    roundsPerDuel: 1,
    shuffle: false,
  });

  for (const winners of roundWinnerIds) {
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
    const result = advanceBracket(tournament);
    if (result.type === 'champion') {
      return {
        ...result.tournament,
        championId: result.championId,
        status: 'completed' as const,
      };
    }
    if (result.type !== 'advanced') {
      throw new Error('expected advance');
    }
    tournament = result.tournament;
  }

  throw new Error('expected champion');
}

function rankByPlayerId(tournament: ReturnType<typeof tournamentAtChampion>) {
  return new Map(
    getTournamentEliminationRankings(tournament).map((entry) => [
      entry.playerId,
      entry.rank,
    ]),
  );
}

describe('getTournamentEliminationRankings', () => {
  it('eliminationRankForBracketRound: pool bands', () => {
    const fourPool = buildFirstBracketRound(['a', 'b', 'c', 'd'], {
      shuffle: false,
      roundsPerDuel: 1,
    });
    expect(eliminationRankForBracketRound(fourPool)).toBe(3);

    const threePool = buildFirstBracketRound(['a', 'b', 'c'], {
      shuffle: false,
      roundsPerDuel: 1,
    });
    expect(eliminationRankForBracketRound(threePool)).toBe(3);
  });

  it('2 players: winner 1, loser 2', () => {
    const tournament = tournamentAtChampion(['a', 'b'], [['a']]);
    const ranks = rankByPlayerId(tournament);
    expect(ranks.get('a')).toBe(1);
    expect(ranks.get('b')).toBe(2);
  });

  it('4 players: semi losers tie at 3, finalist 2', () => {
    const tournament = tournamentAtChampion(['a', 'b', 'c', 'd'], [
      ['a', 'c'],
      ['a'],
    ]);
    const ranks = rankByPlayerId(tournament);
    expect(ranks.get('a')).toBe(1);
    expect(ranks.get('c')).toBe(2);
    expect(ranks.get('b')).toBe(3);
    expect(ranks.get('d')).toBe(3);
  });

  it('3 players with bye: first out 3, finalist 2', () => {
    const tournament = tournamentAtChampion(['a', 'b', 'c'], [['a'], ['a']]);
    const ranks = rankByPlayerId(tournament);
    expect(ranks.get('a')).toBe(1);
    expect(ranks.get('c')).toBe(2);
    expect(ranks.get('b')).toBe(3);
  });

  it('5 players: first-round losers 4, semi loser 3', () => {
    const tournament = tournamentAtChampion(['a', 'b', 'c', 'd', 'e'], [
      ['a', 'c'],
      ['a'],
      ['a'],
    ]);
    const ranks = rankByPlayerId(tournament);
    expect(ranks.get('a')).toBe(1);
    expect(ranks.get('e')).toBe(2);
    expect(ranks.get('c')).toBe(3);
    expect(ranks.get('b')).toBe(4);
    expect(ranks.get('d')).toBe(4);
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

describe('ensureIncompleteTieBreakRound', () => {
  it('adds the first playoff round after a main-round tie', () => {
    const duel = createTournament({
      name: 'T',
      playerIds: ['a', 'b'],
      roundsPerDuel: 3,
    }).bracketRounds[0].duels[0];

    const tiedMain = {
      ...duel,
      rounds: duel.rounds.map((round) =>
        fillRoundScores(round, 5, 5, duel.playerAId, duel.playerBId),
      ),
    };

    expect(getIncompleteTieBreakRound(tiedMain)).toBeNull();

    const prepared = ensureIncompleteTieBreakRound(tiedMain);
    expect(prepared.tieBreakRounds).toHaveLength(1);
    expect(getIncompleteTieBreakRound(prepared)).not.toBeNull();
  });

  it('is idempotent when a playoff round is already in progress', () => {
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
    const preparedOnce = ensureIncompleteTieBreakRound(tiedMain);
    const preparedTwice = ensureIncompleteTieBreakRound(preparedOnce);

    expect(preparedTwice.tieBreakRounds).toHaveLength(1);
  });
});
