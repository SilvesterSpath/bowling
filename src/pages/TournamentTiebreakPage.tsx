import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { RoundScoreGrid } from '../components/match/RoundScoreGrid';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { useActiveTournament } from '../hooks/useActiveTournament';
import { useAppState } from '../hooks/useAppState';
import type { TournamentDuel } from '../types';
import { displayName } from '../utils/format';
import { sortPlayersByName } from '../utils/players';
import { isRoundComplete, parseScoreInput } from '../utils/scoring';
import {
  appendTieBreakRound,
  compareTieBreakRound,
  finishDuel,
  getActiveDuel,
  getDuelMainTotals,
  getIncompleteTieBreakRound,
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
  const [ensuredRound, setEnsuredRound] = useState(false);

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

  useEffect(() => {
    if (!tournament || !duel || ensuredRound) {
      return;
    }
    if (getIncompleteTieBreakRound(duel)) {
      setEnsuredRound(true);
      return;
    }
    if (needsAnotherTieBreakRound(duel)) {
      update((prev) =>
        updateActiveTournament(prev, (t) =>
          updateDuelById(t, duel.id, appendTieBreakRound),
        ),
      );
      setEnsuredRound(true);
    }
  }, [tournament, duel, ensuredRound, update]);

  if (!tournament || !duel) {
    return <Navigate to="/tournament" replace />;
  }

  if (duel.status === 'completed') {
    return <Navigate to="/tournament" replace />;
  }

  if (!isDuelMainComplete(duel, tournament.roundsPerDuel)) {
    return <Navigate to="/tournament/duel" replace />;
  }

  if (!needsTieBreak(duel, tournament.roundsPerDuel)) {
    return <Navigate to="/tournament/duel" replace />;
  }

  const tieBreakEntry = getIncompleteTieBreakRound(duel);
  if (!tieBreakEntry) {
    if (!ensuredRound) {
      return null;
    }
    return <Navigate to="/tournament/duel" replace />;
  }

  const { round: tieBreakRound, index: tieBreakIndex } = tieBreakEntry;
  const playoffNumber = tieBreakIndex + 1;

  const players = sortPlayersByName(
    state.players.filter(
      (player) =>
        player.id === duel.playerAId || player.id === duel.playerBId,
    ),
  );

  const playerA = players.find((p) => p.id === duel.playerAId);
  const playerB = players.find((p) => p.id === duel.playerBId);
  const mainTotals = getDuelMainTotals(duel);
  const roundComplete = isRoundComplete(tieBreakRound);

  const persistDuel = (updater: (current: TournamentDuel) => TournamentDuel) => {
    return update((prev) =>
      updateActiveTournament(prev, (t) =>
        updateDuelById(t, duel.id, updater),
      ),
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
      const result = persistDuel(appendTieBreakRound);
      if (result.ok) {
        setEnsuredRound(false);
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

  return (
    <AppShell compact>
      <PageHeader
        title="Döntő kör"
        backTo="/tournament/duel"
        backLabel="Párharc"
      />
      <p className="play-page__match-name tiebreak-page__intro">
        Döntetlen az összpontban — döntő kör!
      </p>
      <p className="tiebreak-page__context" role="status">
        {playerA && playerB
          ? `${displayName(playerA)} ${mainTotals.totalA} : ${mainTotals.totalB} ${displayName(playerB)}`
          : null}
      </p>
      <p className="play-page__hint" role="status">
        Döntő kör {playoffNumber} — töltsd ki mindkét játékos pontszámát (0–10).
      </p>

      <RoundScoreGrid
        round={tieBreakRound}
        players={players}
        titlesByPlayerId={new Map()}
        onScoreChange={handleScoreChange}
      />

      <footer className="play-page__footer">
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!roundComplete}
          onClick={handleFinishPlayoff}
        >
          Döntő kör lezárása
        </button>
      </footer>
    </AppShell>
  );
}
