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

export interface Song {
  id: string;
  title: string;
  status: SongStatus;
  bpm?: number;
  key?: string;
  moodTags: string[];
  coverArtDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  songId: string;
  section: SongSection;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionsDB {
  songs: Song[];
  tasks: Task[];
}
