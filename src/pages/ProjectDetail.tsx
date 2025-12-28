import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProject, useProjects } from "@/hooks/useProjects";
import { useSongs } from "@/hooks/useSongs";
import { MoodTagsInput } from "@/components/MoodTagsInput";
import { SessionThemeProvider } from "@/components/SessionThemeProvider";
import { SongListItem } from "@/components/SongListItem";
import { ArrowLeft, Trash2, Plus, Music, Upload, Folder } from "lucide-react";
import { toast } from "sonner";
import { Project } from "@/lib/types";
import { LoadingScreen } from "@/components/LoadingScreen";
import { motion } from "framer-motion";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { project, loading } = useProject(id);
  const { updateProject, deleteProject, uploadCoverArt } = useProjects();
  const { songs, createSong } = useSongs(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newSongTitle, setNewSongTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const setLocalProject = (updates: Partial<Project>) => {
    if (!id) return;
    queryClient.setQueryData(["project", id], (prev: Project | null) =>
      prev ? { ...prev, ...updates } : prev
    );
  };

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || "");
    }
  }, [project]);

  const debouncedUpdate = (updates: Parameters<typeof updateProject>[1]) => {
    if (!id) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateProject(id, updates);
    }, 500);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    debouncedUpdate({ title: value });
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    debouncedUpdate({ description: value });
  };

  const handleTagsUpdate = (tags: string[]) => {
    if (id && project) {
      updateProject(id, { mood_tags: tags });
      setLocalProject({ mood_tags: tags });
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    const url = await uploadCoverArt(id, file);
    if (url && project) {
      setLocalProject({ cover_art_url: url });
      toast.success("Cover uploaded");
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("Delete this project? Songs will be unlinked but not deleted.")) return;
    await deleteProject(id);
    navigate("/projects");
  };

  const handleCreateSong = async () => {
    if (!newSongTitle.trim()) return;
    const song = await createSong(newSongTitle.trim(), id);
    if (song) {
      setNewSongTitle("");
      navigate(`/song/${song.id}`);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white p-6">
        <Folder className="w-16 h-16 text-white/10 mb-6" />
        <h1 className="text-2xl font-bold mb-3">Project Not Found</h1>
        <p className="text-white/40 mb-8">This project doesn't exist or has been deleted.</p>
        <Link 
          to="/projects" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <SessionThemeProvider coverUrl={project.cover_art_url}>
      <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden">
        {/* Hidden input */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />

        {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[150px]" 
            style={{ background: 'var(--accent-subtle, rgba(124,58,237,0.1))' }} 
          />
        </div>

        {/* Cover Art Glow */}
        {project.cover_art_url && (
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] blur-[120px] opacity-25 saturate-150"
              style={{ 
                backgroundImage: `url(${project.cover_art_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        )}

        {/* Header - SongDetail style */}
        <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between bg-[#09090b]/80 backdrop-blur-2xl border-b border-white/[0.04]">
          <Link
            to="/projects"
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Projects</span>
          </Link>

          <button
            onClick={handleDelete}
            className="p-2.5 text-white/40 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </header>

        <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12"
          >
            {/* Cover Art */}
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.02 }}
              className="relative w-48 h-48 md:w-56 md:h-56 flex-shrink-0 group"
            >
              {/* Glow behind */}
              {project.cover_art_url && (
                <div 
                  className="absolute -inset-4 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"
                  style={{ 
                    backgroundImage: `url(${project.cover_art_url})`,
                    backgroundSize: "cover",
                  }}
                />
              )}
              {/* Image container */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
                {project.cover_art_url ? (
                  <img src={project.cover_art_url} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/[0.03] flex items-center justify-center border-2 border-dashed border-white/10 group-hover:border-white/20 transition-colors">
                    <Folder className="w-12 h-12 text-white/10" />
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
                placeholder="Untitled Project"
                className="bg-transparent border-none outline-none text-4xl md:text-5xl font-bold tracking-tight text-white placeholder:text-white/10 w-full"
                style={{ fontFamily: "'Syne', sans-serif" }}
              />

              {/* Description */}
              <textarea
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Add a description..."
                rows={2}
                className="bg-transparent border-none outline-none text-white/50 placeholder:text-white/20 w-full resize-none focus:text-white/70 transition-colors"
              />

              {/* Tags */}
              <div className="pt-2">
                <MoodTagsInput tags={project.mood_tags} onUpdate={handleTagsUpdate} />
              </div>
            </div>
          </motion.div>

          {/* Songs Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Songs</h2>
              <span className="text-xs text-white/30">{songs.length} track{songs.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Add song input */}
            <div className="mb-6">
              <div className="glass-premium glass-noise rounded-2xl overflow-hidden relative">
                <div 
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{ background: 'radial-gradient(ellipse at top left, var(--accent-subtle, rgba(124,58,237,0.1)) 0%, transparent 60%)' }}
                />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                
                <div className="relative flex items-center gap-3 p-2">
                  <input
                    type="text"
                    placeholder="Add a new song..."
                    value={newSongTitle}
                    onChange={(e) => setNewSongTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateSong()}
                    className="flex-1 px-4 py-3 text-sm bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                  />
                  <button
                    onClick={handleCreateSong}
                    disabled={!newSongTitle.trim()}
                    className="px-5 py-2.5 mr-1 text-sm font-semibold bg-white text-black rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Songs list */}
            {songs.length > 0 ? (
              <div className="glass-premium glass-noise rounded-2xl overflow-hidden">
                <div className="divide-y divide-white/[0.04]">
                  {songs.map((song) => (
                    <SongListItem key={song.id} song={song} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 glass-premium glass-noise rounded-2xl relative overflow-hidden">
                <div 
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{ background: 'radial-gradient(ellipse at center, var(--accent-subtle, rgba(124,58,237,0.1)) 0%, transparent 60%)' }}
                />
                <Music className="w-14 h-14 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/50 mb-2">No songs yet</h3>
                <p className="text-sm text-white/30">
                  Add your first song to this project above.
                </p>
              </div>
            )}
          </motion.section>
        </main>
      </div>
    </SessionThemeProvider>
  );
}
