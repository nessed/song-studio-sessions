import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { SessionsShell } from "@/components/sessions/Room";
import { CoverArt } from "@/components/sessions/CoverArt";
import { palette, NEUTRAL, paletteStyle } from "@/lib/sessions/theme";
import { SongStatus } from "@/lib/types";

type FanSong = { id: string; title: string; status: SongStatus; hue: number };
const FAN: FanSong[] = [
  { id: "cinders", title: "Cinders", status: "writing", hue: 22 },
  { id: "paper-radio", title: "Paper Radio", status: "mixing", hue: 212 },
  { id: "slow-light", title: "Slow Light", status: "production", hue: 58 },
];
const OFFS = [
  { x: -150, y: -30, r: -9 },
  { x: 0, y: 14, r: 0 },
  { x: 150, y: -30, r: 9 },
];

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) toast.error(error.message || "Failed to sign in");
        else navigate("/projects", { replace: true });
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes("already registered"))
            toast.error("This email is already registered. Try signing in instead.");
          else toast.error(error.message || "Failed to sign up");
        } else {
          toast.success("Check your email to confirm your account!");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SessionsShell vars={NEUTRAL}>
      <div className="auth">
        <div className="auth-aside" style={paletteStyle(palette(58))}>
          <div className="fan" aria-hidden="true">
            {FAN.map((s, i) => (
              <div
                className="c"
                key={s.id}
                style={{
                  transform: `translate(${OFFS[i].x}px, ${OFFS[i].y}px) rotate(${OFFS[i].r}deg)`,
                  zIndex: i,
                  opacity: 0.55 + i * 0.18,
                  "--d": `${0.15 + i * 0.12}s`,
                } as React.CSSProperties}
              >
                <CoverArt song={s} hue={s.hue} radius={18} />
              </div>
            ))}
          </div>
          <div style={{ position: "relative", zIndex: 2 }} className="auth-brand drop">
            <span className="dot" />
            <b style={{ fontSize: 18, fontWeight: 600 }}>Sessions</b>
          </div>
          <div className="auth-quote rise" style={{ "--d": "0.3s" } as React.CSSProperties}>
            <p>The space between a voice memo and a finished record. Kept quiet, on purpose.</p>
            <div className="by kicker">Boutique workspace for songwriters</div>
          </div>
        </div>

        <div className="auth-form-wrap">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-brand rise" style={{ "--d": "0s" } as React.CSSProperties}>
              <span className="dot" />
              <b>Sessions</b>
            </div>
            <div className="auth-h rise" style={{ "--d": "0.06s" } as React.CSSProperties}>
              {isLogin ? "Welcome back" : "Create a studio"}
            </div>
            <div className="auth-sub rise" style={{ "--d": "0.1s" } as React.CSSProperties}>
              {isLogin ? "Pick up where the song left off." : "Start your first session in under a minute."}
            </div>

            {!isLogin && (
              <div className="field rise" style={{ "--d": "0.12s" } as React.CSSProperties}>
                <label>Name</label>
                <div className="inp">
                  <User size={17} />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="field rise" style={{ "--d": "0.14s" } as React.CSSProperties}>
              <label>Email</label>
              <div className="inp">
                <Mail size={17} />
                <input
                  type="email"
                  placeholder="you@studio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div className="field rise" style={{ "--d": "0.18s" } as React.CSSProperties}>
              <label>Password</label>
              <div className="inp">
                <Lock size={17} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              className="auth-submit rise"
              style={{ "--d": "0.22s" } as React.CSSProperties}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Please wait…
                </>
              ) : (
                <>
                  {isLogin ? "Continue" : "Create account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            <div className="auth-alt">
              <span>
                {isLogin ? "New here? " : "Already have a studio? "}
                <a onClick={() => setIsLogin((v) => !v)}>{isLogin ? "Create a studio" : "Sign in"}</a>
              </span>
              <span className="auth-hint">⏎</span>
            </div>
          </form>
        </div>
      </div>
    </SessionsShell>
  );
}
