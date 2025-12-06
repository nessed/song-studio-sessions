import { useEffect, useRef } from "react";
import { PenLine } from "lucide-react";
import { LyricLineContext } from "./types";

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

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-3xl border border-white/5" style={{ background: "var(--bg-card)" }}>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.04] via-transparent to-transparent" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

      <div className="relative h-full flex flex-col">
        <div className="border-b border-white/5 px-4 py-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
          <div className="flex items-center gap-2">
            <PenLine className="w-3.5 h-3.5 text-white/40" />
            <span>Freeform Lyrics</span>
          </div>
          <span className="text-white/40">Flow state — no tabs</span>
        </div>

        <textarea
          ref={textareaRef}
          defaultValue={initialValue}
          onChange={(e) => queuePersist(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Start writing..."
          className="flex-1 w-full bg-transparent text-lg text-white/80 p-8 leading-relaxed font-sans resize-none focus:outline-none placeholder:text-white/25"
          style={{ fontFamily: "Inter, 'Space Grotesk', 'JetBrains Mono', monospace" }}
        />
      </div>
    </div>
  );
}
