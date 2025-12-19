import { useRef } from "react";
import { Image, Upload, ChevronDown, Link as LinkIcon, ExternalLink } from "lucide-react";
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
  shareAction?: React.ReactNode;
  status: string;
  onStatusChange: (value: string) => void;
  statuses: { value: string; label: string }[];
  versions: SongVersion[];
  currentVersion: SongVersion | null;
  onSelectVersion: (version: SongVersion) => void;
  onDeleteVersion?: (version: SongVersion) => void;
  onCoverClick: () => void;
  projectName?: string;
  projects?: { id: string; title: string }[];
  onProjectChange?: (projectId: string) => void;
  referenceLink?: string;
  onReferenceClick?: () => void;
}

export function HeroStrip({
  coverUrl,
  title,
  onTitleChange,
  bpm,
  onBpmChange,
  songKey,
  onKeyChange,
  shareAction,
  status,
  onStatusChange,
  statuses,
  versions,
  currentVersion,
  onSelectVersion,
  onDeleteVersion,
  onCoverClick,
  projectName,
  projects,
  onProjectChange,
  referenceLink,
  onReferenceClick,
}: HeroStripProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const versionLabel = currentVersion?.version_number
    ? `v${currentVersion.version_number}`
    : "v1";

  // Find current project ID if possible, or use 'none'
  const currentProjectId = projects?.find(p => p.title === projectName)?.id || "none";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start gap-8 w-full"
    >
      {/* Cover Art - Slightly larger and cleaner */}
      <div className="relative group">
        <button
          onClick={onCoverClick}
          className="relative w-32 h-32 flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden shadow-2xl transition-transform active:scale-95 z-10 block"
        >
           {/* Glow behind cover */}
          {coverUrl && (
            <div 
              className="absolute -inset-4 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"
              style={{ 
                backgroundImage: `url(${coverUrl})`,
                backgroundSize: "cover",
              }}
            />
          )}

          <div className="relative w-full h-full bg-white/5 border border-white/10">
            {coverUrl ? (
              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/0">
                <Image className="w-8 h-8 text-white/20" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </div>
        </button>
      </div>

      {/* Main Content Info */}
      <div className="flex-1 min-w-0 flex flex-col pt-1">
        
        {/* Context Line: Project • Version • Reference */}
        <div className="flex items-center gap-3 text-xs font-medium text-white/40 mb-2">
           <div className="relative group/project flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <span className="uppercase tracking-wider font-bold text-[10px] truncate max-w-[200px]">
                {projectName || "No Project"}
              </span>
              <ChevronDown className="w-3 h-3 opacity-0 group-hover/project:opacity-50" />
              
              {/* Invisible Select Overlay */}
              {projects && onProjectChange && (
                 <select
                    value={currentProjectId}
                    onChange={(e) => onProjectChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                 >
                    <option value="none">No Project</option>
                    {projects.map(p => (
                       <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                 </select>
              )}
           </div>

           <span className="text-white/10">•</span>

           <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-full px-2 py-0.5 text-[10px] font-mono hover:bg-white/10 transition-colors">
              <span>{versionLabel}</span>
              <VibeBox
                versions={versions}
                currentVersion={currentVersion}
                onSelectVersion={onSelectVersion}
                onDeleteVersion={onDeleteVersion}
                trigger={
                   <ChevronDown className="w-3 h-3 opacity-50" />
                }
              />
           </div>

           {referenceLink && (
             <>
               <span className="text-white/10">•</span>
               <a 
                  href={referenceLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{referenceLink.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
               </a>
             </>
           )}

           {shareAction && (
              <>
                 <span className="text-white/10">•</span>
                 {shareAction}
              </>
           )}
        </div>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled Song"
          className="bg-transparent border-none outline-none text-5xl font-bold tracking-tighter text-white/90 placeholder:text-white/10 w-full mb-4"
          style={{ fontFamily: "'Syne', sans-serif" }} // Premium font feel
        />

        {/* Badges Row: BPM, Key, Status */}
        <div className="flex items-center gap-3">
          
          {/* BPM Pill */}
          <div className="flex items-center bg-white/5 border border-white/5 rounded-md px-3 py-1.5 focus-within:border-white/20 focus-within:bg-white/10 transition-colors">
             <span className="text-[10px] uppercase font-bold text-white/30 mr-2 tracking-wider">BPM</span>
             <input
               type="text"
               value={bpm}
               onChange={(e) => onBpmChange(e.target.value)}
               placeholder="---"
               className="bg-transparent border-none outline-none w-8 text-sm font-mono text-white/80 placeholder:text-white/20 text-center"
             />
          </div>

          {/* Key Pill */}
          <div className="flex items-center bg-white/5 border border-white/5 rounded-md px-3 py-1.5 focus-within:border-white/20 focus-within:bg-white/10 transition-colors">
             <span className="text-[10px] uppercase font-bold text-white/30 mr-2 tracking-wider">KEY</span>
             <input
               type="text"
               value={songKey}
               onChange={(e) => onKeyChange(e.target.value)}
               placeholder="---"
               className="bg-transparent border-none outline-none w-10 text-sm font-mono text-white/80 placeholder:text-white/20 text-center"
             />
          </div>

          {/* Status Dropdown - Clean Text */}
          <div className="relative group">
             <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="appearance-none bg-transparent pl-3 pr-8 py-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors cursor-pointer focus:outline-none"
             >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#09090b]">
                    {s.label}
                  </option>
                ))}
             </select>
             <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
             
             {/* Status indicator dot */}
             <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${
                status === 'completed' ? 'bg-emerald-400' : 
                status === 'writing' ? 'bg-amber-400' : 'bg-white/20'
             }`} />
          </div>

        </div>
      </div>
    </motion.div>
  );
}
