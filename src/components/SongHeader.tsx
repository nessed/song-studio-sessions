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
    <header className="sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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
