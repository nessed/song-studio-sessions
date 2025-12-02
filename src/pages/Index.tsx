import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Music2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music2 className="w-6 h-6 text-white" />
          <span className="text-lg font-bold tracking-tight text-white">Songbook</span>
        </div>
        
        {!loading && (
          <div>
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6">
            Your songs,
            <br />
            <span className="text-white/40">organized.</span>
          </h1>
          
          <p className="text-lg text-white/40 mb-12 max-w-md mx-auto">
            A minimal workspace for songwriters. Track ideas, manage tasks, and keep your lyrics in one place.
          </p>

          <Link
            to={user ? "/dashboard" : "/auth"}
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium bg-white text-black rounded-full hover:bg-white/90 transition-colors group"
          >
            {user ? "Go to Dashboard" : "Get Started"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-xs text-white/20">
          Built for musicians, by musicians.
        </p>
      </footer>
    </div>
  );
};

export default Index;
