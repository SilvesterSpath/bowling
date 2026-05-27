import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DataBackupPanel } from '../components/common/DataBackupPanel';
import { StorageHintBanner } from '../components/common/StorageHintBanner';
import { AppShell } from '../components/layout/AppShell';
import { useActiveMatch } from '../hooks/useActiveMatch';
import { useAppState } from '../hooks/useAppState';
import { abandonActiveMatch } from '../utils/match';
import { hasAnyScoresEntered } from '../utils/scoring';

export function HomePage() {
  const activeMatch = useActiveMatch();
  const { update } = useAppState();
  const [abandonOpen, setAbandonOpen] = useState(false);

  const abandonMessage = activeMatch
    ? hasAnyScoresEntered(activeMatch)
      ? `A(z) „${activeMatch.name}” megszakítva kerül mentésre. Folytatod?`
      : `A(z) „${activeMatch.name}” törlődik. Folytatod?`
    : '';

  const handleAbandon = () => {
    update((prev) => abandonActiveMatch(prev));
    setAbandonOpen(false);
  };

  return (
    <AppShell>
      <StorageHintBanner />
      <header className="home-hero">
        <p className="home-hero__eyebrow">Szilveszter Cup</p>
        <h1 className="home-hero__title">Lengő Teke Championship</h1>
        <p className="home-hero__subtitle">
          Családi buli pontszámláló — mentés a telefonon, internet nélkül is.
        </p>
      </header>

      <nav className="home-nav" aria-label="Főmenü">
        {activeMatch ? (
          <Link to="/match/play" className="btn btn--primary btn--block">
            Folytatás — {activeMatch.name}
          </Link>
        ) : null}

        <Link to="/match/new" className="btn btn--secondary btn--block">
          Új meccs
        </Link>
        <Link to="/players" className="btn btn--secondary btn--block">
          Játékosok
        </Link>
        <Link to="/history" className="btn btn--secondary btn--block">
          Előzmények
        </Link>

        {activeMatch ? (
          <>
            <Link
              to="/match/leaderboard"
              className="btn btn--ghost btn--block"
            >
              Eredménytábla
            </Link>
            <Link to="/match/play" className="btn btn--ghost btn--block">
              Játék
            </Link>
            <button
              type="button"
              className="btn btn--ghost btn--block btn--danger-text"
              onClick={() => setAbandonOpen(true)}
            >
              Meccs elvetése
            </button>
          </>
        ) : null}
      </nav>

      <DataBackupPanel />

      <ConfirmDialog
        open={abandonOpen}
        title="Meccs elvetése"
        message={abandonMessage}
        confirmLabel="Elvetés"
        onConfirm={handleAbandon}
        onCancel={() => setAbandonOpen(false)}
      />
    </AppShell>
  );
}
