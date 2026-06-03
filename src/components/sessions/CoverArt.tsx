import { CSSProperties } from "react";
import { hueForSong, coverTemplate, CoverTemplate } from "@/lib/sessions/theme";

/* CoverArt — a small art-directed series. Four templates, each
   recolored by the song's hue. When the song has a real uploaded
   cover image we show that instead; otherwise we generate art so
   the gallery still reads as a cohesive label, not a blank grid. */

type CoverSong = {
  id: string;
  title: string;
  cover_art_url?: string | null;
};

function coverBg(hue: number, type: CoverTemplate): CSSProperties {
  const A = (l: number, c: number, h: number = hue) => `oklch(${l} ${c} ${h})`;
  switch (type) {
    case "split":
      return {
        background: `linear-gradient(118deg, ${A(0.3, 0.1)} 0%, ${A(0.3, 0.1)} 48.6%, ${A(0.86, 0.04)} 49%, ${A(0.86, 0.04)} 49.4%, ${A(0.62, 0.15)} 50%, ${A(0.62, 0.15)} 100%)`,
      };
    case "disc":
      return {
        background: `radial-gradient(60% 60% at 38% 40%, ${A(0.78, 0.14)}, ${A(0.4, 0.12)} 58%, ${A(0.2, 0.06)} 100%)`,
      };
    case "horizon":
      return {
        background: `linear-gradient(178deg, ${A(0.66, 0.13)} 0%, ${A(0.4, 0.11)} 46%, ${A(0.28, 0.07)} 54%, ${A(0.18, 0.05)} 100%)`,
      };
    case "sun":
    default:
      return {
        background: `radial-gradient(120% 110% at 72% 18%, ${A(0.88, 0.11, hue + 10)}, transparent 50%), radial-gradient(130% 120% at 18% 98%, ${A(0.42, 0.11)}, transparent 58%), linear-gradient(158deg, ${A(0.7, 0.14)}, ${A(0.28, 0.07)})`,
      };
  }
}

interface CoverArtProps {
  song: CoverSong;
  size?: number;
  radius?: number;
  style?: CSSProperties;
  className?: string;
  /* explicit overrides — used by marketing mocks that want a fixed palette */
  hue?: number;
  template?: CoverTemplate;
}

export function CoverArt({ song, size, radius, style, className = "", hue: hueOverride, template }: CoverArtProps) {
  const hue = hueOverride ?? hueForSong(song);
  const type = template ?? coverTemplate(song.id || song.title || "");
  const A = (l: number, c: number, h: number = hue) => `oklch(${l} ${c} ${h})`;

  const hasImage = !!song.cover_art_url;

  const wrap: CSSProperties = {
    ...(size ? { width: size, height: size } : { width: "100%", aspectRatio: "1" }),
    ...(radius != null ? { borderRadius: radius } : {}),
    ...(hasImage ? {} : coverBg(hue, type)),
    ...style,
  };

  return (
    <div className={"cv " + className} style={wrap}>
      {hasImage && <img src={song.cover_art_url as string} alt="" draggable={false} />}
      {!hasImage && type === "sun" && (
        <>
          <div
            style={{
              position: "absolute",
              top: "13%",
              right: "17%",
              width: "34%",
              aspectRatio: "1",
              borderRadius: "50%",
              background: `radial-gradient(circle at 40% 38%, rgba(255,250,242,0.95), ${A(0.86, 0.12, hue + 8)} 44%, transparent 72%)`,
              filter: "blur(1.5px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: "30%",
              height: 1,
              background: `linear-gradient(90deg,transparent,${A(0.9, 0.05)},transparent)`,
            }}
          />
        </>
      )}
      {!hasImage && type === "disc" && (
        <div
          style={{
            position: "absolute",
            top: "24%",
            left: "24%",
            width: "52%",
            aspectRatio: "1",
            borderRadius: "50%",
            boxShadow: `0 0 0 1px ${A(0.9, 0.04)}, 0 20px 50px -10px rgba(0,0,0,0.5)`,
            background: `radial-gradient(circle at 38% 34%, ${A(0.9, 0.08, hue + 6)}, ${A(0.5, 0.13)} 70%)`,
          }}
        />
      )}
      {!hasImage && type === "split" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(80% 60% at 78% 22%, ${A(0.92, 0.05)}, transparent 42%)`,
            mixBlendMode: "soft-light",
          }}
        />
      )}
      {!hasImage && type === "horizon" && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: 1.5,
            background: `linear-gradient(90deg,transparent 8%,${A(0.95, 0.04)},transparent 92%)`,
            boxShadow: `0 0 18px 1px ${A(0.8, 0.12)}`,
          }}
        />
      )}
      <div className="vignette" />
      <div className="grain" />
    </div>
  );
}
