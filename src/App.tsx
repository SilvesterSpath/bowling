import { Navigate, Route, Routes } from 'react-router-dom';
import { SaveErrorBanner } from './components/common/SaveErrorBanner';
import { HistoryPage } from './pages/HistoryPage';
import { HomePage } from './pages/HomePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { MatchEndPage } from './pages/MatchEndPage';
import { NewMatchPage } from './pages/NewMatchPage';
import { PlayMatchPage } from './pages/PlayMatchPage';
import { PlayersPage } from './pages/PlayersPage';

export default function App() {
  return (
    <>
      <SaveErrorBanner />
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/match/new" element={<NewMatchPage />} />
      <Route path="/match/play" element={<PlayMatchPage />} />
      <Route path="/match/leaderboard" element={<LeaderboardPage />} />
      <Route path="/match/end" element={<MatchEndPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/history/:matchId" element={<HistoryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
