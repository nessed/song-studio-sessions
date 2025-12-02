import { Link } from "react-router-dom";
import { Song } from "@/lib/types";
import { Music } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";

interface SongListItemProps {
  song: Song;
  showProject?: boolean;
}

export function SongListItem({ song, showProject }: SongListItemProps) {
  const { projects } = useProjects();
  const project = showProject && song.project_id 
    ? projects.find(p => p.id === song.project_id) 
    : null;

  return (
    <Link
      to={`/song/${song.id}`}
      className="flex items-center gap-4 px-4 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
    >
      {/* Cover */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
        {song.cover_art_url ? (
          <img
            src={song.cover_art_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-5 h-5 text-white/20" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-white truncate group-hover:text-white/80 transition-colors">
          {song.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs px-2 py-0.5 bg-white/5 text-white/50 rounded capitalize">
            {song.status.replace("_", " ")}
          </span>
          {project && (
            <span className="text-xs text-white/30 truncate">
              {project.title}
            </span>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-white/30 flex-shrink-0">
        {song.bpm && <span>{song.bpm} bpm</span>}
        {song.key && <span>{song.key}</span>}
      </div>
    </Link>
  );
}
