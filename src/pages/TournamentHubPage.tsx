import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { TournamentProgressPanel } from '../components/tournament/TournamentProgressPanel';
import { useActiveTournament } from '../hooks/useActiveTournament';
import { useAppState } from '../hooks/useAppState';
import { displayName } from '../utils/format';
import { sortPlayersByName } from '../utils/players';
import {
  abandonActiveTournament,
  activateDuel,
  advanceBracket,
  getCurrentBracketRound,
  getCurrentDuel,
  getTournamentProgress,
  hasAnyTournamentScoresEntered,
  isBracketRoundComplete,
  updateActiveTournament,
} from '../utils/tournament';

export function TournamentHubPage() {
  const navigate = useNavigate();
  const activeTournament = useActiveTournament();
  const { state, update } = useAppState();
  const [abandonOpen, setAbandonOpen] = useState(false);

  const playersById = useMemo(() => {
    if (!activeTournament) {
      return new Map();
    }
    return new Map(
      sortPlayersByName(
        state.players.filter((player) =>
          activeTournament.playerIds.includes(player.id),
        ),
      ).map((player) => [player.id, player]),
    );
  }, [activeTournament, state.players]);

  if (!activeTournament) {
    return <Navigate to="/" replace />;
  }

  const progress = getTournamentProgress(activeTournament);
  const currentRound = getCurrentBracketRound(activeTournament);
  const roundComplete =
    currentRound !== undefined && isBracketRoundComplete(currentRound);
  const currentDuel = getCurrentDuel(activeTournament);
  const championId = activeTournament.championId;

  const abandonMessage = hasAnyTournamentScoresEntered(activeTournament)
    ? `A(z) „${activeTournament.name}” bajnokság elvetése törli az eddigi párharcokat. Folytatod?`
    : `A(z) „${activeTournament.name}” bajnokság törlődik. Folytatod?`;

  const handleAbandon = () => {
    update((prev) => abandonActiveTournament(prev));
    setAbandonOpen(false);
    navigate('/');
  };

  const persistTournament = (next: typeof activeTournament) => {
    return update((prev) => updateActiveTournament(prev, () => next));
  };

  const handleStartDuel = () => {
    if (!currentDuel || championId) {
      return;
    }
    if (currentDuel.status === 'active') {
      navigate('/tournament/duel');
      return;
    }
    const result = persistTournament(
      activateDuel(activeTournament, currentDuel.id),
    );
    if (result.ok) {
      navigate('/tournament/duel');
    }
  };

  const handleAdvanceRound = () => {
    const outcome = advanceBracket(activeTournament);
    if (outcome.type === 'incomplete') {
      return;
    }
    const result = persistTournament(outcome.tournament);
    if (!result.ok) {
      return;
    }
    if (outcome.type === 'champion') {
      navigate('/tournament');
    }
  };

  const duelButtonLabel = () => {
    if (!currentDuel) {
      return null;
    }
    const playerA = playersById.get(currentDuel.playerAId);
    const playerB = playersById.get(currentDuel.playerBId);
    if (!playerA || !playerB) {
      return 'Párharc indítása';
    }
    const nameA = displayName(playerA);
    const nameB = displayName(playerB);
    if (currentDuel.status === 'active') {
      return `Folytatás — ${nameA} vs ${nameB}`;
    }
    return `Párharc indítása — ${nameA} vs ${nameB}`;
  };

  const primaryCta = () => {
    if (championId) {
      const champion = playersById.get(championId);
      return (
        <p className="tournament-hub__champion" role="status">
          Győztes: {champion ? displayName(champion) : '—'}. Az ünneplő
          képernyő a következő lépésben érkezik.
        </p>
      );
    }

    if (roundComplete && progress.remainingDuelCount === 0) {
      return (
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={handleAdvanceRound}
        >
          Következő szakasz
        </button>
      );
    }

    const label = duelButtonLabel();
    if (!label) {
      return (
        <p className="tournament-hub__hint" role="status">
          Nincs hátralévő párharc ebben a szakaszban.
        </p>
      );
    }

    return (
      <button
        type="button"
        className="btn btn--primary btn--block"
        onClick={handleStartDuel}
      >
        {label}
      </button>
    );
  };

  return (
    <AppShell compact>
      <PageHeader title="Bajnokság" backTo="/" />
      <p className="tournament-hub__name">{activeTournament.name}</p>

      <TournamentProgressPanel
        tournament={activeTournament}
        playersById={playersById}
      />

      <footer className="tournament-hub__footer">
        {primaryCta()}
        <button
          type="button"
          className="btn btn--ghost btn--block btn--danger-text"
          onClick={() => setAbandonOpen(true)}
        >
          Bajnokság elvetése
        </button>
      </footer>

      <ConfirmDialog
        open={abandonOpen}
        title="Bajnokság elvetése"
        message={abandonMessage}
        confirmLabel="Elvetés"
        onConfirm={handleAbandon}
        onCancel={() => setAbandonOpen(false)}
      />
    </AppShell>
  );
}
