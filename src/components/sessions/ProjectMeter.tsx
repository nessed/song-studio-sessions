import { SONG_STATUSES, Song } from "@/lib/types";
import { albumProgress, statusLabel } from "@/lib/sessions/theme";

/* Album completion as a 7-segment studio readout. Each segment fills as the
   album's average stage passes it; the segment the album currently sits on
   gets the bright accent. Reads like hardware, not a generic percent bar. */
export function ProjectMeter({ songs }: { songs: Pick<Song, "status">[] }) {
  const prog = albumProgress(songs); // 0..6 float
  const curIdx = Math.round(prog);
  const readyCount = songs.filter((s) => s.status === "release_prep").length;
  return (
    <div className="pmeter">
      <div className="pm-segs">
        {SONG_STATUSES.map((_, i) => {
          // segment i fills as prog passes i-1 → i
          const fill = Math.max(0, Math.min(1, prog - i + 1));
          return (
            <span key={i} className={"pm-seg" + (i === curIdx ? " cur" : "")}>
              <span className="pm-fill" style={{ transform: `scaleX(${fill})` }} />
            </span>
          );
        })}
      </div>
      <div className="pm-foot">
        <span className="pm-stage">{statusLabel(SONG_STATUSES[curIdx].value)}</span>
        <span className="pm-frac">
          {readyCount}/{songs.length} ready
        </span>
      </div>
    </div>
  );
}
