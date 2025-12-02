import { useState, useRef, useEffect } from "react";
import { Play, Pause, RefreshCw, Volume2, VolumeX, ChevronUp, ChevronDown } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  onTimeUpdate?: (time: number) => void;
  noteTray?: React.ReactNode;
}

export function AudioPlayer({ src, onTimeUpdate, noteTray }: AudioPlayerProps) {
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

  const handleMouseLeave = () => {
    setHoverPosition(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50">
      {/* Note Tray */}
      {noteTray && (
        <div
          className={`absolute bottom-full left-0 w-full overflow-hidden transition-all duration-500 ease-out ${
            showNoteTray ? "max-h-80 opacity-100 mb-3" : "max-h-0 opacity-0 mb-0"
          }`}
        >
          <div className="bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            <div className="p-4 max-h-64 overflow-y-auto">
              {noteTray}
            </div>
          </div>
        </div>
      )}

      {/* Main Player - Ultra Glass */}
      <div className="relative h-20 rounded-full overflow-hidden shadow-2xl shadow-black/50">
        {/* Glass layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-white/[0.02]" />
        <div className="absolute inset-0 bg-[#0a0a0c]/70 backdrop-blur-3xl" />
        <div className="absolute inset-0 border border-white/[0.1] rounded-full" />
        <div className="absolute inset-[1px] border border-white/[0.05] rounded-full" />
        
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />
        
        {/* Content */}
        <div className="relative h-full px-6 flex items-center gap-5">
          <audio ref={audioRef} src={src} preload="metadata" />

          {/* Play/Pause - Glowing button */}
          <button
            onClick={togglePlay}
            className="relative h-12 w-12 flex-shrink-0 group"
          >
            <div className="absolute inset-0 bg-white rounded-full opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-full w-full flex items-center justify-center">
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black" />
              ) : (
                <Play className="w-5 h-5 text-black ml-0.5" />
              )}
            </div>
          </button>

          {/* Time - Current */}
          <span className="text-xs font-mono text-white/50 w-10 flex-shrink-0 tabular-nums">
            {formatTime(currentTime)}
          </span>

          {/* Progress Track */}
          <div
            ref={progressRef}
            className="flex-1 h-14 cursor-pointer group flex items-center relative"
            onClick={handleSeek}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Track background */}
            <div className="absolute w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
              {/* Subtle shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
            </div>
            
            {/* Active Progress with glow */}
            <div
              className="absolute h-[3px] bg-white rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            >
              {/* Progress glow */}
              <div className="absolute inset-0 blur-sm bg-white/50" />
            </div>

            {/* Playhead dot */}
            <div
              className="absolute h-3 w-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-75 opacity-0 group-hover:opacity-100"
              style={{ left: `${progress}%`, transform: "translateX(-50%)" }}
            />

            {/* Ghost Hover Line */}
            {hoverPosition !== null && (
              <div
                className="absolute h-6 w-[2px] bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                style={{ left: `${hoverPosition}%`, transform: "translateX(-50%)" }}
              />
            )}
          </div>

          {/* Duration */}
          <span className="text-xs font-mono text-white/50 w-10 flex-shrink-0 tabular-nums">
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
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div 
              className="relative"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-full transition-all"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              
              {/* Volume slider popup */}
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 transition-all duration-200 ${
                showVolume ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              }`}>
                <div className="bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-xl">
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
              </div>
            </div>

            {/* Expand Note Tray */}
            {noteTray && (
              <button
                onClick={() => setShowNoteTray(!showNoteTray)}
                className={`p-2.5 rounded-full transition-all ${
                  showNoteTray 
                    ? "text-white bg-white/10" 
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                {showNoteTray ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}