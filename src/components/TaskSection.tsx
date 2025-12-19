import { useState } from "react";
import { Task, SongSection } from "@/lib/types";
import { Check, Trash2, Plus, Inbox } from "lucide-react";

interface TaskSectionProps {
  section: SongSection;
  tasks: Task[];
  onCreateTask: (title: string) => void;
  onUpdateTask: (id: string, updates: { done?: boolean; title?: string }) => void;
  onDeleteTask: (id: string) => void;
  accentColor?: string | null;
}

export function TaskSection({
  section,
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  accentColor,
}: TaskSectionProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onCreateTask(newTaskTitle.trim());
      setNewTaskTitle("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  return (
    <div
      className="glass-tinted relative rounded-2xl p-5 mb-4 overflow-hidden"
      style={{ borderColor: accentColor ? `${accentColor}` : undefined }}
    >
      {/* Theme glow accent */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(ellipse at top left, var(--accent-subtle, rgba(124,58,237,0.1)) 0%, transparent 50%)' }}
      />
      
      {/* Top highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <h4 className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
        {section}
      </h4>

      <div className="space-y-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="task-item group"
            data-done={task.done}
          >
            <button
              onClick={() => onUpdateTask(task.id, { done: !task.done })}
              className="checkbox-custom flex-shrink-0 mt-0.5"
              data-checked={task.done}
            >
              {task.done && <Check className="w-3 h-3 text-primary-foreground" />}
            </button>

            <span className="task-title flex-1 text-sm">
              {task.title}
            </span>

            <button
              onClick={() => onDeleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        
        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="flex items-center gap-2 py-2 text-white/20">
            <Inbox className="w-3.5 h-3.5" />
            <span className="text-xs">No tasks yet</span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="relative flex items-center">
          <Plus className="absolute left-0 w-3.5 h-3.5 text-white/20" />
          <input
            type="text"
            placeholder={`Add ${section} task`}
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-sm py-1.5 pl-5 text-white/60 bg-transparent border-b border-white/10 focus:border-white/30 focus:bg-white/[0.02] outline-none placeholder:text-white/30 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
