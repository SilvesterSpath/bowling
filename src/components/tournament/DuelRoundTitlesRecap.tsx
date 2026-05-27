import type { Player, TournamentDuel } from '../../types';
import {
  RoundTitlesRecapCore,
  type RoundTitlesRecapEntry,
} from '../match/RoundTitlesRecap';
import { isRoundComplete } from '../../utils/scoring';

interface DuelRoundTitlesRecapProps {
  duel: TournamentDuel;
  players: Player[];
  roundsPerDuel: number;
}

export function DuelRoundTitlesRecap({
  duel,
  players,
  roundsPerDuel,
}: DuelRoundTitlesRecapProps) {
  const playerIds = [duel.playerAId, duel.playerBId];
  const entries: RoundTitlesRecapEntry[] = [];

  for (const round of duel.rounds) {
    if (!isRoundComplete(round)) {
      continue;
    }
    entries.push({
      round,
      titleRoundIndex: round.index,
      summaryLabel: `${round.index}. kör`,
    });
  }

  for (const [index, round] of (duel.tieBreakRounds ?? []).entries()) {
    if (!isRoundComplete(round)) {
      continue;
    }
    entries.push({
      round,
      titleRoundIndex: roundsPerDuel + index + 1,
      summaryLabel: `Döntő kör ${index + 1}`,
    });
  }

  if (entries.length === 0) {
    return null;
  }

  return (
    <details className="round-titles-recap bracket-duel__titles">
      <summary className="round-titles-recap__summary">Körönkénti címek</summary>
      <RoundTitlesRecapCore
        entries={entries}
        playerIds={playerIds}
        players={players}
      />
    </details>
  );
}
