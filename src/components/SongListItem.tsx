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
    <Link to={`/song/${song.id}`} className="song-row group">
      <div className="cover-art-sm w-12 h-12 flex-shrink-0">
        {song.cover_art_url ? (
          <img
            src={song.cover_art_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-5 h-5 text-muted-foreground/50" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {song.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="status-badge">{song.status.replace("_", " ")}</span>
          {project && (
            <span className="text-xs text-muted-foreground truncate">
              {project.title}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        {song.bpm && <span>{song.bpm} bpm</span>}
        {song.key && <span>{song.key}</span>}
      </div>
    </Link>
  );
}