import { useRef, useEffect, useState } from "react";
import { Volume2, VolumeX, Trash2, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SongStem, StemType, STEM_TYPES } from "@/lib/types";

interface StemMixerProps {
  stems: SongStem[];
  isPlaying: boolean;
  currentTime: number;
  onUpdateStem: (stemId: string, updates: Partial<Pick<SongStem, 'is_muted' | 'volume'>>) => void;
  onDeleteStem: (stemId: string) => void;
  onUploadStem: (file: File, stemType: StemType) => void;
  isUploading: boolean;
  uploadProgress: number;
}

export function StemMixer({
  stems,
  isPlaying,
  currentTime,
  onUpdateStem,
  onDeleteStem,
  onUploadStem,
  isUploading,
  uploadProgress,
}: StemMixerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedType, setSelectedType] = useState<StemType>("other");
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync all audio elements with main player
  useEffect(() => {
    audioRefs.current.forEach((audio, stemId) => {
      const stem = stems.find(s => s.id === stemId);
      if (!stem) return;

      // Sync time if drifted more than 0.1s
      if (Math.abs(audio.currentTime - currentTime) > 0.1) {
        audio.currentTime = currentTime;
      }

      // Sync play state
      if (isPlaying && audio.paused && !stem.is_muted) {
        audio.play().catch(() => {});
      } else if (!isPlaying && !audio.paused) {
        audio.pause();
      }

      // Apply mute state
      audio.muted = stem.is_muted;
      audio.volume = stem.volume;
    });
  }, [isPlaying, currentTime, stems]);

  // Register audio refs
  const registerAudio = (stemId: string, audio: HTMLAudioElement | null) => {
    if (audio) {
      audioRefs.current.set(stemId, audio);
    } else {
      audioRefs.current.delete(stemId);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadStem(file, selectedType);
      e.target.value = "";
    }
  };

  const getStemColor = (stemType: StemType) => {
    return STEM_TYPES.find(t => t.value === stemType)?.color || "#6b7280";
  };

  // Always show the button - removed early return

  return (
    <div className="relative">
      {/* Hidden audio elements for each stem */}
      {stems.map(stem => (
        <audio
          key={stem.id}
          ref={(el) => registerAudio(stem.id, el)}
          src={stem.file_url}
          preload="metadata"
        />
      ))}

      {/* Collapse toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-xs font-medium"
      >
        <span>Stems ({stems.length})</span>
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
              {/* Stem list */}
              {stems.map(stem => (
                <div 
                  key={stem.id}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  {/* Type indicator */}
                  <div 
                    className="w-2 h-8 rounded-full"
                    style={{ backgroundColor: getStemColor(stem.stem_type) }}
                  />

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white/80 truncate">
                      {stem.label || STEM_TYPES.find(t => t.value === stem.stem_type)?.label}
                    </div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">
                      {stem.stem_type}
                    </div>
                  </div>

                  {/* Volume slider */}
                  <div className="flex items-center gap-2 w-24">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stem.is_muted ? 0 : Math.round(stem.volume * 100)}
                      onChange={(e) => onUpdateStem(stem.id, { 
                        volume: Number(e.target.value) / 100,
                        is_muted: Number(e.target.value) === 0
                      })}
                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${getStemColor(stem.stem_type)} ${stem.is_muted ? 0 : stem.volume * 100}%, rgba(255,255,255,0.1) 0%)`
                      }}
                    />
                  </div>

                  {/* Mute toggle */}
                  <button
                    onClick={() => onUpdateStem(stem.id, { is_muted: !stem.is_muted })}
                    className={`p-2 rounded-lg transition-all ${
                      stem.is_muted 
                        ? "bg-red-500/20 text-red-400" 
                        : "bg-white/5 text-white/40 hover:text-white"
                    }`}
                  >
                    {stem.is_muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteStem(stem.id)}
                    className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Upload new stem */}
              <div className="pt-2 border-t border-white/5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as StemType)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 focus:outline-none focus:border-white/20"
                  >
                    {STEM_TYPES.map(type => (
                      <option key={type.value} value={type.value} className="bg-[#0a0a0a]">
                        {type.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? `Uploading ${uploadProgress}%` : "Add Stem"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
