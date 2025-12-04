import { Link } from "react-router-dom";
import { Waves } from "lucide-react";

type SessionsLogoProps = {
  to?: string;
  subtitle?: string;
  className?: string;
};

export function SessionsLogo({ to = "/", subtitle = "Studio Console", className }: SessionsLogoProps) {
  const content = (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <div className="h-11 w-11 rounded-full bg-[#09090b]/80 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center justify-center">
        <Waves className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-mono">Sessions</p>
        <p
          className="text-lg font-semibold tracking-tight text-white"
          style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );

  if (!to) return content;
  return (
    <Link to={to} className="hover:opacity-90 transition-opacity">
      {content}
    </Link>
  );
}
