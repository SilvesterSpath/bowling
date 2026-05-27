import { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Navigate, useNavigate } from 'react-router-dom';
import { ChampionConfetti } from '../components/tournament/ChampionConfetti';
import { TournamentTrophy } from '../components/tournament/TournamentTrophy';
import { AppShell } from '../components/layout/AppShell';
import { useActiveTournament } from '../hooks/useActiveTournament';
import { useAppState } from '../hooks/useAppState';
import { displayName } from '../utils/format';
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

        <button
          type="button"
          className="btn btn--primary btn--block champion-page__cta"
          onClick={() => setFinalizeOpen(true)}
        >
          Befejezés
        </button>
      </div>

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
