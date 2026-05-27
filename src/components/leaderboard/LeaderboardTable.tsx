import type { Player } from '../../types';
import type { RankingEntry } from '../../utils/scoring';
import { displayName } from '../../utils/format';

interface LeaderboardTableProps {
  rankings: RankingEntry[];
  playersById: Map<string, Player>;
}

export function LeaderboardTable({
  rankings,
  playersById,
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
          const name = player ? displayName(player) : '—';
          const isLeader = entry.rank === 1;

          return (
            <tr
              key={entry.playerId}
              className={isLeader ? 'leaderboard-table__row--leader' : undefined}
            >
              <td className="leaderboard-table__rank">{entry.rank}.</td>
              <td className="leaderboard-table__name">{name}</td>
              <td className="leaderboard-table__total">{entry.total}</td>
              <td className="leaderboard-table__misses">{entry.misses}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
