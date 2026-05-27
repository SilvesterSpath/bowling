import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { RoundNavigator } from '../components/match/RoundNavigator';
import { RoundScoreGrid } from '../components/match/RoundScoreGrid';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { useActiveTournament } from '../hooks/useActiveTournament';
import { useAppState } from '../hooks/useAppState';
import { useRoundTitleDisplayMap } from '../hooks/useRoundTitleDisplayMap';
import type { TournamentDuel } from '../types';
import { displayName } from '../utils/format';
import { sortPlayersByName } from '../utils/players';
import { parseScoreInput } from '../utils/scoring';
import {
  appendTieBreakRound,
  canAdvanceFromDuelRound,
  compareMainDuelTotals,
  finishDuel,
  getActiveDuel,
  getDuelCurrentRoundIndex,
  getDuelMainTotals,
  getDuelRoundByIndex,
  isDuelMainComplete,
  needsTieBreak,
  updateActiveTournament,
  updateDuelById,
  winnerIdFromOutcome,
} from '../utils/tournament';

export function TournamentDuelPage() {
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

  const [roundIndex, setRoundIndex] = useState(1);
  const [syncedDuelId, setSyncedDuelId] = useState<string | undefined>(undefined);

  if (duel && duel.id !== syncedDuelId) {
    setSyncedDuelId(duel.id);
    setRoundIndex(getDuelCurrentRoundIndex(duel));
  }

  const duelPlayerIds = useMemo(
    () => (duel ? [duel.playerAId, duel.playerBId] : []),
    [duel],
  );

  const round = duel ? getDuelRoundByIndex(duel, roundIndex) : undefined;
  const roundTitlesByPlayerId = useRoundTitleDisplayMap(
    round,
    roundIndex,
    duelPlayerIds,
  );

  if (!tournament || !duel) {
    return <Navigate to='/tournament' replace />;
  }

  if (duel.status === 'completed') {
    return <Navigate to='/tournament' replace />;
  }

  if (needsTieBreak(duel, tournament.roundsPerDuel)) {
    return <Navigate to='/tournament/duel/tiebreak' replace />;
  }

  const players = sortPlayersByName(
    state.players.filter(
      (player) => player.id === duel.playerAId || player.id === duel.playerBId,
    ),
  );

  const roundComplete = canAdvanceFromDuelRound(duel, roundIndex);
  const allMainComplete = isDuelMainComplete(duel, tournament.roundsPerDuel);
  const totals = getDuelMainTotals(duel);
  const playerA = players.find((p) => p.id === duel.playerAId);
  const playerB = players.find((p) => p.id === duel.playerBId);

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
      rounds: current.rounds.map((r) => {
        if (r.index !== roundIndex) {
          return r;
        }
        return {
          ...r,
          scores: r.scores.map((entry) =>
            entry.playerId === playerId ? { ...entry, score } : entry,
          ),
        };
      }),
    }));
  };

  const handleFinishDuel = () => {
    if (!allMainComplete) {
      return;
    }
    const outcome = compareMainDuelTotals(duel);
    if (outcome === 'tie') {
      const result = update((prev) =>
        updateActiveTournament(prev, (t) =>
          updateDuelById(t, duel.id, appendTieBreakRound),
        ),
      );
      if (result.ok) {
        navigate('/tournament/duel/tiebreak');
      }
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

  if (!round) {
    return <Navigate to='/tournament' replace />;
  }

  return (
    <AppShell compact>
      <PageHeader title='Párharc' backTo='/tournament' backLabel='Bajnokság' />
      <p className='play-page__match-name'>
        {playerA && playerB
          ? `${displayName(playerA)} vs ${displayName(playerB)}`
          : 'Párharc'}
      </p>

      <RoundNavigator
        currentRound={roundIndex}
        roundCount={tournament.roundsPerDuel}
        onPrev={() => setRoundIndex((prev) => Math.max(1, prev - 1))}
        onNext={() =>
          setRoundIndex((prev) => Math.min(tournament.roundsPerDuel, prev + 1))
        }
      />

      {!roundComplete ? (
        <p className='play-page__hint' role='status'>
          Töltsd ki minden játékos pontszámát (0–10).
        </p>
      ) : null}

      <RoundScoreGrid
        round={round}
        players={players}
        titlesByPlayerId={roundTitlesByPlayerId}
        onScoreChange={handleScoreChange}
      />

      <footer className='play-page__footer'>
        {allMainComplete ? (
          <>
            <p className='duel-totals' role='status'>
              Összesen: {playerA ? displayName(playerA) : 'A'} {totals.totalA} —{' '}
              {playerB ? displayName(playerB) : 'B'} {totals.totalB}
            </p>
            <button
              type='button'
              className='btn btn--primary btn--block'
              onClick={handleFinishDuel}
            >
              Párharc lezárása
            </button>
          </>
        ) : (
          <button
            type='button'
            className='btn btn--primary btn--block'
            disabled={!roundComplete || roundIndex >= tournament.roundsPerDuel}
            onClick={() => {
              if (roundIndex < tournament.roundsPerDuel && roundComplete) {
                setRoundIndex((prev) => prev + 1);
              }
            }}
          >
            Következő kör
          </button>
        )}
      </footer>
    </AppShell>
  );
}
