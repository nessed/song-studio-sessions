import { useState, useRef, useEffect } from "react";
import { Play, Pause, RefreshCw, Volume2, ChevronUp, ChevronDown } from "lucide-react";

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
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [showNoteTray, setShowNoteTray] = useState(false);

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

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // Expose seekTo for timeline notes
  useEffect(() => {
    if (audioRef.current) {
      (audioRef.current as HTMLAudioElement & { seekTo: typeof seekTo }).seekTo = seekTo;
    }
  }, []);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-50">
      {/* Note Tray */}
      {noteTray && (
        <div
          className={`absolute bottom-full left-0 w-full bg-[#09090b]/95 backdrop-blur-xl border border-white/10 rounded-t-3xl overflow-hidden transition-all duration-300 ${
            showNoteTray ? "max-h-80 p-4 mb-2" : "max-h-0 p-0"
          }`}
        >
          <div className="overflow-y-auto max-h-64">
            {noteTray}
          </div>
        </div>
      )}

      {/* Main Player */}
      <div className="h-20 bg-[#09090b]/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl px-6 flex items-center gap-6">
        <audio ref={audioRef} src={src} preload="metadata" />

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="h-12 w-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        {/* Time */}
        <span className="text-xs font-mono text-white/60 w-10 flex-shrink-0">
          {formatTime(currentTime)}
        </span>

        {/* Progress Track */}
        <div
          ref={progressRef}
          className="flex-1 h-12 cursor-pointer group flex items-center relative"
          onClick={handleSeek}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background Line */}
          <div className="absolute w-full h-[2px] bg-white/10 rounded-full" />
          
          {/* Active Progress */}
          <div
            className="absolute h-[2px] bg-white/90 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />

          {/* Ghost Hover Line */}
          {hoverPosition !== null && (
            <div
              className="absolute h-4 w-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${hoverPosition}%`, transform: "translateX(-50%)" }}
            />
          )}
        </div>

        {/* Duration */}
        <span className="text-xs font-mono text-white/60 w-10 flex-shrink-0">
          {formatTime(duration)}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Loop */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-full transition-colors ${
              isLooping ? "text-emerald-400" : "text-white/40 hover:text-white/80"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Volume */}
          <button className="p-2 text-white/40 hover:text-white/80 rounded-full transition-colors">
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Expand Note Tray */}
          {noteTray && (
            <button
              onClick={() => setShowNoteTray(!showNoteTray)}
              className={`p-2 rounded-full transition-colors ${
                showNoteTray ? "text-white" : "text-white/40 hover:text-white/80"
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
  );
}
