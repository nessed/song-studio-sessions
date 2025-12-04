import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { SessionsLogo } from "@/components/SessionsLogo";
import { ArrowRight, PlayCircle, Sparkles, Check, Infinity } from "lucide-react";

const stagger = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Index = () => {
  const { user, loading } = useAuth();

  const primaryCta = user ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-[520px] w-[520px] rounded-full bg-white/5 blur-[140px] opacity-20" />
        <div className="absolute top-1/3 right-[-10%] h-[640px] w-[640px] rounded-full bg-[#4dd0e1]/10 blur-[160px]" />
        <div className="absolute bottom-[-20%] left-1/4 h-[480px] w-[520px] rounded-full bg-[#7c3aed]/10 blur-[180px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#09090b]/40 to-[#09090b]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <SessionsLogo subtitle="Studio Console" to="/" />
        {!loading && (
          <div className="flex items-center gap-4">
            {!user && (
              <Link to="/auth" className="text-sm text-white/60 hover:text-white transition-colors">
                Sign in
              </Link>
            )}
            <Link
              to={primaryCta}
              className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all"
            >
              {user ? "Go to dashboard" : "Start Session"}
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <main className="relative z-10 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center py-12 sm:py-16">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="space-y-8">
            <motion.div variants={stagger} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
              <Sparkles className="h-4 w-4 text-white/70" />
              <span className="text-xs font-mono text-white/60">No more Song_v3_Final_REAL.mp3</span>
            </motion.div>
            <motion.h1
              variants={stagger}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[0.9] tracking-tight"
              style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}
            >
              Your songs. Organized. Finally.
            </motion.h1>
            <motion.p variants={stagger} className="text-lg sm:text-xl text-white/60 max-w-xl leading-relaxed">
              Sessions is the studio console for producers who are done with chaotic folders, lost mix notes, and flat dashboards. Keep every version, reference, and idea flowing in one minimalist space.
            </motion.p>
            <motion.div variants={stagger} className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Link
                to={primaryCta}
                className="inline-flex items-center gap-3 px-7 py-3 rounded-full bg-white text-black font-medium text-base hover:bg-white/90 transition-all"
              >
                Start Session
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-white/80 hover:text-white hover:border-white/30 transition-colors"
              >
                <PlayCircle className="h-5 w-5" />
                Listen to demo
              </button>
            </motion.div>
            <motion.div
              variants={stagger}
              className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/40 uppercase tracking-[0.2em]"
            >
              <span>Mix versioning</span>
              <span className="h-[1px] w-10 bg-white/15" />
              <span>Floating console</span>
              <span className="h-[1px] w-10 bg-white/15" />
              <span>Sonic palette</span>
            </motion.div>
          </motion.div>

          {/* Abstract visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-80px" }}
            className="relative h-full"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/0 to-white/5" />
              <div className="absolute inset-[1px] rounded-3xl border border-white/10" />
              <div className="absolute inset-0 bg-[#0b0b0d]/70 backdrop-blur-3xl" />
              <div className="absolute inset-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="h-3 w-24 rounded-full bg-white/20" />
                  <div className="grid grid-cols-3 gap-3">
                    {[42, 38, 54].map((h, i) => (
                      <div key={i} className="h-28 rounded-2xl bg-gradient-to-b from-white/15 to-white/0 border border-white/10 relative overflow-hidden">
                        <div
                          className="absolute bottom-0 left-0 right-0 mx-2 rounded-xl bg-white/70"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating glass player cue */}
                <div className="relative">
                  <div className="absolute -inset-6 bg-white/5 blur-3xl opacity-40" />
                  <div className="relative h-20 rounded-full bg-[#09090b]/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 flex items-center px-6 gap-5">
                    <div className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="h-[3px] w-full bg-white/10 rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] via-white to-[#4dd0e1] blur-sm opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/30 w-1/2 rounded-full" />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-white/50">
                        <span>01:12</span>
                        <span>03:47</span>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center text-white/70">
                      <Infinity className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Problem section */}
      <section className="relative z-10 px-6 sm:px-10 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40 font-mono">The problem</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}>
              File version hell vs. a studio-grade console.
            </h2>
            <p className="text-white/60 max-w-2xl">
              Demos named “Song_v3_Final_REAL.mp3”, comments lost in group chats, and tasks scattered across tools. Sessions puts every mix, note, and timestamp in one flow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative p-1">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-3xl opacity-50 blur-xl" />
              <div className="relative h-full rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 space-y-5">
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/50">The old way</p>
                <div className="space-y-3">
                  {["Song_v3_FINAL_REAL.mp3", "Mix-v3-FINAL-(1).mp3", "voice-note-1120.m4a", "Lyrics_final.docx"].map((item) => (
                    <div key={item} className="flex items-center justify-between text-white/60">
                      <span className="text-sm">{item}</span>
                      <span className="text-[11px] text-white/30 font-mono">Lost?</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-white/5 text-white/50 text-sm">
                  “Where’s the mix with the louder kick?”
                </div>
              </div>
            </div>
            <div className="relative p-1">
              <div className="absolute inset-0 bg-gradient-to-b from-[#4dd0e1]/20 via-white/10 to-transparent rounded-3xl opacity-60 blur-xl" />
              <div className="relative h-full rounded-3xl border border-white/15 bg-[#09090b]/80 backdrop-blur-2xl p-8 space-y-5 shadow-2xl shadow-black/40">
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/60">The Sessions way</p>
                <div className="space-y-4">
                  {[
                    { title: "Mix 07 – Sparkle", meta: "Timestamps + notes saved" },
                    { title: "Mix 08 – Club", meta: "A/B vs. ref track" },
                    { title: "Vocal comp", meta: "Linked to lyrics" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-[11px] text-white/40 font-mono">{item.meta}</p>
                      </div>
                      <div className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white/80" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-white/5 text-white/70 text-sm">
                  Every version, note, and task locked to the timeline.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature deep dive */}
      <section className="relative z-10 px-6 sm:px-10 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-10 bg-white/20" />
            <p className="text-xs uppercase tracking-[0.25em] text-white/40 font-mono">The moats</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Mix versioning",
                body: "Capture every pass with instant recall, timestamps, and context. Never guess which export the artist loved.",
              },
              {
                title: "Sonic palette",
                body: "Drop in reference tracks, A/B inside the floating player, and keep notes in the exact bar they matter.",
              },
              {
                title: "Floating console",
                body: "A bottom-fixed glass player + note tray that follows you through tasks, lyrics, and feedback.",
              },
            ].map((feature) => (
              <div key={feature.title} className="space-y-3">
                <h3 className="text-xl font-semibold" style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}>
                  {feature.title}
                </h3>
                <p className="text-white/60 leading-relaxed">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="relative z-10 px-6 sm:px-10 pb-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-10 bg-white/20" />
            <p className="text-xs uppercase tracking-[0.25em] text-white/40 font-mono">Trusted by producers</p>
          </div>
          <div className="flex flex-wrap items-center gap-8 text-white/40 text-sm">
            {["Nightshift Audio", "EchoHaus", "Moon Tape", "Studio South"].map((name) => (
              <span key={name} className="tracking-wide">{name}</span>
            ))}
          </div>
          <div className="relative p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/0 to-white/5 rounded-2xl blur-2xl" />
            <div className="relative rounded-2xl border border-white/10 bg-[#09090b]/80 backdrop-blur-2xl p-8 md:p-10 shadow-2xl shadow-black/40">
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-white/50 mb-4">Studio note</p>
              <p className="text-lg text-white/80 leading-relaxed">
                “Sessions finally matches how we work. Version stacks, timeline notes, and the floating player mean I never dig through Dropbox or text threads again.”
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm text-white/50">
                <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/10" />
                <div>
                  <p className="text-white">Rhea Park</p>
                  <p className="text-white/40">Mixer, EchoHaus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 sm:px-10 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/40">Ready?</p>
          <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}>
            Start a Session and keep every mix in flow.
          </h3>
          <p className="text-white/60 max-w-2xl mx-auto">
            One place for versions, notes, timelines, and tasks. Built for producers who live in the studio—no generic dashboards allowed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={primaryCta}
              className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all"
            >
              {user ? "Resume Session" : "Start Session"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/auth"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
