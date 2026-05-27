import type { Player, Round, RoundTitleDisplay } from '../../types';
import { displayName } from '../../utils/format';
import { PlayerNameWithTitle } from './PlayerNameWithTitle';

interface RoundScoreGridProps {
  round: Round;
  players: Player[];
  titlesByPlayerId: Map<string, RoundTitleDisplay>;
  onScoreChange: (playerId: string, value: string) => void;
}

export function RoundScoreGrid({
  round,
  players,
  titlesByPlayerId,
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
              <PlayerNameWithTitle
                name={displayName(player)}
                title={titlesByPlayerId.get(player.id)?.funny}
                subtitle={titlesByPlayerId.get(player.id)?.descriptive}
              />
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
