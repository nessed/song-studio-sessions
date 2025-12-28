import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSong, useSongs } from "@/hooks/useSongs";
import { useSongVersions } from "@/hooks/useSongVersions";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useSongNotes } from "@/hooks/useSongNotes";
import { SONG_STATUSES, SongStatus, Song } from "@/lib/types";
import { SmartTaskPanel } from "@/components/SmartTaskPanel";
import { TimelineNotes } from "@/components/TimelineNotes";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LyricsEditor } from "@/components/lyrics/LyricsEditor";
import { SessionThemeProvider } from "@/components/SessionThemeProvider";
import { ShareModal } from "@/components/ShareModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { 
  ArrowLeft, Upload, Trash2, 
  Music2, ChevronDown, Clock, Folder, Link as LinkIcon, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { song, loading } = useSong(id);
  const { updateSong, deleteSong, uploadCoverArt } = useSongs();
  const { versions, currentVersion, uploadVersion, setCurrentVersion, deleteVersion, uploadProgress } = useSongVersions(id);
  const { tasks, createTask, updateTask, deleteTask } = useTasks(id);
  const { projects } = useProjects();
  const { notes: timelineNotes, createNote, updateNote, deleteNote } = useSongNotes(id);

  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("");
  const [songKey, setSongKey] = useState("");
  const [referenceLink, setReferenceLink] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [noteAddTime, setNoteAddTime] = useState<number | null>(null);
  const [showVersions, setShowVersions] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const lastTimeUpdateRef = useRef(0);

  // Throttle time updates to reduce re-renders (update every 250ms max)
  const handleTimeUpdate = (time: number) => {
    const now = Date.now();
    if (now - lastTimeUpdateRef.current > 250) {
      lastTimeUpdateRef.current = now;
      setCurrentTime(time);
    }
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

  const handleStatusChange = (status: SongStatus) => {
    if (id) updateSong(id, { status });
  };

  const handleProjectChange = (projectId: string) => {
    if (id) {
      const newProjectId = projectId === "none" ? null : projectId;
      updateSong(id, { project_id: newProjectId });
    }
  };

  const handleTagsUpdate = (tags: string[]) => {
    if (id && song) {
      updateSong(id, { mood_tags: tags });
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    await uploadCoverArt(id, file);
    toast.success("Cover uploaded");
  };

  useEffect(() => {
    if (uploadProgress > 0 && uploadProgress < 100) {
      toast.loading(`Uploading... ${uploadProgress}%`, { id: "upload-progress" });
    } else if (uploadProgress === 100) {
      toast.dismiss("upload-progress");
    }
  }, [uploadProgress]);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    try {
      await uploadVersion(file, `Mix v${versions.length + 1}`);
      toast.success("Version uploaded");
    } catch (err) {
      toast.error("Failed to upload");
      toast.dismiss("upload-progress");
    }
  };

  const handleVersionSelect = async (versionId: string) => {
    await setCurrentVersion(versionId);
    const ver = versions.find(v => v.id === versionId);
    toast.success(`Loaded ${ver?.description || `v${ver?.version_number}`}`);
    setShowVersions(false);
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("Delete this song and all its tasks?")) return;
    await deleteSong(id);
    navigate("/dashboard");
  };

  const handleLyricsChange = (lyrics: string) => {
    if (id) {
      debouncedUpdate({ lyrics: lyrics || null });
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white p-6">
        <Music2 className="w-16 h-16 text-white/10 mb-6" />
        <h1 className="text-2xl font-bold mb-3">Song Not Found</h1>
        <p className="text-white/40 mb-8">This song doesn't exist or has been deleted.</p>
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const currentProject = projects.find((p) => p.id === song.project_id);
  const activeVersion = currentVersion || versions[0];

  return (
    <SessionThemeProvider coverUrl={song.cover_art_url} themeColor={(song as any).theme_color}>
      <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden">
        {/* Hidden inputs */}
        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
        <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />

        {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[150px]" 
            style={{ background: 'var(--accent-subtle, rgba(124,58,237,0.1))' }} 
          />
        </div>

        {/* Cover Art Glow */}
        {song.cover_art_url && (
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] blur-[120px] opacity-25 saturate-150"
              style={{ 
                backgroundImage: `url(${song.cover_art_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between bg-[#09090b]/95 border-b border-white/[0.04]">
          <Link
            to={song.project_id ? `/project/${song.project_id}` : "/dashboard"}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{currentProject?.title || "Dashboard"}</span>
          </Link>

          <div className="flex items-center gap-2">
            <ShareModal 
              song={song} 
              onUpdate={() => queryClient.invalidateQueries({ queryKey: ["song", id] })} 
            />
            <button
              onClick={handleDelete}
              className="p-2.5 text-white/40 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex h-[calc(100vh-64px)] overflow-hidden relative z-10">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto" style={{ paddingBottom: "140px" }}>
            <div className="max-w-4xl mx-auto py-12 px-6 space-y-10">

              {/* Hero Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Cover Art */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <motion.button
                    onClick={() => coverInputRef.current?.click()}
                    whileHover={{ scale: 1.02 }}
                    className="relative w-48 h-48 md:w-56 md:h-56 flex-shrink-0 group"
                  >
                    {/* Glow */}
                    {song.cover_art_url && (
                      <div 
                        className="absolute -inset-4 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"
                        style={{ 
                          backgroundImage: `url(${song.cover_art_url})`,
                          backgroundSize: "cover",
                        }}
                      />
                    )}
                    {/* Image */}
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
                      {song.cover_art_url ? (
                        <img src={song.cover_art_url} alt={song.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/[0.03] flex items-center justify-center border-2 border-dashed border-white/10 group-hover:border-white/20 transition-colors">
                          <Music2 className="w-12 h-12 text-white/10" />
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </motion.button>

                  {/* Title & Meta */}
                  <div className="flex-1 text-center md:text-left space-y-4">
                    {/* Title Input */}
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Untitled Song"
                      className="bg-transparent border-none outline-none text-4xl md:text-5xl font-bold tracking-tight text-white placeholder:text-white/10 w-full"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    />

                    {/* Context Line */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/40">
                      {currentProject && (
                        <span className="flex items-center gap-1.5">
                          <Folder className="w-3.5 h-3.5" />
                          {currentProject.title}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDistanceToNow(new Date(song.created_at), { addSuffix: true })}
                      </span>
                      {referenceLink && (
                        <a 
                          href={referenceLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1.5 hover:text-white transition-colors"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          Reference
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {/* Version */}
                      {versions.length > 0 && (
                        <button 
                          onClick={() => versions.length > 1 && setShowVersions(!showVersions)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold transition-all ${versions.length > 1 ? 'hover:bg-white/10 cursor-pointer' : ''}`}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-main, #a78bfa)' }} />
                          <span className="text-white/70">v{activeVersion?.version_number || 1}</span>
                          {activeVersion?.description && (
                            <span className="text-white/40">· {activeVersion.description}</span>
                          )}
                          {versions.length > 1 && (
                            <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${showVersions ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                      )}
                      
                      {/* BPM */}
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold cursor-text">
                        <span className="text-white/40">BPM</span>
                        <input
                          type="text"
                          value={bpm}
                          onChange={(e) => handleBpmChange(e.target.value)}
                          placeholder="---"
                          className="bg-transparent border-none outline-none w-12 text-white/80 text-center font-mono"
                        />
                      </label>

                      {/* Key */}
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold cursor-text">
                        <span className="text-white/40">Key</span>
                        <input
                          type="text"
                          value={songKey}
                          onChange={(e) => handleKeyChange(e.target.value)}
                          placeholder="---"
                          className="bg-transparent border-none outline-none w-12 text-white/80 text-center font-mono"
                        />
                      </label>

                      {/* Status */}
                      <select
                        value={song.status}
                        onChange={(e) => handleStatusChange(e.target.value as SongStatus)}
                        className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/70 cursor-pointer focus:outline-none hover:bg-white/10 transition-colors appearance-none"
                        style={{ paddingRight: '2rem' }}
                      >
                        {SONG_STATUSES.map(s => (
                          <option key={s.value} value={s.value} className="bg-[#09090b] text-white">
                            {s.label}
                          </option>
                        ))}
                      </select>

                      {/* Tags */}
                      {song.mood_tags?.length > 0 && song.mood_tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Version Dropdown */}
                <AnimatePresence>
                  {showVersions && versions.length > 1 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-[#0c0c0f]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                    >
                      {versions.map((ver) => (
                        <button
                          key={ver.id}
                          onClick={() => handleVersionSelect(ver.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 transition-all ${
                            activeVersion?.id === ver.id 
                              ? "bg-white/10 text-white" 
                              : "hover:bg-white/5 text-white/60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              activeVersion?.id === ver.id ? "text-black" : "bg-white/10 text-white/40"
                            }`} style={{ background: activeVersion?.id === ver.id ? 'var(--accent-main, #a78bfa)' : undefined }}>
                              {ver.version_number}
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-medium">{ver.description || `Version ${ver.version_number}`}</div>
                              <div className="text-[10px] text-white/30">
                                {formatDistanceToNow(new Date(ver.created_at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                          {activeVersion?.id === ver.id && (
                            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent-main, #a78bfa)' }}>Playing</div>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Upload Audio CTA */}
              {!song.mp3_url && versions.length === 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => audioInputRef.current?.click()}
                  className="w-full group relative"
                >
                  <div className="absolute -inset-px rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 blur-sm transition-all" />
                  <div className="relative px-8 py-8 rounded-2xl bg-white/[0.03] border border-dashed border-white/10 group-hover:border-white/20 transition-all flex items-center justify-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-white/40 group-hover:text-white/70 transition-colors" />
                    </div>
                    <div className="text-left">
                      <p className="text-base font-semibold text-white/80">Upload your first mix</p>
                      <p className="text-sm text-white/40">MP3, WAV, or other audio formats</p>
                    </div>
                  </div>
                </motion.button>
              )}

              {/* Lyrics Editor */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <LyricsEditor value={song.lyrics || ""} onChange={handleLyricsChange} />
              </motion.div>

            </div>
          </div>

          {/* Right Side - Tasks Panel with glass styling */}
          <div className="w-80 flex-shrink-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="h-full"
            >
              {/* SmartTaskPanel has its own glass-premium styling */}
              <div className="p-4 pb-36 h-full overflow-y-auto scrollbar-thin">
                <SmartTaskPanel
                  tasks={tasks}
                  onCreateTask={createTask}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  currentSection={song.status === 'idea' ? 'Idea' : song.status === 'writing' ? 'Writing' : song.status === 'recording' ? 'Recording' : song.status === 'mixing' ? 'Mixing' : song.status === 'mastering' ? 'Mastering' : 'Production'}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Audio Player */}
        <AudioPlayer
          src={activeVersion?.file_url || song.mp3_url || ""}
          onTimeUpdate={handleTimeUpdate}
          timelineNotes={timelineNotes}
          onRequestAddNote={(time) =>
            setNoteAddTime((prev) => (prev === time ? time + 0.001 : time))
          }
          notesComponent={
            <TimelineNotes
              songId={song.id}
              currentTime={currentTime}
              notes={timelineNotes}
              onCreateNote={createNote}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
              triggerAddTime={noteAddTime ?? undefined}
            />
          }
        />
      </div>
    </SessionThemeProvider>
  );
}
