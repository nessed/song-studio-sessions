import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSong, useSongs } from "@/hooks/useSongs";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { SONG_STATUSES, SongStatus, SONG_SECTIONS, Song } from "@/lib/types";
import { CoverBackground } from "@/components/CoverBackground";
import { MoodTagsInput } from "@/components/MoodTagsInput";
import { TaskSection } from "@/components/TaskSection";
import { AudioPlayer } from "@/components/AudioPlayer";
import { TimelineNotes } from "@/components/TimelineNotes";
import { LyricsEditor } from "@/components/LyricsEditor";
import { ArrowLeft, Trash2, ExternalLink, Upload, Image } from "lucide-react";
import { toast } from "sonner";

export default function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { song, loading } = useSong(id);
  const { updateSong, deleteSong, uploadCoverArt, uploadMp3 } = useSongs();
  const { tasks, createTask, updateTask, deleteTask } = useTasks(id);
  const { projects } = useProjects();

  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("");
  const [songKey, setSongKey] = useState("");
  const [referenceLink, setReferenceLink] = useState("");
  const [currentTime, setCurrentTime] = useState(0);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const setLocalSong = (updates: Partial<Song>) => {
    if (!id) return;
    queryClient.setQueryData(["song", id], (prev: Song | null) =>
      prev ? { ...prev, ...updates } : prev
    );
  };

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setBpm(song.bpm?.toString() || "");
      setSongKey(song.key || "");
      setReferenceLink(song.reference_link || "");
    }
  }, [song]);

  const debouncedUpdate = (updates: Parameters<typeof updateSong>[1]) => {
    if (!id) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSong(id, updates);
    }, 500);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    debouncedUpdate({ title: value });
  };

  const handleBpmChange = (value: string) => {
    setBpm(value);
    const numBpm = parseInt(value);
    debouncedUpdate({ bpm: isNaN(numBpm) ? null : numBpm });
  };

  const handleKeyChange = (value: string) => {
    setSongKey(value);
    debouncedUpdate({ key: value || null });
  };

  const handleReferenceLinkChange = (value: string) => {
    setReferenceLink(value);
    debouncedUpdate({ reference_link: value || null });
  };

  const handleStatusChange = (status: SongStatus) => {
    if (id) updateSong(id, { status });
    if (song) setLocalSong({ status });
  };

  const handleProjectChange = (projectId: string) => {
    if (id) {
      const newProjectId = projectId === "none" ? null : projectId;
      updateSong(id, { project_id: newProjectId });
      if (song) setLocalSong({ project_id: newProjectId });
    }
  };

  const handleTagsUpdate = (tags: string[]) => {
    if (id && song) {
      updateSong(id, { mood_tags: tags });
      setLocalSong({ mood_tags: tags });
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    const url = await uploadCoverArt(id, file);
    if (url && song) {
      setLocalSong({ cover_art_url: url });
      toast.success("Cover uploaded");
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    toast.loading("Uploading...");
    const url = await uploadMp3(id, file);
    toast.dismiss();
    if (url && song) {
      setLocalSong({ mp3_url: url });
      toast.success("Audio uploaded");
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("Delete this song and all its tasks?")) return;
    await deleteSong(id);
    navigate("/");
  };

  const handleLyricsChange = (lyrics: string) => {
    if (id) {
      debouncedUpdate({ lyrics: lyrics || null });
      if (song) setLocalSong({ lyrics });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

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

  const currentProject = projects.find((p) => p.id === song.project_id);

  return (
    <div className="min-h-screen relative">
      <CoverBackground imageUrl={song.cover_art_url} />

      {/* Hidden inputs */}
      <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
      <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to={song.project_id ? `/project/${song.project_id}` : "/"}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{currentProject?.title || "Dashboard"}</span>
          </Link>

          <button onClick={handleDelete} className="btn-icon text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-[1fr,400px]">
          {/* Left column */}
          <div className="space-y-10 animate-fade-in">
            {/* Song header */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Cover art */}
              <button
                onClick={() => coverInputRef.current?.click()}
                className="cover-art w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0 relative group cursor-pointer"
              >
                {song.cover_art_url ? (
                  <img src={song.cover_art_url} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted gap-2">
                    <Image className="w-8 h-8 text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground">Add cover</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                  <span className="text-xs text-transparent group-hover:text-foreground transition-colors font-medium">
                    Change
                  </span>
                </div>
              </button>

              {/* Meta */}
              <div className="flex-1 space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Untitled"
                  className="input-inline text-2xl sm:text-3xl font-semibold w-full"
                />

                <div className="flex flex-wrap items-center gap-3">
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

                {/* Project selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Project:</span>
                  <select
                    value={song.project_id || "none"}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="select-minimal text-sm"
                  >
                    <option value="none">None</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <MoodTagsInput tags={song.mood_tags} onUpdate={handleTagsUpdate} />
              </div>
            </div>

            {/* Reference link */}
            <div className="glass-panel-subtle p-4">
              <label className="section-heading block mb-2">Reference Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={referenceLink}
                  onChange={(e) => handleReferenceLinkChange(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="input-inline flex-1 text-sm text-muted-foreground"
                />
                {referenceLink && (
                  <a
                    href={referenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-icon"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Audio section */}
            <div className="glass-panel-subtle p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-heading mb-0">Demo</h3>
                <button onClick={() => audioInputRef.current?.click()} className="btn-ghost text-xs flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Upload MP3
                </button>
              </div>

              {song.mp3_url ? (
                <>
                  <AudioPlayer src={song.mp3_url} onTimeUpdate={setCurrentTime} />
                  <div className="mt-6">
                    <TimelineNotes songId={song.id} currentTime={currentTime} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No demo attached yet</p>
              )}
            </div>

            {/* Lyrics */}
            <div>
              <h3 className="section-heading">Lyrics</h3>
              <LyricsEditor value={song.lyrics || ""} onChange={handleLyricsChange} />
            </div>
          </div>

          {/* Right column - Tasks */}
          <div className="space-y-8 animate-slide-up">
            <h3 className="section-heading">Tasks</h3>
            <div className="space-y-8">
              {SONG_SECTIONS.map((section) => (
                <TaskSection
                  key={section}
                  section={section}
                  tasks={tasks.filter((t) => t.section === section)}
                  onCreateTask={(title) => createTask(section, title)}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
