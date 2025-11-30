import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-foreground tracking-tight">
            Sessions
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className={`text-sm transition-colors ${
                location.pathname === "/" 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/library"
              className={`text-sm transition-colors ${
                location.pathname === "/library" 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Library
            </Link>
          </nav>
        </div>

        <button
          onClick={toggleTheme}
          className="btn-ghost text-xs"
          aria-label="Toggle theme"
        >
          {theme === "light" ? "Dark" : "Light"}
        </button>
      </div>
    </header>
  );
}
