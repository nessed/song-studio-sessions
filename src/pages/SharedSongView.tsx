import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Song, SongVersion, SongNote } from "@/lib/types";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SessionsShell } from "@/components/sessions/Room";
import { CoverArt } from "@/components/sessions/CoverArt";
import { StageMeter } from "@/components/sessions/StageMeter";
import { GlassPlayer, Waveform } from "@/components/sessions/GlassPlayer";
import { SessionsLogo } from "@/components/SessionsLogo";
import { useDialogs } from "@/components/sessions/Dialogs";
import { palette, hueForSong, buildWave, fmt } from "@/lib/sessions/theme";
import { AlertCircle, ArrowRight, Play, Pause, Plus, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const FALLBACK_DUR = 210;

/* split freeform lyrics into label/line rows — matches the workspace */
function lyricRows(lyrics: string | null): { label: boolean; text: string }[] {
  if (!lyrics || !lyrics.trim()) return [];
  return lyrics.split("\n").map((raw) => {
    const t = raw.trim();
    const isLabel = /^\[.*\]$/.test(t) || /^(verse|chorus|bridge|intro|outro|pre[- ]?chorus|hook|refrain)\b/i.test(t);
    return { label: isLabel, text: t.replace(/^\[|\]$/g, "") };
  });
}

export default function SharedSongView() {
  const { hash } = useParams<{ hash: string }>();
  const { prompt } = useDialogs();

  const [song, setSong] = useState<Song | null>(null);
  const [versions, setVersions] = useState<SongVersion[]>([]);
  const [notes, setNotes] = useState<SongNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(FALLBACK_DUR);
  const [composer, setComposer] = useState({ t: 0, text: "", armed: false });
  const [deckVisible, setDeckVisible] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const deckRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>();
  const lastTick = useRef(0);

  /* ── data (unchanged logic) ── */
  useEffect(() => {
    async function fetchSharedSong() {
      if (!hash) {
        setError("Missing share link");
        setLoading(false);
        return;
      }

      const { data: songData, error: songError } = await supabase
        .from("songs")
        .select("*")
        .eq("share_hash", hash)
        .eq("is_public", true)
        .maybeSingle();

      if (songError || !songData) {
        console.error(songError);
        setError("Song not found or access denied.");
        setLoading(false);
        return;
      }

      setSong(songData as Song);

      const { data: versionsData } = await supabase
        .from("song_versions")
        .select("*")
        .eq("song_id", songData.id)
        .order("version_number", { ascending: false });

      if (versionsData) {
        setVersions(versionsData as SongVersion[]);
        const current = versionsData.find((v: any) => v.is_current) || versionsData[0];
        if (current) setActiveVersionId(current.id);
      }

      const { data: notesData } = await supabase
        .from("song_notes")
        .select("*")
        .eq("song_id", songData.id)
        .order("timestamp_seconds", { ascending: true });

      if (notesData) setNotes(notesData as SongNote[]);

      setLoading(false);
    }

    fetchSharedSong();
  }, [hash]);

  const activeVersion = versions.find((v) => v.id === activeVersionId) || versions[0];
  const audioUrl = activeVersion?.file_url || song?.mp3_url || null;
  const wave = useMemo(() => buildWave(song ? hueForSong(song) : 1), [song]);

  /* switching takes (or losing audio) restarts the transport */
  useEffect(() => {
    setPlaying(false);
    setTime(0);
    setDuration(FALLBACK_DUR);
  }, [audioUrl]);

  /* simulated playback when there's no real audio file */
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

  /* the floating player docks in only once the deck leaves the viewport */
  useEffect(() => {
    const el = deckRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setDeckVisible(entry.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [loading, song]);

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

  const getComposerTime = () => {
    const liveTime = audioUrl && audioRef.current ? audioRef.current.currentTime : time;
    if (!Number.isFinite(liveTime)) return 0;
    return Math.round(Math.max(0, Math.min(duration, liveTime)));
  };

  const armComposer = () => {
    setComposer((c) => ({ ...c, t: getComposerTime(), armed: true }));
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  /* in-app name prompt (replaces the native browser prompt) */
  const ensureGuestName = async (): Promise<string | null> => {
    let name = localStorage.getItem("sessions-guest-name");
    if (!name) {
      const entered = await prompt({
        title: "Leave feedback as…",
        message: "Your name shows next to the notes you leave. You only set this once.",
        placeholder: "e.g. Alex",
        confirmText: "Continue",
      });
      if (!entered || !entered.trim()) return null;
      name = entered.trim();
      localStorage.setItem("sessions-guest-name", name);
    }
    return name;
  };

  /* guest note creation (data logic unchanged) */
  const addGuestNote = async (timestamp: number, body: string) => {
    if (!song) return;
    const guestName = await ensureGuestName();
    if (!guestName) return;

    const { data, error: insErr } = await supabase
      .from("song_notes")
      .insert({
        song_id: song.id,
        timestamp_seconds: timestamp,
        body,
        guest_name: guestName,
        user_id: null,
      })
      .select()
      .single();

    if (insErr) {
      toast.error("Couldn't post your note — try again.");
      console.error(insErr);
      return;
    }

    const newNote = data as SongNote;
    setNotes((prev) => [...prev, newNote].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds));
    toast.success("Feedback added");
  };

  const commitGuestNote = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && composer.text.trim()) {
      const body = composer.text.trim();
      setComposer((c) => ({ t: c.t, text: "", armed: false }));
      await addGuestNote(composer.t, body);
    }
  };

  if (loading) return <LoadingScreen />;

  if (error || !song) {
    return (
      <SessionsShell vars={palette(250, 0.045)}>
        <div className="share-error">
          <AlertCircle size={40} className="se-ic" />
          <h1 className="display">Link unavailable</h1>
          <p>{error || "This song doesn't exist or is no longer shared."}</p>
          <Link to="/" className="ws-cta">
            Go to Sessions <ArrowRight size={15} />
          </Link>
        </div>
      </SessionsShell>
    );
  }

  const rows = lyricRows(song.lyrics);
  const sortedNotes = [...notes].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds);
  const progress = duration ? time / duration : 0;
  const versionCount = versions.length || (song.mp3_url ? 1 : 0);
  const subtitle = `Shared${activeVersion ? ` · v${activeVersion.version_number}` : ""}`;

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

      <div>
        <header className="ws-hd drop">
          <div className="ws-hd-l">
            <SessionsLogo to="/" />
            <span className="hd-div" />
            <span className="live-badge">
              <i />
              Live preview
            </span>
          </div>
          <div className="ws-hd-r">
            <Link to="/auth" className="ws-cta">
              Create your own <ArrowRight size={14} />
            </Link>
          </div>
        </header>

        <main className="ws-shell">
          {/* identity */}
          <section className="ws-hero">
            <div className="ws-cover-static rise" style={{ "--d": "0.02s" } as React.CSSProperties}>
              <CoverArt song={song} radius={16} />
            </div>
            <div className="ws-id">
              <div className="ws-kick rise" style={{ "--d": "0.08s" } as React.CSSProperties}>
                <StageMeter status={song.status} />
                {versionCount > 0 && (
                  <span className="kicker">v{activeVersion?.version_number ?? versionCount}</span>
                )}
              </div>
              <h1 className="song-title display rise" style={{ "--d": "0.12s", cursor: "default" } as React.CSSProperties}>
                {song.title}
              </h1>
              <div className="meta-row rise" style={{ "--d": "0.18s" } as React.CSSProperties}>
                <span className="accent">{song.bpm ?? "—"} BPM</span>
                <span>{song.key || "—"}</span>
                <span>{fmt(duration)}</span>
                <span>{notes.length} note{notes.length !== 1 ? "s" : ""}</span>
                {song.mood_tags?.slice(0, 2).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </section>

          {/* the deck */}
          <section className="ws-deck glass rise" style={{ "--d": "0.22s" } as React.CSSProperties} ref={deckRef}>
            <button className="deck-play" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: 2 }} />}
            </button>
            <div className="wave-hero">
              <Waveform wave={wave} progress={progress} duration={duration} notes={notes} onSeek={seek} />
            </div>
            <div className="deck-side">
              <div className="deck-time">
                <b>{fmt(time)}</b> / {fmt(duration)}
              </div>
              <div className="deck-actions">
                <button className="p-icbtn" onClick={armComposer} title="Leave feedback at playhead" aria-label="Add feedback">
                  <Plus size={17} />
                </button>
              </div>
            </div>
          </section>

          <div className="ws-grid">
            <section className="rise" style={{ "--d": "0.3s" } as React.CSSProperties}>
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
                        <div className="ly-line" key={i} style={{ cursor: "default" }}>
                          {r.text}
                        </div>
                      ) : (
                        <div style={{ height: 14 }} key={i} />
                      )
                    )}
                  </div>
                ) : (
                  <div className="ly-line" style={{ color: "var(--fg-3)", cursor: "default" }}>
                    No lyrics shared for this track.
                  </div>
                )}
              </div>
            </section>

            <aside className="rise" style={{ "--d": "0.36s" } as React.CSSProperties}>
              <div className="sec-head2">
                <div className="kicker">Feedback</div>
                <div className="count">{notes.length}</div>
              </div>
              <div className={"composer" + (composer.armed ? " armed" : "")}>
                <span className="ts">{fmt(composer.t)}</span>
                <input
                  ref={inputRef}
                  value={composer.text}
                  placeholder="Leave a note at the playhead…"
                  onChange={(e) => setComposer({ ...composer, text: e.target.value })}
                  onKeyDown={commitGuestNote}
                  onFocus={() => setComposer((c) => ({ ...c, armed: true }))}
                  onBlur={() => setComposer((c) => ({ ...c, armed: false }))}
                />
              </div>
              {sortedNotes.length === 0 && (
                <div style={{ padding: "16px 4px", color: "var(--fg-3)", fontSize: 13, lineHeight: 1.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <MessageCircle size={15} style={{ flex: "none", opacity: 0.6 }} />
                  No feedback yet — press <b style={{ color: "var(--fg-2)" }}>+</b> on the deck to drop the first note.
                </div>
              )}
              {sortedNotes.length > 0 && (
                <div className="note-feed">
                  {sortedNotes.map((n) => (
                    <div className="note" key={n.id} onClick={() => seek(n.timestamp_seconds)}>
                      <div className="tstamp">{fmt(n.timestamp_seconds)}</div>
                      <div className="ndot" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="ntext">{n.body}</div>
                        <div className="nwho">
                          {n.guest_name && <span className="guest-badge">guest</span>}
                          {n.guest_name || "Owner"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {versionCount > 1 && (
                <>
                  <div className="sec-head2 subhead">
                    <div className="kicker">Versions</div>
                    <div className="count">{versionCount}</div>
                  </div>
                  {versions.map((v) => (
                    <div
                      className={"ver act" + (v.id === activeVersionId ? " cur" : "")}
                      key={v.id}
                      onClick={() => setActiveVersionId(v.id)}
                      title={v.id === activeVersionId ? undefined : `Play v${v.version_number}`}
                    >
                      <span className="vtag">v{v.version_number}</span>
                      <span className="vname">{v.description || `version ${v.version_number}`}</span>
                      {v.id === activeVersionId ? (
                        <span className="vcur">playing</span>
                      ) : (
                        <span className="vdate">{(() => { try { return new Date(v.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch { return ""; } })()}</span>
                      )}
                    </div>
                  ))}
                </>
              )}
            </aside>
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
          onStems={() => toast("Stems aren't shared on public links")}
          hidden={deckVisible}
        />

        <footer className="share-foot">
          Shared via <Link to="/">Sessions</Link> — the workspace for modern producers
        </footer>
      </div>
    </SessionsShell>
  );
}
