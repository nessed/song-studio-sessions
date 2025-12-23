import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, X } from "lucide-react";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface TimelineNote {
  timestamp_seconds: number;
  body: string;
}

interface LoopRegion {
  start: number;
  end: number;
}

interface AudioPlayerProps {
  src: string;
  onTimeUpdate?: (time: number) => void;
  notesComponent?: React.ReactNode;
  timelineNotes?: TimelineNote[];
  onRequestAddNote?: (time: number) => void;
}

export function AudioPlayer({ src, onTimeUpdate, notesComponent, timelineNotes = [], onRequestAddNote }: AudioPlayerProps) {
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
  
  // Loop region state
  const [loopRegion, setLoopRegion] = useState<LoopRegion | null>(null);
  const [isLoopRegionActive, setIsLoopRegionActive] = useState(false);
  const [isDraggingLoop, setIsDraggingLoop] = useState(false);
  const [loopDragStart, setLoopDragStart] = useState<number | null>(null);
  
  const { peaks } = useAudioAnalyzer(src);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const updateUI = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentTime = audio.currentTime;
    const dur = audio.duration || 1;
    const pct = (currentTime / dur) * 100;

    if (progressBarRef.current) {
      const rightChop = 100 - pct;
      progressBarRef.current.style.clipPath = `inset(0 ${rightChop}% 0 0)`;
    }
    if (timeDisplayRef.current) {
      timeDisplayRef.current.innerText = formatTime(currentTime);
    }

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
      audioRef.current.loop = isLooping && !loopRegion; // Disable native loop if region is active
      audioRef.current.volume = volume;
    }
  }, [isLooping, volume, loopRegion]);

  // Loop region enforcement - check on time update
  useEffect(() => {
    if (!loopRegion || !isLoopRegionActive || !isPlaying) return;
    
    const audio = audioRef.current;
    if (!audio) return;

    const checkLoop = () => {
      if (audio.currentTime >= loopRegion.end) {
        audio.currentTime = loopRegion.start;
      }
    };

    const interval = setInterval(checkLoop, 50); // Check every 50ms
    return () => clearInterval(interval);
  }, [loopRegion, isLoopRegionActive, isPlaying]);

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
    
    if (progressBarRef.current) {
       const rightChop = 100 - (pct * 100);
       progressBarRef.current.style.clipPath = `inset(0 ${rightChop}% 0 0)`;
    }
    if (timeDisplayRef.current) timeDisplayRef.current.innerText = formatTime(audio.currentTime);
  };

  const handleWaveformDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !duration || !onRequestAddNote) return;
    
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const time = pct * duration;
    
    onRequestAddNote(time);
  };

  const handleVolumeChange = (next: number) => {
    const vol = Math.max(0, Math.min(1, next));
    setVolume(vol);
    localStorage.setItem("studio-volume", vol.toString());
  };

  // Loop region handlers
  const handleLoopDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.shiftKey || !duration) return;
    e.preventDefault();
    
    const track = trackRef.current;
    if (!track) return;
    
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const time = pct * duration;
    
    setIsDraggingLoop(true);
    setLoopDragStart(time);
  };

  const handleLoopDragMove = useCallback((e: MouseEvent) => {
    if (!isDraggingLoop || loopDragStart === null || !duration) return;
    
    const track = trackRef.current;
    if (!track) return;
    
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const time = pct * duration;
    
    const start = Math.min(loopDragStart, time);
    const end = Math.max(loopDragStart, time);
    
    if (end - start > 0.5) { // Min 0.5s loop
      setLoopRegion({ start, end });
      setIsLoopRegionActive(true);
    }
  }, [isDraggingLoop, loopDragStart, duration]);

  const handleLoopDragEnd = useCallback(() => {
    setIsDraggingLoop(false);
  }, []);

  // Global mouse listeners for loop drag
  useEffect(() => {
    if (isDraggingLoop) {
      window.addEventListener("mousemove", handleLoopDragMove);
      window.addEventListener("mouseup", handleLoopDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleLoopDragMove);
      window.removeEventListener("mouseup", handleLoopDragEnd);
    };
  }, [isDraggingLoop, handleLoopDragMove, handleLoopDragEnd]);

  const clearLoopRegion = () => {
    setLoopRegion(null);
    setIsLoopRegionActive(false);
    setLoopDragStart(null);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-6 flex justify-center">
      {/* Outer ambient glow */}
      <div 
        className="absolute inset-x-12 -bottom-4 h-32 opacity-50 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 100%, var(--accent-subtle, rgba(124,58,237,0.2)) 0%, transparent 70%)' }}
      />
      
      <div className="relative h-[88px] w-full max-w-5xl rounded-[28px] overflow-hidden group/player shadow-2xl shadow-black/50">
        {/* Glass background */}
        <div className="absolute inset-0 bg-[#08080a]/90 backdrop-blur-3xl" />
        
        {/* Top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Theme-tinted glow from left */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{ background: 'radial-gradient(ellipse 40% 100% at 0% 50%, var(--accent-subtle, rgba(124,58,237,0.15)) 0%, transparent 60%)' }}
        />
        
        {/* Chromatic border */}
        <div className="absolute inset-0 rounded-[28px] pointer-events-none border border-white/[0.08]" />
        
        {/* Content */}
        <div className="relative h-full flex items-center px-5 gap-5">
          <audio ref={audioRef} src={src} preload="metadata" />

          {/* Play/Pause Button - Premium */}
          <button
            onClick={togglePlay}
            className="relative h-14 w-14 min-w-[3.5rem] rounded-2xl flex items-center justify-center transition-all active:scale-95 z-10 group/play"
          >
            {/* Glow behind button */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-50 blur-xl transition-opacity group-hover/play:opacity-80"
              style={{ background: isPlaying ? 'var(--accent-main, #fff)' : 'rgba(255,255,255,0.3)' }}
            />
            
            {/* Button face */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-white to-white/90 shadow-lg" />
            
            {/* Icon */}
            <div className="relative text-black">
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
            </div>
          </button>

          {/* Time & Waveform */}
          <div className="flex-1 flex flex-col justify-center gap-1.5">
            {/* Time display row */}
            <div className="flex items-center justify-between text-[10px] font-medium uppercase px-0.5">
               <div ref={timeDisplayRef} className="tabular-nums text-white/60 font-mono tracking-wide">0:00</div>
               <div className="text-white/25 font-mono tabular-nums tracking-wide">{formatTime(duration)}</div>
            </div>

            {/* Waveform track */}
            <div
              ref={trackRef}
              onClick={handleSeek}
              onMouseDown={handleLoopDragStart}
              onDoubleClick={handleWaveformDoubleClick}
              className={`h-11 w-full relative group cursor-pointer rounded-xl overflow-hidden ${isDraggingLoop ? 'cursor-ew-resize' : ''}`}
              title="Double-click to add note • Shift+Drag to set loop region"
            >
              {/* Track background */}
              <div className="absolute inset-0 bg-white/[0.03] rounded-xl" />
              
              {/* Background waveform */}
              <div className="absolute inset-0 text-white/20 group-hover:text-white/30 transition-colors">
                 <WaveformVisualizer peaks={peaks} color="currentColor" />
              </div>

              {/* Progress waveform with theme color */}
              <div 
                ref={progressBarRef}
                className="absolute inset-0 pointer-events-none will-change-[clip-path]"
                style={{ clipPath: "inset(0 100% 0 0)" }}
              >
                {/* Main colored waveform */}
                <div style={{ color: 'var(--accent-main, #a78bfa)' }}>
                  <WaveformVisualizer peaks={peaks} color="currentColor" />
                </div>
                {/* Glow layer */}
                <div 
                  className="absolute inset-0 blur-[3px] opacity-60"
                  style={{ color: 'var(--accent-main, #a78bfa)' }}
                >
                  <WaveformVisualizer peaks={peaks} color="currentColor" />
                </div>
              </div>

              {/* Loop Region Overlay */}
              {loopRegion && duration > 0 && (
                <div 
                  className="absolute top-0 bottom-0 bg-amber-500/20 border-l-2 border-r-2 border-amber-400/60 z-10 pointer-events-none"
                  style={{
                    left: `${(loopRegion.start / duration) * 100}%`,
                    width: `${((loopRegion.end - loopRegion.start) / duration) * 100}%`,
                  }}
                >
                  {/* Loop region labels */}
                  <div className="absolute -top-5 left-0 text-[8px] font-mono text-amber-400 bg-[#08080a]/90 px-1 rounded">
                    {formatTime(loopRegion.start)}
                  </div>
                  <div className="absolute -top-5 right-0 text-[8px] font-mono text-amber-400 bg-[#08080a]/90 px-1 rounded">
                    {formatTime(loopRegion.end)}
                  </div>
                </div>
              )}

              {/* Note markers */}
              {timelineNotes.map((note, idx) => {
                const pct = duration ? (note.timestamp_seconds / duration) * 100 : 0;
                return (
                  <div
                    key={`${note.timestamp_seconds}-${idx}`}
                    className="absolute bottom-0 top-0 w-0.5 bg-emerald-400/70 hover:bg-emerald-300 hover:w-1 transition-all z-20 group/marker cursor-pointer"
                    style={{ left: `${pct}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const audio = document.querySelector("audio");
                      if (audio) {
                        audio.currentTime = note.timestamp_seconds;
                        audio.play();
                      }
                    }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#08080a] opacity-0 group-hover/marker:opacity-100 transition-opacity" />
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-2 rounded-xl bg-[#0c0c0f]/95 backdrop-blur-xl border border-white/10 text-xs text-white whitespace-nowrap opacity-0 group-hover/marker:opacity-100 pointer-events-none transition-opacity shadow-2xl max-w-[200px]">
                      <div className="text-[9px] font-mono text-emerald-400 mb-0.5">{formatTime(note.timestamp_seconds)}</div>
                      <div className="text-white/80 truncate">{note.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Soft divider */}
          <div className="h-9 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          {/* Right controls */}
          <div className="flex items-center gap-2.5">
            {/* Volume */}
            <div className="flex items-center gap-2 group/volume px-1">
               <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden relative">
                 <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(volume * 100)}
                  onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="h-full rounded-full transition-all" 
                  style={{ 
                    width: `${volume * 100}%`,
                    background: 'var(--accent-main, #a78bfa)'
                  }}
                />
               </div>
            </div>
            
            {/* Loop */}
            <button
              onClick={() => setIsLooping((l) => !l)}
              className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all ${
                isLooping 
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400" 
                : "border-white/10 text-white/35 hover:text-white/60 hover:border-white/20"
              }`}
            >
              Loop
            </button>
            
            {/* Clear Loop Region - shown when a loop region exists */}
            {loopRegion && (
              <button
                onClick={clearLoopRegion}
                className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
                title="Clear loop region"
              >
                <X className="w-3 h-3" />
                <span className="hidden sm:inline">Region</span>
              </button>
            )}
            
            {/* Notes */}
            {notesComponent && (
              <div className="relative">
                {notesComponent}
              </div>
            )}
            
            {/* Add note */}
            <button
              onClick={() => {
                  const audio = audioRef.current;
                  if (audio) onRequestAddNote?.(audio.currentTime);
              }}
              className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-white/40 flex items-center justify-center hover:bg-emerald-500/15 hover:border-emerald-500/30 hover:text-emerald-400 transition-all"
              title="Add note at current time"
            >
              <span className="text-base leading-none">+</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
