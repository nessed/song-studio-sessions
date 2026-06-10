import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { PlayerProvider, usePlayer } from "@/contexts/PlayerContext";
import { GlassPlayer } from "@/components/sessions/GlassPlayer";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/LoadingScreen";
import { DialogProvider } from "@/components/sessions/Dialogs";
// Lazy load all page components for better initial load performance
const Index = lazy(() => import("@/pages/Index"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const SongDetail = lazy(() => import("@/pages/SongDetail"));
const Projects = lazy(() => import("@/pages/Projects"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const Settings = lazy(() => import("@/pages/Settings"));
const Auth = lazy(() => import("@/pages/Auth"));
const SharedSongView = lazy(() => import("@/pages/SharedSongView"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/projects" replace />;
  return <>{children}</>;
}

/* Persistent miniplayer — always mounted, hidden while the in-page deck
   is visible; slides up when the user navigates away or scrolls down. */
function GlobalPlayer() {
  const { song, subtitle, wave, notes, playing, time, duration, deckVisible, togglePlay, seek, addNoteRef } =
    usePlayer();
  const navigate = useNavigate();
  const location = useLocation();

  if (!song) return null;

  const onSongPage = location.pathname === `/song/${song.id}`;
  const goToSong = () => navigate(`/song/${song.id}`);

  const handleAddNote = () => {
    if (addNoteRef.current) addNoteRef.current();
    else goToSong();
  };

  return (
    <GlassPlayer
      song={song}
      subtitle={subtitle}
      wave={wave}
      playing={playing}
      onTogglePlay={togglePlay}
      time={time}
      duration={duration}
      onSeek={seek}
      notes={notes}
      onAddNoteHere={handleAddNote}
      onStems={() => toast("Stem mixer coming soon")}
      hidden={deckVisible}
      onGoToSong={onSongPage ? undefined : goToSong}
    />
  );
}

function AppInner() {
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/song/:id" element={<ProtectedRoute><SongDetail /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/s/:hash" element={<SharedSongView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <GlobalPlayer />
      <Toaster position="bottom-center" />
    </>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlayerProvider>
          <BrowserRouter>
            <DialogProvider>
              <AppInner />
            </DialogProvider>
          </BrowserRouter>
        </PlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
