import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { MatchSetupForm } from '../components/match/MatchSetupForm';

export function NewMatchPage() {
  return (
    <AppShell compact>
      <PageHeader title="Start — Meccs" backTo="/" />
      <MatchSetupForm />
    </AppShell>
  );
}
