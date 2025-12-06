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

  const versionLabel = currentVersion?.version_number
    ? `VERSION v${currentVersion.version_number}`
    : "VERSION v1";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-6"
    >
      {/* Cover Art */}
      <button
        onClick={onCoverClick}
        className="relative w-24 h-24 flex-shrink-0 group cursor-pointer rounded-xl overflow-hidden shadow-2xl"
      >
        {coverUrl && (
          <div 
            className="absolute -inset-3 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"
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

      {/* Title + Meta */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled"
          className="bg-transparent border-none outline-none text-4xl font-bold tracking-tight text-white flex-1 min-w-0 placeholder:text-white/25"
          style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}
        />

        <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-white/70">
          <div className="flex items-center gap-2">
            <span className="uppercase text-[10px] text-white/40 tracking-[0.2em]">BPM</span>
            <input
              type="text"
              value={bpm}
              onChange={(e) => onBpmChange(e.target.value)}
              placeholder="120"
              className="bg-transparent border-none outline-none w-12 text-center placeholder:text-white/30 text-white/80"
            />
          </div>

          <span className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <span className="uppercase text-[10px] text-white/40 tracking-[0.2em]">Key</span>
            <input
              type="text"
              value={songKey}
              onChange={(e) => onKeyChange(e.target.value)}
              placeholder="Fm"
              className="bg-transparent border-none outline-none w-12 text-center placeholder:text-white/30 text-white/80"
            />
          </div>

          <span className="h-4 w-px bg-white/10" />

          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-0 py-0 bg-transparent border-none text-white/80 text-sm font-mono focus:outline-none cursor-pointer hover:text-white transition-colors"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#09090b]">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right rail */}
      <div className="flex flex-col items-end gap-3">
        <div className="flex items-center gap-3">
          <div className="border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white/80">
            {versionLabel}
          </div>
          <VibeBox
            versions={versions}
            currentVersion={currentVersion}
            onSelectVersion={onSelectVersion}
          />
        </div>

        <input 
          ref={uploadInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
        />
      </div>
    </motion.div>
  );
}
