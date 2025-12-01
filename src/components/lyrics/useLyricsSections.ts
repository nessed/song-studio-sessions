import { useEffect, useRef, useState } from "react";
import {
  SECTION_ORDER,
  findSectionByLabel,
  nextLabelInstance,
  parseLyricsToSections,
  serializeSectionsToLyrics,
  type LyricsSection,
} from "@/lib/lyrics";

const baseLabel = (label: string) => label.toLowerCase().replace(/\s+/g, " ").replace(/ \d+$/, "");

export interface LyricsSectionState extends LyricsSection {}

export function useLyricsSections(lyricsText: string) {
  const [sections, setSections] = useState<LyricsSectionState[]>(() => parseLyricsToSections(lyricsText));
  const [activeId, setActiveId] = useState<string | null>(() => sections[0]?.id ?? null);

  const serializedRef = useRef(lyricsText);
  const sectionsRef = useRef<LyricsSectionState[]>(sections);

  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  useEffect(() => {
    if (lyricsText === serializedRef.current) return;
    const parsed = parseLyricsToSections(lyricsText);
    setSections(parsed);
    setActiveId((prev) => (parsed.find((s) => s.id === prev) ? prev : parsed[0]?.id ?? null));
    serializedRef.current = lyricsText;
  }, [lyricsText]);

  const rebuildText = (customSections?: LyricsSectionState[]) => {
    const text = serializeSectionsToLyrics(customSections ?? sectionsRef.current);
    serializedRef.current = text;
    return text;
  };

  const overwriteSections = (next: LyricsSectionState[]) => {
    sectionsRef.current = next;
    setSections(next);
  };

  const setActiveByLabel = (label: string) => {
    const target = findSectionByLabel(sectionsRef.current, label);
    if (target) {
      setActiveId(target.id);
      return target.id;
    }
    return null;
  };

  const insertSection = (label: string) => {
    const finalLabel = nextLabelInstance(sectionsRef.current, label);
    const newSection: LyricsSectionState = {
      id: `${finalLabel.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`,
      label: finalLabel,
      text: "",
    };

    setSections((prev) => {
      const activeIndex = prev.findIndex((s) => s.id === activeId);
      const insertIndex = activeIndex >= 0 ? activeIndex + 1 : prev.length;
      const next = [...prev];
      next.splice(insertIndex, 0, newSection);
      return next;
    });
    setActiveId(newSection.id);
    return newSection.id;
  };

  const updateSectionText = (id: string, text: string) => {
    setSections((prev) => prev.map((section) => (section.id === id ? { ...section, text } : section)));
  };

  return {
    sections,
    activeId,
    setActiveId,
    setActiveByLabel,
    insertSection,
    updateSectionText,
    rebuildText,
    overwriteSections,
    baseLabel,
    canonicalSections: SECTION_ORDER,
  };
}
