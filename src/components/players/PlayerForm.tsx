import { useState, type FormEvent } from 'react';
import { createId } from '../../utils/ids';
import {
  normalizePlayerName,
  validatePlayerName,
} from '../../utils/playerValidation';
import { useAppState } from '../../hooks/useAppState';
import type { Player } from '../../types';

export function PlayerForm() {
  const { update } = useAppState();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validationError = validatePlayerName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    const trimmed = normalizePlayerName(name);
    const newPlayer: Player = {
      id: createId(),
      name: trimmed,
      createdAt: new Date().toISOString(),
    };

    const result = update((prev) => ({
      ...prev,
      players: [...prev.players, newPlayer],
    }));

    if (result.ok) {
      setName('');
      setError(null);
    } else {
      setError('Nem sikerült menteni. Próbáld újra.');
    }
  };

  return (
    <form className="player-form" onSubmit={handleSubmit}>
      <label className="player-form__label" htmlFor="player-name">
        Új játékos
      </label>
      <input
        id="player-name"
        className="input"
        type="text"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          if (error) {
            setError(null);
          }
        }}
        placeholder="Név"
        maxLength={24}
        autoComplete="off"
        enterKeyHint="done"
      />
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn btn--primary btn--block">
        Hozzáadás
      </button>
    </form>
  );
}
