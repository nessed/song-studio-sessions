import { Song, Project, SongStatus, SONG_STATUSES } from "@/lib/types";
import { HeroStrip } from "@/components/HeroStrip";
import { MoodTagsInput } from "@/components/MoodTagsInput";
import { SongVersion } from "@/hooks/useSongVersions";

interface SongMetadataProps {
  song: Song;
  title: string;
  onTitleChange: (v: string) => void;
  bpm: string;
  onBpmChange: (v: string) => void;
  songKey: string;
  onKeyChange: (v: string) => void;
  referenceLink: string;
  onReferenceLinkChange: (v: string) => void;
  onStatusChange: (s: SongStatus) => void;
  projects: Project[];
  onProjectChange: (pid: string) => void;
  versions: SongVersion[];
  currentVersion: SongVersion | null;
  onVersionSelect: (v: SongVersion | null) => void;
  onVersionDelete: (v: SongVersion) => void;
  onCoverClick: () => void;
  onTagsUpdate: (tags: string[]) => void;
}

export function SongMetadata({
  song,
  title,
  onTitleChange,
  bpm,
  onBpmChange,
  songKey,
  onKeyChange,
  referenceLink,
  onReferenceLinkChange, // Note: We might want to make this editable in HeroStrip eventually, for now read-only link
  onStatusChange,
  projects,
  onProjectChange,
  versions,
  currentVersion,
  onVersionSelect,
  onVersionDelete,
  onCoverClick,
  onTagsUpdate,
}: SongMetadataProps) {
  
  const currentProjectName = projects.find(p => p.id === song.project_id)?.title;

  return (
    <section className="grid grid-cols-1 gap-6 items-start pb-8 border-b border-white/5">
      <HeroStrip
        coverUrl={song.cover_art_url}
        title={title}
        onTitleChange={onTitleChange}
        bpm={bpm}
        onBpmChange={onBpmChange}
        songKey={songKey}
        onKeyChange={onKeyChange}
        status={song.status}
        onStatusChange={(s) => onStatusChange(s as SongStatus)}
        statuses={SONG_STATUSES}
        versions={versions}
        currentVersion={currentVersion}
        onSelectVersion={onVersionSelect}
        onDeleteVersion={onVersionDelete}
        onCoverClick={onCoverClick}
        // New Props
        projectName={currentProjectName}
        projects={projects}
        onProjectChange={onProjectChange}
        referenceLink={referenceLink}
      />

      {/* Mood Tags below the hero, cleaner layout */}
      <div className="w-full">
         <MoodTagsInput tags={song.mood_tags} onUpdate={onTagsUpdate} />
      </div>
    </section>
  );
}
