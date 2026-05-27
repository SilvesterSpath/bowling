import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DataBackupPanel } from '../components/common/DataBackupPanel';
import { StorageHintBanner } from '../components/common/StorageHintBanner';
import { AppShell } from '../components/layout/AppShell';
import { useActiveMatch } from '../hooks/useActiveMatch';
import { useActiveTournament } from '../hooks/useActiveTournament';
import { useAppState } from '../hooks/useAppState';
import { abandonActiveMatch } from '../utils/match';
import { hasAnyScoresEntered } from '../utils/scoring';
import {
  abandonActiveTournament,
  hasAnyTournamentScoresEntered,
} from '../utils/tournament';

export function HomePage() {
  const activeMatch = useActiveMatch();
  const activeTournament = useActiveTournament();
  const { update } = useAppState();
  const [abandonMatchOpen, setAbandonMatchOpen] = useState(false);
  const [abandonTournamentOpen, setAbandonTournamentOpen] = useState(false);

  const abandonMessage = activeMatch
    ? hasAnyScoresEntered(activeMatch)
      ? `A(z) „${activeMatch.name}” megszakítva kerül mentésre. Folytatod?`
      : `A(z) „${activeMatch.name}” törlődik. Folytatod?`
    : '';

  const handleAbandonMatch = () => {
    update((prev) => abandonActiveMatch(prev));
    setAbandonMatchOpen(false);
  };

  const handleAbandonTournament = () => {
    update((prev) => abandonActiveTournament(prev));
    setAbandonTournamentOpen(false);
  };

  const tournamentAbandonMessage = activeTournament
    ? hasAnyTournamentScoresEntered(activeTournament)
      ? `A(z) „${activeTournament.name}” bajnokság elvetése törli az eddigi párharcokat. Folytatod?`
      : `A(z) „${activeTournament.name}” bajnokság törlődik. Folytatod?`
    : '';

  return (
    <AppShell>
      <StorageHintBanner />
      <header className='home-hero'>
        <p className='home-hero__eyebrow'>Szilveszter Cup</p>
        <h1 className='home-hero__title'>Lengő Teke Championship</h1>
        <p className='home-hero__subtitle'>
          Családi buli pontszámláló — mentés a telefonon, internet nélkül is.
        </p>
      </header>

      <nav className='home-nav' aria-label='Főmenü'>
        {activeTournament ? (
          <Link to='/tournament' className='btn btn--primary btn--block'>
            Folytatás — {activeTournament.name}
          </Link>
        ) : activeMatch ? (
          <Link to='/match/play' className='btn btn--primary btn--block'>
            Folytatás — {activeMatch.name}
          </Link>
        ) : null}

        <Link to='/match/new' className='btn btn--secondary btn--block'>
          Start — Meccs
        </Link>
        <Link to='/tournament/new' className='btn btn--secondary btn--block'>
          Start — Bajnokság
        </Link>
        <Link to='/players' className='btn btn--secondary btn--block'>
          Játékosok
        </Link>
        <Link to='/history' className='btn btn--secondary btn--block'>
          Előzmények
        </Link>

        {activeMatch ? (
          <>
            <Link to='/match/leaderboard' className='btn btn--ghost btn--block'>
              Eredménytábla
            </Link>
            <Link to='/match/play' className='btn btn--ghost btn--block'>
              Játék
            </Link>
            <button
              type='button'
              className='btn btn--ghost btn--block btn--danger-text'
              onClick={() => setAbandonMatchOpen(true)}
            >
              Meccs elvetése
            </button>
          </>
        ) : null}

        {activeTournament ? (
          <>
            <Link to='/tournament' className='btn btn--ghost btn--block'>
              Bajnokság központ
            </Link>
            <button
              type='button'
              className='btn btn--ghost btn--block btn--danger-text'
              onClick={() => setAbandonTournamentOpen(true)}
            >
              Bajnokság elvetése
            </button>
          </>
        ) : null}
      </nav>

      <DataBackupPanel />

      <ConfirmDialog
        open={abandonMatchOpen}
        title='Meccs elvetése'
        message={abandonMessage}
        confirmLabel='Elvetés'
        onConfirm={handleAbandonMatch}
        onCancel={() => setAbandonMatchOpen(false)}
      />

      <ConfirmDialog
        open={abandonTournamentOpen}
        title='Bajnokság elvetése'
        message={tournamentAbandonMessage}
        confirmLabel='Elvetés'
        onConfirm={handleAbandonTournament}
        onCancel={() => setAbandonTournamentOpen(false)}
      />
    </AppShell>
  );
}
