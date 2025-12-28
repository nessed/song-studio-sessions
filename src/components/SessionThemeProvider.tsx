import React, { useEffect, useMemo, useState } from "react";
import { Vibrant } from "node-vibrant/browser";
import tinycolor from "tinycolor2";

export type SessionThemeProviderProps = {
  coverUrl?: string | null;
  themeColor?: string | null;
  children: React.ReactNode;
};

const DEFAULT_ACCENT = "#7c3aed"; // Purple fallback

export const SessionThemeProvider: React.FC<SessionThemeProviderProps> = ({
  coverUrl,
  themeColor,
  children,
}) => {
  const [dominantColor, setDominantColor] = useState<string>(DEFAULT_ACCENT);

  useEffect(() => {
    let cancelled = false;

    const extractColor = async () => {
      if (!coverUrl) {
        setDominantColor(themeColor || DEFAULT_ACCENT);
        return;
      }

      try {
        const palette = await Vibrant.from(coverUrl).quality(1).getPalette();
        const vibrant = palette?.Vibrant?.hex || palette?.LightVibrant?.hex || palette?.DarkVibrant?.hex;
        if (!cancelled && vibrant) {
          // Keep it natural, don't oversaturate
          const adjusted = tinycolor(vibrant).toHexString();
          setDominantColor(adjusted);
        }
      } catch {
        if (!cancelled) setDominantColor(themeColor || DEFAULT_ACCENT);
      }
    };

    extractColor();
    return () => { cancelled = true; };
  }, [coverUrl, themeColor]);

  const cssVars = useMemo(() => {
    const accent = dominantColor;
    const accentSoft = tinycolor(accent).setAlpha(0.2).toRgbString(); // Reduced from 0.35
    const accentSubtle = tinycolor(accent).setAlpha(0.08).toRgbString(); // Reduced from 0.12
    const accentGlow = tinycolor(accent).setAlpha(0.15).toRgbString(); // Reduced from 0.25

    return {
      "--accent-main": accent,
      "--accent-soft": accentSoft,
      "--accent-subtle": accentSubtle,
      "--accent-glow": accentGlow,
      "--bg-main": "#050505",
      "--bg-card": "rgba(5, 5, 5, 0.6)",
      "--border-weak": "rgba(255, 255, 255, 0.06)",
    } as React.CSSProperties;
  }, [dominantColor]);

  return (
    <div className="relative min-h-screen bg-[#050505] overflow-hidden" style={cssVars}>
      {/* Primary ambient glow - single unified color from cover art */}
      <div 
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${tinycolor(dominantColor).setAlpha(0.15).toRgbString()} 0%, transparent 60%)`,
        }}
      />
      
      {/* Secondary glow - softer, lower */}
      <div 
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 100% 60% at 30% 100%, ${tinycolor(dominantColor).setAlpha(0.05).toRgbString()} 0%, transparent 50%)`,
        }}
      />

      {/* Blurred cover art overlay for texture (if cover exists) */}
      {coverUrl && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <img 
            src={coverUrl} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-[0.08] blur-[100px] scale-150 saturate-150"
          />
        </div>
      )}

      {/* Deep vignette to darken edges and bottom */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
      
      {/* Side vignettes */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-r from-[#050505]/50 via-transparent to-[#050505]/50" />
      
      {/* Noise Texture for depth */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] mix-blend-overlay" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
};
