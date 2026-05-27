import { useAppState } from '../../hooks/useAppState';

function getErrorMessage(error: 'quota' | 'unknown'): string {
  if (error === 'quota') {
    return 'A telefon tárhelye megtelt. Törölj régi meccseket vagy böngészőadatot.';
  }
  return 'Nem sikerült menteni. Próbáld újra.';
}

export function SaveErrorBanner() {
  const { lastSaveError } = useAppState();

  if (!lastSaveError || lastSaveError.ok) {
    return null;
  }

  return (
    <div className="save-error-banner" role="alert">
      {getErrorMessage(lastSaveError.error)}
    </div>
  );
}
