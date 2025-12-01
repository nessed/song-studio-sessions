import { CSSProperties } from "react";
import clsx from "clsx";

type Props = {
  coverUrl?: string | null;
  lowRes?: string | null;
  className?: string;
  style?: CSSProperties;
};

export function AmbientBackground({ coverUrl, lowRes, className, style }: Props) {
  return (
    <div className={clsx("ambient-bg", className)} style={style}>
      <div className="ambient-overlay" />
      <div className="ambient-paint" />
      {(lowRes || coverUrl) && (
        <div
          className="ambient-cover"
          style={{ backgroundImage: `url(${lowRes || coverUrl})` }}
          aria-hidden
        />
      )}
      <div className="ambient-vignette" aria-hidden />
      <div className="ambient-noise" aria-hidden />
    </div>
  );
}
