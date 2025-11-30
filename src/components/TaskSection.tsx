import { useState } from "react";
import { Task, SongSection } from "@/lib/types";
import { Check, Trash2 } from "lucide-react";

interface TaskSectionProps {
  section: SongSection;
  tasks: Task[];
  onCreateTask: (title: string) => void;
  onUpdateTask: (id: string, updates: { done?: boolean; title?: string }) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskSection({
  section,
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
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
    <div className="glass-panel-subtle p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
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
      </div>

      <div className="mt-3">
        <input
          type="text"
          placeholder="Add task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input-inline w-full text-sm py-1.5 text-muted-foreground hover:text-foreground focus:text-foreground transition-colors"
        />
      </div>
    </div>
  );
}