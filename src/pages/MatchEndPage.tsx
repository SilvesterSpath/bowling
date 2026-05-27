import { useMemo, useState } from 'react';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';
import { RoundTitlesRecap } from '../components/match/RoundTitlesRecap';
import { TitleCard } from '../components/leaderboard/TitleCard';
import { useActiveMatch } from '../hooks/useActiveMatch';
import { useAppState } from '../hooks/useAppState';
import { pruneCompletedMatches } from '../utils/match';
import { sortPlayersByName } from '../utils/players';
import { getRankings } from '../utils/scoring';
import { computePlacementTitles } from '../utils/placementTitles';

export function MatchEndPage() {
  const navigate = useNavigate();
  const activeMatch = useActiveMatch();
  const { state, update } = useAppState();
  const [finalizeOpen, setFinalizeOpen] = useState(false);

  const matchPlayers = useMemo(() => {
    if (!activeMatch) {
      return [];
    }
    return sortPlayersByName(
      state.players.filter((player) =>
        activeMatch.playerIds.includes(player.id),
      ),
    );
  }, [activeMatch, state.players]);

  const rankings = useMemo(
    () => (activeMatch ? getRankings(activeMatch) : []),
    [activeMatch],
  );

  const titles = useMemo(
    () =>
      activeMatch ? computePlacementTitles(activeMatch, matchPlayers) : [],
    [activeMatch, matchPlayers],
  );

  const playersById = useMemo(
    () => new Map(matchPlayers.map((player) => [player.id, player])),
    [matchPlayers],
  );

  if (!activeMatch) {
    return <Navigate to='/' replace />;
  }

  const handleFinalize = () => {
    const computedTitles = computePlacementTitles(activeMatch, matchPlayers);
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
      setFinalizeOpen(false);
      navigate('/');
    }
  };

  return (
    <AppShell compact>
      <PageHeader
        title='Meccs vége'
        backTo='/match/leaderboard'
        backLabel='Eredménytábla'
      />
      <p className='match-end__intro'>Szilveszter Cup — helyezési címek</p>

      <section className='match-end__section'>
        <h2 className='match-end__heading'>Végeredmény</h2>
        <LeaderboardTable rankings={rankings} playersById={playersById} />
      </section>

      <section className='match-end__section'>
        <h2 className='match-end__heading'>Helyezési címek</h2>
        <div className='title-card-list'>
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

      <RoundTitlesRecap match={activeMatch} players={matchPlayers} />

      <button
        type='button'
        className='btn btn--primary btn--block'
        onClick={() => setFinalizeOpen(true)}
      >
        Befejezés — mentés az előzményekbe
      </button>

      <ConfirmDialog
        open={finalizeOpen}
        title='Meccs befejezése'
        message='A meccs az előzményekbe kerül, és nem lesz szerkeszthető. Folytatod?'
        confirmLabel='Befejezés'
        onConfirm={handleFinalize}
        onCancel={() => setFinalizeOpen(false)}
      />
    </AppShell>
  );
}
