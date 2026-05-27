import { AppShell } from '../layout/AppShell';
import { PageHeader } from '../layout/PageHeader';

interface PlaceholderPageProps {
  title: string;
  description: string;
  backTo?: string;
  backLabel?: string;
}

export function PlaceholderPage({
  title,
  description,
  backTo = '/',
  backLabel,
}: PlaceholderPageProps) {
  return (
    <AppShell>
      <PageHeader title={title} backTo={backTo} backLabel={backLabel} />
      <div className="placeholder-page">
        <p className="placeholder-page__badge">Hamarosan</p>
        <p className="placeholder-page__text">{description}</p>
      </div>
    </AppShell>
  );
}
