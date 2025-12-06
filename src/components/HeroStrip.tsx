import { useRef } from "react";
import { Image, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { VibeBox } from "./VibeBox";
import { SongVersion } from "@/hooks/useSongVersions";

interface HeroStripProps {
  coverUrl: string | null;
  title: string;
  onTitleChange: (value: string) => void;
  bpm: string;
  onBpmChange: (value: string) => void;
  songKey: string;
  onKeyChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  statuses: { value: string; label: string }[];
  versions: SongVersion[];
  currentVersion: SongVersion | null;
  onSelectVersion: (version: SongVersion) => void;
  onCoverClick: () => void;
  onVersionUpload: (file: File, description: string) => Promise<void>;
  isUploading: boolean;
}

export function HeroStrip({
  coverUrl,
  title,
  onTitleChange,
  bpm,
  onBpmChange,
  songKey,
  onKeyChange,
  status,
  onStatusChange,
  statuses,
  versions,
  currentVersion,
  onSelectVersion,
  onCoverClick,
}: HeroStripProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-5 mb-8"
    >
      {/* Cover Art - Compact with glow */}
      <button
        onClick={onCoverClick}
        className="relative w-16 h-16 flex-shrink-0 group cursor-pointer rounded-xl overflow-hidden"
      >
        {/* Glow effect */}
        {coverUrl && (
          <div 
            className="absolute -inset-2 blur-xl opacity-40 group-hover:opacity-60 transition-opacity"
            style={{ 
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: "cover",
            }}
          />
        )}
        
        <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 bg-white/5">
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="w-5 h-5 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <Upload className="w-4 h-4 text-transparent group-hover:text-white transition-colors" />
          </div>
        </div>
      </button>

      {/* Title + Vibe Box */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled"
          className="bg-transparent border-none outline-none text-2xl font-bold tracking-tight text-white flex-1 min-w-0 placeholder:text-white/20"
          style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}
        />
        
        <VibeBox
          versions={versions}
          currentVersion={currentVersion}
          onSelectVersion={onSelectVersion}
        />
      </div>

      {/* Meta Bar - Ghost inputs */}
      <div className="flex items-center gap-3 text-sm flex-shrink-0">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-2.5 py-1.5 bg-transparent border border-white/10 rounded-lg text-white/70 text-xs focus:outline-none cursor-pointer hover:border-white/20 transition-colors"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value} className="bg-[#09090b]">
              {s.label}
            </option>
          ))}
        </select>

        <div className="h-4 w-px bg-white/10" />

        <input
          type="text"
          value={bpm}
          onChange={(e) => onBpmChange(e.target.value)}
          placeholder="BPM"
          className="bg-transparent border-none outline-none text-xs w-12 text-white/50 placeholder:text-white/30 font-mono text-center"
        />

        <div className="h-4 w-px bg-white/10" />

        <input
          type="text"
          value={songKey}
          onChange={(e) => onKeyChange(e.target.value)}
          placeholder="Key"
          className="bg-transparent border-none outline-none text-xs w-10 text-white/50 placeholder:text-white/30 font-mono text-center"
        />
      </div>

      <input 
        ref={uploadInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
      />
    </motion.div>
  );
}