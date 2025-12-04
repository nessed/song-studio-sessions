import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export default function InsetCard({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        // base surface
        "rounded-xl border bg-[var(--surface)]",
        // inset look
        "shadow-inner ring-1 ring-inset",
        // theme-aware tokens
        "border-[color:var(--border)] ring-[color:var(--ring)]",
        // subtle gradient so it feels recessed
        "bg-gradient-to-b from-[color:var(--surface-top)] to-[color:var(--surface)]",
        className
      )}
    >
      {children}
    </div>
  );
}
