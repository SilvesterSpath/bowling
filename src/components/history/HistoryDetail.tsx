import type { Match, Player } from '../../types';
import { displayName, formatMatchDate } from '../../utils/format';
import { getRankings } from '../../utils/scoring';
import { LeaderboardTable } from '../leaderboard/LeaderboardTable';
import { TitleCard } from '../leaderboard/TitleCard';

interface HistoryDetailProps {
  match: Match;
  players: Player[];
}

export function HistoryDetail({ match, players }: HistoryDetailProps) {
  const playersById = new Map(players.map((player) => [player.id, player]));
  const rankings = getRankings(match);
  const titles = match.titles ?? [];

  return (
    <div className="history-detail">
      <p className="history-detail__date">
        {formatMatchDate(match.completedAt ?? match.createdAt)}
      </p>

      <section className="match-end__section">
        <h2 className="match-end__heading">Végeredmény</h2>
        <LeaderboardTable rankings={rankings} playersById={playersById} />
      </section>

      {titles.length > 0 ? (
        <section className="match-end__section">
          <h2 className="match-end__heading">Címek</h2>
          <div className="title-card-list">
            {titles.map((title) => {
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
        <h2 className="match-end__heading">Körök</h2>
        <div className="rounds-table-wrap">
          <table className="rounds-table">
            <thead>
              <tr>
                <th scope="col">Kör</th>
                {players.map((player) => (
                  <th key={player.id} scope="col">
                    {displayName(player)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {match.rounds.map((round) => (
                <tr key={round.index}>
                  <td>{round.index}.</td>
                  {players.map((player) => {
                    const entry = round.scores.find(
                      (score) => score.playerId === player.id,
                    );
                    return (
                      <td key={player.id}>
                        {entry?.score ?? '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
