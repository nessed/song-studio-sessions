import { useEffect, useMemo, useRef, useState } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import { Play, Pause, RefreshCcw } from "lucide-react";
import type WaveSurfer from "wavesurfer.js";
import type { SongNote } from "@/lib/types";

interface WaveformPlayerProps {
  url: string;
  notes?: SongNote[];
  height?: number;
  onTimeUpdate?: (time: number) => void;
  onInstance?: (instance: WaveSurfer | null) => void;
}

export function WaveformPlayer({
  url,
  notes = [],
  height = 100,
  onTimeUpdate,
  onInstance,
}: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [displayTime, setDisplayTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loop, setLoop] = useState(false);
  const lastSecondRef = useRef(0);

  const options = useMemo(
    () => ({
      container: containerRef,
      url,
      waveColor: "hsl(var(--muted-foreground))",
      progressColor: "hsl(var(--primary))",
      height,
      barWidth: 2,
      barGap: 3,
      barRadius: 2,
    }),
    [url, height]
  );

  const { wavesurfer, isReady, isPlaying, currentTime } = useWavesurfer(options);

  useEffect(() => {
    if (!wavesurfer) return;

    onInstance?.(wavesurfer);

    const handleReady = () => {
      setDuration(wavesurfer.getDuration() || 0);
    };

    const handleTime = (time: number) => {
      onTimeUpdate?.(time);
      const wholeSecond = Math.floor(time);
      if (wholeSecond !== lastSecondRef.current) {
        lastSecondRef.current = wholeSecond;
        setDisplayTime(time);
      }
    };

    wavesurfer.on("ready", handleReady);
    wavesurfer.on("timeupdate", handleTime);
    wavesurfer.on("interaction", handleTime);

    return () => {
      wavesurfer.un("ready", handleReady);
      wavesurfer.un("timeupdate", handleTime);
      wavesurfer.un("interaction", handleTime);
      onInstance?.(null);
    };
  }, [wavesurfer, onTimeUpdate, onInstance]);

  useEffect(() => {
    if (!wavesurfer) return;
    wavesurfer.setOptions({ loop });
  }, [loop, wavesurfer]);

  const togglePlay = () => {
    wavesurfer?.playPause();
  };

  const toggleLoop = () => setLoop((prev) => !prev);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!url) {
    return (
      <div className="glass-panel-subtle p-6 rounded-xl border border-border/50">
        <p className="text-sm text-muted-foreground">No audio uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel-subtle p-6 rounded-xl border border-border/50">
      <div className="relative">
        <div ref={containerRef} className="w-full h-24" />
        {notes.length > 0 && duration > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {notes.map((note) => (
              <span
                key={note.id}
                style={{ left: `${(note.timestamp_seconds / duration) * 100}%` }}
                className="absolute top-0 h-full w-[2px] bg-primary/60"
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={togglePlay}
          disabled={!isReady}
          className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleLoop}
          className={`h-10 w-10 rounded-full flex items-center justify-center border border-border/50 transition-colors ${
            loop ? "bg-primary/10 text-primary" : "text-muted-foreground"
          }`}
          title="Toggle loop"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>

        <div className="ml-auto text-sm font-mono text-muted-foreground">
          {formatTime(displayTime)} / {formatTime(duration || currentTime || 0)}
        </div>
      </div>
    </div>
  );
}
