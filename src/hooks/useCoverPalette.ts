import { useEffect, useRef, useState } from "react";
import { getPaletteWithCache, paletteToCssVars, relativeLuminance, PaletteResult } from "@/lib/palette";

type PaletteState = {
  dominant: PaletteResult["dominant"];
  secondary: PaletteResult["secondary"];
  textOnBg: string;
  cssVars: Record<string, string>;
  lowRes?: string;
  needsLift: boolean;
};

const idle = (fn: () => void) => {
  if (typeof (window as any).requestIdleCallback === "function") {
    const id = (window as any).requestIdleCallback(fn, { timeout: 120 });
    return () => (window as any).cancelIdleCallback?.(id);
  }
  const timer = window.setTimeout(fn, 0);
  return () => window.clearTimeout(timer);
};

export const useCoverPalette = (coverUrl?: string | null) => {
  const [state, setState] = useState<PaletteState | null>(null);
  const debounceRef = useRef<number>();
  const cleanupIdle = useRef<(() => void) | null>(null);
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    cleanupIdle.current?.();

    if (!coverUrl) {
      setState(null);
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      cleanupIdle.current = idle(async () => {
        try {
          const palette = await getPaletteWithCache(coverUrl);
          if (!palette) return;
          const cssVars = paletteToCssVars(palette);

          const bgLum = relativeLuminance({
            r: (palette.dominant.r + palette.secondary.r) / 2,
            g: (palette.dominant.g + palette.secondary.g) / 2,
            b: (palette.dominant.b + palette.secondary.b) / 2,
          });
          const textLum = relativeLuminance({
            r: parseInt(cssVars["--text-on-bg"].slice(1, 3), 16),
            g: parseInt(cssVars["--text-on-bg"].slice(3, 5), 16),
            b: parseInt(cssVars["--text-on-bg"].slice(5, 7), 16),
          });
          const l1 = Math.max(bgLum, textLum);
          const l2 = Math.min(bgLum, textLum);
          const contrast = (l1 + 0.05) / (l2 + 0.05);

          const nextState: PaletteState = {
            dominant: palette.dominant,
            secondary: palette.secondary,
            textOnBg: palette.textOnBg,
            cssVars,
            lowRes: palette.lowResDataUrl,
            needsLift: contrast < 4.5,
          };

          lastUrl.current = coverUrl;
          setState(nextState);
        } catch {
          setState(null);
        }
      });
    }, 80);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      cleanupIdle.current?.();
    };
  }, [coverUrl]);

  return state;
};
