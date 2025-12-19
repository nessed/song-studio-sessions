import { useEffect, useRef } from "react";
import { PenLine, Sparkles, FileText } from "lucide-react";
import { LyricLineContext } from "./types";
import { motion } from "framer-motion";

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

  const queuePersist = (next: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(next), 400);
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

  // Count lines for line number display hint
  const lineCount = (value || initialValue).split(/\r?\n/).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative w-full overflow-hidden rounded-2xl group"
    >
      {/* Animated gradient border on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Main container */}
      <div 
        className="relative rounded-2xl overflow-hidden"
        style={{ 
          background: "linear-gradient(180deg, rgba(15,15,20,0.95) 0%, rgba(10,10,15,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.06)"
        }}
      >
        {/* Top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        
        {/* Inner glow */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.03] via-transparent to-transparent" />

        {/* Header */}
        <div className="relative border-b border-white/[0.06] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center">
                <PenLine className="w-4 h-4 text-violet-400" />
              </div>
              <Sparkles className="w-2.5 h-2.5 text-violet-400/60 absolute -top-0.5 -right-0.5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white/80 tracking-tight">Lyrics</h4>
              <p className="text-[10px] text-white/30 font-medium">Freeform writing mode</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] text-white/30">
              <FileText className="w-3 h-3" />
              <span>{lineCount} lines</span>
            </div>
            <div className="px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[9px] uppercase tracking-widest font-bold text-white/30">⌘+N add note</span>
            </div>
          </div>
        </div>

        {/* Editor area */}
        <div className="relative min-h-[300px] max-h-[600px] h-[450px] resize-y overflow-hidden">
          <textarea
            ref={textareaRef}
            defaultValue={initialValue}
            onChange={(e) => queuePersist(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start writing your lyrics..."
            className="w-full h-full bg-transparent text-base text-white/90 p-6 leading-relaxed resize-none focus:outline-none placeholder:text-white/15 scrollbar-thin"
            style={{ 
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier Prime', monospace",
              letterSpacing: "-0.01em",
              lineHeight: "2"
            }}
          />
          
          {/* Fade at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
          
          {/* Resize handle indicator */}
          <div className="absolute bottom-1 right-3 flex items-center gap-0.5 opacity-30 pointer-events-none">
            <div className="w-1 h-1 rounded-full bg-white/40" />
            <div className="w-1 h-1 rounded-full bg-white/40" />
            <div className="w-1 h-1 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

