import { useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import type { Player } from '../../types';
import { isPlayerInActiveMatch, sortPlayersByName } from '../../utils/players';
import {
  normalizePlayerName,
  validatePlayerName,
} from '../../utils/playerValidation';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { PlayerChip } from './PlayerChip';

export function PlayerList() {
  const { state, update } = useAppState();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const players = sortPlayersByName(state.players);

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
    setEditError(null);
    setListError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditError(null);
  };

  const saveEdit = (playerId: string) => {
    const validationError = validatePlayerName(editName);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    const trimmed = normalizePlayerName(editName);
    const result = update((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === playerId ? { ...player, name: trimmed } : player,
      ),
    }));

    if (result.ok) {
      cancelEdit();
    } else {
      setEditError('Nem sikerült menteni. Próbáld újra.');
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    if (isPlayerInActiveMatch(state, deleteTarget.id)) {
      setListError(
        `${deleteTarget.name} nem törölhető — aktív meccsben szerepel.`,
      );
      setDeleteTarget(null);
      return;
    }

    const result = update((prev) => ({
      ...prev,
      players: prev.players.filter((player) => player.id !== deleteTarget.id),
    }));

    if (!result.ok) {
      setListError('Nem sikerült menteni. Próbáld újra.');
    } else {
      setListError(null);
    }
    setDeleteTarget(null);
  };

  if (players.length === 0) {
    return (
      <p className="empty-state">Még nincs játékos. Add hozzá az elsőt!</p>
    );
  }

  return (
    <>
      {listError ? (
        <p className="field-error" role="alert">
          {listError}
        </p>
      ) : null}
      <ul className="player-list">
        {players.map((player) => (
          <li key={player.id} className="player-list__item">
            {editingId === player.id ? (
              <div className="player-list__edit">
                <label className="visually-hidden" htmlFor={`edit-${player.id}`}>
                  Név szerkesztése
                </label>
                <input
                  id={`edit-${player.id}`}
                  className="input"
                  type="text"
                  value={editName}
                  onChange={(event) => {
                    setEditName(event.target.value);
                    if (editError) {
                      setEditError(null);
                    }
                  }}
                  maxLength={24}
                  autoFocus
                />
                {editError ? (
                  <p className="field-error" role="alert">
                    {editError}
                  </p>
                ) : null}
                <div className="player-list__actions">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => saveEdit(player.id)}
                  >
                    Mentés
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={cancelEdit}
                  >
                    Mégse
                  </button>
                </div>
              </div>
            ) : (
              <>
                <PlayerChip name={player.name} />
                <div className="player-list__actions">
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => startEdit(player)}
                  >
                    Szerkesztés
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      setListError(null);
                      setDeleteTarget(player);
                    }}
                  >
                    Törlés
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Játékos törlése"
        message={
          deleteTarget
            ? `Biztosan törlöd: ${deleteTarget.name}?`
            : ''
        }
        confirmLabel="Törlés"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
