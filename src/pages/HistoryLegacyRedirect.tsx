import { Navigate, useParams } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { getMatchById, getTournamentById } from '../utils/history';

/** Redirects old `/history/:id` links to split match/tournament routes. */
export function HistoryLegacyRedirect() {
  const { legacyId } = useParams<{ legacyId: string }>();
  const { state } = useAppState();

  if (!legacyId) {
    return <Navigate to="/history" replace />;
  }

  const match = getMatchById(state, legacyId);
  if (match?.status === 'completed') {
    return <Navigate to={`/history/match/${legacyId}`} replace />;
  }

  const tournament = getTournamentById(state, legacyId);
  if (tournament?.status === 'completed') {
    return <Navigate to={`/history/tournament/${legacyId}`} replace />;
  }

  return <Navigate to="/history" replace />;
}
