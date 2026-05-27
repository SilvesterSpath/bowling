import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  backTo?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  backTo,
  backLabel = 'Vissza',
}: PageHeaderProps) {
  return (
    <header className="page-header">
      {backTo ? (
        <Link to={backTo} className="page-header__back">
          ← {backLabel}
        </Link>
      ) : (
        <span className="page-header__spacer" aria-hidden="true" />
      )}
      <h1 className="page-header__title">{title}</h1>
    </header>
  );
}
