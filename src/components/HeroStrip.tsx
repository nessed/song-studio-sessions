import { useRef } from "react";
import { Image, Upload, ChevronDown, Link as LinkIcon, ExternalLink, Music2, Sparkles } from "lucide-react";
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

// Status color mapping for dynamic styling
const statusColors: Record<string, { bg: string; text: string; glow: string; dot: string }> = {
  idea: { bg: "bg-purple-500/10", text: "text-purple-400", glow: "shadow-purple-500/20", dot: "bg-purple-400" },
  writing: { bg: "bg-amber-500/10", text: "text-amber-400", glow: "shadow-amber-500/20", dot: "bg-amber-400" },
  recording: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "shadow-blue-500/20", dot: "bg-blue-400" },
  mixing: { bg: "bg-cyan-500/10", text: "text-cyan-400", glow: "shadow-cyan-500/20", dot: "bg-cyan-400" },
  mastering: { bg: "bg-indigo-500/10", text: "text-indigo-400", glow: "shadow-indigo-500/20", dot: "bg-indigo-400" },
  completed: { bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "shadow-emerald-500/20", dot: "bg-emerald-400" },
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
      className="relative flex items-start gap-10 w-full py-2"
    >
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
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
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
                  <Sparkles className="w-3.5 h-3.5 text-white/20 absolute -top-1 -right-1" />
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
           <div className="relative group/project flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/15 transition-all cursor-pointer">
              <span className="uppercase tracking-wider font-bold text-[10px] truncate max-w-[180px] text-white/50 group-hover/project:text-white/80 transition-colors">
                {projectName || "No Project"}
              </span>
              <ChevronDown className="w-3 h-3 opacity-40 group-hover/project:opacity-100 group-hover/project:text-white/80 transition-all" />
              
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

           {/* Version Pill - Enhanced */}
           <div className={`flex items-center gap-1.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-full px-2.5 py-1 text-[10px] font-mono hover:from-indigo-500/15 hover:to-purple-500/15 transition-all group/version ${versions.length > 1 ? 'cursor-pointer' : ''}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-indigo-300/80 font-semibold">{versionLabel}</span>
              {versions.length > 1 ? (
                <VibeBox
                  versions={versions}
                  currentVersion={currentVersion}
                  onSelectVersion={onSelectVersion}
                  onDeleteVersion={onDeleteVersion}
                  trigger={
                     <ChevronDown className="w-3 h-3 text-indigo-400/60 group-hover/version:text-indigo-300 transition-colors" />
                  }
                />
              ) : versions.length === 1 ? (
                <VibeBox
                  versions={versions}
                  currentVersion={currentVersion}
                  onSelectVersion={onSelectVersion}
                  onDeleteVersion={onDeleteVersion}
                  trigger={
                     <ChevronDown className="w-3 h-3 text-indigo-400/20 cursor-default" />
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
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-all group/ref"
                >
                  <LinkIcon className="w-3 h-3 text-emerald-400/70" />
                  <span className="truncate max-w-[120px] text-[10px] text-emerald-400/80 font-medium">{referenceLink.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-emerald-400/50 group-hover/ref:text-emerald-400 transition-colors" />
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
          
          {/* BPM Pill - Gradient Style */}
          <label className="relative group/bpm flex items-center bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2 focus-within:border-white/20 focus-within:from-white/[0.08] focus-within:to-white/[0.04] transition-all shadow-lg shadow-black/20 cursor-text hover:border-white/15">
             <span className="text-[9px] uppercase font-bold text-white/30 mr-2.5 tracking-widest">BPM</span>
             <input
               type="text"
               value={bpm}
               onChange={(e) => onBpmChange(e.target.value)}
               placeholder="---"
               className="bg-transparent border-none outline-none w-14 text-base font-mono font-semibold text-white/90 placeholder:text-white/20 text-center"
             />
             {/* Subtle gradient glow on hover */}
             <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-500/0 via-orange-500/0 to-amber-500/0 group-hover/bpm:from-rose-500/5 group-hover/bpm:via-orange-500/5 group-hover/bpm:to-amber-500/5 transition-all duration-300 pointer-events-none" />
          </label>

          {/* Key Pill - Gradient Style */}
          <label className="relative group/key flex items-center bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2 focus-within:border-white/20 focus-within:from-white/[0.08] focus-within:to-white/[0.04] transition-all shadow-lg shadow-black/20 cursor-text hover:border-white/15">
             <span className="text-[9px] uppercase font-bold text-white/30 mr-2.5 tracking-widest">KEY</span>
             <input
               type="text"
               value={songKey}
               onChange={(e) => onKeyChange(e.target.value)}
               placeholder="---"
               className="bg-transparent border-none outline-none w-16 text-base font-mono font-semibold text-white/90 placeholder:text-white/20 text-center"
             />
             {/* Subtle gradient glow on hover */}
             <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-teal-500/0 group-hover/key:from-blue-500/5 group-hover/key:via-cyan-500/5 group-hover/key:to-teal-500/5 transition-all duration-300 pointer-events-none" />
          </label>

          {/* Spacer */}
          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Status Dropdown - Dynamic Color */}
          <div className={`relative group/status flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shadow-lg ${statusStyle.bg} border-white/10 hover:border-white/20 ${statusStyle.glow}`} title="Click to change status">
             <div className={`w-2 h-2 rounded-full ${statusStyle.dot} shadow-lg`} />
             <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className={`appearance-none bg-transparent pr-5 text-sm font-semibold ${statusStyle.text} cursor-pointer focus:outline-none capitalize`}
             >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#09090b] text-white">
                    {s.label}
                  </option>
                ))}
             </select>
             <ChevronDown className={`w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 ${statusStyle.text} opacity-60 group-hover/status:opacity-100 transition-opacity pointer-events-none`} />
          </div>

        </div>
      </div>
    </motion.div>
  );
}
