import type { Match, Player } from '../../types';
import { displayName } from '../../utils/format';
import { sortPlayersByName } from '../../utils/players';
import { computeRoundTitles } from '../../utils/roundTitles';
import { isRoundComplete } from '../../utils/scoring';
import { PlayerNameWithTitle } from './PlayerNameWithTitle';

interface RoundTitlesRecapProps {
  match: Match;
  players: Player[];
}

export function RoundTitlesRecap({ match, players }: RoundTitlesRecapProps) {
  const sortedPlayers = sortPlayersByName(players);
  const completeRounds = match.rounds.filter((round) => isRoundComplete(round));

  if (completeRounds.length === 0) {
    return null;
  }

  return (
    <details className="round-titles-recap match-end__section">
      <summary className="round-titles-recap__summary">Körönkénti címek</summary>
      <div className="round-titles-recap__rounds">
        {completeRounds.map((round, index) => {
          const titles = computeRoundTitles(
            round,
            round.index,
            match.playerIds,
          );
          const titlesByPlayerId = new Map(
            titles.map((title) => [title.playerId, title.label]),
          );

          return (
            <details
              key={round.index}
              className="round-titles-recap__round"
              open={index === completeRounds.length - 1}
            >
              <summary className="round-titles-recap__round-summary">
                {round.index}. kör
              </summary>
              <ul className="round-titles-recap__list">
                {sortedPlayers.map((player) => (
                  <li key={player.id} className="round-titles-recap__item">
                    <PlayerNameWithTitle
                      name={displayName(player)}
                      title={titlesByPlayerId.get(player.id)}
                    />
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </details>
  );
}
