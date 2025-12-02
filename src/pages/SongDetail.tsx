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
import { ArrowLeft, Trash2, ExternalLink, Upload, Image, PanelRight, PanelRightClose } from "lucide-react";
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
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <p className="text-white/40">Loading...</p>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Song not found</p>
          <Link to="/dashboard" className="text-sm text-white underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentProject = projects.find((p) => p.id === song.project_id);

  return (
    <div className="min-h-screen relative bg-[#09090b]">
      <CoverBackground imageUrl={song.cover_art_url} />

      {/* Hidden inputs */}
      <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
      <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#09090b]/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to={song.project_id ? `/project/${song.project_id}` : "/dashboard"}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{currentProject?.title || "Dashboard"}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTasks(!showTasks)}
              className="p-2 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              {showTasks ? <PanelRightClose className="w-5 h-5" /> : <PanelRight className="w-5 h-5" />}
            </button>
            <button onClick={handleDelete} className="p-2 text-white/50 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pb-40 transition-all duration-300">
          <div className="max-w-2xl mx-auto py-12 px-6">
            {/* Song header */}
            <div className="flex flex-col sm:flex-row gap-6 mb-12 animate-fade-in">
              {/* Cover art */}
              <button
                onClick={() => coverInputRef.current?.click()}
                className="w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0 relative group cursor-pointer rounded-2xl overflow-hidden shadow-2xl"
              >
                {song.cover_art_url ? (
                  <img src={song.cover_art_url} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 gap-2">
                    <Image className="w-8 h-8 text-white/30" />
                    <span className="text-xs text-white/30">Add cover</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span className="text-xs text-transparent group-hover:text-white transition-colors font-medium">
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
                  className="bg-transparent border-none outline-none text-3xl sm:text-4xl font-bold tracking-tight text-white w-full placeholder:text-white/20"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={song.status}
                    onChange={(e) => handleStatusChange(e.target.value as SongStatus)}
                    className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white/80 focus:outline-none cursor-pointer"
                  >
                    {SONG_STATUSES.map((s) => (
                      <option key={s.value} value={s.value} className="bg-[#09090b]">
                        {s.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={bpm}
                    onChange={(e) => handleBpmChange(e.target.value)}
                    placeholder="BPM"
                    className="bg-transparent border-none outline-none text-sm w-16 text-white/50 placeholder:text-white/30"
                  />

                  <input
                    type="text"
                    value={songKey}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    placeholder="Key"
                    className="bg-transparent border-none outline-none text-sm w-16 text-white/50 placeholder:text-white/30"
                  />
                </div>

                {/* Project selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">Project:</span>
                  <select
                    value={song.project_id || "none"}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="px-2 py-1 text-sm bg-transparent border-none text-white/60 focus:outline-none cursor-pointer"
                  >
                    <option value="none" className="bg-[#09090b]">None</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#09090b]">
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <MoodTagsInput tags={song.mood_tags} onUpdate={handleTagsUpdate} />
              </div>
            </div>

            {/* Reference link */}
            <div className="mb-8 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40 block mb-2">Reference Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={referenceLink}
                  onChange={(e) => handleReferenceLinkChange(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="bg-transparent border-none outline-none flex-1 text-sm text-white/60 placeholder:text-white/20"
                />
                {referenceLink && (
                  <a
                    href={referenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-white/40 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Upload audio button if no audio */}
            {!song.mp3_url && (
              <div className="mb-8">
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="w-full py-4 border border-dashed border-white/10 rounded-xl text-white/40 hover:text-white/60 hover:border-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Demo MP3
                </button>
              </div>
            )}

            {/* Lyrics */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Lyrics</h3>
              <LyricsEditor value={song.lyrics || ""} onChange={handleLyricsChange} />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Tasks */}
        <div
          className={`${
            showTasks ? "w-80 opacity-100" : "w-0 opacity-0"
          } transition-all duration-300 ease-in-out border-l border-white/5 bg-[#09090b] flex flex-col overflow-hidden`}
        >
          <div className="p-6 w-80 overflow-y-auto flex-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-6">Tasks</h3>
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
      </div>

      {/* Floating Audio Player */}
      {song.mp3_url && (
        <AudioPlayer
          src={song.mp3_url}
          onTimeUpdate={setCurrentTime}
          noteTray={<TimelineNotes songId={song.id} currentTime={currentTime} />}
        />
      )}
    </div>
  );
}