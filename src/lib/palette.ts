export type RGB = { r: number; g: number; b: number };

export type HSL = { h: number; s: number; l: number };

export type PaletteResult = {
  dominant: RGB;
  secondary: RGB;
  brightness: number;
  hsl: HSL;
  hex: string;
  textOnBg: string;
  lowResDataUrl?: string;
};

type Bucket = {
  count: number;
  r: number;
  g: number;
  b: number;
};

const QUANTIZE_STEP = 16;

export const rgbToHex = (rgb: RGB) =>
  `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`;

export const rgbToHsl = ({ r, g, b }: RGB): HSL => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) h = ((gNorm - bNorm) / delta) % 6;
    else if (max === gNorm) h = (bNorm - rNorm) / delta + 2;
    else h = (rNorm - gNorm) / delta + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
};

const relativeLuminance = ({ r, g, b }: RGB) => {
  const normalize = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
};

const bucketKey = (r: number, g: number, b: number) =>
  `${Math.round(r / QUANTIZE_STEP)}-${Math.round(g / QUANTIZE_STEP)}-${Math.round(b / QUANTIZE_STEP)}`;

const pickMood = (hsl: HSL, brightness: number) => {
  const { h, s, l } = hsl;
  const sat = s / 100;
  const light = l / 100;

  if (sat < 0.25 && light < 0.35) return "nocturne";
  if (sat < 0.25 && light > 0.65) return "minimal";

  if (h >= 340 || h <= 25) {
    if (sat > 0.6 && light >= 0.35 && light <= 0.75) return "intense";
  }

  if (h > 25 && h <= 90) {
    if (sat >= 0.35 && light > 0.6) return "vibrant";
  }

  if (h > 90 && h <= 210) {
    if (sat >= 0.35 && light >= 0.35 && light <= 0.7) return "dreamy";
  }

  if (h > 210 && h <= 320) {
    if (sat > 0.6 && light < 0.5) return "moody";
  }

  return brightness > 0.65 ? "minimal" : "nocturne";
};

const chooseTextColor = (rgb: RGB) => (relativeLuminance(rgb) > 0.5 ? "#0b0b0b" : "#f7f7f7");

const colorDistance = (a: RGB, b: RGB) => {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

const toRgbString = (rgb: RGB, alpha = 1) =>
  `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${alpha})`;

const getImageData = (img: HTMLImageElement, size = 48) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas not supported");
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(img, 0, 0, size, size);
  return { data: ctx.getImageData(0, 0, size, size).data, canvas, ctx };
};

export const extractPalette = (img: HTMLImageElement): PaletteResult => {
  const { data, canvas, ctx } = getImageData(img, 48);
  const buckets = new Map<string, Bucket>();
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 80) continue;

    const key = bucketKey(r, g, b);
    const bucket = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };
    bucket.count += 1;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);

    sumR += r;
    sumG += g;
    sumB += b;
    total += 1;
  }

  const average: RGB = {
    r: total ? sumR / total : 120,
    g: total ? sumG / total : 120,
    b: total ? sumB / total : 120,
  };

  let dominant: RGB = average;
  let secondary: RGB = average;
  let dominantCount = 0;

  buckets.forEach((bucket) => {
    if (bucket.count > dominantCount) {
      dominantCount = bucket.count;
      dominant = {
        r: bucket.r / bucket.count,
        g: bucket.g / bucket.count,
        b: bucket.b / bucket.count,
      };
    }
  });

  let bestScore = -1;
  buckets.forEach((bucket) => {
    const candidate: RGB = {
      r: bucket.r / bucket.count,
      g: bucket.g / bucket.count,
      b: bucket.b / bucket.count,
    };
    const distance = colorDistance(candidate, dominant);
    const score = distance * bucket.count;
    if (distance > 40 && score > bestScore) {
      bestScore = score;
      secondary = candidate;
    }
  });

  const brightness = relativeLuminance(average);
  const hsl = rgbToHsl(dominant);
  const hex = rgbToHex(dominant);
  const textOnBg = chooseTextColor(dominant);

  // Low-res blur source
  const blurSize = 32;
  canvas.width = blurSize;
  canvas.height = blurSize;
  ctx.drawImage(img, 0, 0, blurSize, blurSize);
  const lowResDataUrl = canvas.toDataURL("image/jpeg", 0.5);

  return {
    dominant,
    secondary,
    brightness,
    hsl,
    hex,
    textOnBg,
    lowResDataUrl,
  };
};

const rgbToHslString = (rgb: RGB) => {
  const { h, s, l } = rgbToHsl(rgb);
  return `${h} ${s}% ${l}%`;
};

export const paletteToCssVars = (palette: PaletteResult) => {
  const { dominant, secondary, textOnBg } = palette;
  const textRgb = textOnBg.startsWith("#")
    ? {
        r: parseInt(textOnBg.slice(1, 3), 16),
        g: parseInt(textOnBg.slice(3, 5), 16),
        b: parseInt(textOnBg.slice(5, 7), 16),
      }
    : { r: 0, g: 0, b: 0 };

  return {
    "--bg1": toRgbString(dominant, 0.72),
    "--bg2": toRgbString(secondary, 0.62),
    "--accent": rgbToHslString(dominant),
    "--accent-foreground": rgbToHslString(textRgb),
    "--ring": rgbToHslString(dominant),
    "--text-on-bg": textOnBg,
  } as Record<string, string>;
};

export const getPaletteWithCache = async (url: string): Promise<PaletteResult | null> => {
  const key = `cover-palette:${url}`;
  const cached = sessionStorage.getItem(key);
  if (cached) {
    try {
      return JSON.parse(cached) as PaletteResult;
    } catch {
      sessionStorage.removeItem(key);
    }
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.loading = "eager";
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = reject;
  });

  const palette = extractPalette(img);
  sessionStorage.setItem(key, JSON.stringify(palette));
  return palette;
};

export { relativeLuminance, pickMood };
