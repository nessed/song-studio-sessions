import { useRef, useState } from "react";
import { Play, Pause, Plus, SlidersHorizontal } from "lucide-react";
import { CoverArt } from "./CoverArt";
import { fmt } from "@/lib/sessions/theme";
import { SongNote } from "@/lib/types";

type PlayerSong = { id: string; title: string; cover_art_url?: string | null };

interface WaveformProps {
  wave: number[];
  progress: number;
  duration: number;
  notes: SongNote[];
  onSeek: (t: number) => void;
}

type HoverState = { frac: number; time: number; note: SongNote | null } | null;

const noteWho = (n: SongNote) => n.guest_name || "You";

function Waveform({ wave, progress, duration, notes, onSeek }: WaveformProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverState>(null);
  const nowIdx = Math.round(progress * (wave.length - 1));

  const fracFromX = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  };

  const onMove = (e: React.PointerEvent) => {
    const frac = fracFromX(e.clientX);
    const time = frac * duration;
    let near: SongNote | null = null;
    let best = 6;
    for (const n of notes) {
      const d = Math.abs(n.timestamp_seconds - time);
      if (d < best) {
        best = d;
        near = n;
      }
    }
    setHover({ frac, time, note: near });
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onSeek(fracFromX(e.clientX) * duration);
    const mv = (ev: PointerEvent) => onSeek(fracFromX(ev.clientX) * duration);
    const up = () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
  };

  return (
    <div className="wave-region">
      {notes.map((n, i) => (
        <div
          key={i}
          className="note-dot"
          style={{ left: (n.timestamp_seconds / duration) * 100 + "%" }}
        />
      ))}
      {hover && (
        <div
          className="note-pop glass"
          style={{ left: Math.max(12, Math.min(hover.frac * 100, 96)) + "%" }}
        >
          {hover.note ? (
            <>
              <div className="pp-top">
                <span className="pp-ts">{fmt(hover.note.timestamp_seconds)}</span>
                {hover.note.guest_name && <span className="guest-badge">guest</span>}
                <span className="pp-who">{noteWho(hover.note)}</span>
              </div>
              <div className="pp-text">{hover.note.body}</div>
            </>
          ) : (
            <div className="pp-seek">
              <span className="pp-ts">{fmt(hover.time)}</span> seek here
            </div>
          )}
          <div className="pp-tail" />
        </div>
      )}
      <div
        className="wave"
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {wave.map((h, i) => (
          <div
            key={i}
            className={"wave-bar" + (i < nowIdx ? " on" : "") + (i === nowIdx ? " now" : "")}
            style={{ height: Math.round(h * 100) + "%" }}
          />
        ))}
        {hover && <div className="hover-line" style={{ left: `calc(${hover.frac * 100}% - 0.5px)` }} />}
        <div className="playhead" style={{ left: `calc(${progress * 100}% - 1px)` }} />
      </div>
    </div>
  );
}

interface GlassPlayerProps {
  song: PlayerSong;
  subtitle: string;
  wave: number[];
  playing: boolean;
  onTogglePlay: () => void;
  time: number;
  duration: number;
  onSeek: (t: number) => void;
  notes: SongNote[];
  onAddNoteHere: () => void;
  onStems?: () => void;
}

export function GlassPlayer({
  song,
  subtitle,
  wave,
  playing,
  onTogglePlay,
  time,
  duration,
  onSeek,
  notes,
  onAddNoteHere,
  onStems,
}: GlassPlayerProps) {
  const progress = duration ? time / duration : 0;
  return (
    <div className="player-wrap">
      <div className="player glass">
        <div className="p-cover">
          <CoverArt song={song} radius={13} />
        </div>
        <div className="p-meta">
          <div className="p-title">{song.title}</div>
          <div className="p-sub">{subtitle}</div>
        </div>
        <button className="p-play" onClick={onTogglePlay} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />}
        </button>
        <Waveform wave={wave} progress={progress} duration={duration} notes={notes} onSeek={onSeek} />
        <div className="p-time">
          <b>{fmt(time)}</b> / {fmt(duration)}
        </div>
        <button className="p-icbtn" onClick={onAddNoteHere} title="Add note at playhead" aria-label="Add note">
          <Plus size={17} />
        </button>
        <button className="p-icbtn" onClick={onStems} title="Stems" aria-label="Stems">
          <SlidersHorizontal size={17} />
        </button>
      </div>
    </div>
  );
}
