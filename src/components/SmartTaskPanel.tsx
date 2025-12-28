import { useState, useMemo } from "react";
import { Task, SongSection, SONG_SECTIONS } from "@/lib/types";
import { SmartTaskCard } from "./SmartTaskCard";
import { parseTaskInput, taskTemplates } from "@/lib/taskParser";
import { Plus, Sparkles, ChevronDown, Inbox } from "lucide-react";
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
    const parsed = parseTaskInput(inputValue);

    // If we are filtered to a specific section, force that section
    // unless the user explicitly typed a section keyword that overrides it?
    // The requirement says "default to the section you are currently viewing".
    // So if I am in "Writing", and I type "Record vocals", it might be ambiguous.
    // But usually "Writing" tab -> add to "Writing".
    // Let's rely on parsed section if explicit, otherwise fall back to activeFilter if valid, otherwise currentSection.
    
    let targetSection = parsed.section;
    if (!targetSection) {
      if (activeFilter !== "all") {
        targetSection = activeFilter;
      } else {
        targetSection = currentSection || "Idea";
      }
    }

    try {
      const newTask = await onCreateTask(targetSection, parsed.title, {
        priority: parsed.priority,
        due_date: parsed.dueDate,
      });

      if (newTask) {
        toast.success(`Task added to ${targetSection}`, {
          description: parsed.priority ? `Priority: ${parsed.priority}` : undefined
        });
      }
    } catch (e) {
      toast.error("Failed to add task");
    }
    
    setInputValue("");
    setIsAdding(false);
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
    <div className="glass-premium glass-noise rounded-2xl overflow-hidden flex flex-col h-full max-h-full">
      {/* Header */}
      <div className="relative border-b border-white/[0.06] px-5 py-4 flex-shrink-0">
        <div className="absolute inset-0 pointer-events-none opacity-20" 
          style={{ background: 'radial-gradient(ellipse at top left, var(--accent-subtle, rgba(124,58,237,0.1)) 0%, transparent 50%)' }} 
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="relative flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Tasks</h3>
          
          {/* Template dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-[10px] font-semibold uppercase tracking-wider transition-all"
            >
              <Sparkles className="w-3 h-3" />
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
        <div className="relative flex items-center rounded-xl overflow-hidden transition-colors duration-200 focus-within:bg-white/5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Plus className="absolute left-3 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeFilter !== "all" ? `Add ${activeFilter} task...` : `Add task... (try "Record vocals urgent")`}
            className="w-full py-3 pl-10 pr-4 bg-transparent text-sm text-white/90 placeholder:text-white/30 focus:outline-none"
            disabled={isAdding}
          />
          
          {/* Tooltip trigger */}
          <div className="group absolute right-2">
            <div className="p-1.5 rounded-full hover:bg-white/10 cursor-help transition-colors">
              <span className="text-[10px] font-bold text-white/30 group-hover:text-white/60">?</span>
            </div>
            
            {/* Tooltip Content */}
            <div className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-xl bg-[#09090b] border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-2">Smart Keywords</h5>
              <div className="space-y-2 text-[10px] text-white/50">
                <div className="flex justify-between">
                  <span>Priority</span>
                  <span className="text-white/80">"high", "urgent", "low"</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Date</span>
                  <span className="text-white/80">"by friday", "tomorrow"</span>
                </div>
                <div className="flex justify-between">
                  <span>Sections</span>
                  <span className="text-white/80">"rec", "mix", "write"</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
