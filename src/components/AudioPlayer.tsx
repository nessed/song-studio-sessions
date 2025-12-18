import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface TimelineNote {
  timestamp_seconds: number;
  body: string;
}

interface AudioPlayerProps {
  src: string;
  onTimeUpdate?: (time: number) => void;
  noteTray?: React.ReactNode;
  timelineNotes?: TimelineNote[];
  onRequestAddNote?: (time: number) => void;
}

export function AudioPlayer({ src, onTimeUpdate, noteTray, timelineNotes = [], onRequestAddNote }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const timeDisplayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState(() => {
    if (typeof window === "undefined") return 1;
    const saved = localStorage.getItem("studio-volume");
    return saved ? parseFloat(saved) : 1;
  });
  
  // Audio Analysis
  const { peaks } = useAudioAnalyzer(src);

  // Helper to format time strings efficiently
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const updateUI = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentTime = audio.currentTime;
    const duration = audio.duration || 1; // Avoid divide by zero
    const pct = (currentTime / duration) * 100;

    // Direct DOM manipulation avoiding React render cycle
    if (progressBarRef.current) {
      // Use clip-path to reveal the waveform without squashing it
      // inset(top right bottom left) -> we chop from the right
      const rightChop = 100 - pct;
      progressBarRef.current.style.clipPath = `inset(0 ${rightChop}% 0 0)`;
    }
    if (timeDisplayRef.current) {
      timeDisplayRef.current.innerText = formatTime(currentTime);
    }

    // Call external handler (parent might still re-render, but we don't)
    onTimeUpdate?.(currentTime);

    rafRef.current = requestAnimationFrame(updateUI);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onTimeUpdate]);

  useEffect(() => {
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(updateUI);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, updateUI]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isLooping]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
      audioRef.current.volume = volume;
    }
  }, [isLooping, volume]);

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
    const track = trackRef.current;
    if (!audio || !track || !duration) return;
    
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    
    audio.currentTime = pct * duration;
    
    // Immediate UI update
    if (progressBarRef.current) {
       const rightChop = 100 - (pct * 100);
       progressBarRef.current.style.clipPath = `inset(0 ${rightChop}% 0 0)`;
    }
    if (timeDisplayRef.current) timeDisplayRef.current.innerText = formatTime(audio.currentTime);
  };

  const handleVolumeChange = (next: number) => {
    const vol = Math.max(0, Math.min(1, next));
    setVolume(vol);
    localStorage.setItem("studio-volume", vol.toString());
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full px-6 flex justify-center">
      <div className="relative h-20 w-full max-w-5xl rounded-2xl bg-[#09090b]/60 backdrop-blur-3xl border border-white/5 shadow-2xl flex items-center px-6 gap-6 transition-all hover:bg-[#09090b]/80 group/player">
        <audio ref={audioRef} src={src} preload="metadata" />

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="h-12 w-12 min-w-[3rem] rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] transition-all active:scale-95 z-10"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
        </button>

        {/* Time & Waveform */}
        <div className="flex-1 flex flex-col justify-center gap-1">
          {/* Top Row: Time & Info */}
          <div className="flex items-center justify-between text-[10px] font-medium tracking-wide text-white/40 uppercase px-1">
             <div ref={timeDisplayRef} className="tabular-nums">0:00</div>
             <div className="opacity-0 group-hover/player:opacity-100 transition-opacity">Visualizer Active</div>
          </div>

          <div
            ref={trackRef}
            onClick={handleSeek}
            className="h-10 w-full relative group cursor-pointer"
          >
            {/* Layer 1: Background Waveform */}
            <div className="absolute inset-0 opacity-100 text-white/40 group-hover:text-white/50 transition-colors">
               <WaveformVisualizer peaks={peaks} color="currentColor" />
            </div>

            {/* Layer 2: Foreground Waveform (Clipped) */}
            <div 
              ref={progressBarRef}
              className="absolute inset-0 pointer-events-none text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] will-change-[clip-path]"
              style={{ clipPath: "inset(0 100% 0 0)" }}
            >
               <WaveformVisualizer peaks={peaks} color="currentColor" />
            </div>

            {/* Timeline Notes Markers */}
            {timelineNotes.map((note, idx) => {
              const pct = duration ? (note.timestamp_seconds / duration) * 100 : 0;
              return (
                <div
                  key={`${note.timestamp_seconds}-${idx}`}
                  className="absolute bottom-0 top-0 w-[2px] bg-emerald-400/80 hover:bg-emerald-300 transition-colors z-20 group/marker"
                  style={{ left: `${pct}%` }}
                >
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/90 border border-white/10 text-[10px] text-white whitespace-nowrap opacity-0 group-hover/marker:opacity-100 pointer-events-none transition-opacity">
                    {note.body}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4 pl-4 border-l border-white/5">
          <div className="flex items-center gap-2 group/volume">
             <div className="h-1 w-20 bg-white/10 rounded-full overflow-hidden relative">
               <input
                type="range"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className="h-full bg-white transition-all group-hover/volume:bg-emerald-400" 
                style={{ width: `${volume * 100}%` }}
              />
             </div>
          </div>
          
          <button
            onClick={() => setIsLooping((l) => !l)}
            className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
              isLooping 
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.1)]" 
              : "border-white/5 text-white/40 hover:text-white hover:border-white/20"
            }`}
          >
            Loop
          </button>
          
          <button
            onClick={() => {
                const audio = audioRef.current;
                if (audio) onRequestAddNote?.(audio.currentTime);
            }}
            className="h-9 w-9 rounded-full border border-white/10 bg-white/5 text-white/60 flex items-center justify-center hover:bg-white/10 hover:text-white hover:scale-105 transition-all"
            title="Add note at current time"
          >
            <span className="text-lg leading-none mb-0.5">+</span>
          </button>
        </div>

        {noteTray && (
          <div className="absolute bottom-full left-0 w-full pb-4 px-4 pointer-events-none">
            <div className="pointer-events-auto">
               {noteTray}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
