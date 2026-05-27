import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { PlayerForm } from '../components/players/PlayerForm';
import { PlayerList } from '../components/players/PlayerList';

export function PlayersPage() {
  return (
    <AppShell>
      <PageHeader title="Játékosok" backTo="/" />
      <PlayerForm />
      <PlayerList />
    </AppShell>
  );
}
