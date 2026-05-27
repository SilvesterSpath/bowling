import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '../components/common/PlaceholderPage';

export function HistoryPage() {
  const { matchId } = useParams<{ matchId?: string }>();

  if (matchId) {
    return (
      <PlaceholderPage
        title="Meccs részletei"
        description={`Előzmény megtekintése (${matchId}) — Phase 6-ban érkezik.`}
        backTo="/history"
        backLabel="Előzmények"
      />
    );
  }

  return (
    <PlaceholderPage
      title="Előzmények"
      description="Befejezett meccsek listája — Phase 6-ban érkezik."
      backTo="/"
    />
  );
}
