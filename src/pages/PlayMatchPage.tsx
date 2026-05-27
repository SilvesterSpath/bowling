import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { RoundNavigator } from '../components/match/RoundNavigator';
import { RoundScoreGrid } from '../components/match/RoundScoreGrid';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { useActiveMatch } from '../hooks/useActiveMatch';
import { useAppState } from '../hooks/useAppState';
import { sortPlayersByName } from '../utils/players';
import {
  areAllRoundsComplete,
  canAdvanceFromRound,
  getCurrentRoundIndex,
  getRoundByIndex,
  parseScoreInput,
} from '../utils/scoring';

export function PlayMatchPage() {
  const activeMatch = useActiveMatch();
  const { state, update } = useAppState();
  const [roundIndex, setRoundIndex] = useState(() =>
    activeMatch ? getCurrentRoundIndex(activeMatch) : 1,
  );

  const matchFromState = useMemo(() => {
    if (!activeMatch) {
      return null;
    }
    return (
      state.matches.find(
        (match) =>
          match.id === activeMatch.id && match.status === 'active',
      ) ?? null
    );
  }, [activeMatch, state.matches]);

  if (!activeMatch || !matchFromState) {
    return <Navigate to="/" replace />;
  }

  const players = sortPlayersByName(
    state.players.filter((player) =>
      matchFromState.playerIds.includes(player.id),
    ),
  );

  const round = getRoundByIndex(matchFromState, roundIndex);
  const roundComplete = canAdvanceFromRound(matchFromState, roundIndex);
  const allComplete = areAllRoundsComplete(matchFromState);

  const handleScoreChange = (playerId: string, raw: string) => {
    const score = parseScoreInput(raw);
    update((prev) => ({
      ...prev,
      matches: prev.matches.map((match) => {
        if (match.id !== matchFromState.id) {
          return match;
        }
        return {
          ...match,
          rounds: match.rounds.map((r) => {
            if (r.index !== roundIndex) {
              return r;
            }
            return {
              ...r,
              scores: r.scores.map((entry) =>
                entry.playerId === playerId
                  ? { ...entry, score }
                  : entry,
              ),
            };
          }),
        };
      }),
    }));
  };

  const goNextRound = () => {
    if (roundIndex < matchFromState.roundCount && roundComplete) {
      setRoundIndex((prev) => prev + 1);
    }
  };

  if (!round) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppShell>
      <PageHeader title="Játék" backTo="/" />
      <p className="play-page__match-name">{matchFromState.name}</p>

      <RoundNavigator
        currentRound={roundIndex}
        roundCount={matchFromState.roundCount}
        onPrev={() => setRoundIndex((prev) => Math.max(1, prev - 1))}
        onNext={() => setRoundIndex((prev) => Math.min(matchFromState.roundCount, prev + 1))}
      />

      {!roundComplete ? (
        <p className="play-page__hint" role="status">
          Töltsd ki minden játékos pontszámát (0–10).
        </p>
      ) : null}

      <RoundScoreGrid
        round={round}
        players={players}
        onScoreChange={handleScoreChange}
      />

      <footer className="play-page__footer">
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!roundComplete || roundIndex >= matchFromState.roundCount}
          onClick={goNextRound}
        >
          Következő kör
        </button>
        <Link to="/match/leaderboard" className="btn btn--secondary btn--block">
          Eredménytábla
        </Link>
        {allComplete ? (
          <Link to="/match/end" className="btn btn--secondary btn--block">
            Meccs vége
          </Link>
        ) : null}
      </footer>
    </AppShell>
  );
}
