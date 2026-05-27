import type { Player } from '../../types';
import type { Round } from '../../types';
import { displayName } from '../../utils/format';

interface RoundScoreGridProps {
  round: Round;
  players: Player[];
  onScoreChange: (playerId: string, value: string) => void;
}

export function RoundScoreGrid({
  round,
  players,
  onScoreChange,
}: RoundScoreGridProps) {
  return (
    <ul className="score-grid">
      {players.map((player) => {
        const entry = round.scores.find(
          (score) => score.playerId === player.id,
        );
        const missing = entry?.score === null || entry?.score === undefined;

        return (
          <li
            key={player.id}
            className={`score-grid__row${missing ? ' score-grid__row--missing' : ''}`}
          >
            <label className="score-grid__label" htmlFor={`score-${player.id}`}>
              {displayName(player)}
            </label>
            <input
              id={`score-${player.id}`}
              className="input score-grid__input"
              type="number"
              inputMode="numeric"
              min={0}
              max={10}
              placeholder="—"
              value={
                entry?.score === null || entry?.score === undefined
                  ? ''
                  : entry.score
              }
              onChange={(event) => onScoreChange(player.id, event.target.value)}
              aria-invalid={missing}
            />
          </li>
        );
      })}
    </ul>
  );
}
