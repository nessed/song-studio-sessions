import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useProjects } from "@/hooks/useProjects";
import { useSongs } from "@/hooks/useSongs";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SessionsShell } from "@/components/sessions/Room";
import { TopNav, NavTab } from "@/components/sessions/TopNav";
import { CoverArt } from "@/components/sessions/CoverArt";
import { ProjectMeter } from "@/components/sessions/ProjectMeter";
import { Avatar } from "@/components/sessions/Avatar";
import { NEUTRAL, palette, paletteStyle, hueForProject } from "@/lib/sessions/theme";
import { Project, Song } from "@/lib/types";

function rel(date: string) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: false }) + " ago";
  } catch {
    return "recently";
  }
}

function firstName(name: string | null | undefined, email: string | undefined) {
  const source = (name || email || "there").trim();
  const base = source.includes("@") ? source.split("@")[0] : source;
  const word = base.split(/[\s._-]+/)[0] || base;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function ProjectCard({
  project,
  songs,
  initial,
  index,
  onOpen,
}: {
  project: Project;
  songs: Song[];
  initial: string;
  index: number;
  onOpen: (p: Project) => void;
}) {
  const kind = songs.length > 6 ? "LP" : "EP";
  return (
    <div
      className="card rise"
      style={{
        ...paletteStyle(palette(hueForProject(project))),
        "--d": `${0.12 + Math.min(index, 11) * 0.05}s`,
      } as React.CSSProperties}
      onClick={() => onOpen(project)}
    >
      <div className="art">
        <CoverArt song={{ id: project.id, title: project.title, cover_art_url: project.cover_art_url }} />
        <div className="ov">
          <div className="play">
            <Play size={16} fill="currentColor" style={{ marginLeft: 2 }} />
          </div>
        </div>
      </div>
      <div className="meta">
        <span className="pkind">
          {kind} · {songs.length} {songs.length === 1 ? "song" : "songs"}
        </span>
        <div className="crow">
          <div className="ctitle">{project.title}</div>
          <div className="cupd mono">{rel(project.updated_at)}</div>
        </div>
        <div className="cstage">
          <ProjectMeter songs={songs} />
        </div>
        <div className="pcsub">
          <div className="cmeta mono">album</div>
          <div className="avs">
            <Avatar ch={initial} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { projects, loading, createProject } = useProjects();
  const { songs, loading: songsLoading } = useSongs();
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");

  const initial = (profile?.display_name || user?.email || "N").trim().charAt(0).toUpperCase();
  const name = firstName(profile?.display_name, user?.email);

  // group songs under their project
  const songsByProject = useMemo(() => {
    const map: Record<string, Song[]> = {};
    songs.forEach((s) => {
      if (s.project_id) (map[s.project_id] ||= []).push(s);
    });
    return map;
  }, [songs]);

  // resume on the most-recently-touched project
  const resumeProject = useMemo(
    () => [...projects].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0],
    [projects]
  );

  const onTab = (t: NavTab) => {
    if (t === "songs") navigate("/dashboard");
    else if (t === "tasks") navigate("/tasks");
  };

  const open = (p: Project) => navigate(`/project/${p.id}`);

  const submit = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && draft.trim()) {
      const project = await createProject(draft.trim());
      setDraft("");
      if (project) navigate(`/project/${project.id}`);
    }
  };

  const filtered = useMemo(
    () => projects.filter((p) => p.title.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  );

  if (loading || songsLoading) return <LoadingScreen />;

  return (
    <SessionsShell vars={NEUTRAL}>
      <TopNav
        tab="projects"
        onTab={onTab}
        onNew={() => document.getElementById("ss-create-project")?.focus()}
        search={search}
        onSearch={setSearch}
        initial={initial}
        avatarUrl={profile?.avatar_url}
      />

      <div className="lib">
        <div className="greet rise" style={{ "--d": "0s" } as React.CSSProperties}>
          <div className="gh">
            Hi <span className="nm">{name}</span>
          </div>
          {resumeProject && (
            <button className="resume" onClick={() => open(resumeProject)}>
              Resume on <span className="rp">{resumeProject.title}</span> <span className="arr">→</span>
            </button>
          )}
        </div>

        <div className="lib-top rise" style={{ "--d": "0.05s" } as React.CSSProperties}>
          <div className="create">
            <span className="clabel kicker">Start a record</span>
            <div className="create-inp">
              <Plus size={20} style={{ color: "var(--fg-3)" }} />
              <input
                id="ss-create-project"
                value={draft}
                placeholder="Name your album or EP…"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={submit}
              />
              <span className="enter">⏎</span>
            </div>
          </div>
          <div className="lib-stat">
            <div className="n">{projects.length}</div>
            <div className="l kicker">records</div>
          </div>
        </div>

        <div className="sec-row rise" style={{ "--d": "0.09s" } as React.CSSProperties}>
          <div className="kicker">Albums &amp; EPs</div>
          <div className="kicker" style={{ color: "var(--fg-2)" }}>
            Recent
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="gallery">
            {filtered.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                songs={songsByProject[p.id] || []}
                initial={initial}
                index={i}
                onOpen={open}
              />
            ))}
          </div>
        ) : (
          <div style={{ padding: "40px 4px", color: "var(--fg-3)", fontSize: 14 }}>
            {projects.length === 0
              ? "No records yet — name one above to start an album."
              : "No records match your search."}
          </div>
        )}
      </div>
    </SessionsShell>
  );
}
