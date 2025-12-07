import React from "react";

export type SessionThemeProviderProps = {
  coverUrl?: string | null;
  themeColor?: string | null;
  children: React.ReactNode;
};

export const SessionThemeProvider: React.FC<SessionThemeProviderProps> = ({
  coverUrl,
  themeColor,
  children,
}) => {
  const accent = themeColor ?? "#1c1f3b";

  return (
    <div className="relative min-h-[calc(100vh-56px)] bg-black overflow-hidden">
      {coverUrl && (
        <div
          className="pointer-events-none absolute -inset-x-32 -top-24 h-[420px] -z-20"
          style={{
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(60px) saturate(1.5)",
            opacity: 0.7,
            transform: "scale(1.15)",
          }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at top, ${accent}55 0, transparent 55%),
            radial-gradient(circle at bottom, ${accent}33 0, transparent 60%)
          `,
        }}
      />

      <div className="pointer-events-none absolute inset-0 -z-5 bg-gradient-to-b from-black/70 via-black/80 to-black" />

      <div className="relative z-0">{children}</div>
    </div>
  );
};
