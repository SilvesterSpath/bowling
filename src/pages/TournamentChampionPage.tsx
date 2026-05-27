import { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Navigate, useNavigate } from 'react-router-dom';
import { TitleCard } from '../components/leaderboard/TitleCard';
import { ChampionConfetti } from '../components/tournament/ChampionConfetti';
import { TournamentTrophy } from '../components/tournament/TournamentTrophy';
import { AppShell } from '../components/layout/AppShell';
import { useActiveTournament } from '../hooks/useActiveTournament';
import { useAppState } from '../hooks/useAppState';
import { displayName } from '../utils/format';
import { computeTournamentPlacementTitles } from '../utils/placementTitles';
import { sortPlayersByName } from '../utils/players';
import { finalizeActiveTournament } from '../utils/tournament';

const APPLAUSE_SRC = '/sounds/applause.mp3';

export function TournamentChampionPage() {
  const navigate = useNavigate();
  const activeTournament = useActiveTournament();
  const { state, update } = useAppState();
  const [finalizeOpen, setFinalizeOpen] = useState(false);

  const champion = useMemo(() => {
    if (!activeTournament?.championId) {
      return null;
    }
    return (
      state.players.find(
        (player) => player.id === activeTournament.championId,
      ) ?? null
    );
  }, [activeTournament, state.players]);

  const placementTitles = useMemo(
    () =>
      activeTournament
        ? computeTournamentPlacementTitles(activeTournament)
        : [],
    [activeTournament],
  );

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

  useEffect(() => {
    const audio = new Audio(APPLAUSE_SRC);
    audio.volume = 0.5;
    audio.play().catch(() => {
      /* optional asset — ignore if missing or blocked */
    });
    return () => {
      audio.pause();
    };
  }, []);

  if (!activeTournament) {
    return <Navigate to="/" replace />;
  }

  if (!activeTournament.championId || !champion) {
    return <Navigate to="/tournament" replace />;
  }

  const handleFinalize = () => {
    const result = update((prev) => finalizeActiveTournament(prev));
    if (result.ok) {
      setFinalizeOpen(false);
      navigate('/');
    }
  };

  return (
    <AppShell compact>
      <ChampionConfetti />
      <div className="champion-page">
        <p className="champion-page__eyebrow">Szilveszter Cup</p>
        <h1 className="champion-page__title">Bajnokság győztese</h1>

        <TournamentTrophy />

        <p className="champion-page__name">{displayName(champion)}</p>
        <p className="champion-page__tournament">{activeTournament.name}</p>
      </div>

      {placementTitles.length > 0 ? (
        <section className="match-end__section champion-page__placements">
          <h2 className="match-end__heading">Helyezési címek</h2>
          <div className="title-card-list">
            {placementTitles.map((title) => {
              const player = playersById.get(title.playerId);
              if (!player) {
                return null;
              }
              return (
                <TitleCard key={title.playerId} player={player} title={title} />
              );
            })}
          </div>
        </section>
      ) : null}

      <button
        type="button"
        className="btn btn--primary btn--block champion-page__cta"
        onClick={() => setFinalizeOpen(true)}
      >
        Befejezés
      </button>

      <ConfirmDialog
        open={finalizeOpen}
        title="Bajnokság befejezése"
        message="A bajnokság az előzményekbe kerül, és nem lesz szerkeszthető. Folytatod?"
        confirmLabel="Befejezés"
        onConfirm={handleFinalize}
        onCancel={() => setFinalizeOpen(false)}
      />
    </AppShell>
  );
}
