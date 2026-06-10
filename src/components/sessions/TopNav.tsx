import { useNavigate } from "react-router-dom";
import { Search, Plus, Bell } from "lucide-react";
import { toast } from "sonner";

export type NavTab = "projects" | "songs" | "tasks";

interface TopNavProps {
  tab: NavTab;
  onTab: (tab: NavTab) => void;
  onNew?: () => void;
  search?: string;
  onSearch?: (v: string) => void;
  initial?: string;
}

const TABS: [NavTab, string][] = [
  ["projects", "Projects"],
  ["songs", "Songs"],
  ["tasks", "Tasks"],
];

export function TopNav({ tab, onTab, onNew, search, onSearch, initial = "N" }: TopNavProps) {
  const navigate = useNavigate();
  return (
    <nav className="nav drop">
      <div className="nav-brand" onClick={() => onTab("projects")} style={{ cursor: "pointer" }}>
        <span className="dot" />
        <b>Sessions</b>
      </div>
      <div className="nav-tabs">
        {TABS.map(([k, label]) => (
          <button key={k} className={"nav-tab" + (tab === k ? " on" : "")} onClick={() => onTab(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="nav-sp" />
      <div className="nav-search">
        <Search size={15} style={{ color: "var(--fg-3)" }} />
        <input
          placeholder="Search"
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
      <button className="nav-ic" aria-label="Notifications" onClick={() => toast("No new notifications")}>
        <Bell size={18} />
        {/* <span className="badge" /> */}
      </button>
      <button className="nav-av" onClick={() => navigate("/settings")} aria-label="Settings">
        {initial}
      </button>
    </nav>
  );
}
