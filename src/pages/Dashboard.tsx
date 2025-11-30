import { useState } from "react";
import { useSongs, useSessionsDB } from "@/hooks/useSessionsDB";
import { SongRow } from "@/components/SongRow";
import { Header } from "@/components/Header";

export default function Dashboard() {
  const songs = useSongs();
  const { createSong } = useSessionsDB();
  const [newSongTitle, setNewSongTitle] = useState("");

  const handleCreateSong = () => {
    if (newSongTitle.trim()) {
      createSong(newSongTitle.trim());
      setNewSongTitle("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateSong();
    }
  };

  const sortedSongs = [...songs].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Songs</h1>
          <p className="text-sm text-muted-foreground">
            {songs.length === 0
              ? "Start by creating your first song"
              : `${songs.length} song${songs.length !== 1 ? "s" : ""} in progress`}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="New song title…"
              value={newSongTitle}
              onChange={(e) => setNewSongTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-minimal flex-1"
            />
            <button
              onClick={handleCreateSong}
              disabled={!newSongTitle.trim()}
              className="btn-primary disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>

        {sortedSongs.length > 0 && (
          <div className="space-y-1">
            {sortedSongs.map((song) => (
              <SongRow key={song.id} song={song} />
            ))}
          </div>
        )}

        {songs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">
              No songs yet. Enter a title above to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
