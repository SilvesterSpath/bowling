import { useAppState } from '../../hooks/useAppState';

export function SaveIndicator() {
  const { lastSavedAt } = useAppState();

  if (!lastSavedAt) {
    return null;
  }

  return (
    <div
      key={lastSavedAt}
      className='save-indicator save-indicator--flash'
      role='status'
      aria-live='polite'
    >
      Mentve
    </div>
  );
}
