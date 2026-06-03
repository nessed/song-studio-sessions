import { useState } from "react";
import { Check, Calendar, Sparkles, X } from "lucide-react";
import { CoverArt } from "./CoverArt";
import { StageMeter } from "./StageMeter";
import { paletteStyle, palette, hueForSong } from "@/lib/sessions/theme";
import { Task, TaskPriority, SongSection, Song } from "@/lib/types";

export const PRIO_COLOR: Record<TaskPriority, string> = {
  high: "var(--accent-bright)",
  medium: "var(--fg-2)",
  low: "var(--fg-3)",
};

/* Quick-add parser — "re-cut vocal !high due fri" → fields.
   Priority/date aren't persisted (no DB columns) but we parse them
   so the title stays clean and the right priority dot shows. */
export function parseTask(raw: string): { text: string; prio: TaskPriority; due: string | null } {
  let text = raw;
  let prio: TaskPriority = "medium";
  let due: string | null = null;

  const pm = text.match(/!(high|med|low|hi|h|m|l)\b/i);
  if (pm) {
    const k = pm[1].toLowerCase();
    prio = k[0] === "h" ? "high" : k[0] === "l" ? "low" : "medium";
    text = text.replace(pm[0], "");
  }
  const dm =
    text.match(/\bdue\s+(\w+)/i) ||
    text.match(/\b(mon|tue|wed|thu|fri|sat|sun|today|tomorrow|tmrw)\b/i);
  if (dm) {
    due = dm[1].replace(/^./, (c) => c.toUpperCase());
    text = text.replace(dm[0], "");
  }
  return { text: text.replace(/\s+/g, " ").trim(), prio, due };
}

const prioOf = (t: Task): TaskPriority => (t.priority as TaskPriority) || "medium";

export function TaskCard({
  t,
  onToggle,
  showSec,
}: {
  t: Task;
  onToggle: (t: Task) => void;
  showSec?: boolean;
}) {
  return (
    <div className={"tk" + (t.done ? " done" : "")}>
      <span className="pdot" style={{ background: PRIO_COLOR[prioOf(t)] }} />
      <div className="tbody">
        <div className="ttext">{t.title}</div>
        {(t.due_date || (showSec && t.section)) && (
          <div className="tmeta">
            {showSec && t.section && <span className="tsec">{t.section}</span>}
            {t.due_date && (
              <span className="tdue">
                <Calendar size={11} />
                {t.due_date}
              </span>
            )}
          </div>
        )}
      </div>
      <button className="cbx" onClick={() => onToggle(t)} aria-label="Toggle done">
        <Check size={12} strokeWidth={2.4} />
      </button>
    </div>
  );
}

interface TaskDrawerProps {
  song: Song;
  tasks: Task[];
  onToggle: (t: Task) => void;
  onCreate: (section: SongSection, title: string) => void;
  onClose: () => void;
}

export function TaskDrawer({ song, tasks, onToggle, onCreate, onClose }: TaskDrawerProps) {
  const [draft, setDraft] = useState("");

  const add = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && draft.trim()) {
      const p = parseTask(draft);
      if (!p.text) return;
      onCreate("Recording", p.text);
      setDraft("");
    }
  };

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const sections = [...new Set(open.map((t) => t.section))];

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div
        className="drawer"
        style={paletteStyle(palette(hueForSong(song)))}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      >
        <div className="drawer-head">
          <div className="dh-l">
            <h3>Tasks</h3>
            <span className="dh-n">{open.length} open</span>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="qadd">
          <Sparkles size={15} style={{ color: "var(--accent-bright)", flex: "none" }} />
          <input
            value={draft}
            placeholder="re-cut vocal !high due fri"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={add}
          />
          <span className="qk">⏎</span>
        </div>

        {sections.map((sec) => {
          const items = open.filter((t) => t.section === sec);
          return (
            <div key={sec}>
              <div className="tsec-head">
                <span className="sdot" />
                <span className="kicker" style={{ color: "var(--fg-2)" }}>
                  {sec}
                </span>
                <span className="scount">{items.length}</span>
              </div>
              {items.map((t) => (
                <TaskCard key={t.id} t={t} onToggle={onToggle} />
              ))}
            </div>
          );
        })}

        {done.length > 0 && (
          <div>
            <div className="tsec-head">
              <span className="kicker">Done</span>
              <span className="scount">{done.length}</span>
            </div>
            {done.map((t) => (
              <TaskCard key={t.id} t={t} onToggle={onToggle} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* small reusable group used by the global overview */
export function SongTaskGroup({
  song,
  tasks,
  onToggle,
  onOpen,
}: {
  song: Song;
  tasks: Task[];
  onToggle: (t: Task) => void;
  onOpen: (song: Song) => void;
}) {
  const open = tasks.filter((t) => !t.done);
  return (
    <div className="tov-group" style={paletteStyle(palette(hueForSong(song)))}>
      <div className="tov-gh">
        <div className="gthumb">
          <CoverArt song={song} radius={9} />
        </div>
        <div className="gt" style={{ cursor: "pointer" }} onClick={() => onOpen(song)}>
          {song.title}
        </div>
        <div className="gmeta" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span>{open.length} open</span>
          <StageMeter status={song.status} label={false} />
        </div>
      </div>
      {tasks.map((t) => (
        <TaskCard key={t.id} t={t} onToggle={onToggle} showSec />
      ))}
    </div>
  );
}
