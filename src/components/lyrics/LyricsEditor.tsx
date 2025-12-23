import { useRef, useEffect, useState } from "react";
import { LyricLineContext } from "./types";
import { motion } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";

interface LyricsEditorProps {
  value: string;
  onChange: (value: string) => void;
  onContextChange?: (context: LyricLineContext | null) => void;
  onRequestAddNote?: (context: LyricLineContext | null) => void;
}

// Freeform glass sheet with debounced persistence
export function LyricsEditor({ value, onChange, onContextChange, onRequestAddNote }: LyricsEditorProps) {
  const debounceRef = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const initialValue =
    value && value.trim().length > 0
      ? value
      : `[Intro]

[Verse]

[Pre-Chorus]

[Chorus]

[Bridge]

[Outro]`;

  useEffect(() => {
    // Initial context: entire sheet
    onContextChange?.({
      sectionLabel: "Freeform",
      lineNumber: 1,
      lineText: (value || "").split(/\r?\n/)[0] || "",
    });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Auto-resize textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset to recalculate
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value, isExpanded]);

  const queuePersist = (next: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(next), 400);
    adjustHeight();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key.toLowerCase() === "n" && (event.metaKey || event.ctrlKey) && onRequestAddNote) {
      event.preventDefault();
      const textarea = textareaRef.current;
      const cursorLine =
        textarea?.value
          .substring(0, textarea.selectionStart || 0)
          .split(/\r?\n/).length || 1;
      onRequestAddNote({
        sectionLabel: "Freeform",
        lineNumber: cursorLine,
        lineText: "",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative w-full overflow-hidden rounded-2xl group"
    >
      {/* Animated gradient border on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Main container with premium glass */}
      <div className="glass-premium glass-noise relative rounded-2xl overflow-hidden">
        {/* Theme-tinted inner glow */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(ellipse at top, var(--accent-subtle, rgba(124,58,237,0.1)) 0%, transparent 60%)' }}
        />
        
        {/* Top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent z-10" />

        {/* Header */}
        <div className="relative border-b border-white/[0.06] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <h4 className="text-xs font-semibold text-white/80 tracking-tight">Lyrics</h4>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Editor area */}
        <div className={`relative transition-all duration-300 ${isExpanded ? 'min-h-[500px]' : 'h-[450px]'} overflow-hidden`}>
          <textarea
            ref={textareaRef}
            defaultValue={initialValue}
            onChange={(e) => queuePersist(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start writing your lyrics..."
            className={`w-full ${isExpanded ? 'h-full' : 'h-full'} bg-transparent text-base text-white/90 p-6 leading-relaxed resize-none focus:outline-none placeholder:text-white/15 scrollbar-thin overflow-y-auto`}
            style={{ 
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier Prime', monospace",
              letterSpacing: "-0.01em",
              lineHeight: "2",
              height: isExpanded ? 'auto' : '100%',
              minHeight: '100%'
            }}
          />
          
          {/* Fade at bottom (only when not expanded) */}
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
          )}

          {/* Resize handle (only when not expanded) */}
           {!isExpanded && (
            <div className="absolute bottom-1 right-3 flex items-center gap-0.5 opacity-30 pointer-events-none">
              <div className="w-1 h-1 rounded-full bg-white/40" />
              <div className="w-1 h-1 rounded-full bg-white/40" />
              <div className="w-1 h-1 rounded-full bg-white/40" />
            </div>
           )}
        </div>
      </div>
    </motion.div>
  );
}

