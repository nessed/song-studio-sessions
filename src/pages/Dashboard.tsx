import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSongs } from "@/hooks/useSongs";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SessionsShell } from "@/components/sessions/Room";
import { TopNav } from "@/components/sessions/TopNav";
import { CoverArt } from "@/components/sessions/CoverArt";
import { StageMeter } from "@/components/sessions/StageMeter";
import { Avatar } from "@/components/sessions/Avatar";
import { NEUTRAL, palette, paletteStyle, hueForSong } from "@/lib/sessions/theme";
import { Song } from "@/lib/types";

function rel(date: string) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: false }) + " ago";
  } catch {
    return "recently";
  }
}

function SongCard({ song, initial, index, onOpen }: { song: Song; initial: string; index: number; onOpen: (s: Song) => void }) {
  return (
    <div
      className="card rise"
      onClick={() => onOpen(song)}
      style={{
        ...paletteStyle(palette(hueForSong(song))),
        "--d": `${0.1 + Math.min(index, 11) * 0.05}s`,
      } as React.CSSProperties}
    >
      <div className="art">
        <CoverArt song={song} />
        <div className="ov">
          <div className="play">
            <Play size={16} fill="currentColor" style={{ marginLeft: 2 }} />
          </div>
        </div>
      </div>
      <div className="meta">
        <div className="crow">
          <div className="ctitle">{song.title}</div>
          <div className="cupd">{rel(song.updated_at)}</div>
        </div>
        <div className="cstage">
          <StageMeter status={song.status} />
        </div>
        <div className="csub">
          <div className="cmeta">
            {song.bpm ?? "—"} BPM · {song.key || "—"}
          </div>
          <div className="avs">
            <Avatar ch={initial} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { songs, loading, createSong } = useSongs();
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");

  const initial = (profile?.display_name || user?.email || "N").trim().charAt(0).toUpperCase();

  const open = (s: Song) => navigate(`/song/${s.id}`);

  const submit = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && draft.trim()) {
      const song = await createSong(draft.trim());
      setDraft("");
      if (song) navigate(`/song/${song.id}`);
    }
  };

  const filtered = useMemo(
    () =>
      [...songs]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .filter((s) => s.title.toLowerCase().includes(search.toLowerCase())),
    [songs, search]
  );

  const activity = useMemo(
    () =>
      [...songs]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 3)
        .map((s) => ({ id: s.id, what: s.title, when: rel(s.updated_at), hue: hueForSong(s) })),
    [songs]
  );

  if (loading) return <LoadingScreen />;

  return (
    <SessionsShell vars={NEUTRAL}>
      <TopNav
        tab="songs"
        onTab={(t) => {
          if (t === "projects") navigate("/projects");
          else if (t === "tasks") navigate("/tasks");
        }}
        onNew={() => {
          const el = document.getElementById("ss-create-input");
          el?.focus();
        }}
        search={search}
        onSearch={setSearch}
        initial={initial}
        avatarUrl={profile?.avatar_url}
      />

      <div className="lib fade-in">
        <div className="lib-top">
          <div className="create">
            <span className="clabel kicker">Start a song</span>
            <div className="create-inp">
              <Plus size={20} style={{ color: "var(--fg-3)" }} />
              <input
                id="ss-create-input"
                value={draft}
                placeholder="Name it…"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={submit}
              />
              <span className="enter">⏎</span>
            </div>
          </div>
          <div className="lib-stat">
            <div className="n">{songs.length}</div>
            <div className="l kicker">in progress</div>
          </div>
        </div>

        <div className="lib-body">
          <div>
            <div className="sec-row">
              <div className="kicker">Your songs</div>
              <div className="kicker" style={{ color: "var(--fg-2)" }}>
                Recent
              </div>
            </div>
            {filtered.length > 0 ? (
              <div className="gallery">
                {filtered.map((s, i) => (
                  <SongCard key={s.id} song={s} initial={initial} index={i} onOpen={open} />
                ))}
              </div>
            ) : (
              <div style={{ padding: "40px 4px", color: "var(--fg-3)", fontSize: 14 }}>
                {songs.length === 0 ? "No songs yet — name one above to start a room." : "No songs match your search."}
              </div>
            )}
          </div>
          <aside className="rail">
            <div className="sec-row">
              <div className="kicker">Activity</div>
            </div>
            {activity.map((a) => (
              <div className="rrow" key={a.id}>
                <div className="rdot" style={{ background: `oklch(0.8 0.13 ${a.hue})` }} />
                <div>
                  <div className="rtext">
                    <b>You</b> last worked on <b>{a.what}</b>
                  </div>
                  <div className="rwhen">{a.when}</div>
                </div>
              </div>
            ))}
            {activity.length === 0 && (
              <div className="rtext" style={{ color: "var(--fg-3)" }}>
                Your recent edits will show up here.
              </div>
            )}
          </aside>
        </div>
      </div>
    </SessionsShell>
  );
}
