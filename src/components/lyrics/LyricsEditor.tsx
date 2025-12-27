import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { LyricLineContext } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, X, Minus, Plus } from "lucide-react";
import { JogWheel } from "../JogWheel";

interface LyricsEditorProps {
  value: string;
  onChange: (value: string) => void;
  onContextChange?: (context: LyricLineContext | null) => void;
  onRequestAddNote?: (context: LyricLineContext | null) => void;
}

interface LyricSection {
  id: string;
  header: string;
  lines: string[];
}

// Freeform glass sheet with debounced persistence
export function LyricsEditor({ value, onChange, onContextChange, onRequestAddNote }: LyricsEditorProps) {
  const debounceRef = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const performanceScrollRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPerformanceMode, setIsPerformanceMode] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
  const [scrollSpeed, setScrollSpeed] = useState(80); // pixels per keypress
  
  // Element refs for intersection observer
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const initialValue =
    value && value.trim().length > 0
      ? value
      : `[Intro]

[Verse]

[Pre-Chorus]

[Chorus]

[Bridge]

[Outro]`;

  // Parse lyrics into sections for the jump bar
  const parsedSections = useMemo(() => {
    const lines = (value || initialValue).split(/\r?\n/);
    const sections: LyricSection[] = [];
    let currentSection: LyricSection | null = null;
    let fallbackCounter = 1;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        // New section
        if (currentSection) sections.push(currentSection);
        const headerName = trimmed.slice(1, -1);
        currentSection = {
          id: `section-${headerName.toLowerCase().replace(/\s+/g, '-')}-${fallbackCounter++}`,
          header: headerName,
          lines: []
        };
      } else if (currentSection) {
        currentSection.lines.push(line); // Keep original whitespace for formatting
      } else {
        // Content before first header
        if (!currentSection) {
           currentSection = { id: 'section-start', header: 'Start', lines: [] };
        }
        currentSection.lines.push(line);
      }
    });
    if (currentSection) sections.push(currentSection);
    return sections;
  }, [value, initialValue]);

  // Flatten all lines for global indexing
  const allLines = useMemo(() => {
    const lines: { line: string; sectionId: string; sectionHeader: string }[] = [];
    parsedSections.forEach(section => {
      section.lines.forEach(line => {
        lines.push({ line, sectionId: section.id, sectionHeader: section.header });
      });
    });
    return lines;
  }, [parsedSections]);

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

  // Performance Mode: Intersection Observer for Focus
  useEffect(() => {
    if (!isPerformanceMode) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
           const index = Number(entry.target.getAttribute('data-index'));
           setActiveLineIndex(index);
        }
      });
    }, {
       root: null,
       rootMargin: "-40% 0px -50% 0px", // Focus zone near top-center
       threshold: 0.1
    });

    lineRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [isPerformanceMode, allLines]);


  // Auto-resize textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset to recalculate
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    if (!isPerformanceMode) adjustHeight();
  }, [value, isExpanded, isPerformanceMode]);

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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Jog Wheel handlers
  const handleJogScroll = useCallback((delta: number) => {
    if (performanceScrollRef.current) {
      performanceScrollRef.current.scrollBy({ top: delta * 2, behavior: 'auto' });
    }
  }, []);

  const handleSnapToActive = useCallback(() => {
    const activeEl = lineRefs.current[activeLineIndex];
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLineIndex]);

  // Keyboard navigation for arrow keys
  useEffect(() => {
    if (!isPerformanceMode) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!performanceScrollRef.current) return;
      
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        performanceScrollRef.current.scrollBy({ top: scrollSpeed, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        performanceScrollRef.current.scrollBy({ top: -scrollSpeed, behavior: 'smooth' });
      } else if (e.key === 'Escape') {
        setIsPerformanceMode(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPerformanceMode, scrollSpeed]);

  // Global line index counter for refs
  let globalLineIndex = 0;

  // Performance Mode View - Hardware Aesthetic
  if (isPerformanceMode) {
     return (
        <AnimatePresence>
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 overflow-hidden flex flex-col"
             style={{ backgroundColor: '#0A0A0A' }}
           >
              {/* Sticky Navigation Jump-Bar - Glassmorphism */}
              <div 
                className="flex-none h-20 flex items-center px-6 gap-4 overflow-x-auto no-scrollbar z-50"
                style={{
                  background: 'rgba(10, 10, 10, 0.7)',
                  backdropFilter: 'blur(25px)',
                  WebkitBackdropFilter: 'blur(25px)',
                  borderBottom: '0.5px solid rgba(255,255,255,0.08)',
                  boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.02), 0 4px 30px rgba(0,0,0,0.5)',
                }}
              >
                 {/* Close Button - Tactile */}
                 <button 
                  onClick={() => setIsPerformanceMode(false)}
                  className="relative p-3 rounded-xl flex-shrink-0 transition-all duration-200 active:scale-95"
                  style={{
                    background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.4)',
                    border: '0.5px solid rgba(255,255,255,0.06)',
                  }}
                 >
                   {/* Rim light */}
                   <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%)' }} />
                   <X className="w-5 h-5 text-white/70" />
                 </button>
                 
                 {/* Section Buttons - Sleek Minimal Pills */}
                 <div className="flex items-center gap-1.5 flex-1 overflow-x-auto no-scrollbar">
                    {parsedSections.map((section) => (
                       <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          title={section.header}
                          className="px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 hover:bg-white/10 active:scale-95 flex-shrink-0"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.5)',
                            maxWidth: '120px',
                          }}
                       >
                          <span className="truncate block">{section.header}</span>
                       </button>
                    ))}
                 </div>

                 {/* Scroll Speed Control */}
                 <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <span className="text-[9px] text-white/30 uppercase tracking-wider">Speed</span>
                    <button 
                      onClick={() => setScrollSpeed(Math.max(20, scrollSpeed - 20))}
                      className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-mono text-white/50 w-8 text-center">{scrollSpeed}</span>
                    <button 
                      onClick={() => setScrollSpeed(Math.min(200, scrollSpeed + 20))}
                      className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                 </div>

                 {/* Recording Indicator - LED Style */}
                 <div className="ml-auto flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                       <div 
                         className="w-3 h-3 rounded-full animate-pulse"
                         style={{ 
                           backgroundColor: '#ef4444',
                           boxShadow: '0 0 12px rgba(239, 68, 68, 0.8), 0 0 24px rgba(239, 68, 68, 0.4)',
                         }}
                       />
                       <span className="text-xs font-mono font-bold tracking-wider text-rose-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>REC</span>
                    </div>
                 </div>
              </div>

              {/* Teleprompter Content */}
              <div 
                ref={performanceScrollRef}
                className="flex-1 overflow-y-auto px-12 py-[35vh] scroll-smooth text-center"
                style={{ overscrollBehaviorY: 'contain' }}
              >
                 <div className="max-w-5xl mx-auto space-y-20">
                    {parsedSections.map((section) => (
                       <div key={section.id} id={section.id} className="scroll-mt-28">
                          {/* Section Header - LED Display Style */}
                          <h2 
                            className="text-sm font-bold mb-10 uppercase tracking-[0.2em] px-5 py-2.5 rounded-lg inline-block max-w-full"
                            style={{ 
                              fontFamily: "'JetBrains Mono', monospace",
                              color: 'rgba(244, 63, 94, 0.8)',
                              background: 'rgba(244, 63, 94, 0.08)',
                              border: '1px solid rgba(244, 63, 94, 0.2)',
                              textShadow: '0 0 20px rgba(244, 63, 94, 0.5)',
                              wordBreak: 'break-word',
                              maxWidth: '90%',
                            }}
                            title={section.header}
                          >
                            {section.header.length > 60 ? section.header.substring(0, 60) + '...' : section.header}
                          </h2>
                          <div className="space-y-4">
                            {section.lines.map((line, idx) => {
                               const currentGlobalIndex = globalLineIndex++;
                               const isActive = currentGlobalIndex === activeLineIndex;
                               const distance = Math.abs(currentGlobalIndex - activeLineIndex);
                               const opacity = isActive ? 1 : Math.max(0.15, 1 - (distance * 0.25));
                               
                               return (
                                  <p 
                                    key={idx}
                                    ref={el => lineRefs.current[currentGlobalIndex] = el}
                                    data-index={currentGlobalIndex}
                                    className={`text-5xl font-bold leading-snug transition-all duration-300 ${line.trim() === "" ? 'h-6' : ''}`}
                                    style={{
                                       fontFamily: "'Syne', sans-serif",
                                       opacity,
                                       color: isActive ? '#ffffff' : 'rgba(255,255,255,0.9)',
                                       transform: isActive ? 'scale(1.02)' : 'scale(1)',
                                       textShadow: isActive ? '0 0 40px rgba(255,255,255,0.2)' : 'none',
                                    }}
                                  >
                                    {line || " "}
                                  </p>
                               );
                            })}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Jog Wheel */}
              <JogWheel onScroll={handleJogScroll} onSnapToActive={handleSnapToActive} />
           </motion.div>
        </AnimatePresence>
     );
  }

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
          <div className="flex items-center gap-1">
             <button
               onClick={() => setIsPerformanceMode(true)}
               className="p-1.5 rounded-lg hover:bg-white/5 text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 mr-2"
               title="Performance Mode"
             >
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Record</span>
             </button>
             <button 
               onClick={() => setIsExpanded(!isExpanded)}
               className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
               title={isExpanded ? "Collapse" : "Expand"}
             >
               {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
             </button>
          </div>
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

