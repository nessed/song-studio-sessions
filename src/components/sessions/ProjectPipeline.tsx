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
const SETTLE_MS = 420; // matches .pslot.settling transition
const MAX_TILT = 6;

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
  displayIdx,
  dragging,
  tilt,
  onPointerDown,
  onUpdateVibe,
}: {
  song: Song;
  displayIdx: number;
  dragging: boolean;
  tilt: number;
  onPointerDown: (e: React.PointerEvent) => void;
  onUpdateVibe?: (song: Song, tags: string[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEdit = useCallback((e: React.PointerEvent) => {
    if (!onUpdateVibe) return;
    e.stopPropagation();
    setDraft((song.mood_tags || []).join(" · "));
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
      style={{
        ...paletteStyle(palette(hueForSong(song))),
        ...(dragging
          ? { transform: `translateY(-7px) scale(1.045) rotate(${tilt.toFixed(2)}deg)` }
          : {}),
      }}
      onPointerDown={onPointerDown}
    >
      <span className="pn-idx mono">{String(displayIdx + 1).padStart(2, "0")}</span>
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
            <span className={(!song.mood_tags || song.mood_tags.length === 0) ? "pn-ph" : ""}>{vibeFor(song)}</span>
            {onUpdateVibe && <span className="pn-edit-ic"><Pencil size={11} /></span>}
          </>
        )}
      </div>
    </div>
  );
}

interface MoveState {
  fromIdx: number;
  dx: number;
  target: number;
  moved: number;
  tilt: number;
  phase: "drag" | "settle";
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
   connectors. Transform-only drag reorder (no reflow → guaranteed smooth):
   the lifted card tilts with pointer velocity, neighbors spring out of the
   way, and on release the card glides into its slot before the order commits. */
export function ProjectPipeline({
  songs,
  connector = "clean",
  onOpenSong,
  onReorder,
  onAddSong,
  onUpdateVibe,
}: ProjectPipelineProps) {
  const n = songs.length;
  const [move, setMove] = useState<MoveState | null>(null);

  // live refs so the lifetime-scoped listeners never read stale state
  const moveRef = useRef<(MoveState & { startX: number; lastX: number; lastT: number }) | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>();
  const songsRef = useRef(songs);
  songsRef.current = songs;
  const cbRef = useRef({ onOpenSong, onReorder });
  cbRef.current = { onOpenSong, onReorder };

  const onPointerDown = (e: React.PointerEvent, idx: number) => {
    if (e.button != null && e.button !== 0) return;
    if (moveRef.current) return; // ignore while a previous drag is settling
    moveRef.current = {
      fromIdx: idx, startX: e.clientX, lastX: e.clientX, lastT: performance.now(),
      dx: 0, target: idx, moved: 0, tilt: 0, phase: "drag",
    };
    setMove({ fromIdx: idx, dx: 0, target: idx, moved: 0, tilt: 0, phase: "drag" });
  };

  // listeners attached ONCE for the component lifetime — they no-op unless a
  // drag is in progress, read everything from refs, so no stale closures and
  // no add/remove churn.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const st = moveRef.current;
      if (!st || st.phase !== "drag") return;
      const now = performance.now();
      const dx = e.clientX - st.startX;
      const moved = Math.max(st.moved, Math.abs(dx));
      let target = st.fromIdx + Math.round(dx / STEP);
      target = Math.max(0, Math.min(songsRef.current.length - 1, target));
      // pointer velocity → card tilt, low-passed so it feels weighted
      const dt = Math.max(1, now - st.lastT);
      const vx = (e.clientX - st.lastX) / dt; // px per ms
      const targetTilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, vx * 14));
      st.tilt = st.tilt + (targetTilt - st.tilt) * 0.3;
      st.lastX = e.clientX;
      st.lastT = now;
      st.dx = dx;
      st.target = target;
      st.moved = moved;
      setMove({ fromIdx: st.fromIdx, dx, target, moved, tilt: st.tilt, phase: "drag" });
    };
    const onUp = () => {
      const st = moveRef.current;
      if (!st || st.phase !== "drag") return;
      if (st.moved < 6) {
        moveRef.current = null;
        setMove(null);
        cbRef.current.onOpenSong(songsRef.current[st.fromIdx]);
        return;
      }
      // settle: glide into the destination slot, then commit the new order
      const settleDx = (st.target - st.fromIdx) * STEP;
      st.phase = "settle";
      st.dx = settleDx;
      st.tilt = 0;
      setMove({ fromIdx: st.fromIdx, dx: settleDx, target: st.target, moved: st.moved, tilt: 0, phase: "settle" });
      settleTimer.current = setTimeout(() => {
        const fin = moveRef.current;
        moveRef.current = null;
        setMove(null);
        if (fin && fin.target !== fin.fromIdx) {
          const next = songsRef.current.slice();
          const [moving] = next.splice(fin.fromIdx, 1);
          next.splice(fin.target, 0, moving);
          cbRef.current.onReorder(next);
        }
      }, SETTLE_MS);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, []);

  // slot transform for each index given the current move
  const slotStyle = (i: number): CSSProperties => {
    if (!move) return {};
    const { fromIdx, dx, target } = move;
    if (i === fromIdx) return { transform: `translateX(${dx}px)` };
    if (target > fromIdx && i > fromIdx && i <= target) return { transform: `translateX(${-STEP}px)` };
    if (target < fromIdx && i < fromIdx && i >= target) return { transform: `translateX(${STEP}px)` };
    return { transform: "translateX(0px)" };
  };

  const slotClass = (i: number): string => {
    if (!move) return "pslot";
    if (i === move.fromIdx) return "pslot lifted" + (move.phase === "settle" ? " settling" : "");
    return "pslot shift";
  };

  // index each card reports while the order is in flux
  const displayIdx = (i: number): number => {
    if (!move || move.moved < 6) return i;
    const { fromIdx, target } = move;
    if (i === fromIdx) return target;
    if (target > fromIdx && i > fromIdx && i <= target) return i - 1;
    if (target < fromIdx && i < fromIdx && i >= target) return i + 1;
    return i;
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
      <div className={"pipe" + (move ? " is-dragging" : "")}>
        {songs.map((song, i) => (
          <Fragment key={song.id}>
            {i > 0 && <Connector leftStatus={songs[i - 1].status} curve={connector === "curve"} />}
            <div className={slotClass(i)} style={slotStyle(i)}>
              <PipeNode
                song={song}
                displayIdx={displayIdx(i)}
                dragging={!!move && move.fromIdx === i && move.phase === "drag"}
                tilt={move && move.fromIdx === i ? move.tilt : 0}
                onPointerDown={(e) => onPointerDown(e, i)}
                onUpdateVibe={onUpdateVibe}
              />
            </div>
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
