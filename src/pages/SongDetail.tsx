import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSong, useSongs } from "@/hooks/useSongs";
import { useSongVersions } from "@/hooks/useSongVersions";
import { useSongStems } from "@/hooks/useSongStems";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useSongNotes } from "@/hooks/useSongNotes";
import { SONG_STATUSES, SongStatus, SONG_SECTIONS, Song, StemType } from "@/lib/types";
import { SmartTaskPanel } from "@/components/SmartTaskPanel";
import { TimelineNotes } from "@/components/TimelineNotes";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LyricsEditor } from "@/components/lyrics/LyricsEditor";
import { StemMixer } from "@/components/StemMixer";
import { SessionThemeProvider } from "@/components/SessionThemeProvider";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { SongHeader } from "@/components/SongHeader";
import { SongMetadata } from "@/components/SongMetadata";
import { LoadingScreen } from "@/components/LoadingScreen";

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
  const { stems, uploadStem, updateStem, deleteStem, isUploading: isStemUploading, uploadProgress: stemUploadProgress } = useSongStems(currentVersion?.id);
  const [isPlaying, setIsPlaying] = useState(false);

  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("");
  const [songKey, setSongKey] = useState("");
  const [referenceLink, setReferenceLink] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [showTasks, setShowTasks] = useState(true);
  const [noteAddTime, setNoteAddTime] = useState<number | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

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

  // Watch upload progress
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

  const handleVersionSelect = async (version: typeof currentVersion) => {
    if (!version) return;
    await setCurrentVersion(version.id);
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
    }
  };

  if (loading) {
    return (
      <LoadingScreen />
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

  return (
    <SessionThemeProvider coverUrl={song.cover_art_url} themeColor={(song as any).theme_color}>
    <div className="min-h-screen relative">

      {/* Hidden inputs */}
      <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
      <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />

      <SongHeader
        song={song}
        project={currentProject}
        showTasks={showTasks}
        onToggleTasks={() => setShowTasks(!showTasks)}
        onDelete={handleDelete}
      />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto transition-all duration-300" style={{ paddingBottom: "120px" }}>
          <div className="max-w-6xl mx-auto py-10 px-6 space-y-8">
            
            <SongMetadata
              song={song}
              title={title}
              onTitleChange={handleTitleChange}
              bpm={bpm}
              onBpmChange={handleBpmChange}
              songKey={songKey}
              onKeyChange={handleKeyChange}
              referenceLink={referenceLink}
              onReferenceLinkChange={handleReferenceLinkChange}
              onStatusChange={handleStatusChange}
              projects={projects}
              onProjectChange={handleProjectChange}
              versions={versions}
              currentVersion={currentVersion}
              onVersionSelect={handleVersionSelect}
              onVersionDelete={async (v) => {
                await deleteVersion(v.id);
                toast.success("Version deleted");
              }}
              onCoverClick={() => coverInputRef.current?.click()}
              onTagsUpdate={handleTagsUpdate}
              onUpdateSong={() => queryClient.invalidateQueries({ queryKey: ["song", id] })}
            />

            {/* Upload audio button if no audio */}
            {!song.mp3_url && versions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="py-4"
              >
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="relative w-full group"
                >
                  {/* Subtle hover glow */}
                  <div className="absolute -inset-px rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
                  
                  <div className="relative px-8 py-6 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 group-hover:border-white/15 transition-all flex items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" />
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white/90">Upload your first mix</p>
                      <p className="text-xs text-white/40">Drag and drop or click to browse</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            )}

            {/* Lyrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <LyricsEditor value={song.lyrics || ""} onChange={handleLyricsChange} />
            </motion.div>

            {/* Stem Mixer */}
            {currentVersion && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <StemMixer
                  stems={stems}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  onUpdateStem={updateStem}
                  onDeleteStem={async (stemId) => {
                    await deleteStem(stemId);
                    toast.success("Stem deleted");
                  }}
                  onUploadStem={async (file, stemType) => {
                    await uploadStem(file, stemType);
                    toast.success("Stem uploaded");
                  }}
                  isUploading={isStemUploading}
                  uploadProgress={stemUploadProgress}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Tasks */}
        <motion.div
          initial={false}
          animate={{
            width: showTasks ? 260 : 0,
            opacity: showTasks ? 1 : 0,
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="border-l border-white/10 bg-[#09090b]/80 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="p-4 w-80 overflow-y-auto flex-1">
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

      {/* Floating Audio Player */}
      <AudioPlayer
        src={currentVersion?.file_url || song.mp3_url || ""}
        onTimeUpdate={setCurrentTime}
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
