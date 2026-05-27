import type { Player, Tournament } from '../../types';
import { displayName } from '../../utils/format';
import {
  getTournamentProgress,
  type TournamentProgress,
} from '../../utils/tournament';
import { PlayerChip } from '../players/PlayerChip';

interface TournamentProgressPanelProps {
  tournament: Tournament;
  playersById: Map<string, Player>;
}

function playerName(
  playersById: Map<string, Player>,
  playerId: string,
): string {
  const player = playersById.get(playerId);
  return player ? displayName(player) : '—';
}

function duelLabel(
  progress: TournamentProgress,
  playersById: Map<string, Player>,
): string | null {
  const duel = progress.currentDuel;
  if (!duel) {
    return null;
  }
  return `${playerName(playersById, duel.playerAId)} vs ${playerName(playersById, duel.playerBId)}`;
}

export function TournamentProgressPanel({
  tournament,
  playersById,
}: TournamentProgressPanelProps) {
  const progress = getTournamentProgress(tournament);
  const duelText = duelLabel(progress, playersById);
  const byeName = progress.byePlayerId
    ? playerName(playersById, progress.byePlayerId)
    : null;

  return (
    <section className="tournament-progress" aria-label="Bajnokság állapota">
      <div className="tournament-progress__block">
        <h2 className="tournament-progress__label">Aktuális szakasz</h2>
        <p className="tournament-progress__value">{progress.roundLabel || '—'}</p>
      </div>

      <div className="tournament-progress__block">
        <h2 className="tournament-progress__label">Hátralévő játékosok</h2>
        <p className="tournament-progress__value">
          {progress.remainingPlayerCount} játékos
        </p>
      </div>

      <div className="tournament-progress__block">
        <h2 className="tournament-progress__label">Hátralévő párharcok</h2>
        <p className="tournament-progress__value">
          {progress.remainingDuelCount} párharc
        </p>
      </div>

      {progress.advancedPlayerIds.length > 0 ? (
        <div className="tournament-progress__block">
          <h2 className="tournament-progress__label">Továbbjutók</h2>
          <div className="tournament-progress__chips">
            {progress.advancedPlayerIds.map((playerId) => (
              <PlayerChip
                key={playerId}
                name={playerName(playersById, playerId)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {duelText ? (
        <div className="tournament-progress__block">
          <h2 className="tournament-progress__label">Aktuális párharc</h2>
          <p className="tournament-progress__value">{duelText}</p>
        </div>
      ) : null}

      {byeName ? (
        <div className="tournament-progress__block">
          <h2 className="tournament-progress__label">Erőnyerő</h2>
          <p className="tournament-progress__value">
            {byeName} — erőnyerő
          </p>
        </div>
      ) : null}
    </section>
  );
}
