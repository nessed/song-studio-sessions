import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSong, useSongs } from "@/hooks/useSongs";
import { useSongVersions } from "@/hooks/useSongVersions";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { SONG_STATUSES, SongStatus, SONG_SECTIONS, Song } from "@/lib/types";
import { CoverBackground } from "@/components/CoverBackground";
import { MoodTagsInput } from "@/components/MoodTagsInput";
import { TaskSection } from "@/components/TaskSection";
import { TimelineNotes } from "@/components/TimelineNotes";
import { HeroStrip } from "@/components/HeroStrip";
import { ReferencePill } from "@/components/ReferencePill";
import { GlassAudioPlayer } from "@/components/GlassAudioPlayer";
import { LyricsEditor } from "@/components/lyrics/LyricsEditor";
import { ArrowLeft, Trash2, PanelRight, PanelRightClose, Upload } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { song, loading } = useSong(id);
  const { updateSong, deleteSong, uploadCoverArt } = useSongs();
  const { versions, currentVersion, uploadVersion, setCurrentVersion, isUploading } = useSongVersions(id);
  const { tasks, createTask, updateTask, deleteTask } = useTasks(id);
  const { projects } = useProjects();

  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("");
  const [songKey, setSongKey] = useState("");
  const [referenceLink, setReferenceLink] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [showTasks, setShowTasks] = useState(true);

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
    await uploadVersion(file, `Mix v${versions.length + 1}`);
    toast.dismiss();
    toast.success("Version uploaded");
  };

  const handleVersionSelect = async (version: typeof currentVersion) => {
    if (!version) return;
    await setCurrentVersion(version.id);
    if (song) {
      setLocalSong({ mp3_url: version.file_url });
    }
    toast.success(`Loaded ${version.description || `v${version.version_number}`}`);
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("Delete this song and all its tasks?")) return;
    await deleteSong(id);
    navigate("/dashboard");
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
          <Link to="/dashboard" className="text-sm text-foreground underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentProject = projects.find((p) => p.id === song.project_id);

  // Determine accent color based on mood tags
  const getAccentColor = () => {
    const tags = song.mood_tags || [];
    if (tags.some(t => t.toLowerCase().includes("chill") || t.toLowerCase().includes("ambient"))) {
      return "77, 208, 225"; // Cyan
    }
    if (tags.some(t => t.toLowerCase().includes("energetic") || t.toLowerCase().includes("upbeat"))) {
      return "251, 146, 60"; // Orange
    }
    if (tags.some(t => t.toLowerCase().includes("dark") || t.toLowerCase().includes("moody"))) {
      return "139, 92, 246"; // Purple
    }
    return "99, 102, 241"; // Indigo default
  };

  return (
    <div className="min-h-screen relative bg-background">
      <CoverBackground imageUrl={song.cover_art_url} />

      {/* Hidden inputs */}
      <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
      <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/60 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to={song.project_id ? `/project/${song.project_id}` : "/dashboard"}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{currentProject?.title || "Dashboard"}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTasks(!showTasks)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
            >
              {showTasks ? <PanelRightClose className="w-5 h-5" /> : <PanelRight className="w-5 h-5" />}
            </button>
            <button onClick={handleDelete} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-white/5">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pb-40 transition-all duration-300">
          <div className="max-w-2xl mx-auto py-8 px-6">
            
            {/* Hero Strip */}
            <HeroStrip
              coverUrl={song.cover_art_url}
              title={title}
              onTitleChange={handleTitleChange}
              bpm={bpm}
              onBpmChange={handleBpmChange}
              songKey={songKey}
              onKeyChange={handleKeyChange}
              status={song.status}
              onStatusChange={(s) => handleStatusChange(s as SongStatus)}
              statuses={SONG_STATUSES}
              versions={versions}
              currentVersion={currentVersion}
              onSelectVersion={handleVersionSelect}
              onCoverClick={() => coverInputRef.current?.click()}
              onVersionUpload={uploadVersion}
              isUploading={isUploading}
            />

            {/* Sub-controls row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap items-center gap-4 mb-8"
            >
              {/* Project selector */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground text-xs">Project:</span>
                <select
                  value={song.project_id || "none"}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="bg-transparent border-none text-foreground/70 text-sm focus:outline-none cursor-pointer hover:text-foreground transition-colors"
                >
                  <option value="none" className="bg-background">None</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-background">
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="h-4 w-px bg-border" />

              {/* Reference Pill */}
              <ReferencePill
                value={referenceLink}
                onChange={handleReferenceLinkChange}
              />
            </motion.div>

            {/* Mood Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-8"
            >
              <MoodTagsInput tags={song.mood_tags} onUpdate={handleTagsUpdate} />
            </motion.div>

            {/* Upload audio button if no audio */}
            {!song.mp3_url && versions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="w-full py-6 border border-dashed border-border rounded-xl text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors flex items-center justify-center gap-3 group"
                >
                  <div className="relative">
                    <Upload className="w-5 h-5" />
                    <div className="absolute inset-0 blur-md bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span>Upload your first mix</span>
                </button>
              </motion.div>
            )}

            {/* Lyrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <h3 className="section-heading">Lyrics</h3>
              <LyricsEditor value={song.lyrics || ""} onChange={handleLyricsChange} />
            </motion.div>
          </div>
        </div>

        {/* Right Sidebar - Tasks */}
        <motion.div
          initial={false}
          animate={{
            width: showTasks ? 320 : 0,
            opacity: showTasks ? 1 : 0,
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="border-l border-border bg-background flex flex-col overflow-hidden"
        >
          <div className="p-6 w-80 overflow-y-auto flex-1">
            <h3 className="section-heading">Tasks</h3>
            <div className="space-y-8">
              {SONG_SECTIONS.map((section) => (
                <TaskSection
                  key={section}
                  section={section}
                  tasks={tasks.filter((t) => t.section === section)}
                  onCreateTask={(taskTitle) => createTask(section, taskTitle)}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Glass Audio Player */}
      <GlassAudioPlayer
        src={currentVersion?.file_url || song.mp3_url}
        onTimeUpdate={setCurrentTime}
        noteTray={<TimelineNotes songId={song.id} currentTime={currentTime} />}
        accentColor={getAccentColor()}
        onUploadClick={() => audioInputRef.current?.click()}
      />
    </div>
  );
}