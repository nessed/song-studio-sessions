import { Fragment, useEffect, useRef, useState, CSSProperties, useCallback } from "react";
import { Plus, Pencil } from "lucide-react";
import { Song, SONG_STATUSES, SongStatus } from "@/lib/types";
import { palette, paletteStyle, hueForSong, statusIndex } from "@/lib/sessions/theme";
import { CoverArt } from "./CoverArt";
import { StageMeter } from "./StageMeter";

const NODE_W = 208;
const CONN_W = 64;
const STEP = NODE_W + CONN_W; // horizontal distance between consecutive nodes
const STAGE_TOTAL = SONG_STATUSES.length;

/* A one-line "vibe" descriptor so the artist can read the album's trajectory
   at a glance. Real songs carry mood tags; fall back to a stage-aware phrase. */
const STAGE_VIBE: Record<SongStatus, string> = {
  idea: "A spark — title and a feeling, nothing tracked yet.",
  writing: "Lyric and melody still finding their shape.",
  recording: "Takes going down — the song is becoming itself.",
  production: "Arrangement and sounds coming into focus.",
  mixing: "Balancing the parts so it breathes.",
  mastering: "Final polish — loudness and shine.",
  release_prep: "Locked and ready for the world.",
};
function vibeFor(song: Song): string {
  if (song.mood_tags && song.mood_tags.length) return song.mood_tags.join(" · ");
  return STAGE_VIBE[song.status] ?? "";
}

/* one connector between two nodes; fill shows the left song's progress */
function Connector({ leftStatus, curve }: { leftStatus: SongStatus | string; curve: boolean }) {
  const frac = statusIndex(leftStatus) / (STAGE_TOTAL - 1);
  const d = curve ? "M0,50 C 33,40 67,60 100,50" : "M0,50 L100,50";
  return (
    <div className="pconn">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path className="ln-base" d={d} pathLength={1} />
        <path
          className="ln-fill"
          d={d}
          pathLength={1}
          stroke="var(--accent)"
          strokeDasharray={`${Math.max(frac, 0.001)} 1`}
        />
      </svg>
    </div>
  );
}

function PipeNode({
  song,
  idx,
  dragStyle,
  dragging,
  onPointerDown,
  onUpdateVibe,
}: {
  song: Song;
  idx: number;
  dragStyle: CSSProperties;
  dragging: boolean;
  onPointerDown: (e: React.PointerEvent, idx: number) => void;
  onUpdateVibe?: (song: Song, tags: string[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEdit = useCallback((e: React.PointerEvent) => {
    if (!onUpdateVibe) return;
    e.stopPropagation();
    setDraft(song.mood_tags.join(" · "));
    setEditing(true);
  }, [onUpdateVibe, song.mood_tags]);

  const commit = useCallback(() => {
    setEditing(false);
    if (!onUpdateVibe) return;
    const tags = draft.trim()
      ? draft.split("·").map((t) => t.trim()).filter(Boolean)
      : [];
    onUpdateVibe(song, tags);
  }, [draft, onUpdateVibe, song]);

  return (
    <div
      className={"pnode" + (dragging ? " dragging" : "")}
      style={{ ...paletteStyle(palette(hueForSong(song))), ...dragStyle }}
      onPointerDown={(e) => onPointerDown(e, idx)}
    >
      <span className="pn-idx mono">{String(idx + 1).padStart(2, "0")}</span>
      <div className="pn-cover">
        <CoverArt song={song} radius={11} />
      </div>
      <div className="pn-name">{song.title}</div>
      <div className="pn-stage">
        <StageMeter status={song.status} />
      </div>
      <div
        className={"pn-vibe" + (onUpdateVibe ? " editable" : "")}
        onPointerDown={onUpdateVibe && !editing ? startEdit : undefined}
      >
        {editing ? (
          <input
            autoFocus
            className="pn-vibe-inp"
            value={draft}
            placeholder="add a note…"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); commit(); }
              if (e.key === "Escape") setEditing(false);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <span className={song.mood_tags.length === 0 ? "pn-ph" : ""}>{vibeFor(song)}</span>
            {onUpdateVibe && <span className="pn-edit-ic"><Pencil size={11} /></span>}
          </>
        )}
      </div>
    </div>
  );
}

interface DragState {
  fromIdx: number;
  dx: number;
  target: number;
  moved: number;
}

interface ProjectPipelineProps {
  songs: Song[];
  connector?: "clean" | "curve";
  onOpenSong: (song: Song) => void;
  onReorder: (next: Song[]) => void;
  onAddSong?: () => void;
  onUpdateVibe?: (song: Song, tags: string[]) => void;
}

/* THE signature view — songs as a horizontal pipeline connected by progress
   connectors. Transform-only drag reorder (no reflow → guaranteed smooth). */
export function ProjectPipeline({
  songs,
  connector = "clean",
  onOpenSong,
  onReorder,
  onAddSong,
  onUpdateVibe,
}: ProjectPipelineProps) {
  const n = songs.length;
  const [drag, setDrag] = useState<DragState | null>(null);

  // live refs so the lifetime-scoped listeners never read stale state
  const dragRef = useRef<(DragState & { startX: number }) | null>(null);
  const songsRef = useRef(songs);
  songsRef.current = songs;
  const cbRef = useRef({ onOpenSong, onReorder });
  cbRef.current = { onOpenSong, onReorder };

  const onPointerDown = (e: React.PointerEvent, idx: number) => {
    if (e.button != null && e.button !== 0) return;
    dragRef.current = { fromIdx: idx, startX: e.clientX, dx: 0, target: idx, moved: 0 };
    setDrag({ fromIdx: idx, dx: 0, target: idx, moved: 0 });
  };

  // listeners attached ONCE for the component lifetime — they no-op unless a
  // drag is in progress, read everything from refs, so no stale closures and
  // no add/remove churn.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const st = dragRef.current;
      if (!st) return;
      const dx = e.clientX - st.startX;
      const moved = Math.max(st.moved, Math.abs(dx));
      let target = st.fromIdx + Math.round(dx / STEP);
      target = Math.max(0, Math.min(songsRef.current.length - 1, target));
      st.dx = dx;
      st.target = target;
      st.moved = moved;
      setDrag({ fromIdx: st.fromIdx, dx, target, moved });
    };
    const onUp = () => {
      const st = dragRef.current;
      if (!st) return;
      dragRef.current = null;
      if (st.moved < 6) {
        cbRef.current.onOpenSong(songsRef.current[st.fromIdx]);
      } else if (st.target !== st.fromIdx) {
        const next = songsRef.current.slice();
        const [moving] = next.splice(st.fromIdx, 1);
        next.splice(st.target, 0, moving);
        cbRef.current.onReorder(next);
      }
      setDrag(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  // transform for each node given the current drag
  const styleFor = (i: number): CSSProperties => {
    if (!drag) return {};
    const { fromIdx, dx, target } = drag;
    if (i === fromIdx) return { transform: `translateX(${dx}px) scale(1.04)` };
    if (target > fromIdx && i > fromIdx && i <= target) return { transform: `translateX(${-STEP}px)` };
    if (target < fromIdx && i < fromIdx && i >= target) return { transform: `translateX(${STEP}px)` };
    return { transform: "translateX(0px)" };
  };

  if (n === 0) {
    return (
      <div className="pipe-empty">
        No songs in this record yet — add the first one to start the pipeline.
        {onAddSong && (
          <div style={{ marginTop: 22 }}>
            <button className="padd" onClick={onAddSong} aria-label="Add song" style={{ width: 168 }}>
              <span className="pa-ic">
                <Plus size={18} />
              </span>
              <span className="pa-l">Add song</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pipe-scroll">
      <div className={"pipe" + (drag ? " is-dragging" : "")}>
        {songs.map((song, i) => (
          <Fragment key={song.id}>
            {i > 0 && <Connector leftStatus={songs[i - 1].status} curve={connector === "curve"} />}
            <PipeNode
              song={song}
              idx={i}
              dragStyle={styleFor(i)}
              dragging={!!drag && drag.fromIdx === i}
              onPointerDown={onPointerDown}
              onUpdateVibe={onUpdateVibe}
            />
          </Fragment>
        ))}
        <Connector leftStatus={songs[n - 1].status} curve={connector === "curve"} />
        <button className="padd" onClick={onAddSong} aria-label="Add song">
          <span className="pa-ic">
            <Plus size={18} />
          </span>
          <span className="pa-l">Add song</span>
        </button>
      </div>
    </div>
  );
}
