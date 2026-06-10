import { CSSProperties, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, Check, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SessionsShell } from "@/components/sessions/Room";
import { CoverArt } from "@/components/sessions/CoverArt";
import { StageMeter } from "@/components/sessions/StageMeter";
import { Avatar } from "@/components/sessions/Avatar";
import { Reveal } from "@/components/sessions/Reveal";
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

const d = (s: number) => ({ "--d": `${s}s` } as CSSProperties);

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
  const start = () => navigate(user ? "/projects" : "/auth");
  const signIn = () => navigate("/auth");
  const nm = useMemo(() => buildWave(58, 44), []);

  return (
    <SessionsShell vars={palette(58)}>
      <div className="lp">
        <nav className="lp-nav drop" style={d(0)}>
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
              <div className="kicker rise" style={d(0.05)}>For people who make music together</div>
              <h1 className="lp-h1 rise" style={d(0.12)}>
                Everything that goes into a song,
                <br />
                in <span className="em">one place.</span>
              </h1>
              <p className="lp-sub rise" style={d(0.2)}>
                Making a song means juggling recordings, lyrics, edits, feedback and a dozen versions across
                your phone, Dropbox, Docs and chats. Sessions puts all of it in one workspace, tracks how far
                along each song is, and lets the people you work with leave feedback on the exact spot they mean.
              </p>
              <div className="lp-actions rise" style={d(0.28)}>
                <span className="lp-cta lp-cta-lg" onClick={start}>
                  Start your first song
                  <ArrowRight size={16} />
                </span>
                <span className="lp-ghost" onClick={start}>
                  <Play size={15} />
                  See how it works
                </span>
              </div>
              <div className="lp-trust rise" style={d(0.36)}>
                <span className="tdot" />
                <span className="l">No card needed. Set up a song in under a minute.</span>
              </div>
            </div>

            <div className="lp-shot rise" style={d(0.18)}>
              <div className="cover-frame">
                <CoverArt song={HERO} hue={HERO.hue} radius={18} />
              </div>
              <div className="float-note glass bob">
                <div className="fn-top">
                  <span className="fn-ts">0:42</span>
                  <span className="guest-badge">guest</span>
                  <span className="fn-who">Mara</span>
                </div>
                <div className="fn-text">love this harmony stack — keep it</div>
              </div>
              <div className="float-player bob2">
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
            <Reveal className="lp-stat" delay={0}>
              <div className="n">
                Every stage <span className="em">tracked</span>
              </div>
              <div className="l">see what's done and what's left</div>
            </Reveal>
            <Reveal className="lp-stat" delay={0.08}>
              <div className="n">
                One <span className="em">workspace</span>
              </div>
              <div className="l">recordings, lyrics, feedback, versions</div>
            </Reveal>
            <Reveal className="lp-stat" delay={0.16}>
              <div className="n">
                Notes on the <span className="em">second</span>
              </div>
              <div className="l">no more "the part around 1:20"</div>
            </Reveal>
          </div>
        </div>

        {/* rooms band */}
        <div className="lp-rooms">
          <div className="lp-wrap">
            <Reveal className="lp-sechead">
              <div className="kicker">The idea</div>
              <h2>Always know what's left.</h2>
              <p>
                Every song moves through clear stages, from first idea to finished. Sessions shows you exactly
                where each one is, so you can look at your whole project and instantly see what's done and what
                still needs work.
              </p>
            </Reveal>
            <div className="rooms-strip">
              {ROOMS.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.07}>
                  <div className="room-cell" style={paletteStyle(palette(s.hue))}>
                    <CoverArt song={s} hue={s.hue} radius={13} />
                    <div className="rc-meta">
                      <div className="rc-title">{s.title}</div>
                      <div className="rc-stage">
                        <StageMeter status={s.status} label={false} />
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* features */}
        <div className="lp-wrap">
          <div className="lp-features">
            {/* 1 notes */}
            <div className="feat">
              <Reveal className="feat-text" from="left">
                <div className="num">01</div>
                <h3>Point to the exact moment you mean.</h3>
                <p>
                  Stop describing the second you mean. Click that spot in the song, leave a note right there,
                  and share one link. Anyone can listen and reply without making an account.
                </p>
                <div className="feat-list">
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Comments pinned to the exact second
                  </div>
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Share with one link, no sign-up for guests
                  </div>
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Everyone stays on the same up-to-date version
                  </div>
                </div>
              </Reveal>
              <Reveal className="feat-mock glass" from="right" delay={0.08} style={paletteStyle(palette(58))}>
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
              </Reveal>
            </div>

            {/* 2 tasks */}
            <div className="feat rev">
              <Reveal className="feat-text" from="right">
                <div className="num">02</div>
                <h3>A to-do list that understands the work.</h3>
                <p>
                  Write a task the way you'd say it, like "redo the vocals by Friday," and Sessions sorts it
                  into the right stage automatically, sitting right next to the song it belongs to.
                </p>
                <div className="feat-list">
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Plain language, like "redo vocals by Friday"
                  </div>
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Sorted into the right stage for you
                  </div>
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Lives next to the song, never in the way
                  </div>
                </div>
              </Reveal>
              <Reveal className="feat-mock glass" from="left" delay={0.08} style={paletteStyle(palette(212))}>
                <div className="tm-add">
                  <span className="tx">
                    re-cut vocal <span className="hl">!high</span> <span className="hl">due fri</span>
                  </span>
                  <span className="mh-l" style={{ marginLeft: "auto" }}>⏎</span>
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
              </Reveal>
            </div>

            {/* 3 versions */}
            <div className="feat">
              <Reveal className="feat-text" from="left">
                <div className="num">03</div>
                <h3>Never lose a version again.</h3>
                <p>
                  Every time you save a new edit, Sessions keeps the old one and makes the new one current. The
                  full history is one click away, so nobody ever works off the wrong file.
                </p>
                <div className="feat-list">
                  <div className="fi">
                    <Check size={15} className="ck" />
                    Old versions saved automatically
                  </div>
                  <div className="fi">
                    <Check size={15} className="ck" />
                    One link to share the latest version
                  </div>
                  <div className="fi">
                    <Check size={15} className="ck" />
                    See each song's progress at a glance
                  </div>
                </div>
              </Reveal>
              <Reveal className="feat-mock glass" from="right" delay={0.08} style={paletteStyle(palette(152))}>
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
              </Reveal>
            </div>
          </div>
        </div>

        {/* quote */}
        <div className="lp-wrap lp-quote">
          <Reveal>
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
          </Reveal>
        </div>

        {/* final */}
        <div className="lp-wrap lp-final">
          <Reveal>
            <h2>Finish the song.</h2>
            <p>One place to start an idea, work on it with others, and actually get it done.</p>
            <span className="lp-cta lp-cta-lg" onClick={start} style={{ height: 50, padding: "0 26px", fontSize: 15 }}>
              Start free
              <ArrowRight size={16} />
            </span>
          </Reveal>
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
