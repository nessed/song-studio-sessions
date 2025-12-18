import React, { useEffect, useMemo, useState } from "react";
import { Vibrant } from "node-vibrant/browser";
import tinycolor from "tinycolor2";
import { MeshGradient } from "./MeshGradient";

export type SessionThemeProviderProps = {
  coverUrl?: string | null;
  themeColor?: string | null;
  children: React.ReactNode;
};

const SONIC_NEON = ["#7c3aed", "#f59e0b", "#22d3ee", "#10b981"];

export const SessionThemeProvider: React.FC<SessionThemeProviderProps> = ({
  coverUrl,
  themeColor,
  children,
}) => {
  const [meshColors, setMeshColors] = useState<string[]>(SONIC_NEON);

  useEffect(() => {
    let cancelled = false;

    const extractPalette = async () => {
      const ensureBright = (input: tinycolor.Instance, fallbackHue = 270) => {
        const clone = input.clone();
        const hsl = clone.toHsl();
        const hue = Number.isFinite(hsl.h) ? hsl.h : fallbackHue;
        let neon = tinycolor({
          h: hue,
          s: Math.max(hsl.s, 0.75),
          l: Math.max(hsl.l, 0.62),
        }).saturate(20);
        while (neon.getLuminance() < 0.3) {
          neon = neon.lighten(8);
          if (neon.getLuminance() > 0.5) break;
        }
        return neon.toHexString();
      };

      const applyPalette = (dominant?: string, secondary?: string) => {
        // Boost saturation and brightness for that "Neon Glass" look
        const domBase = tinycolor(dominant || themeColor || SONIC_NEON[0])
          .saturate(40) // Increased saturation
          .lighten(5);   // Slight lighten
          
        const secBase = tinycolor(
          secondary || domBase.clone().spin(180).toHexString()
        )
          .saturate(40)
          .lighten(5);

        const ensureNeon = (c: tinycolor.Instance) => {
           // Force high saturation for glow effect
           if (c.toHsl().s < 0.5) c.saturate(30);
           // Ensure not too dark, not too nice
           if (c.getBrightness() < 40) c.lighten(20);
           return c.toHexString();
        };

        const palette = [
          ensureNeon(domBase),
          ensureNeon(domBase.clone().spin(45)),
          ensureNeon(secBase),
          ensureNeon(secBase.clone().spin(-45)),
        ];

        setMeshColors(palette);
      };

      if (!coverUrl) {
        applyPalette(themeColor ?? SONIC_NEON[0], SONIC_NEON[1]);
        return;
      }

      try {
        const palette = await Vibrant.from(coverUrl).quality(1).getPalette(); 
        const dominant = palette?.Vibrant?.hex || palette?.LightVibrant?.hex;
        const secondary = palette?.DarkVibrant?.hex || palette?.Muted?.hex;
        if (!cancelled) applyPalette(dominant ?? undefined, secondary ?? undefined);
      } catch {
        if (!cancelled) applyPalette(themeColor ?? SONIC_NEON[0], SONIC_NEON[1]);
      }
    };

    extractPalette();

    return () => {
      cancelled = true;
    };
  }, [coverUrl, themeColor]);

  const cssVars = useMemo(() => {
    const accent = meshColors[0] ?? SONIC_NEON[0];
    // More opaque soft accent for better glass highlights
    const accentSoft = tinycolor(accent).setAlpha(0.35).toRgbString(); 
    const accentSubtle = tinycolor(accent).setAlpha(0.15).toRgbString();

    return {
      "--gradient-color-1": meshColors[0],
      "--gradient-color-2": meshColors[1],
      "--gradient-color-3": meshColors[2],
      "--gradient-color-4": meshColors[3],
      "--bg-main": "#050505", // Darker base for contrast
      "--bg-card": "rgba(5, 5, 5, 0.6)", // More transparent card
      "--accent-main": accent,
      "--accent-soft": accentSoft,
      "--accent-subtle": accentSubtle,
      "--border-weak": "rgba(255, 255, 255, 0.06)",
    } as React.CSSProperties;
  }, [meshColors]);

  return (
    <div className="relative min-h-screen bg-[#050505] overflow-hidden" style={cssVars}>
      <MeshGradient colorSignature={meshColors.join("-")} />
      
      {/* Deep darkening vignette from bottom to top to ensure legible lyrics */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent opacity-90" />
      
      {/* Top light leak */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-[#050505]/40 to-transparent" />
      
      {/* Noise Texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <div className="relative">{children}</div>
    </div>
  );
};
