import { Link } from 'react-router-dom';
import type { Player } from '../../types';
import { formatMatchDate } from '../../utils/format';
import {
  getTournamentChampionLabel,
  getWinnerLabel,
  type HistoryEntry,
} from '../../utils/history';

interface HistoryListProps {
  entries: HistoryEntry[];
  players: Player[];
}

export function HistoryList({ entries, players }: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <p className="empty-state">
        Még nincs befejezett meccs vagy bajnokság. Fejezz be egy játékot!
      </p>
    );
  }

  return (
    <ul className="history-list">
      {entries.map((entry) => {
        if (entry.kind === 'match') {
          const { match } = entry;
          return (
            <li key={`match-${match.id}`}>
              <Link to={`/history/match/${match.id}`} className="history-card">
                <span className="history-card__badge history-card__badge--match">
                  Meccs
                </span>
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
          );
        }

        const { tournament } = entry;
        const roundCount = tournament.bracketRounds.length;
        return (
          <li key={`tournament-${tournament.id}`}>
            <Link
              to={`/history/tournament/${tournament.id}`}
              className="history-card"
            >
              <span className="history-card__badge history-card__badge--tournament">
                Bajnokság
              </span>
              <p className="history-card__name">{tournament.name}</p>
              <p className="history-card__meta">
                {formatMatchDate(
                  tournament.completedAt ?? tournament.createdAt,
                )}
              </p>
              <p className="history-card__winner">
                Győztes: {getTournamentChampionLabel(tournament, players)}
              </p>
              <p className="history-card__count">
                {tournament.playerIds.length} játékos · {roundCount} szakasz
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
