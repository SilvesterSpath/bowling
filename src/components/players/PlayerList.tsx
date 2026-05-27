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
              <div className="player-list__row">
                <PlayerChip name={player.name} />
                <div className="player-list__actions">
                  <button
                    type="button"
                    className="player-list__action"
                    onClick={() => startEdit(player)}
                  >
                    <EditIcon />
                    <span>Szerkesztés</span>
                  </button>
                  <button
                    type="button"
                    className="player-list__action player-list__action--danger"
                    onClick={() => {
                      setListError(null);
                      setDeleteTarget(player);
                    }}
                  >
                    <DeleteIcon />
                    <span>Törlés</span>
                  </button>
                </div>
              </div>
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

function EditIcon() {
  return (
    <svg
      className="player-list__icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      className="player-list__icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14H5V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
