import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, PanelRight, PanelRightClose } from "lucide-react";
import { Song, Project } from "@/lib/types";

interface SongHeaderProps {
  song: Song;
  project?: Project;
  showTasks: boolean;
  onToggleTasks: () => void;
  onDelete: () => void;
}

export function SongHeader({
  song,
  project,
  showTasks,
  onToggleTasks,
  onDelete,
}: SongHeaderProps) {
  return (
    <header className="sticky top-0 z-30 relative overflow-hidden">
      {/* Glass background */}
      <div className="absolute inset-0 bg-[#09090b]/85 backdrop-blur-2xl" />
      
      {/* Theme-tinted inner glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{ background: 'linear-gradient(90deg, var(--accent-subtle, rgba(124,58,237,0.1)) 0%, transparent 50%)' }}
      />
      
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Bottom border with chromatic effect */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="relative max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to={song.project_id ? `/project/${song.project_id}` : "/dashboard"}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{project?.title || "Dashboard"}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTasks}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
          >
            {showTasks ? (
              <PanelRightClose className="w-5 h-5" />
            ) : (
              <PanelRight className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-white/5"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
