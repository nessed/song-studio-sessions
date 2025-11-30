import { useEffect, useState } from "react";
import { extractColorsFromImage, ExtractedColors } from "@/lib/color-extraction";
import { useTheme } from "@/hooks/useTheme";

interface AmbientBackgroundProps {
  imageUrl?: string;
}

export function AmbientBackground({ imageUrl }: AmbientBackgroundProps) {
  const { theme } = useTheme();
  const [colors, setColors] = useState<ExtractedColors | null>(null);

  useEffect(() => {
    if (imageUrl) {
      extractColorsFromImage(imageUrl).then(setColors);
    } else {
      setColors(null);
    }
  }, [imageUrl]);

  const defaultLight = "linear-gradient(180deg, hsl(40, 20%, 97%) 0%, hsl(40, 15%, 94%) 100%)";
  const defaultDark = "linear-gradient(180deg, hsl(220, 15%, 8%) 0%, hsl(220, 12%, 10%) 100%)";

  const gradient = colors
    ? `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
    : theme === "dark"
    ? defaultDark
    : defaultLight;

  return (
    <div
      className="gradient-ambient"
      style={{ background: gradient }}
    />
  );
}
