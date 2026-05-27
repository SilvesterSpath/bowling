import { Link } from 'react-router-dom';
import type { Match } from '../../types';
import type { Player } from '../../types';
import { formatMatchDate } from '../../utils/format';
import { getWinnerLabel } from '../../utils/history';

interface HistoryListProps {
  matches: Match[];
  players: Player[];
}

export function HistoryList({ matches, players }: HistoryListProps) {
  if (matches.length === 0) {
    return (
      <p className="empty-state">Még nincs befejezett meccs. Fejezz be egy meccset!</p>
    );
  }

  return (
    <ul className="history-list">
      {matches.map((match) => (
        <li key={match.id}>
          <Link to={`/history/${match.id}`} className="history-card">
            <p className="history-card__name">{match.name}</p>
            <p className="history-card__meta">
              {formatMatchDate(match.completedAt ?? match.createdAt)}
            </p>
            <p className="history-card__winner">
              Győztes: {getWinnerLabel(match, players)}
            </p>
            <p className="history-card__count">
              {match.playerIds.length} játékos · {match.roundCount} kör
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
