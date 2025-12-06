import { useEffect, useMemo, useState } from "react";

type Theme = {
  bgMain: string;
  bgCard: string;
  bgTinted: string;
  accentMain: string;
  accentSoft: string;
  accentSubtle: string;
  borderWeak: string;
};

const DEFAULT_THEME: Theme = {
  bgMain: "#09090b",
  bgCard: "#0c0c10",
  bgTinted: "rgba(255,255,255,0.03)",
  accentMain: "#7c3aed",
  accentSoft: "rgba(124,58,237,0.35)",
  accentSubtle: "rgba(124,58,237,0.15)",
  borderWeak: "rgba(255,255,255,0.08)",
};

interface SessionThemeProviderProps {
  coverUrl?: string | null;
  children: React.ReactNode;
}

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  if (Number.isNaN(bigint)) return [0, 0, 0] as const;
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
  ] as const;
};

const luminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

const saturation = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const l = (max + min) / 2;
  return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
};

const mix = (hex: string, amount: number, to: string) => {
  const [r1, g1, b1] = hexToRgb(hex);
  const [r2, g2, b2] = hexToRgb(to);
  const r = Math.round(r1 + (r2 - r1) * amount);
  const g = Math.round(g1 + (g2 - g1) * amount);
  const b = Math.round(b1 + (b2 - b1) * amount);
  return `rgb(${r}, ${g}, ${b})`;
};

export function SessionThemeProvider({ coverUrl, children }: SessionThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    let cancelled = false;
    const extract = async () => {
      if (!coverUrl) {
        setTheme(DEFAULT_THEME);
        return;
      }
      try {
        const { Vibrant } = await import("node-vibrant/browser");
        if (!Vibrant?.from) {
          setTheme(DEFAULT_THEME);
          return;
        }

        const palette = await Vibrant.from(coverUrl).getPalette();
        const dominant = palette?.Vibrant?.hex || palette?.Muted?.hex;
        const secondary = palette?.DarkVibrant?.hex || palette?.LightVibrant?.hex || dominant;
        if (!dominant) {
          setTheme(DEFAULT_THEME);
          return;
        }

        const lum = luminance(dominant);
        const sat = saturation(dominant);

        // If image is too bright/flat, fall back
        if (lum > 0.8 || sat < 0.1) {
          setTheme(DEFAULT_THEME);
          return;
        }

        const bgCard = mix(dominant, 0.85, "#050507");
        const bgTinted = "rgba(255,255,255,0.03)";
        const accentMain = dominant;
        const accentSoft = mix(dominant, 0.2, "#ffffff");
        const accentSubtle = mix(dominant, 0.1, "#ffffff");

        const next: Theme = {
          bgMain: "#09090b",
          bgCard,
          bgTinted,
          accentMain,
          accentSoft,
          accentSubtle,
          borderWeak: "rgba(255,255,255,0.08)",
        };
        if (!cancelled) setTheme(next);
      } catch (err) {
        console.error("palette extraction failed", err);
        if (!cancelled) setTheme(DEFAULT_THEME);
      }
    };
    extract();
    return () => {
      cancelled = true;
    };
  }, [coverUrl]);

  const styleVars = useMemo(
    () => ({
      "--bg-main": theme.bgMain,
      "--bg-card": theme.bgCard,
      "--bg-tinted": theme.bgTinted,
      "--accent-main": theme.accentMain,
      "--accent-soft": theme.accentSoft,
      "--accent-subtle": theme.accentSubtle,
      "--border-weak": theme.borderWeak,
    }) as React.CSSProperties,
    [theme]
  );

  return (
    <div className="theme-shell" style={styleVars}>
      {children}
    </div>
  );
}
