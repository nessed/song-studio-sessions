import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };
    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
      }
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
  };

  const handleVolumeChange = (next: number) => {
    const vol = Math.max(0, Math.min(1, next));
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const waveformBars = Array.from({ length: 40 }, (_, i) => 6 + ((i * 13) % 18));

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full px-6">
      <div className="relative h-24 w-full max-w-6xl mx-auto rounded-full bg-[#050505]/90 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center px-8 gap-6">
        <audio ref={audioRef} src={src} preload="metadata" />

        <button
          onClick={togglePlay}
          className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg shadow-white/20"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <div
          ref={trackRef}
          onClick={handleSeek}
          className="flex-1 h-14 flex items-end justify-center gap-1 cursor-pointer relative"
        >
          {waveformBars.map((h, idx) => {
            const played = idx / waveformBars.length <= progress / 100;
            return (
              <div
                key={idx}
                className="w-[4px] rounded-full transition-colors"
                style={{
                  height: `${h + 20}px`,
                  backgroundColor: played ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)",
                }}
              />
            );
          })}
          {timelineNotes.map((note, idx) => {
            const pct = duration ? (note.timestamp_seconds / duration) * 100 : 0;
            return (
              <div
                key={`${note.timestamp_seconds}-${idx}`}
                className="absolute bottom-0 h-3 w-[3px] rounded-full bg-emerald-300/90"
                style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
                title={note.body}
              />
            );
          })}
        </div>

        <div className="text-xs font-mono text-white/50 w-16 text-right tabular-nums">
          {Math.floor(currentTime / 60)
            .toString()
            .padStart(1, "0")}
          :
          {Math.floor(currentTime % 60)
            .toString()
            .padStart(2, "0")}
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
          className="w-24 accent-white"
        />
        <button
          onClick={() => setIsLooping((l) => !l)}
          className={`text-xs font-mono px-3 py-1 rounded-full border ${isLooping ? "border-emerald-400 text-emerald-300" : "border-white/10 text-white/60"}`}
        >
          Loop
        </button>
        <button
          onClick={() => onRequestAddNote?.(currentTime)}
          className="h-8 w-8 rounded-full border border-white/20 text-white/80 flex items-center justify-center hover:border-white/40"
          title="Add note at current time"
        >
          +
        </button>
      </div>

      {noteTray && (
        <div className="absolute bottom-full left-0 w-full pb-3">
          {noteTray}
        </div>
      )}
    </div>
  );
}
