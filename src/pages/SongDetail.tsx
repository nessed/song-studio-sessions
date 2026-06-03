import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, ChevronDown, List, Share2, Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { useSong, useSongs } from "@/hooks/useSongs";
import { useSongNotes } from "@/hooks/useSongNotes";
import { useSongVersions } from "@/hooks/useSongVersions";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SessionsShell } from "@/components/sessions/Room";
import { CoverArt } from "@/components/sessions/CoverArt";
import { StageMeter } from "@/components/sessions/StageMeter";
import { GlassPlayer } from "@/components/sessions/GlassPlayer";
import { TaskDrawer } from "@/components/sessions/Tasks";
import { palette, hueForSong, buildWave, fmt } from "@/lib/sessions/theme";
import { SONG_STATUSES, SongStatus, Song, Task } from "@/lib/types";

const FALLBACK_DUR = 210;

/* status dropdown built on the stage meter */
function StatusPill({ value, onChange }: { value: SongStatus; onChange: (s: SongStatus) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="statwrap" ref={ref}>
      <button className="status-ctl" onClick={() => setOpen((o) => !o)}>
        <StageMeter status={value} frac />
        <ChevronDown size={13} className="chev" />
      </button>
      {open && (
        <div className="menu">
          {SONG_STATUSES.map((s) => (
            <div
              key={s.value}
              className={"menu-item" + (s.value === value ? " sel" : "")}
              onClick={() => {
                onChange(s.value);
                setOpen(false);
              }}
            >
              {s.label}
              {s.value === value && <Check size={13} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* split freeform lyrics into label/line rows */
function lyricRows(lyrics: string | null): { label: boolean; text: string }[] {
  if (!lyrics || !lyrics.trim()) return [];
  return lyrics.split("\n").map((raw) => {
    const t = raw.trim();
    const isLabel = /^\[.*\]$/.test(t) || /^(verse|chorus|bridge|intro|outro|pre[- ]?chorus|hook|refrain)\b/i.test(t);
    return { label: isLabel, text: t.replace(/^\[|\]$/g, "") };
  });
}

export default function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { song, loading } = useSong(id);
  const { updateSong } = useSongs();
  const { notes, createNote } = useSongNotes(id);
  const { versions, currentVersion } = useSongVersions(id);
  const { tasks, createTask, updateTask } = useTasks(id);

  const [status, setStatus] = useState<SongStatus>("idea");
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(FALLBACK_DUR);
  const [composer, setComposer] = useState({ t: 0, text: "", armed: false });
  const [drawer, setDrawer] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number>();
  const lastTick = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const audioUrl = currentVersion?.file_url || song?.mp3_url || null;
  const wave = useMemo(() => buildWave(song ? hueForSong(song) : 1), [song]);

  useEffect(() => {
    if (song) setStatus(song.status);
  }, [song]);

  /* simulated playback when there's no real audio file yet */
  useEffect(() => {
    if (audioUrl || !playing) return;
    lastTick.current = performance.now();
    const step = (now: number) => {
      const dt = (now - lastTick.current) / 1000;
      lastTick.current = now;
      setTime((t) => {
        const nt = t + dt;
        if (nt >= duration) {
          setPlaying(false);
          return duration;
        }
        return nt;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, audioUrl, duration]);

  /* spacebar play/pause */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, audioUrl]);

  const togglePlay = useCallback(() => {
    if (audioUrl && audioRef.current) {
      if (playing) audioRef.current.pause();
      else audioRef.current.play().catch(() => {});
    }
    setPlaying((p) => !p);
  }, [audioUrl, playing]);

  const seek = useCallback(
    (t: number) => {
      const clamped = Math.max(0, Math.min(duration, t));
      if (audioUrl && audioRef.current) audioRef.current.currentTime = clamped;
      setTime(clamped);
    },
    [duration, audioUrl]
  );

  const armComposer = () => {
    setComposer((c) => ({ ...c, t: Math.round(time), armed: true }));
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const commitNote = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && composer.text.trim()) {
      await createNote(composer.t, composer.text.trim());
      setComposer({ t: composer.t, text: "", armed: false });
    }
  };

  const onStatus = (s: SongStatus) => {
    setStatus(s);
    if (id) updateSong(id, { status: s });
  };

  const toggleTask = (t: Task) => updateTask(t.id, { done: !t.done });
  const addTask = (section: Task["section"], title: string) => createTask(section, title);

  const share = () => {
    if (song?.share_hash) {
      navigator.clipboard?.writeText(`${window.location.origin}/s/${song.share_hash}`);
      toast.success("Share link copied");
    } else {
      toast("Publish this song from settings to get a share link");
    }
  };

  if (loading) return <LoadingScreen />;
  if (!song) {
    return (
      <SessionsShell vars={palette(250, 0.045)}>
        <div style={{ padding: 60, textAlign: "center", color: "var(--fg-2)" }}>
          Song not found.{" "}
          <button className="lp-signin" onClick={() => navigate("/dashboard")}>
            Back to library
          </button>
        </div>
      </SessionsShell>
    );
  }

  const subtitle =
    (profile?.display_name || "You") + (currentVersion ? ` · v${currentVersion.version_number}` : "");
  const initial = (profile?.display_name || user?.email || "N").trim().charAt(0).toUpperCase();
  const openTasks = tasks.filter((t) => !t.done).length;
  const sortedNotes = [...notes].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds);
  const rows = lyricRows(song.lyrics);
  const versionCount = versions.length || (song.mp3_url ? 1 : 0);

  return (
    <SessionsShell vars={palette(hueForSong(song))}>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onLoadedMetadata={(e) => {
            const d = (e.target as HTMLAudioElement).duration;
            if (isFinite(d) && d > 0) setDuration(d);
          }}
          onTimeUpdate={(e) => setTime((e.target as HTMLAudioElement).currentTime)}
          onEnded={() => setPlaying(false)}
          style={{ display: "none" }}
        />
      )}

      <div className="fade-in">
        <header className="ws-hd">
          <div className="ws-hd-l">
            <button className="ws-back" onClick={() => navigate("/dashboard")} aria-label="Back">
              <ArrowLeft size={17} />
            </button>
            <div className="ws-crumb">
              Library <ChevronRight size={12} style={{ opacity: 0.5 }} /> <b>{song.title}</b>
            </div>
          </div>
          <div className="ws-hd-r">
            <StatusPill value={status} onChange={onStatus} />
            <button className="ghost-btn" onClick={() => setDrawer(true)}>
              <List size={15} />
              Tasks <span className="b">{openTasks}</span>
            </button>
            <button className="ghost-btn" onClick={share}>
              <Share2 size={15} />
              Share
            </button>
            <div className="avatar2">{initial}</div>
          </div>
        </header>

        <main className="ws-shell">
          <div className="ws-grid">
            <div className="ws-cover-col">
              <CoverArt song={song} />
              <div className="title-block">
                <h1 className="song-title display">{song.title}</h1>
                <div className="meta-row">
                  <span className="accent">{song.bpm ?? "—"} BPM</span>
                  <span>{song.key || "—"}</span>
                  <span>{fmt(duration)}</span>
                  <span>{profile?.display_name || "You"}</span>
                </div>
              </div>
              <div>
                <div className="sec-head2">
                  <div className="kicker">Lyrics</div>
                </div>
                <div className="lyrics">
                  {rows.length > 0 ? (
                    <div>
                      {rows.map((r, i) =>
                        r.label ? (
                          <div className="ly-label" key={i}>
                            {r.text}
                          </div>
                        ) : r.text ? (
                          <div className="ly-line" key={i}>
                            {r.text}
                          </div>
                        ) : (
                          <div style={{ height: 12 }} key={i} />
                        )
                      )}
                    </div>
                  ) : (
                    <div className="ly-line" style={{ color: "var(--fg-3)" }}>
                      (empty — start writing)
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="sec-head2">
                <div className="kicker">Notes</div>
                <div className="count">{notes.length}</div>
              </div>
              <div className={"composer" + (composer.armed ? " armed" : "")}>
                <span className="ts">{fmt(composer.t)}</span>
                <input
                  ref={inputRef}
                  value={composer.text}
                  placeholder="Note at the playhead…"
                  onChange={(e) => setComposer({ ...composer, text: e.target.value })}
                  onKeyDown={commitNote}
                  onFocus={() => setComposer((c) => ({ ...c, armed: true }))}
                  onBlur={() => setComposer((c) => ({ ...c, armed: false }))}
                />
              </div>
              {sortedNotes.length === 0 && (
                <div style={{ padding: "16px 4px", color: "var(--fg-3)", fontSize: 13 }}>
                  No notes yet — press <b style={{ color: "var(--fg-2)" }}>+</b> on the player to drop one at the
                  playhead.
                </div>
              )}
              {sortedNotes.map((n) => (
                <div className="note" key={n.id} onClick={() => seek(n.timestamp_seconds)}>
                  <div className="tstamp">{fmt(n.timestamp_seconds)}</div>
                  <div className="ndot" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ntext">{n.body}</div>
                    <div className="nwho">
                      {n.guest_name && <span className="guest-badge">guest</span>}
                      {n.guest_name || "You"}
                    </div>
                  </div>
                </div>
              ))}

              <div className="sec-head2 subhead">
                <div className="kicker">Versions</div>
                <div className="count">{versionCount}</div>
              </div>
              {versions.length > 0 ? (
                versions.map((v) => (
                  <div className={"ver" + (v.is_current ? " cur" : "")} key={v.id}>
                    <span className="vtag">v{v.version_number}</span>
                    <span className="vname">{v.description || `${song.title.toLowerCase().replace(/\s+/g, "-")}_v${v.version_number}`}</span>
                    {v.is_current ? (
                      <span className="vcur">current</span>
                    ) : (
                      <span className="vdate">{(() => { try { return new Date(v.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch { return ""; } })()}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="ver cur">
                  <span className="vtag">v1</span>
                  <span className="vname">{song.mp3_url ? "current upload" : "no audio yet"}</span>
                  {song.mp3_url ? <span className="vcur">current</span> : <span className="vdate">upload a take</span>}
                </div>
              )}
            </div>
          </div>
        </main>

        <GlassPlayer
          song={song}
          subtitle={subtitle}
          wave={wave}
          playing={playing}
          onTogglePlay={togglePlay}
          time={time}
          duration={duration}
          onSeek={seek}
          notes={notes}
          onAddNoteHere={armComposer}
          onStems={() => toast("Stem mixer coming soon")}
        />

        {drawer && (
          <TaskDrawer
            song={song}
            tasks={tasks}
            onToggle={toggleTask}
            onCreate={addTask}
            onClose={() => setDrawer(false)}
          />
        )}
      </div>
    </SessionsShell>
  );
}
