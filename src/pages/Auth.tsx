import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { SessionsLogo } from "@/components/SessionsLogo";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || "Failed to sign in");
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Try signing in instead.");
          } else {
            toast.error(error.message || "Failed to sign up");
          }
        } else {
          toast.success("Check your email to confirm your account!");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Primary violet glow */}
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px]" 
          style={{ background: 'rgba(139, 92, 246, 0.15)' }} 
        />
        {/* Secondary accent glow */}
        <div 
          className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full blur-[100px]" 
          style={{ background: 'rgba(124, 58, 237, 0.08)' }} 
        />
        {/* Warm accent */}
        <div 
          className="absolute top-1/4 left-1/4 w-[200px] h-[200px] rounded-full blur-[80px]" 
          style={{ background: 'rgba(251, 191, 36, 0.05)' }} 
        />
      </div>

      {/* Decorative floating elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-[20%] w-2 h-2 rounded-full bg-violet-500/30"
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 left-[15%] w-1.5 h-1.5 rounded-full bg-amber-400/20"
          animate={{ y: [0, -15, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/3 left-[10%] w-1 h-1 rounded-full bg-white/20"
          animate={{ y: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <SessionsLogo to={null} subtitle={isLogin ? "Welcome Back" : "Get Started"} />
        </motion.div>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-deep p-8 sm:p-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}
            >
              {isLogin ? "Sign in to your account" : "Create your account"}
            </h2>
            <p className="text-sm text-white/40">
              {isLogin ? "Enter your credentials to continue" : "Start your musical journey today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="displayName"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                    Display name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all duration-200"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all duration-200"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full mt-2 px-6 py-3.5 text-sm font-semibold bg-white text-black rounded-xl hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign in" : "Create account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-white/40 hover:text-white transition-colors group"
            >
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <span className="text-violet-400 group-hover:text-violet-300 font-medium">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span className="text-violet-400 group-hover:text-violet-300 font-medium">Sign in</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center text-xs text-white/20 mt-8"
        >
          By continuing, you agree to our Terms of Service
        </motion.p>
      </motion.div>
    </div>
  );
}
