import { Song } from "@/lib/types";
import { useNavigate } from "react-router-dom";

interface SongRowProps {
  song: Song;
}

export function SongRow({ song }: SongRowProps) {
  const navigate = useNavigate();

  const formatStatus = (status: string) => {
    return status.replace("_", " ");
  };

  return (
    <div
      className="song-row group"
      onClick={() => navigate(`/song/${song.id}`)}
    >
      {song.coverArtDataUrl && (
        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-muted">
          <img
            src={song.coverArtDataUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {!song.coverArtDataUrl && (
        <div className="w-10 h-10 rounded bg-muted flex-shrink-0" />
      )}
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground truncate">
          {song.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="status-badge">{formatStatus(song.status)}</span>
          {song.bpm && (
            <span className="text-xs text-muted-foreground">{song.bpm} BPM</span>
          )}
          {song.key && (
            <span className="text-xs text-muted-foreground">{song.key}</span>
          )}
        </div>
      </div>

      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        Open →
      </span>
    </div>
  );
}
