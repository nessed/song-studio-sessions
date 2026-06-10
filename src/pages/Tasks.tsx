import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSongs } from "@/hooks/useSongs";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SessionsShell } from "@/components/sessions/Room";
import { TopNav } from "@/components/sessions/TopNav";
import { SongTaskGroup } from "@/components/sessions/Tasks";
import { NEUTRAL } from "@/lib/sessions/theme";
import { Song, Task } from "@/lib/types";

export default function Tasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { songs, loading: songsLoading } = useSongs();
  const [tasksBySong, setTasksBySong] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);

  const initial = (profile?.display_name || user?.email || "N").trim().charAt(0).toUpperCase();

  const fetchAll = useCallback(async () => {
    if (!user) {
      setTasksBySong({});
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (!error && data) {
      const map: Record<string, Task[]> = {};
      (data as Task[]).forEach((t) => {
        (map[t.song_id] ||= []).push(t);
      });
      setTasksBySong(map);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const toggle = async (t: Task) => {
    const next = !t.done;
    setTasksBySong((m) => ({
      ...m,
      [t.song_id]: (m[t.song_id] || []).map((x) => (x.id === t.id ? { ...x, done: next } : x)),
    }));
    await supabase.from("tasks").update({ done: next }).eq("id", t.id);
  };

  const openSong = (s: Song) => navigate(`/song/${s.id}`);

  if (loading || songsLoading) return <LoadingScreen />;

  const groups = songs.filter((s) => (tasksBySong[s.id] || []).length > 0);

  return (
    <SessionsShell vars={NEUTRAL}>
      <TopNav
        tab="tasks"
        onTab={(t) => {
          if (t === "projects") navigate("/projects");
          else if (t === "songs") navigate("/dashboard");
        }}
        onNew={() => navigate("/dashboard")}
        initial={initial}
      />
      <div className="tov fade-in">
        <div className="sec-row" style={{ margin: "14px 0 6px" }}>
          <div className="kicker">All tasks</div>
          <div className="kicker" style={{ color: "var(--fg-2)" }}>
            By song
          </div>
        </div>
        {groups.length > 0 ? (
          groups.map((s, i) => (
            <div key={s.id} className="rise" style={{ "--d": `${Math.min(i, 8) * 0.06}s` } as React.CSSProperties}>
              <SongTaskGroup song={s} tasks={tasksBySong[s.id]} onToggle={toggle} onOpen={openSong} />
            </div>
          ))
        ) : (
          <div style={{ padding: "40px 4px", color: "var(--fg-3)", fontSize: 14 }}>
            No tasks yet — open a song and add some from the Tasks sidecar.
          </div>
        )}
      </div>
    </SessionsShell>
  );
}
