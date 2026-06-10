import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { SongNote } from "@/lib/types";

const FALLBACK_DUR = 210;

export type PlayerSong = { id: string; title: string; cover_art_url?: string | null };

interface PlayerCtx {
  song: PlayerSong | null;
  subtitle: string;
  audioUrl: string | null;
  wave: number[];
  notes: SongNote[];
  playing: boolean;
  time: number;
  duration: number;
  deckVisible: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  addNoteRef: React.MutableRefObject<(() => void) | null>;
  loadSong: (
    song: PlayerSong,
    audioUrl: string | null,
    wave: number[],
    notes: SongNote[],
    subtitle: string,
    autoPlay?: boolean,
  ) => void;
  setNotes: (notes: SongNote[]) => void;
  togglePlay: () => void;
  seek: (t: number) => void;
  setDeckVisible: (v: boolean) => void;
}

const Ctx = createContext<PlayerCtx | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [song, setSong] = useState<PlayerSong | null>(null);
  const [subtitle, setSubtitle] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [wave, setWave] = useState<number[]>([]);
  const [notes, setNotes] = useState<SongNote[]>([]);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(FALLBACK_DUR);
  const [deckVisible, setDeckVisible] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const addNoteRef = useRef<(() => void) | null>(null);
  const rafRef = useRef<number>();
  const lastTick = useRef(0);
  const pendingPlayRef = useRef(false);

  // sync audio element src whenever audioUrl changes, reset transport
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    setPlaying(false);
    setTime(0);
    setDuration(FALLBACK_DUR);
    const willAutoPlay = pendingPlayRef.current;
    pendingPlayRef.current = false;
    if (audioUrl) {
      el.src = audioUrl;
      el.load();
      if (willAutoPlay) {
        const tryPlay = () => {
          el.play().then(() => setPlaying(true)).catch(() => {});
        };
        if (el.readyState >= 2) {
          tryPlay();
        } else {
          el.addEventListener("canplay", tryPlay, { once: true });
          return () => el.removeEventListener("canplay", tryPlay);
        }
      }
    } else {
      el.removeAttribute("src");
      el.load();
      if (willAutoPlay) setPlaying(true);
    }
  }, [audioUrl]);

  // simulated playback when no real audio file
  useEffect(() => {
    if (audioUrl || !playing) return;
    lastTick.current = performance.now();
    const step = (now: number) => {
      const dt = (now - lastTick.current) / 1000;
      lastTick.current = now;
      setTime((t) => {
        const nt = t + dt;
        if (nt >= duration) {
          setPlaying(false);
          return duration;
        }
        return nt;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, audioUrl, duration]);

  // global spacebar shortcut — re-registers only when song or playing state changes
  useEffect(() => {
    if (!song) return;
    const h = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        const el = audioRef.current;
        if (el && el.src) {
          if (playing) el.pause();
          else el.play().catch(() => {});
        }
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song, playing, audioUrl]);

  const loadSong = useCallback(
    (
      newSong: PlayerSong,
      newUrl: string | null,
      newWave: number[],
      newNotes: SongNote[],
      newSubtitle: string,
      autoPlay = false,
    ) => {
      setSong(newSong);
      setSubtitle(newSubtitle);
      setWave(newWave);
      setNotes(newNotes);
      pendingPlayRef.current = autoPlay;
      setAudioUrl(newUrl); // triggers the audioUrl effect → resets transport
    },
    [],
  );

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (el && audioUrl) {
      if (playing) el.pause();
      else el.play().catch(() => {});
    }
    setPlaying((p) => !p);
  }, [audioUrl, playing]);

  const seek = useCallback(
    (t: number) => {
      const clamped = Math.max(0, Math.min(duration, t));
      const el = audioRef.current;
      if (el && audioUrl) el.currentTime = clamped;
      setTime(clamped);
    },
    [audioUrl, duration],
  );

  return (
    <Ctx.Provider
      value={{
        song,
        subtitle,
        audioUrl,
        wave,
        notes,
        playing,
        time,
        duration,
        deckVisible,
        audioRef,
        addNoteRef,
        loadSong,
        setNotes,
        togglePlay,
        seek,
        setDeckVisible,
      }}
    >
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const d = (e.target as HTMLAudioElement).duration;
          if (isFinite(d) && d > 0) setDuration(d);
        }}
        onTimeUpdate={(e) => setTime((e.target as HTMLAudioElement).currentTime)}
        onEnded={() => setPlaying(false)}
        style={{ display: "none" }}
      />
      {children}
    </Ctx.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}
