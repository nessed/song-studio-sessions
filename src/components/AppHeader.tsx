import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { User, Folder, Music, Music2 } from "lucide-react";

export function AppHeader() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <header className="sticky top-0 z-10 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-white">
            <Music2 className="w-5 h-5" />
            <span className="text-lg font-bold tracking-tight">Songbook</span>
          </Link>
          
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
