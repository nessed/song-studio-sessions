import React, { useEffect, useMemo, useState } from "react";
import { Vibrant } from "node-vibrant/browser";
import tinycolor from "tinycolor2";

export type SessionThemeProviderProps = {
  coverUrl?: string | null;
  themeColor?: string | null;
  children: React.ReactNode;
};

const SONIC_NEON = ["#7c3aed", "#f59e0b", "#22d3ee", "#10b981"];

const ensureNeon = (color: string, fallback: string) => {
  const fallbackHsl = tinycolor(fallback).toHsl();
  const parsed = tinycolor(color);
  const hsl = parsed.toHsl();
  const hue = Number.isNaN(hsl.h) ? fallbackHsl.h : hsl.h;
  const saturated = Math.max(hsl.s, 0.86);
  const lit = Math.max(hsl.l, 0.68);

  return tinycolor({ h: hue, s: saturated, l: lit }).saturate(8).toHexString();
};

const buildMeshPalette = (swatches: string[], accent?: string) => {
  const candidates = [
    ...(accent ? [accent] : []),
    ...swatches.filter(Boolean),
  ];

  const lightnessAverage =
    candidates.length > 0
      ? candidates.reduce((sum, color) => sum + tinycolor(color).toHsl().l, 0) /
        candidates.length
      : 0;

  const paletteSeed = lightnessAverage < 0.35 ? SONIC_NEON : candidates;
  const visible = paletteSeed.length ? paletteSeed : SONIC_NEON;

  const palette = visible.slice(0, 4).map((color, index) => ensureNeon(color, SONIC_NEON[index % SONIC_NEON.length]));

  while (palette.length < 4) {
    const nextIndex = palette.length % SONIC_NEON.length;
    palette.push(ensureNeon(SONIC_NEON[nextIndex], SONIC_NEON[nextIndex]));
  }

  return palette;
};

export const SessionThemeProvider: React.FC<SessionThemeProviderProps> = ({
  coverUrl,
  themeColor,
  children,
}) => {
  const [meshColors, setMeshColors] = useState<string[]>(SONIC_NEON);

  useEffect(() => {
    let cancelled = false;

    const extractPalette = async () => {
      if (!coverUrl) {
        const palette = buildMeshPalette([], themeColor ?? undefined);
        if (!cancelled) setMeshColors(palette);
        return;
      }

      try {
        const palette = await Vibrant.from(coverUrl).quality(2).getPalette();
        const swatches = [
          palette?.Vibrant?.getHex(),
          palette?.LightVibrant?.getHex(),
          palette?.DarkVibrant?.getHex(),
          palette?.Muted?.getHex(),
          palette?.LightMuted?.getHex(),
          palette?.DarkMuted?.getHex(),
        ].filter(Boolean) as string[];

        const meshPalette = buildMeshPalette(swatches, themeColor ?? undefined);
        if (!cancelled) setMeshColors(meshPalette);
      } catch {
        const fallbackPalette = buildMeshPalette([], themeColor ?? undefined);
        if (!cancelled) setMeshColors(fallbackPalette);
      }
    };

    extractPalette();

    return () => {
      cancelled = true;
    };
  }, [coverUrl, themeColor]);

  const cssVars = useMemo(() => {
    const accent = meshColors[0] ?? SONIC_NEON[0];
    const accentSoft = tinycolor(accent).setAlpha(0.22).toRgbString();
    const accentSubtle = tinycolor(accent).setAlpha(0.14).toRgbString();

    return {
      "--gradient-color-1": meshColors[0],
      "--gradient-color-2": meshColors[1],
      "--gradient-color-3": meshColors[2],
      "--gradient-color-4": meshColors[3],
      "--bg-main": "#09090b",
      "--bg-card": "rgba(9, 9, 11, 0.78)",
      "--accent-main": accent,
      "--accent-soft": accentSoft,
      "--accent-subtle": accentSubtle,
      "--border-weak": "rgba(255, 255, 255, 0.08)",
    } as React.CSSProperties;
  }, [meshColors]);

  return (
    <div className="relative min-h-screen bg-[#09090b] overflow-hidden" style={cssVars}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#09090b]/65 via-[#09090b]/72 to-[#09090b]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.06),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.05),transparent_30%)] mix-blend-screen" />
      <div className="relative">{children}</div>
    </div>
  );
};
