/* Collaborator initial chip, colored by a stable per-letter hue. */
const HUE_MAP: Record<string, number> = { N: 58, M: 212, J: 280, H: 22, C: 194, Y: 150 };

export function avHue(ch: string): number {
  return HUE_MAP[ch] ?? (ch.charCodeAt(0) * 7) % 360;
}

interface AvatarProps {
  ch: string;
  s?: number;
}

export function Avatar({ ch, s = 21 }: AvatarProps) {
  const hue = avHue(ch);
  return (
    <div
      className="av"
      style={{
        width: s,
        height: s,
        fontSize: s * 0.45,
        background: `linear-gradient(150deg, oklch(0.7 0.1 ${hue}), oklch(0.42 0.1 ${hue + 20}))`,
      }}
    >
      {ch}
    </div>
  );
}
