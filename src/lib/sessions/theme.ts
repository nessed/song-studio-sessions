import { SongStatus, SONG_STATUSES } from "@/lib/types";

/* ════════════════════════════════════════════════
   Sessions design system — runtime helpers.
   Ported from the Claude Design handoff (data.jsx).
   "Every song is its own room": a single hue drives a
   set of CSS custom properties that recolor the whole UI.
   ════════════════════════════════════════════════ */

export type PaletteVars = Record<string, string>;

/* per-song "room": accent derived from a single hue so the whole
   UI recolors. low chroma keeps it from looking like an AI gradient. */
export function palette(hue: number, chroma = 0.13): PaletteVars {
  return {
    "--accent": `oklch(0.75 ${chroma} ${hue})`,
    "--accent-bright": `oklch(0.83 ${chroma} ${hue})`,
    "--accent-glow": `oklch(0.75 ${chroma} ${hue} / 0.22)`,
    "--accent-dim": `oklch(0.75 ${Math.min(chroma, 0.07)} ${hue} / 0.15)`,
    "--accent-line": `oklch(0.75 ${Math.min(chroma, 0.1)} ${hue} / 0.30)`,
  };
}

export const NEUTRAL = palette(250, 0.045);

/* format seconds → m:ss */
export const fmt = (s: number) => {
  s = Math.max(0, Math.floor(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/* deterministic performed waveform (seeded so it's stable per song) */
export function buildWave(seed: number, n = 80): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env =
      0.42 +
      0.32 * Math.sin(t * Math.PI + seed) +
      0.18 * Math.sin(t * Math.PI * 6 + seed * 2) +
      0.12 * Math.sin(t * Math.PI * 17);
    const j = ((Math.sin((i + seed) * 12.9898) * 43758.5453) % 1 + 1) % 1;
    out.push(Math.max(0.12, Math.min(1, env * (0.7 + 0.5 * j))));
  }
  return out;
}

/* stable hash from a string → 0..359 hue. Gives each song its own room
   even when there's no cover art / extracted palette. */
export function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) % 360;
  }
  // nudge away from muddy yellows-greens that read poorly on dark
  return h;
}

export type CoverTemplate = "sun" | "split" | "disc" | "horizon";
const COVER_TEMPLATES: CoverTemplate[] = ["sun", "split", "disc", "horizon"];

export function coverTemplate(input: string): CoverTemplate {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h + input.charCodeAt(i) * 7) % 997;
  return COVER_TEMPLATES[h % COVER_TEMPLATES.length];
}

/* derive the room hue for a real song (no `hue` column in the DB) */
export function hueForSong(song: { id: string; title: string }): number {
  return hashHue(song.id || song.title || "");
}

/* ——— status / stage meter helpers ——— */
export const STATUS_LABELS = SONG_STATUSES.map((s) => s.label);

export function statusIndex(status: SongStatus | string): number {
  const i = SONG_STATUSES.findIndex(
    (s) => s.value === status || s.label === status
  );
  return Math.max(0, i);
}

export function statusLabel(status: SongStatus | string): string {
  const s = SONG_STATUSES.find((x) => x.value === status || x.label === status);
  return s ? s.label : String(status);
}

/* convert PaletteVars to an inline style object usable by React */
export function paletteStyle(vars: PaletteVars): React.CSSProperties {
  return vars as React.CSSProperties;
}
