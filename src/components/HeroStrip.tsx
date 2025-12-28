import { useRef } from "react";
import { Image, Upload, ChevronDown, Link as LinkIcon, ExternalLink, Music2, Folder } from "lucide-react";
import { motion } from "framer-motion";
import { VibeBox } from "./VibeBox";
import { MoodTagsInput } from "./MoodTagsInput";
import { SongVersion } from "@/hooks/useSongVersions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  tags?: string[];
  onTagsUpdate?: (tags: string[]) => void;
}

// Status color mapping for dynamic styling
const statusColors: Record<string, { bg: string; text: string; glow: string; dot: string }> = {
  idea: { bg: "bg-white/5", text: "text-white/70", glow: "shadow-white/5", dot: "bg-white/40" },
  writing: { bg: "bg-white/5", text: "text-white/70", glow: "shadow-white/5", dot: "bg-white/40" },
  recording: { bg: "bg-white/5", text: "text-white/70", glow: "shadow-white/5", dot: "bg-white/40" },
  mixing: { bg: "bg-white/5", text: "text-white/70", glow: "shadow-white/5", dot: "bg-white/40" },
  mastering: { bg: "bg-white/5", text: "text-white/70", glow: "shadow-white/5", dot: "bg-white/40" },
  completed: { bg: "bg-white/5", text: "text-white/70", glow: "shadow-white/5", dot: "bg-white/60" },
};

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
  tags = [],
  onTagsUpdate,
}: HeroStripProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const versionLabel = currentVersion?.version_number
    ? `v${currentVersion.version_number}`
    : "v1";

  // Find current project ID if possible, or use 'none'
  const currentProjectId = projects?.find(p => p.title === projectName)?.id || "none";
  
  // Get status colors
  const statusStyle = statusColors[status] || { bg: "bg-white/5", text: "text-white/60", glow: "", dot: "bg-white/40" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex items-start gap-12 w-full py-2"
    >
      {/* ... (Background & Cover Art code omitted as it matches original, ensuring no broken context) ... */}
      {/* Ambient Background Glow from Cover */}
      {coverUrl && (
        <div className="absolute -inset-20 -z-10 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 blur-[120px] opacity-20 saturate-150 scale-150"
            style={{ 
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#09090b]/50 to-[#09090b]" />
        </div>
      )}

      {/* Cover Art - Premium Showcase */}
      <motion.div 
        className="relative group"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Floating Glow Effect */}
        {coverUrl && (
          <motion.div 
            className="absolute -inset-3 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ 
              background: `radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        
        <button
          onClick={onCoverClick}
          className="relative w-40 h-40 flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden shadow-2xl shadow-black/50 transition-all active:scale-95 z-10 block ring-1 ring-white/10"
        >
          {/* Inner Glow */}
          {coverUrl && (
            <div 
              className="absolute -inset-8 blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 -z-10"
              style={{ 
                backgroundImage: `url(${coverUrl})`,
                backgroundSize: "cover",
              }}
            />
          )}

          <div className="relative w-full h-full bg-gradient-to-br from-white/10 to-white/5">
            {coverUrl ? (
              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent border-2 border-dashed border-white/10 group-hover:border-white/20 transition-colors">
                <div className="relative">
                  <Music2 className="w-10 h-10 text-white/15" />
                </div>
                <span className="text-[9px] uppercase tracking-wider font-medium text-white/25 group-hover:text-white/40 transition-colors">Click to upload</span>
              </div>
            )}
            
            {/* Upload Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-white" />
                <span className="text-[10px] uppercase tracking-wider font-medium text-white/80">Upload Art</span>
              </div>
            </div>
          </div>
        </button>
      </motion.div>

      {/* Main Content Info */}
      <div className="flex-1 min-w-0 flex flex-col pt-2">
        
        {/* Context Line: Project • Version • Reference */}
        <div className="flex items-center gap-3 text-xs font-medium text-white/40 mb-3">
          
           {/* Project Selector - Replaced with proper Select */}
           {projects && onProjectChange ? (
             <Select value={currentProjectId} onValueChange={onProjectChange}>
               <SelectTrigger className="h-7 w-auto min-w-[120px] max-w-[200px] gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold text-white/50 hover:bg-white/[0.08] hover:text-white/80 transition-all focus:ring-0 focus:ring-offset-0">
                 <div className="flex items-center gap-1.5 truncate">
                   <span>{projectName || "No Project"}</span>
                 </div>
               </SelectTrigger>
               <SelectContent 
                 className="bg-[#050505]/95 border-white/[0.08] text-white/90 rounded-xl backdrop-blur-2xl shadow-xl min-w-[180px]"
                 align="start"
                 sideOffset={8}
               >
                 <SelectItem value="none" className="text-[11px] font-medium text-white/50 focus:bg-white/5 focus:text-white/90 cursor-pointer py-2 pl-3">No Project</SelectItem>
                 {projects.map(p => (
                   <SelectItem key={p.id} value={p.id} className="text-[11px] font-medium text-white/70 focus:bg-white/5 focus:text-white cursor-pointer py-2 pl-3 flex items-center gap-2">
                      <Folder className="w-3 h-3 opacity-50 mr-2" />
                      {p.title}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
              <span className="uppercase tracking-wider font-bold text-[10px] truncate max-w-[180px] text-white/50">
                {projectName || "No Project"}
              </span>
            </div>
           )}

           <span className="text-white/10">•</span>

           {/* Version Pill - Enhanced */}
           <div className={`flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1 text-[10px] font-mono hover:bg-white/10 transition-all group/version ${versions.length > 1 ? 'cursor-pointer' : ''}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover/version:bg-white/60 transition-colors" />
              <span className="text-white/50 font-semibold group-hover/version:text-white/80 transition-colors">{versionLabel}</span>
              {versions.length > 1 ? (
                <VibeBox
                  versions={versions}
                  currentVersion={currentVersion}
                  onSelectVersion={onSelectVersion}
                  onDeleteVersion={onDeleteVersion}
                  trigger={
                     <ChevronDown className="w-3 h-3 text-white/30 group-hover/version:text-white/60 transition-colors" />
                  }
                />
              ) : versions.length === 1 ? (
                <VibeBox
                  versions={versions}
                  currentVersion={currentVersion}
                  onSelectVersion={onSelectVersion}
                  onDeleteVersion={onDeleteVersion}
                  trigger={
                     <ChevronDown className="w-3 h-3 text-white/10 cursor-default" />
                  }
                />
              ) : null}
           </div>

           {referenceLink && (
             <>
               <span className="text-white/10">•</span>
               <a 
                  href={referenceLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/ref"
                >
                  <LinkIcon className="w-3 h-3 text-white/30 group-hover/ref:text-white/60 transition-colors" />
                  <span className="truncate max-w-[120px] text-[10px] text-white/40 group-hover/ref:text-white/70 font-medium transition-colors">{referenceLink.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-white/20 group-hover/ref:text-white/50 transition-colors" />
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

        {/* Title Input - Premium Typography */}
        <div className="relative mb-5 group/title">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled Song"
            className="bg-transparent border-none outline-none text-[3.5rem] font-bold tracking-tight text-white placeholder:text-white/10 w-full leading-none"
            style={{ fontFamily: "'Syne', sans-serif" }}
          />
          {/* Subtle underline accent - expands on hover/focus */}
          <div className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-white/20 to-transparent rounded-full transition-all duration-300 w-24 group-hover/title:w-48 group-focus-within/title:w-64 group-focus-within/title:from-white/40" />
        </div>

        {/* Badges Row: BPM, Key, Status - Redesigned */}
        <div className="flex items-center gap-3">
          
          {/* BPM Pill - Premium Glass */}
          <label className="glass-pill relative group/bpm flex items-center px-3 py-1.5 cursor-text">
             <span className="text-[9px] uppercase font-semibold text-white/30 mr-2 tracking-wider">BPM</span>
             <input
               type="text"
               value={bpm}
               onChange={(e) => onBpmChange(e.target.value)}
               placeholder="---"
               className="bg-transparent border-none outline-none w-14 text-base font-mono font-semibold text-white/90 placeholder:text-white/20 text-center"
             />
             {/* Chromatic accent on hover */}
             <div className="absolute inset-0 rounded-xl opacity-0 group-hover/bpm:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'rgba(255,255,255,0.03)' }} />
          </label>

          {/* Key Pill - Premium Glass */}
          <label className="glass-pill relative group/key flex items-center px-3 py-1.5 cursor-text">
             <span className="text-[9px] uppercase font-semibold text-white/30 mr-2 tracking-wider">KEY</span>
             <input
               type="text"
               value={songKey}
               onChange={(e) => onKeyChange(e.target.value)}
               placeholder="---"
               className="bg-transparent border-none outline-none w-16 text-base font-mono font-semibold text-white/90 placeholder:text-white/20 text-center"
             />
             {/* Chromatic accent on hover */}
             <div className="absolute inset-0 rounded-xl opacity-0 group-hover/key:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'rgba(255,255,255,0.03)' }} />
          </label>

          {/* Spacer */}
          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Status Dropdown - Replaced with Select */}
          <div className="relative">
             <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className={`h-[34px] w-auto gap-2 rounded-xl border border-white/10 ${statusStyle.bg} ${statusStyle.glow} px-3 text-sm font-semibold capitalize transition-all hover:bg-white/10 hover:border-white/20 focus:ring-0 focus:ring-offset-0`}>
                   <div className={`w-2 h-2 rounded-full ${statusStyle.dot} shadow-lg mr-1`} />
                   <span className={statusStyle.text}>{statuses.find(s => s.value === status)?.label}</span>
                </SelectTrigger>
                <SelectContent 
                   className="bg-[#050505]/95 border-white/[0.08] text-white/90 rounded-xl backdrop-blur-2xl shadow-xl min-w-[180px]"
                   align="end"
                   sideOffset={8}
                >
                   {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="text-sm font-medium text-white/70 focus:bg-white/5 focus:text-white capitalize cursor-pointer my-1 py-2 pl-3">
                         <span className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full shadow-lg transition-colors ${statusColors[s.value]?.dot || 'bg-white/40'}`} />
                            {s.label}
                         </span>
                      </SelectItem>
                   ))}
                </SelectContent>
             </Select>
          </div>

          {/* Spacer */}
          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Inline Tags */}
          {onTagsUpdate && (
             <div className="opacity-80">
                <MoodTagsInput tags={tags} onUpdate={onTagsUpdate} />
             </div>
          )}
          </div>
      </div>
    </motion.div>
  );
}
