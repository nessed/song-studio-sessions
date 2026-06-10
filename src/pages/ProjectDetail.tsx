import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useProject, useProjects } from "@/hooks/useProjects";
import { useSongs } from "@/hooks/useSongs";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SessionsShell } from "@/components/sessions/Room";
import { CoverArt } from "@/components/sessions/CoverArt";
import { ProjectPipeline } from "@/components/sessions/ProjectPipeline";
import {
  palette,
  paletteStyle,
  hueForProject,
  albumProgress,
  statusLabel,
} from "@/lib/sessions/theme";
import { SONG_STATUSES, Song } from "@/lib/types";

function rel(date: string) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: false }) + " ago";
  } catch {
    return "recently";
  }
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project, loading } = useProject(id);
  const { deleteProject, uploadCoverArt, updateProject } = useProjects();
  const { songs, loading: songsLoading, createSong, updateSong } = useSongs(id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [titleEdit, setTitleEdit] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  // local pipeline order (drag reorder). Reconciled when the fetched set
  // changes — keep known songs in their current order, append new ones,
  // drop removed. The backend has no order column, so this is session-local.
  const [order, setOrder] = useState<Song[]>([]);
  useEffect(() => {
    setOrder((prev) => {
      const byId = new Map(songs.map((s) => [s.id, s]));
      const kept = prev.filter((s) => byId.has(s.id)).map((s) => byId.get(s.id)!);
      const keptIds = new Set(kept.map((s) => s.id));
      const added = songs.filter((s) => !keptIds.has(s.id));
      return [...kept, ...added];
    });
  }, [songs]);

  const vars = useMemo(
    () => (project ? palette(hueForProject(project)) : palette(250, 0.045)),
    [project]
  );

  const progress = albumProgress(order);
  const progIdx = Math.round(progress);
  const readyCount = order.filter((s) => s.status === "release_prep").length;
  const kind = order.length > 6 ? "LP" : "EP";

  // how the record spreads across the stages — quiet readout over the pipeline
  const census = useMemo(() => {
    const counts = new Map<string, number>();
    order.forEach((s) => counts.set(s.status, (counts.get(s.status) || 0) + 1));
    return SONG_STATUSES.filter((st) => counts.has(st.value)).map((st) => ({
      label: st.label,
      count: counts.get(st.value)!,
    }));
  }, [order]);

  const commitTitle = () => {
    setTitleEdit(false);
    if (id && titleDraft.trim() && titleDraft.trim() !== project?.title)
      updateProject(id, { title: titleDraft.trim() });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    const url = await uploadCoverArt(id, file);
    if (url) toast.success("Cover uploaded");
  };

  const handleDelete = async () => {
    if (!id || !project) return;
    if (!window.confirm(`Delete "${project.title}"? Songs will be unlinked but not deleted.`)) return;
    await deleteProject(id);
    navigate("/projects");
  };

  const handleAddSong = async () => {
    const title = window.prompt("New song name");
    if (!title || !title.trim() || !id) return;
    const song = await createSong(title.trim(), id);
    if (song) navigate(`/song/${song.id}`);
  };

  if (loading || songsLoading) return <LoadingScreen />;

  if (!project) {
    return (
      <SessionsShell vars={palette(250, 0.045)}>
        <div className="proj view-dissolve">
          <button className="proj-back" onClick={() => navigate("/projects")}>
            <span className="arr">←</span> All projects
          </button>
          <div style={{ padding: "60px 4px", color: "var(--fg-3)", fontSize: 15 }}>
            This record doesn't exist or has been deleted.
          </div>
        </div>
      </SessionsShell>
    );
  }

  return (
    <SessionsShell vars={vars}>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />

      <div className="proj view-dissolve" style={paletteStyle(vars)}>
        <div className="proj-headrow rise" style={{ "--d": "0s" } as React.CSSProperties}>
          <button className="proj-back" onClick={() => navigate("/projects")}>
            <span className="arr">←</span> All projects
          </button>
          <button className="x-btn" onClick={handleDelete} aria-label="Delete record">
            <Trash2 size={16} />
          </button>
        </div>

        <div className="proj-head rise" style={{ "--d": "0.06s" } as React.CSSProperties}>
          <button
            className="ph-cover"
            onClick={() => fileInputRef.current?.click()}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", position: "relative" }}
            aria-label="Upload cover"
          >
            <CoverArt
              song={{ id: project.id, title: project.title, cover_art_url: project.cover_art_url }}
              hue={hueForProject(project)}
              radius={14}
            />
          </button>
          <div className="ph-meta">
            <div className="ph-kind">
              {kind} · {order.length} {order.length === 1 ? "song" : "songs"}
            </div>
            {titleEdit ? (
              <input
                autoFocus
                className="ph-title-inp"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); commitTitle(); }
                  if (e.key === "Escape") setTitleEdit(false);
                }}
              />
            ) : (
              <div className="ph-title" onClick={() => { setTitleDraft(project.title); setTitleEdit(true); }}>{project.title}</div>
            )}
            <div className="ph-row">
              {order.length > 0 && (
                <span>
                  <span className="accent">{statusLabel(SONG_STATUSES[progIdx].value)}</span> overall
                </span>
              )}
              {order.length > 0 && (
                <span>
                  {readyCount}/{order.length} ready
                </span>
              )}
              <span>Last worked {rel(project.updated_at)}</span>
            </div>
          </div>
        </div>

        <div className="pipe-head rise" style={{ "--d": "0.14s" } as React.CSSProperties}>
          <div className="kicker">Pipeline</div>
          {order.length > 0 && <div className="ph-hint">drag to reorder · click to open</div>}
        </div>

        {census.length > 1 && (
          <div className="pipe-census rise" style={{ "--d": "0.18s" } as React.CSSProperties}>
            {census.map((c) => (
              <span className="pc" key={c.label}>
                <i />
                <b>{c.count}</b> {c.label}
              </span>
            ))}
          </div>
        )}

        <div className="rise" style={{ "--d": "0.22s" } as React.CSSProperties}>
          <ProjectPipeline
            songs={order}
            onOpenSong={(s) => navigate(`/song/${s.id}`)}
            onReorder={setOrder}
            onAddSong={handleAddSong}
            onUpdateVibe={(s, tags) => updateSong(s.id, { mood_tags: tags })}
          />
        </div>
      </div>
    </SessionsShell>
  );
}
