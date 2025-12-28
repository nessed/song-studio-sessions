import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSongs } from "@/hooks/useSongs";
import { useProjects } from "@/hooks/useProjects";
import { AppHeader } from "@/components/AppHeader";
import { SongListItem } from "@/components/SongListItem";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Plus, Music, Folder, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { songs, loading, createSong } = useSongs();
  const { projects } = useProjects();
  const [newSongTitle, setNewSongTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="min-h-screen bg-[#09090b] relative">
      {/* Subtle ambient glow (default purple when no theme) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -5%, var(--accent-subtle, rgba(124,58,237,0.1)) 0%, transparent 60%)' }}
      />
      
      <AppHeader />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <section className="mb-12 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">Recent Projects</h2>
              <Link to="/projects" className="text-sm text-white/40 hover:text-white transition-colors">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {recentProjects.map((project) => (
                <Link key={project.id} to={`/project/${project.id}`} className="group">
                  <div className="glass-tinted aspect-square rounded-xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                    {project.cover_art_url ? (
                      <img src={project.cover_art_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Folder className="w-10 h-10 text-white/20" />
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-medium text-white truncate group-hover:text-white/80 transition-colors">{project.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Songs */}
        <section className="animate-slide-up">
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
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                />
              </div>
            )}
          </div>

          {/* Create song */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="New song title..."
                value={newSongTitle}
                onChange={(e) => setNewSongTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
              />
              <button
                onClick={handleCreateSong}
                disabled={!newSongTitle.trim()}
                className="px-5 py-3 text-sm font-medium bg-white text-black rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>

          {/* Song List */}
          {sortedSongs.length > 0 ? (
            <div className="border-t border-white/5">
              {sortedSongs.map((song) => (
                <SongListItem key={song.id} song={song} showProject />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Music className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-sm text-white/40">No songs yet. Enter a title above to get started.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
