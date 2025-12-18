import { Song, Project, SongStatus, SONG_STATUSES } from "@/lib/types";
import { HeroStrip } from "@/components/HeroStrip";
import { ReferencePill } from "@/components/ReferencePill";
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
  onReferenceLinkChange,
  onStatusChange,
  projects,
  onProjectChange,
  versions,
  currentVersion,
  onVersionSelect,
  onCoverClick,
  onTagsUpdate,
}: SongMetadataProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-8 items-start pb-8 border-b border-white/5">
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
        onCoverClick={onCoverClick}
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground text-xs">Project</span>
            <select
              value={song.project_id || "none"}
              onChange={(e) => onProjectChange(e.target.value)}
              className="bg-transparent border border-white/10 rounded-full px-3 py-1.5 text-foreground/80 text-xs focus:outline-none cursor-pointer hover:border-white/20 transition-colors"
            >
              <option value="none" className="bg-background">
                None
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-background">
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <ReferencePill
            value={referenceLink}
            onChange={onReferenceLinkChange}
          />
        </div>

        <MoodTagsInput tags={song.mood_tags} onUpdate={onTagsUpdate} />
      </div>
    </section>
  );
}
