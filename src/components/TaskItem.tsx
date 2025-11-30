import { Task } from "@/lib/types";
import { useSessionsDB } from "@/hooks/useSessionsDB";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { updateTask, deleteTask } = useSessionsDB();

  const toggleDone = () => {
    updateTask(task.id, { done: !task.done });
  };

  return (
    <div className="task-item group" data-done={task.done}>
      <button
        className="checkbox-custom mt-0.5"
        data-checked={task.done}
        onClick={toggleDone}
        aria-label={task.done ? "Mark as incomplete" : "Mark as complete"}
      >
        {task.done && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className="text-primary-foreground"
          >
            <path
              d="M2 5L4 7L8 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      
      <span className="task-title text-sm flex-1">{task.title}</span>
      
      <button
        onClick={() => deleteTask(task.id)}
        className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
        aria-label="Delete task"
      >
        ×
      </button>
    </div>
  );
}
