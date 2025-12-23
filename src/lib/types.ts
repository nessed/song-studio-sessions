export type SongStatus =
  | "idea"
  | "writing"
  | "recording"
  | "production"
  | "mixing"
  | "mastering"
  | "release_prep";

export type SongSection =
  | "Idea"
  | "Writing"
  | "Recording"
  | "Production"
  | "Mixing"
  | "Mastering"
  | "Release Prep";

export const SONG_SECTIONS: SongSection[] = [
  "Idea",
  "Writing",
  "Recording",
  "Production",
  "Mixing",
  "Mastering",
  "Release Prep",
];

export const SONG_STATUSES: { value: SongStatus; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "writing", label: "Writing" },
  { value: "recording", label: "Recording" },
  { value: "production", label: "Production" },
  { value: "mixing", label: "Mixing" },
  { value: "mastering", label: "Mastering" },
  { value: "release_prep", label: "Release Prep" },
];

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  mood_tags: string[];
  cover_art_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Song {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  status: SongStatus;
  bpm: number | null;
  key: string | null;
  mood_tags: string[];
  cover_art_url: string | null;
  mp3_url: string | null;
  reference_link: string | null;
  lyrics: string | null;
  is_public?: boolean;
  share_hash?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  song_id: string;
  user_id: string;
  section: SongSection;
  title: string;
  done: boolean;
  created_at: string;
  updated_at: string;
}

export interface SongNote {
  id: string;
  song_id: string;
  user_id: string | null;
  guest_name?: string | null;
  timestamp_seconds: number;
  body: string;
  created_at: string;
}

export interface ExportData {
  profile: Profile | null;
  projects: Project[];
  songs: Song[];
  tasks: Task[];
  song_notes: SongNote[];
  exported_at: string;
}

export interface SongVersion {
  id: string;
  song_id: string;
  version_number: number;
  file_url: string;
  description: string | null;
  is_current: boolean;
  created_at: string;
  user_id: string;
}

export type StemType = 'drums' | 'bass' | 'vocals' | 'synths' | 'guitars' | 'other';

export interface SongStem {
  id: string;
  version_id: string;
  user_id: string;
  stem_type: StemType;
  file_url: string;
  label: string | null;
  is_muted: boolean;
  volume: number;
  created_at: string;
}

export const STEM_TYPES: { value: StemType; label: string; color: string }[] = [
  { value: 'drums', label: 'Drums', color: '#f97316' },
  { value: 'bass', label: 'Bass', color: '#8b5cf6' },
  { value: 'vocals', label: 'Vocals', color: '#06b6d4' },
  { value: 'synths', label: 'Synths', color: '#10b981' },
  { value: 'guitars', label: 'Guitars', color: '#f59e0b' },
  { value: 'other', label: 'Other', color: '#6b7280' },
];

export interface SessionsDB {
  songs: Song[];
  tasks: Task[];
  song_versions: SongVersion[];
  song_stems: SongStem[];
}

