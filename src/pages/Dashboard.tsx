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
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Ambient Background - matching SongDetail */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/8 blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-violet-500/5 blur-[100px]" />
        </div>

        {/* Header - Glass style matching SongDetail */}
        <header className="sticky top-0 z-30 relative overflow-hidden">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
          
          <div className="relative max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <SessionsLogo />

              <nav className="hidden sm:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 text-sm rounded-full transition-all ${
                    isActive("/dashboard") || isActive("/song")
                      ? "text-foreground bg-white/10 border border-white/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  Songs
                </Link>
                <Link
                  to="/projects"
                  className={`px-4 py-2 text-sm rounded-full transition-all ${
                    isActive("/projects") || isActive("/project")
                      ? "text-foreground bg-white/10 border border-white/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  Projects
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/settings" className="p-2 rounded-full hover:bg-white/5 transition-colors">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </Link>
            </div>
          </div>
          
          {/* Mobile nav */}
          <nav className="sm:hidden relative px-6 pb-3 flex items-center gap-2">
            <Link
              to="/dashboard"
              className={`flex-1 py-2 text-center text-sm rounded-full transition-all ${
                isActive("/dashboard") || isActive("/song")
                  ? "text-foreground bg-white/10 border border-white/10"
                  : "text-muted-foreground"
              }`}
            >
              Songs
            </Link>
            <Link
              to="/projects"
              className={`flex-1 py-2 text-center text-sm rounded-full transition-all ${
                isActive("/projects") || isActive("/project")
                  ? "text-foreground bg-white/10 border border-white/10"
                  : "text-muted-foreground"
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
              transition={{ duration: 0.5 }}
              className="mb-14"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 rounded-full bg-primary/50" />
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Recent Projects</h2>
                </div>
                <Link to="/projects" className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
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
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {project.cover_art_url ? (
                          <>
                            {/* Image glow */}
                            <div 
                              className="absolute -inset-4 blur-xl opacity-0 group-hover:opacity-40 transition-opacity"
                              style={{ 
                                backgroundImage: `url(${project.cover_art_url})`,
                                backgroundSize: "cover",
                              }}
                            />
                            <img src={project.cover_art_url} alt="" className="relative w-full h-full object-cover" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Folder className="w-10 h-10 text-white/10" />
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-sm font-medium text-muted-foreground truncate group-hover:text-foreground transition-colors">{project.title}</p>
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
                  className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2"
                  style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}
                >
                  All Songs
                </h1>
                <p className="text-sm text-muted-foreground">
                  {songs.length === 0 ? "Start by creating your first song" : `${songs.length} song${songs.length !== 1 ? "s" : ""} in your library`}
                </p>
              </div>

              {/* Search Bar */}
              {songs.length > 0 && (
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                  <input
                    type="text"
                    placeholder="Search songs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-full pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Create song - Glass panel */}
            <div className="mb-8">
              <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
                <div className="pl-3">
                  <Disc3 className="w-5 h-5 text-muted-foreground/30" />
                </div>
                <input
                  type="text"
                  placeholder="New song title..."
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-2 py-3 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                />
                <button
                  onClick={handleCreateSong}
                  disabled={!newSongTitle.trim()}
                  className="px-5 py-2.5 mr-1 text-sm font-semibold bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </button>
              </div>
            </div>

            {/* Song List - Glass panel */}
            {sortedSongs.length > 0 ? (
              <div className="rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
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
                  <Music className="w-8 h-8 text-muted-foreground/20" />
                </div>
                <p className="text-sm text-muted-foreground/60 mb-1">No songs yet</p>
                <p className="text-xs text-muted-foreground/40">Enter a title above to get started</p>
              </div>
            )}
          </motion.section>
        </main>
      </div>
    </SessionThemeProvider>
  );
}
