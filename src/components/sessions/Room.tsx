import { ReactNode, useEffect } from "react";
import { PaletteVars } from "@/lib/sessions/theme";

/* Apply a room palette to the document root so the fixed ambient
   background (and every --accent consumer) recolors per context. */
export function useRoomTheme(vars: PaletteVars) {
  // serialize so the effect re-runs when any value changes
  const key = JSON.stringify(vars);
  useEffect(() => {
    const root = document.documentElement;
    const entries = Object.entries(vars);
    entries.forEach(([k, v]) => root.style.setProperty(k, v));
    return () => {
      entries.forEach(([k]) => root.style.removeProperty(k));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/* The ambient "room" — a quiet pool of the accent color + grain. */
export function Room() {
  return <div className="room" aria-hidden="true" />;
}

/* Full-screen sessions surface: dark canvas, ambient room, content layer. */
export function SessionsShell({
  children,
  vars,
  className = "",
}: {
  children: ReactNode;
  vars: PaletteVars;
  className?: string;
}) {
  useRoomTheme(vars);
  return (
    <div className={"ss-app " + className}>
      <Room />
      <div className="ss-content">{children}</div>
    </div>
  );
}
