import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Volume2, VolumeX, ChevronUp, ChevronDown, Upload } from "lucide-react";

interface GlassAudioPlayerProps {
  src: string | null;
  onTimeUpdate?: (time: number) => void;
  noteTray?: React.ReactNode;
  accentColor?: string;
  onUploadClick?: () => void;
}

// Custom thin-stroke SVG icons
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-0.5">
    <path d="M8 5.14v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

export function GlassAudioPlayer({ 
  src, 
  onTimeUpdate, 
  noteTray,
  accentColor = "99, 102, 241", // Indigo default
  onUploadClick,
}: GlassAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [showNoteTray, setShowNoteTray] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };
    const handleEnded = () => {
      if (!isLooping) setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate, isLooping]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progress = progressRef.current;
    if (!audio || !progress || !duration) return;

    const rect = progress.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = percentage * duration;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const progress = progressRef.current;
    if (!progress) return;

    const rect = progress.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setHoverPosition(percentage);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // Generate dummy waveform bars
  const waveformBars = Array.from({ length: 48 }, (_, i) => ({
    height: 20 + Math.sin(i * 0.5) * 15 + Math.random() * 20,
    delay: i * 0.02,
  }));

  // No audio state
  if (!src) {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50">
        <div className="relative h-20 rounded-full overflow-visible">
          <div className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-3xl rounded-full border border-white/[0.08]" />
          <div className="relative h-full px-6 flex items-center justify-center">
            <button
              onClick={onUploadClick}
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-dashed border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm">Upload your first mix</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50">
      {/* Note Tray */}
      {noteTray && (
        <AnimatePresence>
          {showNoteTray && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="mb-3"
            >
              <div className="relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[#0a0a0c]/95 backdrop-blur-2xl" />
                <div className="absolute inset-0 border border-white/[0.08] rounded-2xl" />
                <div className="relative p-4 max-h-64 overflow-y-auto">
                  {noteTray}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Main Player - Premium Glass Capsule */}
      <div className="relative h-20 rounded-full overflow-visible group">
        {/* Bioluminescent glow shadow */}
        <div 
          className="absolute -inset-2 rounded-full blur-2xl opacity-30 transition-opacity duration-500 group-hover:opacity-50"
          style={{ background: `radial-gradient(ellipse at center, rgba(${accentColor}, 0.4) 0%, transparent 70%)` }}
        />

        {/* Glass layers */}
        <div className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent rounded-full" />
        <div className="absolute inset-0 border border-white/[0.08] rounded-full" />
        <div className="absolute inset-[1px] border border-white/[0.03] rounded-full" />
        
        {/* Inner reflection */}
        <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]" />
        
        {/* Content */}
        <div className="relative h-full px-6 flex items-center gap-5">
          <audio ref={audioRef} src={src} preload="metadata" />

          {/* Play/Pause - Floating button with glow */}
          <button
            onClick={togglePlay}
            className="relative h-14 w-14 flex-shrink-0 group/btn"
          >
            {/* Button glow */}
            <div 
              className="absolute inset-0 rounded-full blur-lg opacity-40 transition-opacity group-hover/btn:opacity-60"
              style={{ background: `rgba(${accentColor}, 0.5)` }}
            />
            <div className="absolute inset-0 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
            <div className="relative h-full w-full flex items-center justify-center text-black">
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </div>
          </button>

          {/* Time - Current */}
          <span className="text-xs font-mono text-white/40 w-10 flex-shrink-0 tabular-nums">
            {formatTime(currentTime)}
          </span>

          {/* Waveform Progress Track */}
          <div
            ref={progressRef}
            className="flex-1 h-12 cursor-pointer flex items-end justify-center gap-[2px] relative"
            onClick={handleSeek}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverPosition(null)}
          >
            {waveformBars.map((bar, i) => {
              const barProgress = (i / waveformBars.length) * 100;
              const isPlayed = barProgress <= progress;
              const isHovered = hoverPosition !== null && barProgress <= hoverPosition;
              
              return (
                <motion.div
                  key={i}
                  className="w-[2px] rounded-full transition-all duration-75"
                  style={{
                    height: `${bar.height}%`,
                    background: isPlayed 
                      ? `rgba(${accentColor}, 0.9)` 
                      : isHovered 
                        ? "rgba(255,255,255,0.4)" 
                        : "rgba(255,255,255,0.15)",
                    boxShadow: isPlayed ? `0 0 6px rgba(${accentColor}, 0.5)` : "none",
                  }}
                  animate={isPlaying && isPlayed ? {
                    scaleY: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    duration: 0.4,
                    delay: bar.delay,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              );
            })}

            {/* Playhead glow */}
            <div
              className="absolute top-0 bottom-0 w-[3px] rounded-full transition-all duration-75"
              style={{
                left: `${progress}%`,
                transform: "translateX(-50%)",
                background: `rgba(${accentColor}, 1)`,
                boxShadow: `0 0 12px rgba(${accentColor}, 0.8), 0 0 24px rgba(${accentColor}, 0.4)`,
              }}
            />
          </div>

          {/* Duration */}
          <span className="text-xs font-mono text-white/40 w-10 flex-shrink-0 tabular-nums">
            {formatTime(duration)}
          </span>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Loop */}
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2.5 rounded-full transition-all ${
                isLooping 
                  ? "text-emerald-400 bg-emerald-400/10" 
                  : "text-white/30 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
            </button>

            {/* Volume */}
            <div 
              className="relative"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-full transition-all"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Volume2 className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>
              
              {/* Volume slider popup */}
              <AnimatePresence>
                {showVolume && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2"
                  >
                    <div className="bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-xl">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-20 h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Expand Note Tray */}
            {noteTray && (
              <button
                onClick={() => setShowNoteTray(!showNoteTray)}
                className={`p-2.5 rounded-full transition-all ${
                  showNoteTray 
                    ? "text-white bg-white/10" 
                    : "text-white/30 hover:text-white/60 hover:bg-white/5"
                }`}
              >
                {showNoteTray ? (
                  <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}