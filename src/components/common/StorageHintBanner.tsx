import { useState } from 'react';
import { STORAGE_HINT_KEY } from '../../constants/storage';

export function StorageHintBanner() {
  const [visible, setVisible] = useState(
    () => localStorage.getItem(STORAGE_HINT_KEY) !== '1',
  );

  if (!visible) {
    return null;
  }

  const dismiss = () => {
    localStorage.setItem(STORAGE_HINT_KEY, '1');
    setVisible(false);
  };

  return (
    <div className="storage-hint" role="note">
      <p>
        Az adatok a telefonon maradnak. Ha törlöd a böngésző adatait, az
        eredmények elvesznek.
      </p>
      <button type="button" className="storage-hint__dismiss" onClick={dismiss}>
        Értem
      </button>
    </div>
  );
}
