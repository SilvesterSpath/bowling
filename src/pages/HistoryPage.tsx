import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { HistoryList } from '../components/history/HistoryList';
import { useAppState } from '../hooks/useAppState';
import { getHistoryEntries } from '../utils/history';

export function HistoryPage() {
  const { state } = useAppState();
  const entries = getHistoryEntries(state);

  return (
    <AppShell compact>
      <PageHeader title="Előzmények" backTo="/" />
      <HistoryList entries={entries} players={state.players} />
    </AppShell>
  );
}
