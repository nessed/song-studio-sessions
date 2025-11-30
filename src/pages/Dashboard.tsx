import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSongs } from "@/hooks/useSongs";
import { useProjects } from "@/hooks/useProjects";
import { AppHeader } from "@/components/AppHeader";
import { SongListItem } from "@/components/SongListItem";
import { Plus, Music, Folder } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { songs, loading, createSong } = useSongs();
  const { projects } = useProjects();
  const [newSongTitle, setNewSongTitle] = useState("");

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

  const sortedSongs = [...songs].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const recentProjects = projects.slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-muted-foreground">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {recentProjects.length > 0 && (
          <section className="mb-12 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-heading mb-0">Recent Projects</h2>
              <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recentProjects.map((project) => (
                <Link key={project.id} to={`/project/${project.id}`} className="p-4 rounded-xl bg-card/40 hover:bg-card/70 border border-border/50 hover:border-border transition-all">
                  <div className="w-full aspect-square rounded-lg bg-muted overflow-hidden mb-3">
                    {project.cover_art_url ? (
                      <img src={project.cover_art_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Folder className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{project.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="animate-slide-up">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">All Songs</h2>
            <p className="text-sm text-muted-foreground">
              {songs.length === 0 ? "Start by creating your first song" : `${songs.length} song${songs.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3">
              <input type="text" placeholder="New song title..." value={newSongTitle} onChange={(e) => setNewSongTitle(e.target.value)} onKeyDown={handleKeyDown} className="input-minimal flex-1" />
              <button onClick={handleCreateSong} disabled={!newSongTitle.trim()} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                <Plus className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>

          {sortedSongs.length > 0 ? (
            <div className="space-y-2">
              {sortedSongs.map((song) => (
                <SongListItem key={song.id} song={song} showProject />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-panel-subtle">
              <Music className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No songs yet. Enter a title above to get started.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
