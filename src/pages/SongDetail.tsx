import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, ChevronDown, List, Share2, Check, X, Play, Pause, Plus, SlidersHorizontal, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSong, useSongs } from "@/hooks/useSongs";
import { useSongNotes } from "@/hooks/useSongNotes";
import { useSongVersions, SongVersion } from "@/hooks/useSongVersions";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePlayer } from "@/contexts/PlayerContext";
import { useDialogs } from "@/components/sessions/Dialogs";
import { ShareSheet } from "@/components/sessions/ShareSheet";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SessionsShell } from "@/components/sessions/Room";
import { CoverArt } from "@/components/sessions/CoverArt";
import { StageMeter } from "@/components/sessions/StageMeter";
import { Waveform } from "@/components/sessions/GlassPlayer";
import { TaskDrawer } from "@/components/sessions/Tasks";
import { palette, hueForSong, buildWave, fmt } from "@/lib/sessions/theme";
import { SONG_STATUSES, SongStatus, Task } from "@/lib/types";

const HASH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const makeShareHash = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => HASH_CHARS[b % HASH_CHARS.length]).join("");

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
    <div className={"statwrap" + (open ? " open" : "")} ref={ref}>
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
  const { updateSong, uploadCoverArt } = useSongs();
  const { notes, createNote } = useSongNotes(id);
  const { versions, currentVersion, uploadVersion, setCurrentVersion, deleteVersion, isUploading, uploadProgress } = useSongVersions(id);
  const { tasks, createTask, updateTask, deleteTask } = useTasks(id);
  const player = usePlayer();
  const { confirm } = useDialogs();

  const [status, setStatus] = useState<SongStatus>("idea");
  const [titleEdit, setTitleEdit] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [composer, setComposer] = useState({ t: 0, text: "", armed: false });
  const [drawer, setDrawer] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const deckRef = useRef<HTMLElement>(null);

  const audioUrl = currentVersion?.file_url || song?.mp3_url || null;
  const wave = useMemo(() => buildWave(song ? hueForSong(song) : 1), [song]);

  // status tracks DB value
  useEffect(() => {
    if (song) setStatus(song.status);
  }, [song]);

  // Register song in the global player when this song becomes active or version switches.
  // Skip if a *different* song is already playing — don't interrupt playback.
  useEffect(() => {
    if (!song) return;
    if (player.playing && player.song?.id !== song.id) return;
    const subtitle =
      (profile?.display_name || "You") + (currentVersion ? ` · v${currentVersion.version_number}` : "");
    player.loadSong(song, audioUrl, wave, notes, subtitle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id, audioUrl]);

  // Keep notes in sync — only while this song is the active player song.
  useEffect(() => {
    if (player.song?.id !== id) return;
    player.setNotes(notes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  // Hide the miniplayer while the in-page deck is visible AND this song is the active one.
  // If a different song is playing, keep the miniplayer showing.
  useEffect(() => {
    const el = deckRef.current;
    const isActive = player.song?.id === song?.id;
    if (!isActive) {
      player.setDeckVisible(false);
      return () => { player.addNoteRef.current = null; };
    }
    if (!el || typeof IntersectionObserver === "undefined") {
      player.setDeckVisible(true);
      return () => {
        player.setDeckVisible(false);
        player.addNoteRef.current = null;
      };
    }
    const io = new IntersectionObserver(
      ([entry]) => player.setDeckVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      player.setDeckVisible(false);
      player.addNoteRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.song?.id, song?.id, loading]);

  // keep addNoteRef fresh every render (armComposer reads `player.time` directly)
  const armComposer = () => {
    setComposer((c) => ({ ...c, t: Math.round(player.time), armed: true }));
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  if (player.song?.id === song?.id) player.addNoteRef.current = armComposer;

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

  const startTitleEdit = () => {
    setTitleDraft(song?.title || "");
    setTitleEdit(true);
  };
  const commitTitle = () => {
    setTitleEdit(false);
    if (id && titleDraft.trim() && titleDraft.trim() !== song?.title)
      updateSong(id, { title: titleDraft.trim() });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    const url = await uploadCoverArt(id, file);
    if (url) toast.success("Cover updated");
    e.target.value = "";
  };
  const handleCoverRemove = () => {
    if (!id) return;
    updateSong(id, { cover_art_url: null });
    toast.success("Cover removed");
  };

  const toggleTask = (t: Task) => updateTask(t.id, { done: !t.done });
  const addTask = (section: Task["section"], title: string) => createTask(section, title);

  /* enable/disable the public link; returns the live hash for the share sheet */
  const setPublic = async (enabled: boolean): Promise<string | null> => {
    if (!song || !id) return null;
    if (!enabled) {
      await updateSong(id, { is_public: false });
      return null;
    }
    const hash = song.share_hash || makeShareHash();
    const res = await updateSong(id, { is_public: true, share_hash: hash });
    if (res?.error) return null;
    return hash;
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await uploadVersion(file, file.name.replace(/\.[^/.]+$/, ""));
      toast.success("Take uploaded");
    } catch {
      toast.error("Upload failed — try again");
    }
  };

  const switchVersion = async (v: SongVersion) => {
    if (v.is_current) return;
    try {
      await setCurrentVersion(v.id);
      toast.success(`v${v.version_number} is now current`);
    } catch {
      toast.error("Couldn't switch version");
    }
  };

  const removeVersion = async (v: SongVersion) => {
    const ok = await confirm({
      title: `Delete v${v.version_number}?`,
      message: "This take will be removed for good. This can't be undone.",
      confirmText: "Delete take",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteVersion(v.id);
      toast.success(`v${v.version_number} deleted`);
    } catch {
      toast.error("Couldn't delete version");
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

  // Show this song's playback state only while it's the active player song.
  const isActiveSong = player.song?.id === song.id;
  const playing = isActiveSong && player.playing;
  const time = isActiveSong ? player.time : 0;
  const duration = isActiveSong ? player.duration : 210;
  const progress = duration ? time / duration : 0;
  const seek = isActiveSong ? player.seek : () => {};

  // Clicking play on this deck either starts this song or toggles it if already loaded.
  const handleDeckPlay = () => {
    if (!isActiveSong) {
      const subtitle =
        (profile?.display_name || "You") + (currentVersion ? ` · v${currentVersion.version_number}` : "");
      player.loadSong(song, audioUrl, wave, notes, subtitle, true);
    } else {
      player.togglePlay();
    }
  };

  const initial = (profile?.display_name || user?.email || "N").trim().charAt(0).toUpperCase();
  const openTasks = tasks.filter((t) => !t.done).length;
  const sortedNotes = [...notes].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds);
  const rows = lyricRows(song.lyrics);
  const versionCount = versions.length || (song.mp3_url ? 1 : 0);

  return (
    <SessionsShell vars={palette(hueForSong(song))}>
      <div>
        <header className="ws-hd drop">
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
            <button className="ghost-btn" onClick={() => setShareOpen(true)}>
              <Share2 size={15} />
              Share
            </button>
            <div className="avatar2">{initial}</div>
          </div>
        </header>

        <main className="ws-shell">
          {/* identity — the song is the headline, metadata recedes */}
          <section className="ws-hero">
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
            <button
              className="ws-cover-btn rise"
              style={{ "--d": "0.02s" } as React.CSSProperties}
              onClick={() => coverInputRef.current?.click()}
              aria-label="Change cover art"
            >
              <CoverArt song={song} radius={16} />
              {song.cover_art_url && (
                <button
                  className="ws-cover-rm"
                  onClick={(e) => { e.stopPropagation(); handleCoverRemove(); }}
                  aria-label="Remove cover art"
                >
                  <X size={14} />
                </button>
              )}
            </button>
            <div className="ws-id">
              <div className="ws-kick rise" style={{ "--d": "0.08s" } as React.CSSProperties}>
                <StageMeter status={status} />
                {versionCount > 0 && <span className="kicker">v{currentVersion?.version_number ?? versionCount}</span>}
              </div>
              {titleEdit ? (
                <input
                  autoFocus
                  className="song-title-inp display"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); commitTitle(); }
                    if (e.key === "Escape") setTitleEdit(false);
                  }}
                />
              ) : (
                <h1
                  className="song-title display rise"
                  style={{ "--d": "0.12s" } as React.CSSProperties}
                  onClick={startTitleEdit}
                >
                  {song.title}
                </h1>
              )}
              <div className="meta-row rise" style={{ "--d": "0.18s" } as React.CSSProperties}>
                <span className="accent">{song.bpm ?? "—"} BPM</span>
                <span>{song.key || "—"}</span>
                <span>{fmt(duration)}</span>
                <span>{profile?.display_name || "You"}</span>
              </div>
            </div>
          </section>

          {/* the deck — transport + performed waveform, the room's centerpiece */}
          <section className="ws-deck glass rise" style={{ "--d": "0.22s" } as React.CSSProperties} ref={deckRef}>
            <button className="deck-play" onClick={handleDeckPlay} aria-label={playing ? "Pause" : "Play"}>
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
                <button
                  className="p-icbtn"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={isUploading}
                  title={isUploading ? "Uploading…" : "Upload a take"}
                  aria-label="Upload a take"
                >
                  {isUploading ? <span className="upl-pct">{uploadProgress}%</span> : <Upload size={17} />}
                </button>
                <button className="p-icbtn" onClick={armComposer} title="Note at playhead" aria-label="Add note">
                  <Plus size={17} />
                </button>
                <button className="p-icbtn" onClick={() => toast("Stem mixer coming soon")} title="Stems" aria-label="Stems">
                  <SlidersHorizontal size={17} />
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
                        <div className="ly-line" key={i}>
                          {r.text}
                        </div>
                      ) : (
                        <div style={{ height: 14 }} key={i} />
                      )
                    )}
                  </div>
                ) : (
                  <div className="ly-line" style={{ color: "var(--fg-3)" }}>
                    (empty — start writing)
                  </div>
                )}
              </div>
            </section>

            <aside className="rise" style={{ "--d": "0.36s" } as React.CSSProperties}>
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
                <div style={{ padding: "16px 4px", color: "var(--fg-3)", fontSize: 13, lineHeight: 1.5 }}>
                  No notes yet — press <b style={{ color: "var(--fg-2)" }}>+</b> on the deck to drop one at the
                  playhead.
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
                          {n.guest_name || "You"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="sec-head2 subhead">
                <div className="kicker">Versions</div>
                <div className="count">{versionCount}</div>
              </div>
              {versions.length > 0 ? (
                versions.map((v) => (
                  <div
                    className={"ver act" + (v.is_current ? " cur" : "")}
                    key={v.id}
                    onClick={() => switchVersion(v)}
                    title={v.is_current ? undefined : `Make v${v.version_number} current`}
                  >
                    <span className="vtag">v{v.version_number}</span>
                    <span className="vname">{v.description || `${song.title.toLowerCase().replace(/\s+/g, "-")}_v${v.version_number}`}</span>
                    {v.is_current ? (
                      <span className="vcur">current</span>
                    ) : (
                      <>
                        <span className="vdate">{(() => { try { return new Date(v.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch { return ""; } })()}</span>
                        <button
                          className="vdel"
                          onClick={(e) => { e.stopPropagation(); removeVersion(v); }}
                          aria-label={`Delete v${v.version_number}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="ver act cur" onClick={() => audioInputRef.current?.click()}>
                  <span className="vtag">v1</span>
                  <span className="vname">{song.mp3_url ? "current upload" : "no audio yet"}</span>
                  {song.mp3_url ? <span className="vcur">current</span> : <span className="vdate">upload a take</span>}
                </div>
              )}
            </aside>
          </div>
        </main>

        {drawer && (
          <TaskDrawer
            song={song}
            tasks={tasks}
            onToggle={toggleTask}
            onCreate={addTask}
            onClose={() => setDrawer(false)}
            onDelete={(t) => deleteTask(t.id)}
            onEdit={(t, title) => updateTask(t.id, { title })}
          />
        )}

        {shareOpen && (
          <ShareSheet
            title={song.title}
            isPublic={!!song.is_public}
            shareHash={song.share_hash ?? null}
            onSetPublic={setPublic}
            onClose={() => setShareOpen(false)}
          />
        )}
      </div>
    </SessionsShell>
  );
}
