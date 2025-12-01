import { useEffect, useMemo, useRef, useState } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { useLyricsSections } from "./useLyricsSections";
import { SECTION_ORDER, findSectionByLabel } from "@/lib/lyrics";
import { LyricLineContext } from "./types";

interface LyricsEditorProps {
  value: string;
  onChange: (value: string) => void;
  onContextChange?: (context: LyricLineContext | null) => void;
  onRequestAddNote?: (context: LyricLineContext | null) => void;
}

export function LyricsEditor({ value, onChange, onContextChange, onRequestAddNote }: LyricsEditorProps) {
  const {
    sections,
    activeId,
    setActiveId,
    setActiveByLabel,
    insertSection,
    updateSectionText,
    rebuildText,
    overwriteSections,
  } = useLyricsSections(value || "");

  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentContext, setCurrentContext] = useState<LyricLineContext | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    onContextChange?.(currentContext);
  }, [currentContext, onContextChange]);

  const activeSection = useMemo(() => sections.find((s) => s.id === activeId), [sections, activeId]);

  useEffect(() => {
    if (!activeSection) {
      setCurrentContext(null);
      return;
    }
    const firstLine = activeSection.text.split(/\r?\n/).find((line) => line.trim().length > 0) || "";
    setCurrentContext({
      sectionLabel: activeSection.label,
      lineNumber: 1,
      lineText: firstLine,
    });
  }, [activeSection]);

  const queuePersist = (nextLyrics: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(nextLyrics);
    }, 500);
  };

  const handleSaveNow = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const text = rebuildText();
    onChange(text);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`lyrics-section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const focusSection = (id: string) => {
    setActiveId(id);
    setTimeout(() => scrollToSection(id), 10);
  };

  const handleTabClick = (label: string) => {
    const found = setActiveByLabel(label);
    if (found) {
      scrollToSection(found);
      return;
    }
    const newId = insertSection(label);
    setTimeout(() => {
      scrollToSection(newId);
    }, 20);
  };

  const handleSectionChange = (id: string, text: string) => {
    const nextSections = sections.map((section) => (section.id === id ? { ...section, text } : section));
    overwriteSections(nextSections);
    const nextLyrics = rebuildText(nextSections);
    queuePersist(nextLyrics);
  };

  const handleCaretChange = (sectionId: string, lineNumber: number, lineText: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    setCurrentContext({ sectionLabel: section.label, lineNumber, lineText });
  };

  const moveSection = (direction: 1 | -1) => {
    if (!activeId) return;
    const currentIndex = sections.findIndex((s) => s.id === activeId);
    if (currentIndex === -1) return;
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= sections.length) return;
    focusSection(sections[nextIndex].id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && /^[1-6]$/.test(event.key)) {
      event.preventDefault();
      const idx = Number(event.key) - 1;
      const label = SECTION_ORDER[idx];
      handleTabClick(label);
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      moveSection(event.shiftKey ? -1 : 1);
      return;
    }

    if (event.key.toLowerCase() === "n" && onRequestAddNote) {
      event.preventDefault();
      event.stopPropagation();
      onRequestAddNote(currentContext);
    }
  };

  return (
    <div className="lyrics-shell" ref={containerRef}>
      <div className="lyrics-tabs" role="tablist">
        {SECTION_ORDER.map((label) => {
          const sectionExists = !!findSectionByLabel(sections, label);
          const isActive = !!activeSection && activeSection.label.startsWith(label);
          return (
            <button
              key={label}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabClick(label)}
              className={`lyrics-tab ${isActive ? "active" : ""} ${sectionExists ? "present" : ""}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="lyrics-panel">
        {sections.length === 0 && (
          <div className="empty-lyrics">
            <p className="text-muted-foreground">No sections yet. Choose one above to start.</p>
          </div>
        )}

        {sections.map((section) => (
          <CollapsibleSection
            key={section.id}
            id={section.id}
            label={section.label}
            text={section.text}
            expanded={section.id === activeId}
            onExpand={() => focusSection(section.id)}
            onChange={(text) => handleSectionChange(section.id, text)}
            onBlur={handleSaveNow}
            onCaretChange={(line, lineText) => handleCaretChange(section.id, line, lineText)}
            onKeyDown={handleKeyDown}
          />
        ))}
      </div>
    </div>
  );
}
