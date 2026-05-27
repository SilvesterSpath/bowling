import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';
import { useActiveMatch } from '../hooks/useActiveMatch';
import { useAppState } from '../hooks/useAppState';
import {
  computeRoundTitles,
  getLatestCompleteRound,
  toRoundTitleDisplayMap,
} from '../utils/roundTitles';
import { getRankings } from '../utils/scoring';

export function LeaderboardPage() {
  const activeMatch = useActiveMatch();
  const { state } = useAppState();

  const roundTitlesByPlayerId = useMemo(() => {
    if (!activeMatch) {
      return new Map();
    }
    const round = getLatestCompleteRound(activeMatch);
    if (!round) {
      return new Map();
    }
    return toRoundTitleDisplayMap(
      computeRoundTitles(round, round.index, activeMatch.playerIds),
    );
  }, [activeMatch]);

  if (!activeMatch) {
    return <Navigate to='/' replace />;
  }

  const rankings = getRankings(activeMatch);
  const playersById = new Map(
    state.players
      .filter((player) => activeMatch.playerIds.includes(player.id))
      .map((player) => [player.id, player]),
  );

  return (
    <AppShell compact>
      <PageHeader
        title='Eredménytábla'
        backTo='/match/play'
        backLabel='Játék'
      />
      <p className='leaderboard-page__match'>{activeMatch.name}</p>
      <LeaderboardTable
        rankings={rankings}
        playersById={playersById}
        titlesByPlayerId={roundTitlesByPlayerId}
      />
      <Link to='/match/end' className='btn btn--primary btn--block'>
        Meccs vége
      </Link>
      <Link to='/match/play' className='btn btn--secondary btn--block'>
        Vissza a játékhoz
      </Link>
    </AppShell>
  );
}
