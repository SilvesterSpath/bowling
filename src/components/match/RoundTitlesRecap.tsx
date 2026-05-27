import type { Player, PlayerId, Round } from '../../types';
import { displayName } from '../../utils/format';
import { sortPlayersByName } from '../../utils/players';
import {
  computeRoundTitles,
  toRoundTitleDisplayMap,
} from '../../utils/roundTitles';
import { isRoundComplete } from '../../utils/scoring';
import { PlayerNameWithTitle } from './PlayerNameWithTitle';

export interface RoundTitlesRecapEntry {
  round: Round;
  /** Index passed to `computeRoundTitles` for label variants. */
  titleRoundIndex: number;
  summaryLabel: string;
}

interface RoundTitlesRecapCoreProps {
  entries: RoundTitlesRecapEntry[];
  playerIds: PlayerId[];
  players: Player[];
}

export function RoundTitlesRecapCore({
  entries,
  playerIds,
  players,
}: RoundTitlesRecapCoreProps) {
  const sortedPlayers = sortPlayersByName(
    players.filter((player) => playerIds.includes(player.id)),
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="round-titles-recap__rounds">
      {entries.map((entry, index) => {
        const titlesByPlayerId = toRoundTitleDisplayMap(
          computeRoundTitles(
            entry.round,
            entry.titleRoundIndex,
            playerIds,
          ),
        );

        return (
          <details
            key={`${entry.summaryLabel}-${entry.titleRoundIndex}`}
            className="round-titles-recap__round"
            open={index === entries.length - 1}
          >
            <summary className="round-titles-recap__round-summary">
              {entry.summaryLabel}
            </summary>
            <ul className="round-titles-recap__list">
              {sortedPlayers.map((player) => (
                <li key={player.id} className="round-titles-recap__item">
                  <PlayerNameWithTitle
                    name={displayName(player)}
                    title={titlesByPlayerId.get(player.id)?.funny}
                    subtitle={titlesByPlayerId.get(player.id)?.descriptive}
                  />
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

interface RoundTitlesRecapProps {
  match: { rounds: Round[]; playerIds: PlayerId[] };
  players: Player[];
}

export function RoundTitlesRecap({ match, players }: RoundTitlesRecapProps) {
  const entries: RoundTitlesRecapEntry[] = match.rounds
    .filter((round) => isRoundComplete(round))
    .map((round) => ({
      round,
      titleRoundIndex: round.index,
      summaryLabel: `${round.index}. kör`,
    }));

  if (entries.length === 0) {
    return null;
  }

  return (
    <details className="round-titles-recap match-end__section">
      <summary className="round-titles-recap__summary">Körönkénti címek</summary>
      <RoundTitlesRecapCore
        entries={entries}
        playerIds={match.playerIds}
        players={players}
      />
    </details>
  );
}
