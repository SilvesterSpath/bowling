import { useEffect, useState } from 'react';
import { useAppState } from '../../hooks/useAppState';

export function SaveIndicator() {
  const { lastSavedAt } = useAppState();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastSavedAt) {
      return;
    }
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 2000);
    return () => window.clearTimeout(timer);
  }, [lastSavedAt]);

  if (!visible) {
    return null;
  }

  return (
    <div className='save-indicator' role='status' aria-live='polite'>
      Mentve
    </div>
  );
}
