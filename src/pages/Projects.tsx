import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { AppHeader } from "@/components/AppHeader";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Plus, Folder } from "lucide-react";

export default function Projects() {
  const navigate = useNavigate();
  const { projects, loading, createProject } = useProjects();
  const [newTitle, setNewTitle] = useState("");

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const project = await createProject(newTitle.trim());
    if (project) {
      setNewTitle("");
      navigate(`/project/${project.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreate();
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <AppHeader />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Projects</h1>
          <p className="text-sm text-white/40">
            {projects.length === 0
              ? "Create your first album or EP"
              : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Create new */}
        <div className="mb-12 animate-slide-up">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="New project name..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
            />
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              className="px-5 py-3 text-sm font-medium bg-white text-black rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          </div>
        </div>

        {/* Projects grid - Gallery Look */}
        {projects.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 animate-slide-up">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="group"
              >
                {/* Image - Hero element */}
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl bg-white/5">
                  {project.cover_art_url ? (
                    <img
                      src={project.cover_art_url}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Folder className="w-16 h-16 text-white/20" />
                    </div>
                  )}
                </div>
                
                {/* Title - Clean below artwork */}
                <h3 className="mt-4 text-lg tracking-tight text-white font-medium group-hover:text-white/80 transition-colors truncate">
                  {project.title}
                </h3>
                
                {/* Tags */}
                {project.mood_tags.length > 0 && (
                  <p className="text-xs text-white/40 mt-1 truncate">
                    {project.mood_tags.slice(0, 3).join(" · ")}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in">
            <Folder className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-sm text-white/40">
              No projects yet. Create one to organize your songs.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
