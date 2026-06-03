import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, Check, Sparkles, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SessionsShell } from "@/components/sessions/Room";
import { CoverArt } from "@/components/sessions/CoverArt";
import { StageMeter } from "@/components/sessions/StageMeter";
import { Avatar } from "@/components/sessions/Avatar";
import { palette, paletteStyle, buildWave } from "@/lib/sessions/theme";
import { SongStatus } from "@/lib/types";

/* Marketing imagery uses a fixed art-directed set of "songs" — they
   only drive cover art + palettes on the landing page. */
type MockSong = { id: string; title: string; status: SongStatus; hue: number };
const HERO: MockSong = { id: "slow-light", title: "Slow Light", status: "production", hue: 58 };
const ROOMS: MockSong[] = [
  { id: "slow-light", title: "Slow Light", status: "production", hue: 58 },
  { id: "paper-radio", title: "Paper Radio", status: "mixing", hue: 212 },
  { id: "cinders", title: "Cinders", status: "writing", hue: 22 },
  { id: "understory", title: "Understory", status: "writing", hue: 152 },
  { id: "salt-air", title: "Salt Air", status: "mastering", hue: 194 },
];

function MiniWave({ hue, n = 46, played = 0.42 }: { hue: number; n?: number; played?: number }) {
  const w = useMemo(() => buildWave(hue, n), [hue, n]);
  const cut = Math.round(n * played);
  return (
    <div className="mini-wave">
      {w.map((h, i) => (
        <div key={i} className={"b" + (i < cut ? " on" : "")} style={{ height: Math.round(h * 100) + "%" }} />
      ))}
    </div>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const start = () => navigate(user ? "/dashboard" : "/auth");
  const signIn = () => navigate("/auth");
  const nm = useMemo(() => buildWave(58, 44), []);

  return (
    <SessionsShell vars={palette(58)}>
      <div className="lp fade-in">
        <nav className="lp-nav">
          <div className="nb">
            <span className="dot" />
            <b>Sessions</b>
          </div>
          <div className="links">
            <a onClick={start}>Features</a>
            <a onClick={start}>For bands</a>
            <a onClick={start}>Pricing</a>
          </div>
          <div className="sp" />
          <span className="lp-signin" onClick={signIn}>
            Sign in
          </span>
          <span className="lp-cta" onClick={start}>
            Start free
            <ArrowRight size={15} />
          </span>
        </nav>

        {/* hero */}
        <div className="lp-wrap">
          <div className="lp-hero">
            <div>
              <div className="kicker">Boutique workspace for songwriters</div>
              <h1 className="lp-h1">
                Where voice memos
                <br />
                become <span className="em">records.</span>
              </h1>
              <p className="lp-sub">
                Sessions is the quiet studio between the spark and the master. Drop a take, leave notes on
                the exact second, keep every version — and watch the whole room color itself around the song.
              </p>
              <div className="lp-actions">
                <span className="lp-cta lp-cta-lg" onClick={start}>
                  Start your first song
                  <ArrowRight size={16} />
                </span>
                <span className="lp-ghost" onClick={start}>
                  <Play size={15} />
                  See a session
                </span>
              </div>
              <div className="lp-trust">
                <Sparkles size={14} style={{ color: "var(--accent-bright)" }} />
                <span className="l">No card · bring a song in under a minute</span>
              </div>
            </div>

            <div className="lp-shot">
              <div className="cover-frame">
                <CoverArt song={HERO} hue={HERO.hue} radius={18} />
              </div>
              <div className="float-note glass">
                <div className="fn-top">
                  <span className="fn-ts">0:42</span>
                  <span className="guest-badge">guest</span>
                  <span className="fn-who">Mara</span>
                </div>
                <div className="fn-text">love this harmony stack — keep it</div>
              </div>
              <div className="float-player">
                <div className="mini-player glass">
                  <div className="mp-cover">
                    <CoverArt song={HERO} hue={HERO.hue} radius={12} />
                  </div>
                  <div className="mp-play">
                    <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />
                  </div>
                  <MiniWave hue={58} />
                  <div className="mp-time">1:24 / 3:48</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lp-stats">
            <div className="lp-stat">
              <div className="n">
                <span className="em">7</span> stages
              </div>
              <div className="l">idea → release, tracked</div>
            </div>
            <div className="lp-stat">
              <div className="n">
                every <span className="em">take</span>
              </div>
              <div className="l">versioned automatically</div>
            </div>
            <div className="lp-stat">
              <div className="n">
                notes on the <span className="em">second</span>
              </div>
              <div className="l">timestamped feedback</div>
            </div>
          </div>
        </div>

        {/* rooms band */}
        <div className="lp-rooms">
          <div className="lp-wrap">
            <div className="lp-sechead">
              <div className="kicker">The idea</div>
              <h2>Every song becomes its own room.</h2>
              <p>
                Sessions reads the color out of your cover art and themes the entire workspace around it — so
                opening a different song feels like walking into a different room, not refreshing a dashboard.
              </p>
            </div>
            <div className="rooms-strip">
              {ROOMS.map((s) => (
                <div className="room-cell" key={s.id} style={paletteStyle(palette(s.hue))}>
                  <CoverArt song={s} hue={s.hue} radius={13} />
                  <div className="rc-meta">
                    <div className="rc-title">{s.title}</div>
                    <div className="rc-stage">
                      <StageMeter status={s.status} label={false} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* features */}
        <div className="lp-wrap">
          <div className="lp-features">
            {/* 1 notes */}
            <div className="feat">
              <div className="feat-text">
                <div className="num">01</div>
                <h3>Feedback that lives on the timeline.</h3>
                <p>
                  Stop describing the second you mean. Click the waveform, leave a note where it happened, and
                  send a private link — collaborators reply on the exact bar.
                </p>
                <div className="feat-list">
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Timestamped notes from you and guests
                  </div>
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Hover the wave to preview any comment
                  </div>
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Read-only rooms — no files handed over
                  </div>
                </div>
              </div>
              <div className="feat-mock glass" style={paletteStyle(palette(58))}>
                <div className="mock-head">
                  <span className="mh-l">Slow Light · notes</span>
                  <span className="mh-l">5</span>
                </div>
                <div className="nm-wave">
                  {nm.map((h, i) => (
                    <div key={i} className={"b" + (i < 18 ? " on" : "")} style={{ height: Math.round(h * 100) + "%" }} />
                  ))}
                  <div className="dot" style={{ left: "18%" }} />
                  <div className="dot" style={{ left: "42%" }} />
                  <div className="dot" style={{ left: "74%" }} />
                </div>
                <div className="nm-row">
                  <div className="ts">0:42</div>
                  <div>
                    <div className="tx">love this harmony stack — keep it</div>
                    <div className="wh">Mara · guest</div>
                  </div>
                </div>
                <div className="nm-row">
                  <div className="ts">1:18</div>
                  <div>
                    <div className="tx">pull the reverb back here</div>
                    <div className="wh">You</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2 tasks */}
            <div className="feat rev">
              <div className="feat-text">
                <div className="num">02</div>
                <h3>A to-do list that speaks studio.</h3>
                <p>
                  Type it the way you'd say it. Sessions parses the priority and the date and files the task
                  under the right stage — recording, production, mixing — so the work sorts itself.
                </p>
                <div className="feat-list">
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Natural language:{" "}
                    <span className="mono" style={{ color: "var(--fg)", marginLeft: 4 }}>
                      !high due fri
                    </span>
                  </div>
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Grouped by where you are in the pipeline
                  </div>
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Lives in a sidecar, never over the song
                  </div>
                </div>
              </div>
              <div className="feat-mock glass" style={paletteStyle(palette(212))}>
                <div className="tm-add">
                  <Sparkles size={14} style={{ color: "var(--accent-bright)" }} />
                  <span className="tx">
                    re-cut vocal <span className="hl">!high</span> <span className="hl">due fri</span>
                  </span>
                </div>
                <div className="tm-row">
                  <span className="pd" style={{ background: "var(--accent-bright)" }} />
                  <span className="tx">Re-cut lead vocal, chorus 2</span>
                  <span className="due">Thu</span>
                  <span className="ck" />
                </div>
                <div className="tm-row">
                  <span className="pd" style={{ background: "var(--fg-2)" }} />
                  <span className="tx">Layer room mics on the bridge</span>
                  <span className="ck" />
                </div>
                <div className="tm-row done">
                  <span className="pd" style={{ background: "var(--fg-3)" }} />
                  <span className="tx">Automate the pad swell</span>
                  <span className="ck">
                    <Check size={12} />
                  </span>
                </div>
              </div>
            </div>

            {/* 3 versions */}
            <div className="feat">
              <div className="feat-text">
                <div className="num">03</div>
                <h3>Every take, kept and named.</h3>
                <p>
                  New mix? It stacks as the next version and becomes current automatically. The whole history
                  stays one tap away, and the song's progress is always on the wall.
                </p>
                <div className="feat-list">
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Automatic versioning on every upload
                  </div>
                  <div className="fi">
                    <Check size={15} className="ck" />
                    One link to share a listening room
                  </div>
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Stage meter from idea to release prep
                  </div>
                </div>
              </div>
              <div className="feat-mock glass" style={paletteStyle(palette(152))}>
                <div className="mock-head">
                  <span className="mh-l">Understory · versions</span>
                  <StageMeter status="writing" label={false} />
                </div>
                <div className="vm-row">
                  <span className="vt">v3</span>
                  <span className="vn">understory_mix-b</span>
                  <span className="vc">current</span>
                </div>
                <div className="vm-row">
                  <span className="vt">v2</span>
                  <span className="vn">understory_rough</span>
                  <span className="vd">may 28</span>
                </div>
                <div className="vm-row">
                  <span className="vt">v1</span>
                  <span className="vn">voice-memo</span>
                  <span className="vd">may 11</span>
                </div>
                <div className="vm-share">
                  <Share2 size={15} style={{ color: "var(--accent-bright)" }} />
                  <span className="lk">sessions.fm/s/u7x2a9</span>
                  <span className="cp">Copy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* quote */}
        <div className="lp-wrap lp-quote">
          <blockquote>
            "I stopped losing songs in voice-memo hell. Now an idea has somewhere to live until it's actually
            finished."
          </blockquote>
          <div className="qby">
            <Avatar ch="J" s={32} />
            <div style={{ textAlign: "left" }}>
              <div className="qn">Jonah Reyes</div>
              <div className="qr">producer · 4× release on Sessions</div>
            </div>
          </div>
        </div>

        {/* final */}
        <div className="lp-wrap lp-final">
          <h2>Finish the song.</h2>
          <p>Your next record is one quiet room away.</p>
          <span className="lp-cta lp-cta-lg" onClick={start} style={{ height: 50, padding: "0 26px", fontSize: 15 }}>
            Start free
            <ArrowRight size={16} />
          </span>
        </div>

        <footer className="lp-foot">
          <div className="fin">
            <div className="fl">
              <span className="dot" style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--accent-bright)" }} />
              <b>Sessions</b>
            </div>
            <div className="fr">
              <a>Product</a>
              <a>For bands</a>
              <a>Changelog</a>
              <a>Privacy</a>
            </div>
            <div className="cc">© 2026 Sessions</div>
          </div>
        </footer>
      </div>
    </SessionsShell>
  );
}
