import React, { useEffect, useMemo, useState } from "react";
import { Vibrant } from "node-vibrant/browser";
import tinycolor from "tinycolor2";

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
        const baseSource = dominant || themeColor || SONIC_NEON[0];
        const base = tinycolor(baseSource).saturate(35).lighten(18);

        const palette = [
          ensureBright(base),
          ensureBright(base.clone().spin(30)),
          ensureBright(base.clone().spin(180)),
          ensureBright(base.clone().spin(60)),
        ];

        setMeshColors(palette);
      };

      if (!coverUrl) {
        applyPalette(themeColor ?? SONIC_NEON[0], SONIC_NEON[1]);
        return;
      }

      try {
        const palette = await Vibrant.from(coverUrl).quality(2).getPalette();
        const dominant = palette?.Vibrant?.getHex() || palette?.Muted?.getHex();
        const secondary = palette?.LightVibrant?.getHex() || palette?.DarkVibrant?.getHex();
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
