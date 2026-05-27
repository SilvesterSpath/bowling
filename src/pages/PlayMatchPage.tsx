import { Link, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { useActiveMatch } from '../hooks/useActiveMatch';
import { useAppState } from '../hooks/useAppState';
import { displayName } from '../utils/format';
import { sortPlayersByName } from '../utils/players';

export function PlayMatchPage() {
  const activeMatch = useActiveMatch();
  const { state } = useAppState();

  if (!activeMatch) {
    return <Navigate to="/" replace />;
  }

  const players = sortPlayersByName(
    state.players.filter((player) =>
      activeMatch.playerIds.includes(player.id),
    ),
  );

  return (
    <AppShell>
      <PageHeader title="Játék" backTo="/" />
      <div className="match-started">
        <h2 className="match-started__name">{activeMatch.name}</h2>
        <p className="match-started__meta">
          {activeMatch.roundCount} kör · {players.length} játékos
        </p>
        <ul className="match-started__players">
          {players.map((player) => (
            <li key={player.id}>{displayName(player)}</li>
          ))}
        </ul>
        <p className="match-started__notice">
          A körönkénti pontbevitel a következő fázisban érkezik.
        </p>
        <Link to="/match/leaderboard" className="btn btn--primary btn--block">
          Eredménytábla
        </Link>
        <Link to="/match/end" className="btn btn--secondary btn--block">
          Meccs vége
        </Link>
        <Link to="/" className="btn btn--secondary btn--block">
          Főoldal
        </Link>
      </div>
    </AppShell>
  );
}
