import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

interface CollapsibleSectionProps {
  id: string;
  label: string;
  text: string;
  expanded: boolean;
  accent?: string;
  onExpand: () => void;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onCaretChange?: (lineNumber: number, lineText: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function CollapsibleSection({
  id,
  label,
  text,
  expanded,
  accent,
  onExpand,
  onChange,
  onBlur,
  onCaretChange,
  onKeyDown,
}: CollapsibleSectionProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (expanded && textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true });
    }
  }, [expanded]);

  const handleCaret = (target: HTMLTextAreaElement) => {
    if (!onCaretChange) return;
    const caret = target.selectionStart || 0;
    const beforeCaret = target.value.slice(0, caret);
    const lines = beforeCaret.split(/\r?\n/);
    const activeLineIndex = Math.max(lines.length - 1, 0);
    const currentLines = target.value.split(/\r?\n/);
    const lineText = currentLines[activeLineIndex] || "";
    onCaretChange(activeLineIndex + 1, lineText);
  };

  const previewLine = text.split(/\r?\n/).find((line) => line.trim().length > 0) || "Add lyrics...";

  return (
    <div
      id={`lyrics-section-${id}`}
      className={`lyric-section ${expanded ? "expanded" : "collapsed"}`}
      aria-expanded={expanded}
      onClick={() => {
        if (!expanded) onExpand();
      }}
    >
      <div className="lyric-section-header">
        <div className="flex items-center gap-2">
          <span className="lyric-section-label" style={accent ? { color: accent } : undefined}>
            [{label}]
          </span>
          {!expanded && <p className="lyric-section-preview">{previewLine}</p>}
        </div>
        <ChevronDown className={`chevron ${expanded ? "open" : ""}`} />
      </div>

      {expanded && (
        <div className="lyric-section-body">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onClick={(e) => handleCaret(e.currentTarget)}
            onKeyUp={(e) => handleCaret(e.currentTarget)}
            onSelect={(e) => handleCaret(e.currentTarget)}
            onKeyDown={onKeyDown}
            placeholder="Start writing..."
            className="lyric-section-textarea"
          />
        </div>
      )}
    </div>
  );
}
