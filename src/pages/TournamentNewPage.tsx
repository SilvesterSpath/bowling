import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { TournamentSetupForm } from '../components/tournament/TournamentSetupForm';

export function TournamentNewPage() {
  return (
    <AppShell compact>
      <PageHeader title="Új bajnokság" backTo="/" />
      <TournamentSetupForm />
    </AppShell>
  );
}
