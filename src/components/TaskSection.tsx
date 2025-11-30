import { useState } from "react";
import { Task, SongSection } from "@/lib/types";
import { useSessionsDB } from "@/hooks/useSessionsDB";
import { TaskItem } from "./TaskItem";

interface TaskSectionProps {
  songId: string;
  section: SongSection;
  tasks: Task[];
}

export function TaskSection({ songId, section, tasks }: TaskSectionProps) {
  const { createTask } = useSessionsDB();
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      createTask(songId, section, newTaskTitle.trim());
      setNewTaskTitle("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const sectionTasks = tasks.filter((t) => t.section === section);

  return (
    <div className="animate-fade-in">
      <h4 className="section-heading">{section}</h4>
      
      <div className="space-y-0.5">
        {sectionTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      <div className="mt-2">
        <input
          type="text"
          placeholder="Add task…"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input-inline w-full text-sm py-1.5 text-muted-foreground hover:text-foreground focus:text-foreground transition-colors"
        />
      </div>
    </div>
  );
}
