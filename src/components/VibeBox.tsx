import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Download, Clock, X, Trash2 } from "lucide-react";
import { SongVersion } from "@/hooks/useSongVersions";
import { formatDistanceToNow } from "date-fns";

interface VibeBoxProps {
  versions: SongVersion[];
  currentVersion: SongVersion | null;
  onSelectVersion: (version: SongVersion) => void;
  onDeleteVersion?: (version: SongVersion) => void;
  trigger?: React.ReactNode;
}

export function VibeBox({ versions, currentVersion, onSelectVersion, onDeleteVersion, trigger }: VibeBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewIndex, setViewIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayVersion = versions[viewIndex] || currentVersion;
  const versionNumber = currentVersion?.version_number || 1;

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const cycleUp = () => {
    if (viewIndex > 0) setViewIndex(viewIndex - 1);
  };

  const cycleDown = () => {
    if (viewIndex < versions.length - 1) setViewIndex(viewIndex + 1);
  };

  const handleSelect = () => {
    if (displayVersion && displayVersion.id !== currentVersion?.id) {
      onSelectVersion(displayVersion);
    }
    setIsOpen(false);
  };

  if (versions.length === 0) {
    return (
      <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-sm font-mono">
        v1
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Badge */}
      <button
        onClick={() => {
          setViewIndex(versions.findIndex((v) => v.id === currentVersion?.id) || 0);
          setIsOpen(true);
        }}
        className={trigger ? "flex items-center justify-center transition-opacity hover:opacity-80" : "group relative px-3 py-1.5 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105"}
      >
        {trigger ? (
           trigger
        ) : (
          <>
            {/* Glass background */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-md border border-white/10" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 animate-pulse" />
            </div>
            
            <span className="relative text-sm font-mono font-medium text-white/80">
              v{versionNumber}
            </span>
          </>
        )}
      </button>

      {/* Popover via portal to escape clipping */}
      {isOpen &&
        createPortal(
          <AnimatePresence>
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-[#0c0c0e]/95 backdrop-blur-2xl rounded-2xl border border-white/10" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent rounded-2xl" />
                  <div className="absolute inset-0 shadow-2xl shadow-black/50 rounded-2xl" />

                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-bold tracking-widest text-white/40 uppercase">
                        Version Roller
                      </h3>
                      <div className="flex items-center gap-1">
                        {onDeleteVersion && versions.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (displayVersion && window.confirm(`Delete v${displayVersion.version_number}? This cannot be undone.`)) {
                                onDeleteVersion(displayVersion);
                                setIsOpen(false);
                              }
                            }}
                            className="p-1 mr-2 text-white/20 hover:text-red-500 transition-colors"
                            title="Delete this version"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setIsOpen(false)}
                          className="p-1 text-white/40 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="relative h-32 overflow-hidden rounded-xl bg-black/30 border border-white/5">
                      <button
                        onClick={cycleUp}
                        disabled={viewIndex === 0}
                        className={`absolute top-2 left-1/2 -translate-x-1/2 z-10 p-1.5 rounded-full transition-all ${
                          viewIndex === 0 
                            ? "text-white/10 cursor-not-allowed" 
                            : "text-white/50 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>

                      <button
                        onClick={cycleDown}
                        disabled={viewIndex === versions.length - 1}
                        className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-10 p-1.5 rounded-full transition-all ${
                          viewIndex === versions.length - 1
                            ? "text-white/10 cursor-not-allowed"
                            : "text-white/50 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>

                      <AnimatePresence mode="popLayout">
                        {displayVersion && (
                          <motion.div
                            key={displayVersion.id}
                            initial={{ rotateX: -90, opacity: 0, y: 40 }}
                            animate={{ rotateX: 0, opacity: 1, y: 0 }}
                            exit={{ rotateX: 90, opacity: 0, y: -40 }}
                            transition={{ type: "spring", damping: 20, stiffness: 200 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-4"
                            style={{ transformStyle: "preserve-3d" }}
                          >
                            <span className="text-3xl font-bold font-mono text-white mb-1">
                              v{displayVersion.version_number}
                            </span>
                            <span className="text-sm text-white/60 truncate max-w-full">
                              {displayVersion.description || `Mix v${displayVersion.version_number}`}
                            </span>
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-white/40">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(displayVersion.created_at), { addSuffix: true })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={handleSelect}
                        disabled={displayVersion?.id === currentVersion?.id}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          displayVersion?.id === currentVersion?.id
                            ? "bg-white/5 text-white/30 cursor-not-allowed"
                            : "bg-white text-black hover:bg-white/90"
                        }`}
                      >
                        {displayVersion?.id === currentVersion?.id ? "Current" : "Load This Version"}
                      </button>
                      
                      <a
                        href={displayVersion?.file_url}
                        download
                        className="p-2.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-1">
                      {versions.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setViewIndex(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            i === viewIndex ? "bg-white w-4" : "bg-white/20 hover:bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
