import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { AppHeader } from "@/components/AppHeader";
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
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-muted-foreground">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {projects.length === 0
              ? "Create your first album or EP"
              : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Create new */}
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="New project name..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-minimal flex-1"
            />
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          </div>
        </div>

        {/* Projects grid */}
        {projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-slide-up">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="project-card group"
              >
                <div className="w-full aspect-square rounded-lg bg-muted overflow-hidden mb-3">
                  {project.cover_art_url ? (
                    <img
                      src={project.cover_art_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Folder className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-foreground truncate">{project.title}</h3>
                {project.mood_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.mood_tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="tag-pill text-2xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <Folder className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No projects yet. Create one to organize your songs.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}