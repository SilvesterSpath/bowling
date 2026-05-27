import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { useAppState } from '../hooks/useAppState';

export function PlayersPage() {
  const { state } = useAppState();
  const activeLabel = state.activeMatchId ? 'igen' : 'nem';

  return (
    <AppShell>
      <PageHeader title="Játékosok" backTo="/" />
      <div className="placeholder-page">
        <p className="placeholder-page__badge">Hamarosan</p>
        <p className="placeholder-page__text">
          Játékos hozzáadás és szerkesztés a következő fázisban érkezik.
        </p>
        <dl className="state-summary" aria-label="Mentett állapot">
          <div className="state-summary__row">
            <dt>Játékosok</dt>
            <dd>{state.players.length}</dd>
          </div>
          <div className="state-summary__row">
            <dt>Meccsek</dt>
            <dd>{state.matches.length}</dd>
          </div>
          <div className="state-summary__row">
            <dt>Aktív meccs</dt>
            <dd>{activeLabel}</dd>
          </div>
        </dl>
      </div>
    </AppShell>
  );
}
