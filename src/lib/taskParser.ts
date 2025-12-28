import { SongSection } from "./types";

export type TaskPriority = 'high' | 'medium' | 'low';

interface ParsedTaskInput {
  title: string;
  priority?: TaskPriority;
  dueDate?: Date;
  section?: SongSection;
}

// Day name to next occurrence
const getNextDayOfWeek = (dayName: string): Date => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = days.indexOf(dayName.toLowerCase());
  if (dayIndex === -1) return new Date();
  
  const today = new Date();
  const todayIndex = today.getDay();
  let daysUntil = dayIndex - todayIndex;
  if (daysUntil <= 0) daysUntil += 7;
  
  const result = new Date(today);
  result.setDate(today.getDate() + daysUntil);
  result.setHours(23, 59, 59, 0);
  return result;
};

// Parse relative dates
const parseRelativeDate = (text: string): Date | null => {
  const lower = text.toLowerCase();
  const today = new Date();
  
  if (lower === 'today') {
    today.setHours(23, 59, 59, 0);
    return today;
  }
  if (lower === 'tomorrow') {
    today.setDate(today.getDate() + 1);
    today.setHours(23, 59, 59, 0);
    return today;
  }
  if (lower === 'next week') {
    today.setDate(today.getDate() + 7);
    today.setHours(23, 59, 59, 0);
    return today;
  }
  
  // Day names
  const dayMatch = lower.match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
  if (dayMatch) {
    return getNextDayOfWeek(dayMatch[1]);
  }
  
  return null;
};

// Section detection keywords
const sectionKeywords: Record<string, SongSection> = {
  'idea': 'Idea',
  'concept': 'Idea',
  'brainstorm': 'Idea',
  'write': 'Writing',
  'lyrics': 'Writing',
  'verse': 'Writing',
  'chorus': 'Writing',
  'record': 'Recording',
  'vocal': 'Recording',
  'take': 'Recording',
  'track': 'Recording',
  'produce': 'Production',
  'arrange': 'Production',
  'mix': 'Mixing',
  'eq': 'Mixing',
  'compress': 'Mixing',
  'balance': 'Mixing',
  'master': 'Mastering',
  'loudness': 'Mastering',
  'export': 'Mastering',
  'release': 'Release Prep',
  'distribute': 'Release Prep',
  'artwork': 'Release Prep',
};

export function parseTaskInput(input: string): ParsedTaskInput {
  let title = input.trim();
  let priority: TaskPriority | undefined;
  let dueDate: Date | undefined;
  let section: SongSection | undefined;

  // Priority detection
  const highPriorityPattern = /\b(urgent|asap|high priority|high|important|critical|!+)\b/i;
  const lowPriorityPattern = /\b(low priority|low|later|someday|eventually)\b/i;
  
  if (highPriorityPattern.test(title)) {
    priority = 'high';
    title = title.replace(highPriorityPattern, '').trim();
  } else if (lowPriorityPattern.test(title)) {
    priority = 'low';
    title = title.replace(lowPriorityPattern, '').trim();
  }

  // Due date detection: "by [date]" or "due [date]"
  const byDatePattern = /\b(?:by|due|before|until)\s+(today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/i;
  const byMatch = title.match(byDatePattern);
  
  if (byMatch) {
    const dateStr = byMatch[1];
    const parsed = parseRelativeDate(dateStr);
    
    if (parsed) {
      dueDate = parsed;
    } else {
      // Try parsing MM/DD or MM/DD/YYYY
      const parts = dateStr.split('/');
      if (parts.length >= 2) {
        const month = parseInt(parts[0]) - 1;
        const day = parseInt(parts[1]);
        const year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();
        const fullYear = year < 100 ? 2000 + year : year;
        dueDate = new Date(fullYear, month, day, 23, 59, 59);
      }
    }
    
    title = title.replace(byDatePattern, '').trim();
  }

  // Section detection from keywords
  const titleLower = title.toLowerCase();
  for (const [keyword, sec] of Object.entries(sectionKeywords)) {
    if (titleLower.includes(keyword)) {
      section = sec;
      break;
    }
  }

  // Clean up extra spaces
  title = title.replace(/\s+/g, ' ').trim();

  return {
    title,
    priority,
    dueDate,
    section,
  };
}

// Task templates per section
export const taskTemplates: Record<SongSection, string[]> = {
  'Idea': [
    'Capture voice memo',
    'Research reference tracks',
    'Write concept notes',
    'Define mood/vibe',
  ],
  'Writing': [
    'Draft verse 1',
    'Draft chorus',
    'Draft verse 2',
    'Write bridge',
    'Finalize song structure',
    'Polish lyrics',
  ],
  'Recording': [
    'Record scratch vocals',
    'Record final lead vocals',
    'Record harmonies',
    'Record ad-libs',
    'Punch-in corrections',
  ],
  'Production': [
    'Arrange full production',
    'Add drum patterns',
    'Layer synths/keys',
    'Add bass line',
    'Create transitions',
  ],
  'Mixing': [
    'Balance levels',
    'Apply EQ to vocals',
    'Add compression',
    'Create depth with reverb',
    'Pan elements',
    'Automate dynamics',
    'Export stems',
  ],
  'Mastering': [
    'A/B with reference',
    'Final loudness check',
    'Check mono compatibility',
    'Export master file',
  ],
  'Release Prep': [
    'Create album artwork',
    'Write song description',
    'Set up distribution',
    'Plan release date',
    'Create promo content',
  ],
};
