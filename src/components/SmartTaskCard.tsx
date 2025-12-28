import { Task, TaskPriority } from "@/lib/types";
import { Check, Trash2, Calendar, AlertCircle } from "lucide-react";
import { formatDistanceToNow, isPast, isToday } from "date-fns";
import { motion } from "framer-motion";

interface SmartTaskCardProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  accentColor?: string | null;
}

const priorityConfig: Record<TaskPriority, { color: string; bg: string; label: string }> = {
  high: { color: 'text-rose-400', bg: 'bg-rose-500/10', label: 'HIGH' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'MED' },
  low: { color: 'text-white/40', bg: 'bg-white/5', label: 'LOW' },
};

export function SmartTaskCard({ task, onToggle, onDelete, accentColor }: SmartTaskCardProps) {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isOverdue = dueDate && isPast(dueDate) && !task.done;
  const isDueToday = dueDate && isToday(dueDate);
  
  const dueDateDisplay = dueDate 
    ? formatDistanceToNow(dueDate, { addSuffix: true })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`group relative rounded-xl p-4 transition-all duration-200 ${
        task.done ? 'opacity-50' : ''
      }`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Accent glow on hover */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ 
          background: `radial-gradient(ellipse at top left, ${accentColor || 'rgba(124,58,237,0.1)'} 0%, transparent 60%)`,
        }}
      />
      
      <div className="relative flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            task.done 
              ? 'bg-emerald-500 border-emerald-500' 
              : 'border-white/20 hover:border-white/40'
          }`}
        >
          {task.done && <Check className="w-3 h-3 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-tight ${
            task.done ? 'line-through text-white/40' : 'text-white/90'
          }`}>
            {task.title}
          </p>
          
          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Section badge */}
            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-semibold">
              {task.section}
            </span>
            
            {/* Priority badge */}
            {task.priority !== 'medium' && (
              <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${priority.bg} ${priority.color} font-bold`}>
                {priority.label}
              </span>
            )}
            
            {/* Due date */}
            {dueDateDisplay && (
              <span className={`flex items-center gap-1 text-[10px] ${
                isOverdue ? 'text-rose-400' : isDueToday ? 'text-amber-400' : 'text-white/40'
              }`}>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
                <Calendar className="w-3 h-3" />
                {dueDateDisplay}
              </span>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-rose-400 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
