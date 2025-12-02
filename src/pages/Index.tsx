import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Music2, Disc3, Headphones, FileMusic } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col relative overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] rounded-full bg-white/[0.015] blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 sm:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Sessions</span>
        </div>
        
        {!loading && (
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 text-sm font-medium bg-white text-black rounded-full hover:bg-white/90 transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors hidden sm:block"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth"
                  className="px-5 py-2.5 text-sm font-medium bg-white text-black rounded-full hover:bg-white/90 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-12">
        <div className="max-w-3xl text-center">
          <div className="mb-8 flex items-center justify-center gap-2">
            <span className="px-3 py-1 text-xs font-medium text-white/50 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
              For songwriters & producers
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-[0.9]">
            Your music,
            <br />
            <span className="text-white/30">simplified.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/40 mb-12 max-w-lg mx-auto leading-relaxed">
            A minimal workspace to organize songs, track ideas, manage tasks, and keep your lyrics all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/auth"}
              className="inline-flex items-center gap-3 px-8 py-4 text-base font-medium bg-white text-black rounded-full hover:bg-white/90 transition-all group shadow-2xl shadow-white/10"
            >
              {user ? "Go to Dashboard" : "Start Creating"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>

      {/* Feature hints */}
      <section className="relative z-10 px-6 sm:px-12 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-white/50" />
            </div>
            <p className="text-sm text-white/40">Organize projects</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FileMusic className="w-5 h-5 text-white/50" />
            </div>
            <p className="text-sm text-white/40">Track lyrics & notes</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white/50" />
            </div>
            <p className="text-sm text-white/40">Preview demos</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 text-center border-t border-white/5">
        <p className="text-xs text-white/20">
          Built for musicians, by musicians.
        </p>
      </footer>
    </div>
  );
};

export default Index;
