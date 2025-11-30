import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSong, useSongTasks, useSessionsDB } from "@/hooks/useSessionsDB";
import { SONG_SECTIONS, SONG_STATUSES, SongStatus } from "@/lib/types";
import { TaskSection } from "@/components/TaskSection";
import { CoverArtUpload } from "@/components/CoverArtUpload";
import { MoodTags } from "@/components/MoodTags";
import { AmbientBackground } from "@/components/AmbientBackground";
import { useTheme } from "@/hooks/useTheme";

export default function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { updateSong, deleteSong } = useSessionsDB();
  
  const song = useSong(id || "");
  const tasks = useSongTasks(id || "");

  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("");
  const [songKey, setSongKey] = useState("");
  
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setBpm(song.bpm?.toString() || "");
      setSongKey(song.key || "");
    }
  }, [song]);

  const debouncedUpdate = (updates: Parameters<typeof updateSong>[1]) => {
    if (!id) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSong(id, updates);
    }, 300);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    debouncedUpdate({ title: value });
  };

  const handleBpmChange = (value: string) => {
    setBpm(value);
    const numBpm = parseInt(value);
    debouncedUpdate({ bpm: isNaN(numBpm) ? undefined : numBpm });
  };

  const handleKeyChange = (value: string) => {
    setSongKey(value);
    debouncedUpdate({ key: value || undefined });
  };

  const handleStatusChange = (status: SongStatus) => {
    if (id) updateSong(id, { status });
  };

  const handleCoverArtUpload = (dataUrl: string) => {
    if (id) updateSong(id, { coverArtDataUrl: dataUrl });
  };

  const handleTagsUpdate = (tags: string[]) => {
    if (id) updateSong(id, { moodTags: tags });
  };

  const handleDelete = () => {
    if (id && window.confirm("Delete this song and all its tasks?")) {
      deleteSong(id);
      navigate("/");
    }
  };

  if (!song) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Song not found</p>
          <Link to="/" className="text-sm text-foreground underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AmbientBackground imageUrl={song.coverArtDataUrl} />
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/60 backdrop-blur-md border-b border-border/50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </Link>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="btn-ghost text-xs"
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
            <button
              onClick={handleDelete}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Song Info */}
        <div className="flex gap-8 mb-16 animate-fade-in">
          <CoverArtUpload
            currentArt={song.coverArtDataUrl}
            onUpload={handleCoverArtUpload}
          />
          
          <div className="flex-1 space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Untitled"
              className="input-inline text-2xl font-semibold w-full"
            />
            
            <div className="flex items-center gap-4">
              <select
                value={song.status}
                onChange={(e) => handleStatusChange(e.target.value as SongStatus)}
                className="select-minimal"
              >
                {SONG_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              
              <input
                type="text"
                value={bpm}
                onChange={(e) => handleBpmChange(e.target.value)}
                placeholder="BPM"
                className="input-inline text-sm w-16 text-muted-foreground"
              />
              
              <input
                type="text"
                value={songKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="Key"
                className="input-inline text-sm w-16 text-muted-foreground"
              />
            </div>
            
            <MoodTags tags={song.moodTags} onUpdate={handleTagsUpdate} />
          </div>
        </div>

        {/* Task Sections */}
        <div className="grid gap-12 md:grid-cols-2">
          {SONG_SECTIONS.map((section) => (
            <TaskSection
              key={section}
              songId={song.id}
              section={section}
              tasks={tasks}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
