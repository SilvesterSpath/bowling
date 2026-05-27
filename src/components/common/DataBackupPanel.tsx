import { useRef, useState } from 'react';
import { STORAGE_KEY } from '../../constants/storage';
import { useAppState } from '../../hooks/useAppState';
import { migrateState } from '../../storage/migrate';
import { ConfirmDialog } from './ConfirmDialog';

export function DataBackupPanel() {
  const { replace } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [pendingData, setPendingData] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setMessage('Nincs mentett adat.');
      return;
    }
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lengoteke-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Biztonsági mentés letöltve.');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPendingData(reader.result);
        setRestoreOpen(true);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const confirmRestore = () => {
    if (!pendingData) {
      return;
    }
    try {
      const parsed: unknown = JSON.parse(pendingData);
      const next = migrateState(parsed);
      const result = replace(next);
      if (result.ok) {
        setMessage('Visszaállítás sikeres. Az oldal frissül.');
        window.setTimeout(() => window.location.reload(), 800);
      } else {
        setMessage('Nem sikerült menteni a visszaállított adatot.');
      }
    } catch {
      setMessage('Érvénytelen mentés fájl.');
    }
    setRestoreOpen(false);
    setPendingData(null);
  };

  return (
    <details className="backup-panel">
      <summary className="backup-panel__summary">Biztonsági mentés</summary>
      <p className="backup-panel__hint">
        Mentsd le az eredményeket a buli után — hogy később is megmaradjanak.
      </p>
      <div className="backup-panel__actions">
        <button
          type="button"
          className="btn btn--secondary btn--block"
          onClick={handleExport}
        >
          Mentés letöltése
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={() => fileInputRef.current?.click()}
        >
          Mentés visszaállítása
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="visually-hidden"
          onChange={handleFileSelect}
        />
      </div>
      {message ? <p className="backup-panel__message">{message}</p> : null}

      <ConfirmDialog
        open={restoreOpen}
        title="Adatok visszaállítása"
        message="A jelenlegi adatok felülíródnak. Biztosan folytatod?"
        confirmLabel="Visszaállítás"
        onConfirm={confirmRestore}
        onCancel={() => {
          setRestoreOpen(false);
          setPendingData(null);
        }}
      />
    </details>
  );
}
