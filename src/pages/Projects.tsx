import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SessionThemeProvider } from "@/components/SessionThemeProvider";
import { Plus, Folder, ArrowLeft, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export default function Projects() {
  const navigate = useNavigate();
  const { projects, loading, createProject, deleteProject } = useProjects();
  const [newTitle, setNewTitle] = useState("");

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const project = await createProject(newTitle.trim());
    if (project) {
      setNewTitle("");
      navigate(`/project/${project.id}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" and all its songs?`)) return;
    await deleteProject(id);
    toast.success("Project deleted");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreate();
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const featuredCover = projects.find(p => p.cover_art_url)?.cover_art_url;

  return (
    <SessionThemeProvider coverUrl={featuredCover}>
      <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden">
        
        {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[150px]" 
            style={{ background: 'var(--accent-subtle, rgba(124,58,237,0.1))' }} 
          />
        </div>

        {/* Cover Art Glow */}
        {featuredCover && (
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] blur-[120px] opacity-20 saturate-150"
              style={{ 
                backgroundImage: `url(${featuredCover})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-30 px-4 sm:px-6 py-4 flex items-center justify-between bg-[#09090b]/95 backdrop-blur-xl border-b border-white/[0.04]">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              {projects.length} Project{projects.length !== 1 ? 's' : ''}
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 sm:mb-12"
          >
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4" 
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Projects
            </h1>
            <p className="text-base sm:text-lg text-white/40">
              {projects.length === 0 
                ? "Create your first album or EP to organize your songs." 
                : "Your albums, EPs, and collections."}
            </p>
          </motion.div>

          {/* Create new */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-8 sm:mb-12"
          >
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
              <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2">
                <input
                  type="text"
                  placeholder="New project name..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                />
                <button
                  onClick={handleCreate}
                  disabled={!newTitle.trim()}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold bg-white text-black rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Projects grid */}
          {projects.length > 0 ? (
            <div className="grid gap-6 sm:gap-8 grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <ContextMenu key={project.id}>
                  <ContextMenuTrigger>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                    >
                      <Link to={`/project/${project.id}`} className="group block">
                        {/* Image with glow */}
                        <div className="relative">
                          {project.cover_art_url && (
                            <div 
                              className="absolute -inset-4 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity hidden sm:block"
                              style={{ 
                                backgroundImage: `url(${project.cover_art_url})`,
                                backgroundSize: "cover",
                              }}
                            />
                          )}
                          
                          <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02] ring-1 ring-white/10 bg-white/[0.02]">
                            {project.cover_art_url ? (
                              <img
                                src={project.cover_art_url}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Folder className="w-10 h-10 sm:w-16 sm:h-16 text-white/10" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="mt-3 sm:mt-5 text-sm sm:text-lg tracking-tight text-white font-medium group-hover:text-white/80 transition-colors truncate">
                          {project.title}
                        </h3>
                        
                        {/* Tags - hidden on mobile */}
                        {project.mood_tags.length > 0 && (
                          <div className="hidden sm:flex flex-wrap gap-2 mt-2">
                            {project.mood_tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/40">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    </motion.div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="bg-[#0c0c0f]/95 backdrop-blur-xl border-white/10">
                    <ContextMenuItem 
                      onClick={() => handleDelete(project.id, project.title)}
                      className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Project
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-16 sm:py-24 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
            >
              <Folder className="w-14 h-14 sm:w-20 sm:h-20 text-white/10 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-semibold text-white/60 mb-2">No projects yet</h3>
              <p className="text-sm text-white/30 px-4">
                Create your first project above to get started.
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </SessionThemeProvider>
  );
}
