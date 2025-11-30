import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun, User, Settings, Folder, Music } from "lucide-react";

export function AppHeader() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-semibold text-foreground">
            Sessions
          </Link>
          
          <nav className="hidden sm:flex items-center gap-1">
            <Link to="/" className="btn-ghost flex items-center gap-2">
              <Music className="w-4 h-4" />
              Songs
            </Link>
            <Link to="/projects" className="btn-ghost flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Projects
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="btn-icon">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          
          <Link to="/settings" className="btn-icon">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </Link>
        </div>
      </div>
      
      {/* Mobile nav */}
      <nav className="sm:hidden px-6 pb-3 flex items-center gap-2">
        <Link to="/" className="btn-ghost flex-1 justify-center flex items-center gap-2 text-sm">
          <Music className="w-4 h-4" />
          Songs
        </Link>
        <Link to="/projects" className="btn-ghost flex-1 justify-center flex items-center gap-2 text-sm">
          <Folder className="w-4 h-4" />
          Projects
        </Link>
      </nav>
    </header>
  );
}