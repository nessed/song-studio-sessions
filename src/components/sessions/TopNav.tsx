import { useNavigate } from "react-router-dom";
import { Search, Plus, Bell } from "lucide-react";

interface TopNavProps {
  tab: "songs" | "tasks";
  onTab: (tab: "songs" | "tasks") => void;
  onNew?: () => void;
  search?: string;
  onSearch?: (v: string) => void;
  initial?: string;
}

export function TopNav({ tab, onTab, onNew, search, onSearch, initial = "N" }: TopNavProps) {
  const navigate = useNavigate();
  return (
    <nav className="nav">
      <div className="nav-brand" onClick={() => onTab("songs")} style={{ cursor: "pointer" }}>
        <span className="dot" />
        <b>Sessions</b>
      </div>
      <div className="nav-tabs">
        <button className={"nav-tab" + (tab === "songs" ? " on" : "")} onClick={() => onTab("songs")}>
          Songs
        </button>
        <button className={"nav-tab" + (tab === "tasks" ? " on" : "")} onClick={() => onTab("tasks")}>
          Tasks
        </button>
      </div>
      <div className="nav-sp" />
      <div className="nav-search">
        <Search size={15} style={{ color: "var(--fg-3)" }} />
        <input
          placeholder="Search songs"
          autoComplete="off"
          value={search ?? ""}
          onChange={(e) => onSearch?.(e.target.value)}
        />
        <span className="k">/</span>
      </div>
      <button className="nav-new" onClick={onNew}>
        <Plus size={15} />
        New
      </button>
      <button className="nav-ic" aria-label="Notifications">
        <Bell size={18} />
        <span className="badge" />
      </button>
      <button className="nav-av" onClick={() => navigate("/settings")} aria-label="Settings">
        {initial}
      </button>
    </nav>
  );
}
