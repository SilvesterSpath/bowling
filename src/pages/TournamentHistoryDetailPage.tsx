import { Link, useParams } from 'react-router-dom';
import { TitleCard } from '../components/leaderboard/TitleCard';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { TournamentBracketView } from '../components/tournament/TournamentBracketView';
import { useAppState } from '../hooks/useAppState';
import { displayName, formatMatchDate } from '../utils/format';
import { getTournamentById } from '../utils/history';
import { computeTournamentPlacementTitles } from '../utils/placementTitles';
import { sortPlayersByName } from '../utils/players';

export function TournamentHistoryDetailPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { state } = useAppState();

  if (!tournamentId) {
    return null;
  }

  const tournament = getTournamentById(state, tournamentId);

  if (!tournament || tournament.status !== 'completed') {
    return (
      <AppShell compact>
        <PageHeader
          title="Bajnokság részletei"
          backTo="/history"
          backLabel="Előzmények"
        />
        <div className="placeholder-page">
          <p className="placeholder-page__text">
            Ez a bajnokság nem található, vagy még nem fejeződött be.
          </p>
          <Link to="/history" className="btn btn--primary btn--block">
            Vissza az előzményekhez
          </Link>
        </div>
      </AppShell>
    );
  }

  const players = sortPlayersByName(
    state.players.filter((player) =>
      tournament.playerIds.includes(player.id),
    ),
  );
  const playersById = new Map(players.map((player) => [player.id, player]));
  const champion = tournament.championId
    ? playersById.get(tournament.championId)
    : null;

  const placementTitles =
    tournament.titles && tournament.titles.length > 0
      ? tournament.titles
      : computeTournamentPlacementTitles(tournament);

  return (
    <AppShell compact>
      <PageHeader
        title={tournament.name}
        backTo="/history"
        backLabel="Előzmények"
      />
      <div className="history-detail">
        <p className="history-detail__date">
          {formatMatchDate(tournament.completedAt ?? tournament.createdAt)}
        </p>

        {champion ? (
          <section className="tournament-history-champion">
            <h2 className="match-end__heading">Bajnokság győztese</h2>
            <p className="tournament-history-champion__name">
              {displayName(champion)}
            </p>
          </section>
        ) : null}

        {placementTitles.length > 0 ? (
          <section className="match-end__section">
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

        <section className="match-end__section">
          <h2 className="match-end__heading">Ágrajz</h2>
          <TournamentBracketView
            tournament={tournament}
            playersById={playersById}
          />
        </section>
      </div>
    </AppShell>
  );
}
