import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';
import { TitleCard } from '../components/leaderboard/TitleCard';
import { useActiveMatch } from '../hooks/useActiveMatch';
import { useAppState } from '../hooks/useAppState';
import { pruneCompletedMatches } from '../utils/match';
import { getRankings } from '../utils/scoring';
import { computeTitles } from '../utils/titles';

export function MatchEndPage() {
  const navigate = useNavigate();
  const activeMatch = useActiveMatch();
  const { state, update } = useAppState();

  const matchPlayers = useMemo(() => {
    if (!activeMatch) {
      return [];
    }
    return state.players.filter((player) =>
      activeMatch.playerIds.includes(player.id),
    );
  }, [activeMatch, state.players]);

  const rankings = useMemo(
    () => (activeMatch ? getRankings(activeMatch) : []),
    [activeMatch],
  );

  const titles = useMemo(
    () =>
      activeMatch ? computeTitles(activeMatch, matchPlayers) : [],
    [activeMatch, matchPlayers],
  );

  const playersById = useMemo(
    () => new Map(matchPlayers.map((player) => [player.id, player])),
    [matchPlayers],
  );

  if (!activeMatch) {
    return <Navigate to="/" replace />;
  }

  const handleFinalize = () => {
    const computedTitles = computeTitles(activeMatch, matchPlayers);
    const completedAt = new Date().toISOString();

    const result = update((prev) => {
      const matches = prev.matches.map((match) =>
        match.id === activeMatch.id
          ? {
              ...match,
              status: 'completed' as const,
              completedAt,
              titles: computedTitles,
            }
          : match,
      );

      return {
        ...prev,
        matches: pruneCompletedMatches(matches),
        activeMatchId: null,
      };
    });

    if (result.ok) {
      navigate('/');
    }
  };

  return (
    <AppShell>
      <PageHeader title="Meccs vége" backTo="/match/leaderboard" backLabel="Eredménytábla" />
      <p className="match-end__intro">Szilveszter Cup — vicces címek</p>

      <section className="match-end__section">
        <h2 className="match-end__heading">Végeredmény</h2>
        <LeaderboardTable rankings={rankings} playersById={playersById} />
      </section>

      <section className="match-end__section">
        <h2 className="match-end__heading">Címek</h2>
        <div className="title-card-list">
          {titles.map((title) => {
            const player = playersById.get(title.playerId);
            if (!player) {
              return null;
            }
            return (
              <TitleCard key={title.playerId} player={player} title={title} />
            );
          })}
        </div>
      </section>

      <button
        type="button"
        className="btn btn--primary btn--block"
        onClick={handleFinalize}
      >
        Befejezés — mentés az előzményekbe
      </button>
    </AppShell>
  );
}
