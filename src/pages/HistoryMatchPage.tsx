import { Link, useParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { HistoryDetail } from '../components/history/HistoryDetail';
import { useAppState } from '../hooks/useAppState';
import { getMatchById } from '../utils/history';
import { sortPlayersByName } from '../utils/players';

export function HistoryMatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { state } = useAppState();

  if (!matchId) {
    return null;
  }

  const match = getMatchById(state, matchId);

  if (!match || match.status !== 'completed') {
    return (
      <AppShell compact>
        <PageHeader
          title="Meccs részletei"
          backTo="/history"
          backLabel="Előzmények"
        />
        <div className="placeholder-page">
          <p className="placeholder-page__text">
            Ez a meccs nem található, vagy még nem fejeződött be.
          </p>
          <Link to="/history" className="btn btn--primary btn--block">
            Vissza az előzményekhez
          </Link>
        </div>
      </AppShell>
    );
  }

  const players = sortPlayersByName(
    state.players.filter((player) => match.playerIds.includes(player.id)),
  );

  return (
    <AppShell compact>
      <PageHeader
        title={match.name}
        backTo="/history"
        backLabel="Előzmények"
      />
      <HistoryDetail match={match} players={players} />
    </AppShell>
  );
}
