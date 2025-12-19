import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { User } from "lucide-react";
import { SessionsLogo } from "@/components/SessionsLogo";

export function AppHeader() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <header className="sticky top-0 z-10 relative overflow-hidden">
      {/* Glass background */}
      <div className="absolute inset-0 bg-[#09090b]/85 backdrop-blur-2xl" />
      
      {/* Theme-tinted glow (subtle) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{ background: 'linear-gradient(90deg, var(--accent-subtle, rgba(124,58,237,0.08)) 0%, transparent 40%)' }}
      />
      
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      
      {/* Bottom border */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
      
      <div className="relative max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <SessionsLogo />

          <nav className="hidden sm:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                isActive("/dashboard") || isActive("/song")
                  ? "text-white bg-white/10"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              Songs
            </Link>
            <Link
              to="/projects"
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                isActive("/projects") || isActive("/project")
                  ? "text-white bg-white/10"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              Projects
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/settings" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-4 h-4 text-white/50" />
              </div>
            )}
          </Link>
        </div>
      </div>
      
      {/* Mobile nav */}
      <nav className="sm:hidden px-6 pb-3 flex items-center gap-2">
        <Link
          to="/dashboard"
          className={`flex-1 py-2 text-center text-sm rounded-lg transition-colors ${
            isActive("/dashboard") || isActive("/song")
              ? "text-white bg-white/10"
              : "text-white/50 hover:text-white"
          }`}
        >
          Songs
        </Link>
        <Link
          to="/projects"
          className={`flex-1 py-2 text-center text-sm rounded-lg transition-colors ${
            isActive("/projects") || isActive("/project")
              ? "text-white bg-white/10"
              : "text-white/50 hover:text-white"
          }`}
        >
          Projects
        </Link>
      </nav>
    </header>
  );
}
