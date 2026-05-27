import { Navigate, Route, Routes } from 'react-router-dom';
import { SaveErrorBanner } from './components/common/SaveErrorBanner';
import { SaveIndicator } from './components/common/SaveIndicator';
import { HistoryLegacyRedirect } from './pages/HistoryLegacyRedirect';
import { HistoryMatchPage } from './pages/HistoryMatchPage';
import { HistoryPage } from './pages/HistoryPage';
import { TournamentHistoryDetailPage } from './pages/TournamentHistoryDetailPage';
import { HomePage } from './pages/HomePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { MatchEndPage } from './pages/MatchEndPage';
import { NewMatchPage } from './pages/NewMatchPage';
import { PlayMatchPage } from './pages/PlayMatchPage';
import { PlayersPage } from './pages/PlayersPage';
import { TournamentDuelPage } from './pages/TournamentDuelPage';
import { TournamentHubPage } from './pages/TournamentHubPage';
import { TournamentNewPage } from './pages/TournamentNewPage';
import { TournamentChampionPage } from './pages/TournamentChampionPage';
import { TournamentTiebreakPage } from './pages/TournamentTiebreakPage';

export default function App() {
  return (
    <>
      <SaveErrorBanner />
      <SaveIndicator />
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/match/new" element={<NewMatchPage />} />
      <Route path="/match/play" element={<PlayMatchPage />} />
      <Route path="/match/leaderboard" element={<LeaderboardPage />} />
      <Route path="/match/end" element={<MatchEndPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/history/match/:matchId" element={<HistoryMatchPage />} />
      <Route
        path="/history/tournament/:tournamentId"
        element={<TournamentHistoryDetailPage />}
      />
      <Route path="/history/:legacyId" element={<HistoryLegacyRedirect />} />
      <Route path="/tournament/new" element={<TournamentNewPage />} />
      <Route path="/tournament" element={<TournamentHubPage />} />
      <Route path="/tournament/duel" element={<TournamentDuelPage />} />
      <Route path="/tournament/duel/tiebreak" element={<TournamentTiebreakPage />} />
      <Route path="/tournament/champion" element={<TournamentChampionPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
