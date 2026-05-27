import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DEFAULT_ROUND_COUNT,
  MAX_PLAYERS,
  MAX_ROUND_COUNT,
  MIN_PLAYERS,
  MIN_ROUND_COUNT,
} from '../../constants/scoring';
import { useAppState } from '../../hooks/useAppState';
import { useActiveMatch } from '../../hooks/useActiveMatch';
import { useActiveTournament } from '../../hooks/useActiveTournament';
import type { PlayerId } from '../../types';
import { defaultMatchName, displayName } from '../../utils/format';
import { createMatch } from '../../utils/match';
import { sortPlayersByName } from '../../utils/players';

export function MatchSetupForm() {
  const navigate = useNavigate();
  const { state, update } = useAppState();
  const activeMatch = useActiveMatch();
  const activeTournament = useActiveTournament();
  const players = sortPlayersByName(state.players);

  const [selectedIds, setSelectedIds] = useState<Set<PlayerId>>(new Set());
  const [roundCount, setRoundCount] = useState(DEFAULT_ROUND_COUNT);
  const [matchName, setMatchName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const togglePlayer = (playerId: PlayerId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else if (next.size < MAX_PLAYERS) {
        next.add(playerId);
      }
      return next;
    });
    setError(null);
  };

  const adjustRounds = (delta: number) => {
    setRoundCount((prev) =>
      Math.min(MAX_ROUND_COUNT, Math.max(MIN_ROUND_COUNT, prev + delta)),
    );
    setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (activeTournament) {
      setError('Már fut egy bajnokság. Előbb fejezd be vagy vedd el.');
      return;
    }

    if (activeMatch) {
      setError('Már fut egy meccs. Folytasd vagy fejezd be előbb.');
      return;
    }

    if (selectedIds.size < MIN_PLAYERS) {
      setError(`Válassz legalább ${MIN_PLAYERS} játékost.`);
      return;
    }

    if (selectedIds.size > MAX_PLAYERS) {
      setError(`Legfeljebb ${MAX_PLAYERS} játékos lehet egy meccsen.`);
      return;
    }

    const playerIds = players
      .filter((player) => selectedIds.has(player.id))
      .map((player) => player.id);

    const match = createMatch({
      name: matchName,
      playerIds,
      roundCount,
    });

    const result = update((prev) => ({
      ...prev,
      matches: [...prev.matches, match],
      activeMatchId: match.id,
      activeTournamentId: null,
    }));

    if (result.ok) {
      navigate('/match/play');
    } else {
      setError('Nem sikerült menteni. Próbáld újra.');
    }
  };

  if (players.length < MIN_PLAYERS) {
    return (
      <div className="match-setup match-setup--empty">
        <p className="match-setup__hint">
          Legalább {MIN_PLAYERS} játékos kell egy meccshez.
        </p>
        <Link to="/players" className="btn btn--primary btn--block">
          Játékosok hozzáadása
        </Link>
      </div>
    );
  }

  if (activeTournament) {
    return (
      <div className="match-setup match-setup--blocked">
        <p className="field-error" role="alert">
          Már fut egy bajnokság: {activeTournament.name}
        </p>
        <p className="match-setup__hint">
          A meccs csak bajnokság elvetése után indítható.
        </p>
        <Link to="/" className="btn btn--primary btn--block">
          Vissza a főoldalra
        </Link>
      </div>
    );
  }

  if (activeMatch) {
    return (
      <div className="match-setup match-setup--blocked">
        <p className="field-error" role="alert">
          Már fut egy meccs: {activeMatch.name}
        </p>
        <Link to="/match/play" className="btn btn--primary btn--block">
          Meccs folytatása
        </Link>
        <Link to="/" className="btn btn--ghost btn--block">
          Vissza a főoldalra
        </Link>
      </div>
    );
  }

  return (
    <form className="match-setup" onSubmit={handleSubmit}>
      <fieldset className="match-setup__section">
        <legend className="match-setup__legend">Játékosok</legend>
        <p className="match-setup__hint">
          Válassz {MIN_PLAYERS}–{MAX_PLAYERS} játékost ({selectedIds.size}{' '}
          kiválasztva)
        </p>
        <ul className="match-setup__players">
          {players.map((player) => {
            const checked = selectedIds.has(player.id);
            const disabled =
              !checked && selectedIds.size >= MAX_PLAYERS;
            return (
              <li key={player.id}>
                <label
                  className={`match-setup__player${checked ? ' match-setup__player--selected' : ''}${disabled ? ' match-setup__player--disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => togglePlayer(player.id)}
                  />
                  <span>{displayName(player)}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="match-setup__section">
        <label className="match-setup__legend" htmlFor="round-count">
          Körök száma
        </label>
        <div className="round-stepper">
          <button
            type="button"
            className="btn btn--secondary round-stepper__btn"
            onClick={() => adjustRounds(-1)}
            disabled={roundCount <= MIN_ROUND_COUNT}
            aria-label="Kevesebb kör"
          >
            −
          </button>
          <span id="round-count" className="round-stepper__value">
            {roundCount}
          </span>
          <button
            type="button"
            className="btn btn--secondary round-stepper__btn"
            onClick={() => adjustRounds(1)}
            disabled={roundCount >= MAX_ROUND_COUNT}
            aria-label="Több kör"
          >
            +
          </button>
        </div>
        <p className="match-setup__hint">
          {MIN_ROUND_COUNT}–{MAX_ROUND_COUNT} kör (alapértelmezett:{' '}
          {DEFAULT_ROUND_COUNT})
        </p>
      </div>

      <div className="match-setup__section">
        <label className="match-setup__legend" htmlFor="match-name">
          Meccs neve (opcionális)
        </label>
        <input
          id="match-name"
          className="input"
          type="text"
          value={matchName}
          onChange={(event) => setMatchName(event.target.value)}
          placeholder={defaultMatchName()}
          maxLength={48}
        />
      </div>

      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn--primary btn--block">
        Start — Meccs
      </button>
    </form>
  );
}
