import { SONG_STATUSES, SongStatus } from "@/lib/types";
import { statusIndex, statusLabel } from "@/lib/sessions/theme";

/* The 7-stage pipeline as a progress strip. Replaces status pills
   everywhere — informative (shows how far along) and reads like
   studio hardware. */
interface StageMeterProps {
  status: SongStatus | string;
  label?: boolean;
  frac?: boolean;
  dim?: boolean;
}

export function StageMeter({ status, label = true, frac = false, dim = false }: StageMeterProps) {
  const idx = statusIndex(status);
  const total = SONG_STATUSES.length;
  return (
    <div className={"stage" + (dim ? " dim" : "")}>
      <div className="ticks">
        {SONG_STATUSES.map((_, i) => (
          <span
            key={i}
            className={"tick" + (i <= idx ? " on" : "") + (i === idx ? " cur" : "")}
          />
        ))}
      </div>
      {label && <span className="slabel">{statusLabel(status)}</span>}
      {frac && <span className="sfrac">{idx + 1}/{total}</span>}
    </div>
  );
}
