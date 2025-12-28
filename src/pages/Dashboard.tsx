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
import { Plus, Music, Folder, Search, User, Disc3 } from "lucide-react";
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
        {/* Ambient Background - matching SongDetail exactly */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[150px]" 
            style={{ background: 'var(--accent-subtle, rgba(124,58,237,0.1))' }} 
          />
        </div>

        {/* Header - Premium Design */}
        <header className="sticky top-0 z-30 border-b border-white/[0.06]">
          {/* Glass background */}
          <div className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-2xl" />
          
          <div className="relative px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6 sm:gap-10">
              <SessionsLogo />

              {/* Navigation Tabs - Desktop */}
              <nav className="hidden sm:flex items-center">
                <div className="flex items-center bg-white/[0.04] rounded-full p-1 border border-white/[0.06]">
                  <Link
                    to="/dashboard"
                    className={`relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                      isActive("/dashboard") || isActive("/song")
                        ? "text-white bg-white/[0.12] shadow-sm"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    Songs
                  </Link>
                  <Link
                    to="/projects"
                    className={`relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                      isActive("/projects") || isActive("/project")
                        ? "text-white bg-white/[0.12] shadow-sm"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    Projects
                  </Link>
                </div>
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle could go here */}
              <Link 
                to="/settings" 
                className="group relative p-1.5 rounded-full hover:bg-white/5 transition-all"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-white/20 transition-all"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-all">
                    <User className="w-4 h-4 text-white/60" />
                  </div>
                )}
              </Link>
            </div>
          </div>
        </header>
        
        {/* Mobile Navigation Bar */}
        <nav className="sm:hidden sticky top-[57px] z-20 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/[0.04] px-4 py-2">
          <div className="flex items-center bg-white/[0.03] rounded-full p-1 border border-white/[0.05]">
            <Link
              to="/dashboard"
              className={`flex-1 py-2.5 text-center text-sm font-medium rounded-full transition-all ${
                isActive("/dashboard") || isActive("/song")
                  ? "text-white bg-white/10"
                  : "text-white/40"
              }`}
            >
              Songs
            </Link>
            <Link
              to="/projects"
              className={`flex-1 py-2.5 text-center text-sm font-medium rounded-full transition-all ${
                isActive("/projects") || isActive("/project")
                  ? "text-white bg-white/10"
                  : "text-white/40"
              }`}
            >
              Projects
            </Link>
          </div>
        </nav>

        <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-14"
            >
              <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">Recent Projects</p>
                <Link to="/projects" className="text-xs text-white/30 hover:text-white transition-colors">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recentProjects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={`/project/${project.id}`} className="group block">
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06] group-hover:border-white/10 transition-all">
                        {/* Glow effect on hover */}
                        {project.cover_art_url && (
                          <div 
                            className="absolute -inset-4 blur-xl opacity-0 group-hover:opacity-30 transition-opacity"
                            style={{ 
                              backgroundImage: `url(${project.cover_art_url})`,
                              backgroundSize: "cover",
                            }}
                          />
                        )}
                        {project.cover_art_url ? (
                          <img src={project.cover_art_url} alt="" className="relative w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Folder className="w-10 h-10 text-white/10" />
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-sm font-medium text-white/50 truncate group-hover:text-white transition-colors">{project.title}</p>
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
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 
                  className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2"
                  style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}
                >
                  All Songs
                </h1>
                <p className="text-sm text-white/40">
                  {songs.length === 0 ? "Start by creating your first song" : `${songs.length} song${songs.length !== 1 ? "s" : ""} in your library`}
                </p>
              </div>

              {/* Search Bar - matching SongDetail input style */}
              {songs.length > 0 && (
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search songs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Create song - Glass panel matching SongDetail */}
            <div className="mb-8">
              <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="pl-3">
                  <Disc3 className="w-5 h-5 text-white/20" />
                </div>
                <input
                  type="text"
                  placeholder="New song title..."
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-2 py-3 text-sm bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                />
                <button
                  onClick={handleCreateSong}
                  disabled={!newSongTitle.trim()}
                  className="px-5 py-2.5 mr-1 text-sm font-semibold bg-white text-black rounded-xl hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </button>
              </div>
            </div>

            {/* Song List - Glass panel matching SongDetail version dropdown */}
            {sortedSongs.length > 0 ? (
              <div className="rounded-2xl overflow-hidden bg-[#0c0c0f]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40">
                <div className="divide-y divide-white/[0.04]">
                  {sortedSongs.map((song, i) => (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <SongListItem song={song} showProject projects={projects} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <Music className="w-8 h-8 text-white/10" />
                </div>
                <p className="text-sm text-white/40 mb-1">No songs yet</p>
                <p className="text-xs text-white/20">Enter a title above to get started</p>
              </div>
            )}
          </motion.section>
        </main>
      </div>
    </SessionThemeProvider>
  );
}
