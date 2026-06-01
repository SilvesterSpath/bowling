import { useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { RoundScoreGrid } from '../components/match/RoundScoreGrid';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { useActiveTournament } from '../hooks/useActiveTournament';
import { useAppState } from '../hooks/useAppState';
import { useRoundTitleDisplayMap } from '../hooks/useRoundTitleDisplayMap';
import type { TournamentDuel } from '../types';
import { displayName } from '../utils/format';
import { sortPlayersByName } from '../utils/players';
import { isRoundComplete, parseScoreInput } from '../utils/scoring';
import {
  appendTieBreakRound,
  compareTieBreakRound,
  ensureIncompleteTieBreakRound,
  findDuelById,
  finishDuel,
  getActiveDuel,
  getDuelMainTotals,
  getTieBreakPlayoffRound,
  isDuelMainComplete,
  needsAnotherTieBreakRound,
  needsTieBreak,
  updateActiveTournament,
  updateDuelById,
  winnerIdFromOutcome,
} from '../utils/tournament';

export function TournamentTiebreakPage() {
  const navigate = useNavigate();
  const activeTournament = useActiveTournament();
  const { state, update } = useAppState();

  const tournament = useMemo(() => {
    if (!activeTournament) {
      return null;
    }
    return (
      state.tournaments.find(
        (entry) =>
          entry.id === activeTournament.id && entry.status === 'active',
      ) ?? null
    );
  }, [activeTournament, state.tournaments]);

  const duel = useMemo(
    () => (tournament ? getActiveDuel(tournament) : null),
    [tournament],
  );

  const playoffEntry = useMemo(
    () => (duel ? getTieBreakPlayoffRound(duel) : null),
    [duel],
  );

  const duelPlayerIds = useMemo(
    () => (duel ? [duel.playerAId, duel.playerBId] : []),
    [duel],
  );

  const tieBreakTitleRoundIndex =
    tournament && playoffEntry
      ? tournament.roundsPerDuel + playoffEntry.index + 1
      : 1;

  const roundTitlesByPlayerId = useRoundTitleDisplayMap(
    playoffEntry?.round,
    tieBreakTitleRoundIndex,
    duelPlayerIds,
  );

  useEffect(() => {
    if (!tournament || !duel) {
      return;
    }
    if (!needsTieBreak(duel, tournament.roundsPerDuel)) {
      return;
    }
    if (getTieBreakPlayoffRound(duel)) {
      return;
    }
    if (!needsAnotherTieBreakRound(duel)) {
      return;
    }

    update((prev) =>
      updateActiveTournament(prev, (t) => {
        const current = findDuelById(t, duel.id);
        if (!current) {
          return t;
        }
        const prepared = ensureIncompleteTieBreakRound(current);
        if (prepared === current) {
          return t;
        }
        return updateDuelById(t, duel.id, () => prepared);
      }),
    );
  }, [duel, tournament, update]);

  if (!tournament || !duel) {
    return <Navigate to='/tournament' replace />;
  }

  if (duel.status === 'completed') {
    return <Navigate to='/tournament' replace />;
  }

  if (!isDuelMainComplete(duel, tournament.roundsPerDuel)) {
    return <Navigate to='/tournament/duel' replace />;
  }

  if (!needsTieBreak(duel, tournament.roundsPerDuel)) {
    return <Navigate to='/tournament/duel' replace />;
  }

  if (!playoffEntry) {
    return (
      <AppShell compact>
        <PageHeader
          title='Döntő kör'
          backTo='/tournament/duel'
          backLabel='Párharc'
        />
        <p className='play-page__hint' role='status'>
          Döntő kör előkészítése…
        </p>
      </AppShell>
    );
  }

  const { round: tieBreakRound, index: tieBreakIndex } = playoffEntry;
  const playoffNumber = tieBreakIndex + 1;

  const players = sortPlayersByName(
    state.players.filter(
      (player) => player.id === duel.playerAId || player.id === duel.playerBId,
    ),
  );

  const playerA = players.find((p) => p.id === duel.playerAId);
  const playerB = players.find((p) => p.id === duel.playerBId);
  const mainTotals = getDuelMainTotals(duel);
  const roundComplete = isRoundComplete(tieBreakRound);

  const persistDuel = (
    updater: (current: TournamentDuel) => TournamentDuel,
  ) => {
    return update((prev) =>
      updateActiveTournament(prev, (t) => updateDuelById(t, duel.id, updater)),
    );
  };

  const handleScoreChange = (playerId: string, raw: string) => {
    const score = parseScoreInput(raw);
    persistDuel((current) => ({
      ...current,
      tieBreakRounds: (current.tieBreakRounds ?? []).map((round, idx) => {
        if (idx !== tieBreakIndex) {
          return round;
        }
        return {
          ...round,
          scores: round.scores.map((entry) =>
            entry.playerId === playerId ? { ...entry, score } : entry,
          ),
        };
      }),
    }));
  };

  const handleFinishPlayoff = () => {
    if (!roundComplete) {
      return;
    }
    const outcome = compareTieBreakRound(duel, tieBreakRound);
    if (outcome === 'tie') {
      persistDuel(appendTieBreakRound);
      return;
    }
    if (outcome === 'incomplete') {
      return;
    }
    const winnerId = winnerIdFromOutcome(duel, outcome);
    const result = update((prev) =>
      updateActiveTournament(prev, (t) => finishDuel(t, duel.id, winnerId)),
    );
    if (result.ok) {
      navigate('/tournament');
    }
  };

  return (
    <AppShell compact>
      <PageHeader
        title='Döntő kör'
        backTo='/tournament/duel'
        backLabel='Párharc'
      />
      <p className='play-page__match-name tiebreak-page__intro'>
        Döntetlen az összpontban — döntő kör!
      </p>
      <p className='tiebreak-page__context' role='status'>
        {playerA && playerB
          ? `${displayName(playerA)} ${mainTotals.totalA} : ${mainTotals.totalB} ${displayName(playerB)}`
          : null}
      </p>
      <p className='play-page__hint' role='status'>
        Döntő kör {playoffNumber} — töltsd ki mindkét játékos pontszámát (0–10).
      </p>

      <RoundScoreGrid
        round={tieBreakRound}
        players={players}
        titlesByPlayerId={roundTitlesByPlayerId}
        onScoreChange={handleScoreChange}
      />

      <footer className='play-page__footer'>
        <button
          type='button'
          className='btn btn--primary btn--block'
          disabled={!roundComplete}
          onClick={handleFinishPlayoff}
        >
          Döntő kör lezárása
        </button>
      </footer>
    </AppShell>
  );
}
