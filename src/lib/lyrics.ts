export const SECTION_ORDER = ["Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Outro"] as const;

export type SectionLabel = (typeof SECTION_ORDER)[number];

export interface LyricsSection {
  id: string;
  label: string;
  text: string;
}

export const HEADING_REGEX = /^\[(Intro|Verse(?: \d+)?|Pre-?Chorus|Chorus|Bridge|Outro)\]\s*$/i;
const GENERIC_HEADING_REGEX = /^\[(.+?)\]\s*$/;

const makeId = (label: string, index: number) =>
  `${label.replace(/\s+/g, "-").toLowerCase()}-${index}-${Math.random().toString(36).slice(2, 7)}`;

const normalizeLabel = (raw: string) => {
  const cleaned = raw.trim().replace(/pre[\s-]?chorus/i, "Pre-Chorus");
  const withCaps = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return withCaps.replace(/\s+/, " ");
};

const normalizeCustomLabel = (raw: string) => {
  if (!raw.trim()) return "Untitled";
  const safe = raw.trim();
  return safe.charAt(0).toUpperCase() + safe.slice(1);
};

const baseLabel = (label: string) => label.toLowerCase().replace(/\s+/g, " ").replace(/ \d+$/, "");

export const parseLyricsToSections = (lyricsText: string | null | undefined): LyricsSection[] => {
  const text = lyricsText || "";
  if (!text.trim()) return [];

  const lines = text.split(/\r?\n/);
  const sections: LyricsSection[] = [];
  let currentLabel: string | null = null;
  let currentLines: string[] = [];
  let sectionCount = 0;

  const pushSection = () => {
    if (currentLabel === null) return;
    sections.push({
      id: makeId(currentLabel, sectionCount),
      label: currentLabel,
      text: currentLines.join("\n").replace(/^\n+/, "").replace(/\s+$/, ""),
    });
    sectionCount += 1;
  };

  for (const line of lines) {
    const headingMatch = line.match(HEADING_REGEX);
    const genericMatch = !headingMatch ? line.match(GENERIC_HEADING_REGEX) : null;
    if (headingMatch || genericMatch) {
      if (currentLabel !== null) {
        pushSection();
      }
      currentLabel = headingMatch ? normalizeLabel(headingMatch[1]) : normalizeCustomLabel(genericMatch![1]);
      currentLines = [];
      continue;
    }
    if (currentLabel === null) {
      currentLabel = "Verse";
    }
    currentLines.push(line);
  }

  pushSection();

  if (sections.length === 0) {
    return [
      {
        id: makeId("Verse", 0),
        label: "Verse",
        text: text.trim(),
      },
    ];
  }

  return sections;
};

export const serializeSectionsToLyrics = (sections: LyricsSection[]): string => {
  if (!sections.length) return "";

  const blocks = sections.map((section) => {
    const safeText = section.text.replace(/^\n+/, "").trimEnd();
    const block = safeText.length ? `[${section.label}]\n${safeText}` : `[${section.label}]\n`;
    return block;
  });

  return blocks.join("\n\n");
};

export const findSectionByLabel = (sections: LyricsSection[], label: string): LyricsSection | undefined => {
  const target = baseLabel(label);
  return sections.find((section) => baseLabel(section.label) === target);
};

export const nextLabelInstance = (sections: LyricsSection[], label: string) => {
  const count = sections.filter((s) => baseLabel(s.label) === baseLabel(label)).length;
  return count ? `${label} ${count + 1}` : label;
};
