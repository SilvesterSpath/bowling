import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DEFAULT_TOURNAMENT_DUEL_ROUNDS,
  MAX_TOURNAMENT_DUEL_ROUNDS,
  MIN_TOURNAMENT_DUEL_ROUNDS,
} from '../../constants/tournament';
import { MAX_PLAYERS, MIN_PLAYERS } from '../../constants/scoring';
import { useAppState } from '../../hooks/useAppState';
import { useActiveMatch } from '../../hooks/useActiveMatch';
import { useActiveTournament } from '../../hooks/useActiveTournament';
import type { PlayerId } from '../../types';
import { defaultTournamentName, createTournament } from '../../utils/tournament';
import { displayName } from '../../utils/format';
import { sortPlayersByName } from '../../utils/players';

export function TournamentSetupForm() {
  const navigate = useNavigate();
  const { state, update } = useAppState();
  const activeMatch = useActiveMatch();
  const activeTournament = useActiveTournament();
  const players = sortPlayersByName(state.players);

  const [selectedIds, setSelectedIds] = useState<Set<PlayerId>>(new Set());
  const [roundsPerDuel, setRoundsPerDuel] = useState(
    DEFAULT_TOURNAMENT_DUEL_ROUNDS,
  );
  const [shuffle, setShuffle] = useState(true);
  const [tournamentName, setTournamentName] = useState('');
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
    setRoundsPerDuel((prev) =>
      Math.min(
        MAX_TOURNAMENT_DUEL_ROUNDS,
        Math.max(MIN_TOURNAMENT_DUEL_ROUNDS, prev + delta),
      ),
    );
    setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (activeMatch) {
      setError('Már fut egy meccs. Előbb fejezd be vagy vedd el.');
      return;
    }

    if (activeTournament) {
      setError('Már fut egy bajnokság. Folytasd vagy vedd el előbb.');
      return;
    }

    if (selectedIds.size < MIN_PLAYERS) {
      setError(`Válassz legalább ${MIN_PLAYERS} játékost.`);
      return;
    }

    const playerIds = players
      .filter((player) => selectedIds.has(player.id))
      .map((player) => player.id);

    const tournament = createTournament({
      name: tournamentName,
      playerIds,
      roundsPerDuel,
      shuffle,
    });

    const result = update((prev) => ({
      ...prev,
      tournaments: [...prev.tournaments, tournament],
      activeTournamentId: tournament.id,
      activeMatchId: null,
    }));

    if (result.ok) {
      navigate('/tournament');
    } else {
      setError('Nem sikerült menteni. Próbáld újra.');
    }
  };

  if (players.length < MIN_PLAYERS) {
    return (
      <div className="match-setup match-setup--empty">
        <p className="match-setup__hint">
          Legalább {MIN_PLAYERS} játékos kell egy bajnoksághoz.
        </p>
        <Link to="/players" className="btn btn--primary btn--block">
          Játékosok hozzáadása
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
        <p className="match-setup__hint">
          A bajnokság csak meccs elvetése után indítható.
        </p>
        <Link to="/" className="btn btn--primary btn--block">
          Vissza a főoldalra
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
        <Link to="/tournament" className="btn btn--primary btn--block">
          Bajnokság folytatása
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
          Válassz legalább {MIN_PLAYERS} játékost ({selectedIds.size}{' '}
          kiválasztva). Párosítás automatikus
          {shuffle ? ', véletlen sorrendben' : ''}.
        </p>
        <ul className="match-setup__players">
          {players.map((player) => {
            const checked = selectedIds.has(player.id);
            const disabled = !checked && selectedIds.size >= MAX_PLAYERS;
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
        <label className="match-setup__legend" htmlFor="duel-round-count">
          Körök párharcenként
        </label>
        <div className="round-stepper">
          <button
            type="button"
            className="btn btn--secondary round-stepper__btn"
            onClick={() => adjustRounds(-1)}
            disabled={roundsPerDuel <= MIN_TOURNAMENT_DUEL_ROUNDS}
            aria-label="Kevesebb kör"
          >
            −
          </button>
          <span id="duel-round-count" className="round-stepper__value">
            {roundsPerDuel}
          </span>
          <button
            type="button"
            className="btn btn--secondary round-stepper__btn"
            onClick={() => adjustRounds(1)}
            disabled={roundsPerDuel >= MAX_TOURNAMENT_DUEL_ROUNDS}
            aria-label="Több kör"
          >
            +
          </button>
        </div>
        <p className="match-setup__hint">
          {MIN_TOURNAMENT_DUEL_ROUNDS}–{MAX_TOURNAMENT_DUEL_ROUNDS} kör
          (alapértelmezett: {DEFAULT_TOURNAMENT_DUEL_ROUNDS})
        </p>
      </div>

      <div className="match-setup__section">
        <label className="match-setup__player">
          <input
            type="checkbox"
            checked={shuffle}
            onChange={(event) => setShuffle(event.target.checked)}
          />
          <span>Játékosok összekeverése (véletlen párosítás)</span>
        </label>
      </div>

      <div className="match-setup__section">
        <label className="match-setup__legend" htmlFor="tournament-name">
          Bajnokság neve (opcionális)
        </label>
        <input
          id="tournament-name"
          className="input"
          type="text"
          value={tournamentName}
          onChange={(event) => setTournamentName(event.target.value)}
          placeholder={defaultTournamentName()}
          maxLength={48}
        />
      </div>

      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn--primary btn--block">
        Bajnokság indítása
      </button>
    </form>
  );
}
