import { useState, useMemo } from "react";
import { Task, SongSection, SONG_SECTIONS } from "@/lib/types";
import { SmartTaskCard } from "./SmartTaskCard";
import { parseTaskInput, taskTemplates } from "@/lib/taskParser";
import { Plus, ChevronDown, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface SmartTaskPanelProps {
  tasks: Task[];
  onCreateTask: (section: SongSection, title: string, options?: { priority?: 'high' | 'medium' | 'low'; due_date?: Date }) => Promise<Task | null>;
  onUpdateTask: (id: string, updates: { done?: boolean; title?: string }) => void;
  onDeleteTask: (id: string) => void;
  currentSection?: SongSection;
  accentColor?: string | null;
}

export function SmartTaskPanel({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  currentSection,
  accentColor,
}: SmartTaskPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<SongSection | "all">("all");
  const [showTemplates, setShowTemplates] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      // Done tasks at bottom
      if (a.done !== b.done) return a.done ? 1 : -1;
      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) return priorityOrder[a.priority] - priorityOrder[b.priority];
      // Then by due date
      if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      // Then by sort order
      return a.sort_order - b.sort_order;
    });

    if (activeFilter === "all") return sorted;
    return sorted.filter(t => t.section === activeFilter);
  }, [tasks, activeFilter]);

  // Task counts per section
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tasks.filter(t => !t.done).length };
    SONG_SECTIONS.forEach(s => {
      counts[s] = tasks.filter(t => t.section === s && !t.done).length;
    });
    return counts;
  }, [tasks]);

  const handleSubmit = async () => {
    if (!inputValue.trim() || isAdding) return;
    
    setIsAdding(true);
    try {
      const parsed = parseTaskInput(inputValue);

      // Simplify: If user is in a specific filter, ALWAYS add to that filter.
      // Only use smart parsing activeFilter is "all".
      let targetSection = parsed.section;
      
      if (activeFilter !== "all") {
        targetSection = activeFilter;
      } else if (!targetSection) {
        targetSection = currentSection || "Idea";
      }

      const newTask = await onCreateTask(targetSection, parsed.title, {
        priority: parsed.priority,
        due_date: parsed.dueDate,
      });

      if (newTask) {
        toast.success(`Task added to ${targetSection}`, {
          description: parsed.priority ? `Priority: ${parsed.priority}` : undefined
        });
        setInputValue("");
      } else {
         throw new Error("Task creation returned null");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to add task");
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAddTemplate = async (section: SongSection) => {
    const templates = taskTemplates[section] || [];
    let count = 0;
    for (const title of templates) {
      await onCreateTask(section, title);
      count++;
    }
    toast.success(`Added ${count} template tasks to ${section}`);
    setShowTemplates(false);
  };

  // Abbreviated section names for pills
  const sectionAbbrev: Record<SongSection, string> = {
    'Idea': 'Idea',
    'Writing': 'Write',
    'Recording': 'Rec',
    'Production': 'Prod',
    'Mixing': 'Mix',
    'Mastering': 'Master',
    'Release Prep': 'Release',
  };

  return (
    <div className="glass-panel glass-noise rounded-2xl overflow-hidden flex flex-col h-full max-h-full">
      {/* Header */}
      <div className="relative border-b border-white/[0.06] px-5 py-4 flex-shrink-0">
        
        <div className="relative flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Tasks</h3>
          
          {/* Template dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-[10px] font-semibold uppercase tracking-wider transition-all"
            >
              Templates
              <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50"
                  style={{
                    background: 'rgba(10,10,10,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {SONG_SECTIONS.map((section) => (
                    <button
                      key={section}
                      onClick={() => handleAddTemplate(section)}
                      className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {section}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Phase Filter Tabs */}
      <div className="px-4 py-3 border-b border-white/[0.04] overflow-x-auto no-scrollbar flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all flex-shrink-0 ${
              activeFilter === "all"
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            All {sectionCounts.all > 0 && <span className="ml-1 opacity-60">({sectionCounts.all})</span>}
          </button>
          
          {SONG_SECTIONS.map((section) => (
            <button
              key={section}
              onClick={() => setActiveFilter(section)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all flex-shrink-0 ${
                activeFilter === section
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              {sectionAbbrev[section]} 
              {sectionCounts[section] > 0 && (
                <span className="ml-1 opacity-60">({sectionCounts[section]})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Task List - Flexible height */}
      <div className="p-4 space-y-2 overflow-y-auto scrollbar-thin flex-1 min-h-0">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <SmartTaskCard
              key={task.id}
              task={task}
              onToggle={() => onUpdateTask(task.id, { done: !task.done })}
              onDelete={() => onDeleteTask(task.id)}
              accentColor={accentColor}
            />
          ))}
        </AnimatePresence>
        
        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-white/20">
            <Inbox className="w-8 h-8 mb-2" />
            <span className="text-xs">No tasks {activeFilter !== "all" ? `in ${activeFilter}` : "yet"}</span>
          </div>
        )}
      </div>

      {/* Smart Input */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0">
        <div className="relative flex items-center rounded-xl transition-colors duration-200 focus-within:bg-white/5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <button 
            className="absolute left-3 p-1 rounded-full hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isAdding || !inputValue.trim()}
          >
            <Plus className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeFilter !== "all" ? `Add ${activeFilter} task...` : `Add task...`}
            className="w-full py-3 pl-12 pr-4 bg-transparent text-sm text-white/90 placeholder:text-white/30 focus:outline-none"
            disabled={isAdding}
          />
        </div>
      </div>
    </div>
  );
}
