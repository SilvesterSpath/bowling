import type { Player, Tournament, TournamentDuel } from '../../types';
import { displayName } from '../../utils/format';
import { getDuelMainTotals } from '../../utils/tournament';

interface TournamentBracketViewProps {
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

function DuelScoresTable({
  duel,
  playersById,
  rounds,
  label,
}: {
  duel: TournamentDuel;
  playersById: Map<string, Player>;
  rounds: typeof duel.rounds;
  label?: string;
}) {
  const playerA = playersById.get(duel.playerAId);
  const playerB = playersById.get(duel.playerBId);
  if (!playerA || !playerB) {
    return null;
  }

  return (
    <div className="bracket-duel__scores">
      {label ? <p className="bracket-duel__scores-label">{label}</p> : null}
      <div className="rounds-table-wrap">
        <table className="rounds-table rounds-table--compact">
          <thead>
            <tr>
              <th scope="col">Kör</th>
              <th scope="col">{displayName(playerA)}</th>
              <th scope="col">{displayName(playerB)}</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((round) => (
              <tr key={round.index}>
                <td>{round.index}.</td>
                {round.scores.map((entry) => (
                  <td key={entry.playerId}>{entry.score ?? '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TournamentBracketView({
  tournament,
  playersById,
}: TournamentBracketViewProps) {
  const championId = tournament.championId;

  return (
    <div className="tournament-bracket">
      {tournament.bracketRounds.map((round) => (
        <section key={round.index} className="tournament-bracket__round">
          <h3 className="tournament-bracket__round-title">{round.label}</h3>

          {round.byePlayerId ? (
            <p className="tournament-bracket__bye">
              Erőnyerő: {playerName(playersById, round.byePlayerId)}
            </p>
          ) : null}

          <ul className="tournament-bracket__duels">
            {round.duels.map((duel) => {
              const totals = getDuelMainTotals(duel);
              const isChampionDuel =
                championId &&
                (duel.playerAId === championId || duel.playerBId === championId) &&
                duel.winnerId === championId;

              return (
                <li
                  key={duel.id}
                  className={`bracket-duel${isChampionDuel ? ' bracket-duel--champion-path' : ''}`}
                >
                  <h4 className="bracket-duel__title">
                    {playerName(playersById, duel.playerAId)} vs{' '}
                    {playerName(playersById, duel.playerBId)}
                  </h4>

                  <DuelScoresTable
                    duel={duel}
                    playersById={playersById}
                    rounds={duel.rounds}
                  />

                  <p className="bracket-duel__totals">
                    Összesen: {totals.totalA} – {totals.totalB}
                  </p>

                  {(duel.tieBreakRounds ?? []).map((tbRound, index) => (
                    <DuelScoresTable
                      key={`tb-${duel.id}-${index}`}
                      duel={duel}
                      playersById={playersById}
                      rounds={[tbRound]}
                      label={`Döntő kör ${index + 1}`}
                    />
                  ))}

                  {duel.winnerId ? (
                    <p className="bracket-duel__winner">
                      Győztes:{' '}
                      <strong>{playerName(playersById, duel.winnerId)}</strong>
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
