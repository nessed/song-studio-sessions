export interface ExtractedColors {
  primary: string;
  secondary: string;
  isDark: boolean;
}

export async function extractColorsFromImage(
  imageUrl: string
): Promise<ExtractedColors> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(getDefaultColors());
        return;
      }

      // Sample at a smaller size for performance
      const sampleSize = 50;
      canvas.width = sampleSize;
      canvas.height = sampleSize;

      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imageData.data;

      let r = 0, g = 0, b = 0;
      let count = 0;

      // Sample pixels
      for (let i = 0; i < data.length; i += 16) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }

      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      // Calculate luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const isDark = luminance < 0.5;

      // Create subtle, desaturated versions for backgrounds
      const hsl = rgbToHsl(r, g, b);
      
      // Make colors very subtle for background use
      const primaryHsl = {
        h: hsl.h,
        s: Math.min(hsl.s * 0.3, 20),
        l: isDark ? 10 : 95,
      };
      
      const secondaryHsl = {
        h: hsl.h,
        s: Math.min(hsl.s * 0.2, 15),
        l: isDark ? 8 : 97,
      };

      resolve({
        primary: `hsl(${primaryHsl.h}, ${primaryHsl.s}%, ${primaryHsl.l}%)`,
        secondary: `hsl(${secondaryHsl.h}, ${secondaryHsl.s}%, ${secondaryHsl.l}%)`,
        isDark,
      });
    };

    img.onerror = () => {
      resolve(getDefaultColors());
    };

    img.src = imageUrl;
  });
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function getDefaultColors(): ExtractedColors {
  return {
    primary: "hsl(40, 20%, 97%)",
    secondary: "hsl(40, 15%, 94%)",
    isDark: false,
  };
}
