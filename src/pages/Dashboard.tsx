import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSongs } from "@/hooks/useSongs";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { SongListItem } from "@/components/SongListItem";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SessionThemeProvider } from "@/components/SessionThemeProvider";
import { SessionsLogo } from "@/components/SessionsLogo";
import { Plus, Music, Folder, Search, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { songs, loading, createSong } = useSongs();
  const { projects } = useProjects();
  const [newSongTitle, setNewSongTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const handleCreateSong = async () => {
    if (!newSongTitle.trim()) return;
    const song = await createSong(newSongTitle.trim());
    if (song) {
      setNewSongTitle("");
      navigate(`/song/${song.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateSong();
    }
  };

  const sortedSongs = [...songs]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .filter((song) => song.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const recentProjects = projects.slice(0, 4);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SessionThemeProvider>
      <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden">

        {/* Header */}
        <header className="sticky top-0 z-30 relative overflow-hidden">
          {/* Glass background */}
          <div className="absolute inset-0 bg-[#09090b]/85 backdrop-blur-2xl" />
          
          {/* Theme-tinted glow */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{ background: 'linear-gradient(90deg, var(--accent-subtle, rgba(124,58,237,0.08)) 0%, transparent 40%)' }}
          />
          
          {/* Top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
          
          {/* Bottom border */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
          
          <div className="relative max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <SessionsLogo />

              <nav className="hidden sm:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive("/dashboard") || isActive("/song")
                      ? "text-white bg-white/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Songs
                </Link>
                <Link
                  to="/projects"
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive("/projects") || isActive("/project")
                      ? "text-white bg-white/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Projects
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/settings" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-white/50" />
                  </div>
                )}
              </Link>
            </div>
          </div>
          
          {/* Mobile nav */}
          <nav className="sm:hidden px-6 pb-3 flex items-center gap-2">
            <Link
              to="/dashboard"
              className={`flex-1 py-2 text-center text-sm rounded-lg transition-colors ${
                isActive("/dashboard") || isActive("/song")
                  ? "text-white bg-white/10"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Songs
            </Link>
            <Link
              to="/projects"
              className={`flex-1 py-2 text-center text-sm rounded-lg transition-colors ${
                isActive("/projects") || isActive("/project")
                  ? "text-white bg-white/10"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Projects
            </Link>
          </nav>
        </header>

        <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Recent Projects</h2>
                <Link to="/projects" className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-wider">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {recentProjects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <Link to={`/project/${project.id}`} className="group block">
                      <div className="glass-premium glass-noise aspect-square rounded-2xl overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-300">
                        {/* Glow effect on hover */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          style={{ background: 'radial-gradient(ellipse at center, var(--accent-subtle, rgba(124,58,237,0.15)) 0%, transparent 70%)' }}
                        />
                        {project.cover_art_url ? (
                          <img src={project.cover_art_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center border border-white/[0.06]">
                            <Folder className="w-10 h-10 text-white/10" />
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-sm font-medium text-white/80 truncate group-hover:text-white transition-colors">{project.title}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* All Songs */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">All Songs</h1>
                <p className="text-sm text-white/40">
                  {songs.length === 0 ? "Start by creating your first song" : `${songs.length} song${songs.length !== 1 ? "s" : ""}`}
                </p>
              </div>

              {/* Search Bar */}
              {songs.length > 0 && (
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    placeholder="Search songs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Create song */}
            <div className="mb-8">
              <div 
                className="flex items-center gap-3 p-1 rounded-2xl transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <input
                  type="text"
                  placeholder="New song title..."
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-4 py-3 text-sm bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                />
                <button
                  onClick={handleCreateSong}
                  disabled={!newSongTitle.trim()}
                  className="px-5 py-2.5 mr-1 text-sm font-semibold bg-white text-black rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </button>
              </div>
            </div>

            {/* Song List */}
            {sortedSongs.length > 0 ? (
              <div className="glass-premium glass-noise rounded-2xl overflow-hidden">
                <div className="divide-y divide-white/[0.04]">
                  {sortedSongs.map((song) => (
                    <SongListItem key={song.id} song={song} showProject />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 glass-premium glass-noise rounded-2xl">
                <Music className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-sm text-white/40">No songs yet. Enter a title above to get started.</p>
              </div>
            )}
          </motion.section>
        </main>
      </div>
    </SessionThemeProvider>
  );
}
