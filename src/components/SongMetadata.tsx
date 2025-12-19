import { Song, Project, SongStatus, SONG_STATUSES } from "@/lib/types";
import { HeroStrip } from "@/components/HeroStrip";
import { MoodTagsInput } from "@/components/MoodTagsInput";
import { SongVersion } from "@/hooks/useSongVersions";
import { ShareModal } from "@/components/ShareModal";
import { motion } from "framer-motion";
import { Tags } from "lucide-react";

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
  onUpdateSong: () => void;
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
  onUpdateSong,
}: SongMetadataProps) {
  
  const currentProjectName = projects.find(p => p.id === song.project_id)?.title;

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative space-y-6"
    >
      {/* Main Hero Content */}
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
        shareAction={
           <ShareModal 
              song={song} 
              onUpdate={onUpdateSong} 
           />
        }
      />

      {/* Mood Tags Section - Enhanced styling */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative"
      >
        {/* Subtle divider */}
        <div className="absolute -top-3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        
        <div className="flex items-start gap-4 pt-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/30 pt-1.5">
            <Tags className="w-3.5 h-3.5" />
            <span>Vibes</span>
          </div>
          <div className="flex-1">
            <MoodTagsInput tags={song.mood_tags} onUpdate={onTagsUpdate} />
          </div>
        </div>
        
        {/* Bottom divider */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </motion.div>
    </motion.section>
  );
}

