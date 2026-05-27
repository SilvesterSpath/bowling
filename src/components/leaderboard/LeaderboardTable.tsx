import type { Player } from '../../types';
import type { RankingEntry } from '../../utils/scoring';
import { displayName } from '../../utils/format';
import { PlayerNameWithTitle } from '../match/PlayerNameWithTitle';

interface LeaderboardTableProps {
  rankings: RankingEntry[];
  playersById: Map<string, Player>;
  titlesByPlayerId?: Map<string, string>;
}

export function LeaderboardTable({
  rankings,
  playersById,
  titlesByPlayerId,
}: LeaderboardTableProps) {
  if (rankings.length === 0) {
    return (
      <p className="empty-state">Még nincs eredmény ehhez a meccshez.</p>
    );
  }

  return (
    <table className="leaderboard-table">
      <thead>
        <tr>
          <th scope="col">Helyezés</th>
          <th scope="col">Játékos</th>
          <th scope="col">Összesen</th>
          <th scope="col">Nullák</th>
        </tr>
      </thead>
      <tbody>
        {rankings.map((entry) => {
          const player = playersById.get(entry.playerId);
          const isLeader = entry.rank === 1;

          return (
            <tr
              key={entry.playerId}
              className={isLeader ? 'leaderboard-table__row--leader' : undefined}
            >
              <td className="leaderboard-table__rank">{entry.rank}.</td>
              <td className="leaderboard-table__name">
                {player ? (
                  <PlayerNameWithTitle
                    name={displayName(player)}
                    title={titlesByPlayerId?.get(entry.playerId)}
                  />
                ) : (
                  '—'
                )}
              </td>
              <td className="leaderboard-table__total">{entry.total}</td>
              <td className="leaderboard-table__misses">{entry.misses}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
