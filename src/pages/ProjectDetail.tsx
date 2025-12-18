import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProject, useProjects } from "@/hooks/useProjects";
import { useSongs } from "@/hooks/useSongs";
import { MoodTagsInput } from "@/components/MoodTagsInput";
import { CoverBackground } from "@/components/CoverBackground";
import { SongListItem } from "@/components/SongListItem";
import { ArrowLeft, Trash2, Plus, Music } from "lucide-react";
import { toast } from "sonner";
import { Project } from "@/lib/types";
import { LoadingScreen } from "@/components/LoadingScreen";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Project not found</p>
          <Link to="/projects" className="text-sm text-foreground underline">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <CoverBackground imageUrl={project.cover_art_url} />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/projects"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Projects</span>
          </Link>

          <button
            onClick={handleDelete}
            className="btn-icon text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Project info */}
        <div className="flex flex-col md:flex-row gap-8 mb-12 animate-fade-in">
          {/* Cover art */}
          <div className="w-full md:w-48 flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="cover-art w-full md:w-48 h-48 relative group cursor-pointer"
            >
              {project.cover_art_url ? (
                <img
                  src={project.cover_art_url}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-xs text-muted-foreground">No cover</span>
                </div>
              )}
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                <span className="text-xs text-transparent group-hover:text-foreground transition-colors">
                  Upload
                </span>
              </div>
            </button>
          </div>

          {/* Meta */}
          <div className="flex-1 space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Untitled Project"
              className="input-inline text-2xl font-semibold w-full"
            />

            <textarea
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Add a description..."
              rows={2}
              className="input-inline w-full text-muted-foreground resize-none"
            />

            <MoodTagsInput tags={project.mood_tags} onUpdate={handleTagsUpdate} />
          </div>
        </div>

        {/* Songs in this project */}
        <section className="animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-heading mb-0">Songs</h2>
          </div>

          {/* Add song */}
          <div className="flex items-center gap-3 mb-6">
            <input
              type="text"
              placeholder="New song title..."
              value={newSongTitle}
              onChange={(e) => setNewSongTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateSong()}
              className="input-minimal flex-1"
            />
            <button
              onClick={handleCreateSong}
              disabled={!newSongTitle.trim()}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Songs list */}
          {songs.length > 0 ? (
            <div className="space-y-2">
              {songs.map((song) => (
                <SongListItem key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-panel-subtle">
              <Music className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No songs in this project yet
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
