import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

/* Scroll-linked entrance. Renders hidden (.rv) and flips to .in the first
   time it enters the viewport — CSS owns the actual motion so it stays on
   the compositor. `from` slides in sideways instead of up. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  from,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: "left" | "right";
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const dir = from === "left" ? " rv-l" : from === "right" ? " rv-r" : "";
  return (
    <div
      ref={ref}
      className={"rv" + dir + (seen ? " in" : "") + (className ? " " + className : "")}
      style={{ ...style, "--d": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}
