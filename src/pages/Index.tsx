import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { SessionsLogo } from "@/components/SessionsLogo";
import { ArrowRight, PlayCircle, Check, Infinity, Disc3, Waves, MessageCircle } from "lucide-react";

const stagger = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Index = () => {
  const { user, loading } = useAuth();
  const primaryCta = user ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Ambient Background - matching SongDetail */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/8 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-violet-500/5 blur-[120px]" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      {/* Header - Glass style */}
      <header className="sticky top-0 z-30 relative overflow-hidden">
        <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <SessionsLogo subtitle="Studio Console" to="/" />
          {!loading && (
            <div className="flex items-center gap-4">
              {!user && (
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign in
                </Link>
              )}
              <Link
                to={primaryCta}
                className="px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-all"
              >
                {user ? "Go to dashboard" : "Start Session"}
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center py-16 lg:py-24">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="space-y-8">
            <motion.div variants={stagger} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Disc3 className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-xs font-mono text-muted-foreground">No more Song_v3_Final_REAL.mp3</span>
            </motion.div>
            <motion.h1
              variants={stagger}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight bg-gradient-to-b from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent"
              style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}
            >
              Your music. <br />
              Mastered.
            </motion.h1>
            <motion.p variants={stagger} className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
              The operating system for modern producers. Manage versions, feedback, and tasks in a workspace that feels as good as your studio looks.
            </motion.p>
            <motion.div variants={stagger} className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Link
                to={primaryCta}
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-foreground text-background font-medium text-base hover:bg-foreground/90 transition-all shadow-lg shadow-white/5"
              >
                Start Session
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors backdrop-blur-sm"
              >
                <PlayCircle className="h-5 w-5" />
                Listen to demo
              </button>
            </motion.div>
            <motion.div
              variants={stagger}
              className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-[0.2em]"
            >
              <span>Mix versioning</span>
              <span className="h-[1px] w-8 bg-white/10" />
              <span>Timeline notes</span>
              <span className="h-[1px] w-8 bg-white/10" />
              <span>Secure sharing</span>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Glass Console Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-80px" }}
            className="relative h-full"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
              {/* Glass background */}
              <div className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-3xl" />
              <div className="absolute inset-[1px] rounded-3xl border border-white/[0.08]" />
              
              {/* Glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-primary/20 blur-[80px] opacity-50" />
              
              {/* Content */}
              <div className="absolute inset-6 flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-primary/60" />
                    <div className="h-2 w-24 rounded-full bg-white/10" />
                  </div>
                  
                  {/* Version pills */}
                  <div className="flex gap-2">
                    {["v3", "v2", "v1"].map((v, i) => (
                      <div 
                        key={v}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-mono ${
                          i === 0 
                            ? "bg-primary/20 border border-primary/30 text-primary" 
                            : "bg-white/5 border border-white/10 text-white/40"
                        }`}
                      >
                        {v}
                      </div>
                    ))}
                  </div>
                  
                  {/* Waveform preview */}
                  <div className="h-20 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center gap-1 px-4">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-gradient-to-t from-primary/40 to-primary/80"
                        style={{ 
                          height: `${Math.sin(i * 0.3) * 30 + 35}%`,
                          opacity: i < 20 ? 1 : 0.3
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Timeline notes */}
                  <div className="space-y-2">
                    {[
                      { time: "1:42", note: "Fix the hi-hat here" },
                      { time: "2:15", note: "Louder kick" },
                    ].map((item) => (
                      <div key={item.time} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <span className="text-[10px] font-mono text-primary/70">{item.time}</span>
                        <span className="text-xs text-white/50">{item.note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating glass player */}
                <div className="relative">
                  <div className="absolute -inset-6 bg-white/5 blur-xl opacity-40" />
                  <div className="relative h-16 rounded-full bg-[#09090b]/90 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 flex items-center px-5 gap-4">
                    <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="h-[3px] w-full bg-white/10 rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-foreground/80 to-primary/40 w-1/2 rounded-full" />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-muted-foreground/50">
                        <span>01:12</span>
                        <span>03:47</span>
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full border border-white/15 flex items-center justify-center text-muted-foreground/50">
                      <Infinity className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 font-mono mb-4">Core Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}>
              Stop texting MP3s to yourself.
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Disc3,
                title: "Version Roller",
                description: "Stack every mix version in one slot. Compare instantly, delete the bad ones.",
              },
              {
                icon: MessageCircle,
                title: "Timeline Notes",
                description: "Drop notes at exact timestamps. Every comment locked to the second.",
              },
              {
                icon: Waves,
                title: "Public Sharing",
                description: "Send secure, branded links. Premium player, no login required.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm h-full">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                    <feature.icon className="w-5 h-5 text-primary/70" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Old way */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-8 space-y-5"
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/50">The old way</p>
              <div className="space-y-3">
                {["Song_v3_FINAL_REAL.mp3", "Mix-v3-FINAL-(1).mp3", "voice-note-1120.m4a"].map((item) => (
                  <div key={item} className="flex items-center justify-between text-muted-foreground">
                    <span className="text-sm font-mono">{item}</span>
                    <span className="text-[10px] text-destructive/50">Lost?</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground/60 italic pt-4 border-t border-white/5">
                "Where's the mix with the louder kick?"
              </p>
            </motion.div>

            {/* Sessions way */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 p-8 space-y-5 shadow-2xl shadow-black/40"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-primary/15 blur-[60px] opacity-50" />
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary/60 relative">The Sessions way</p>
              <div className="space-y-4 relative">
                {[
                  { title: "Mix 07 – Sparkle", meta: "Timestamps + notes" },
                  { title: "Mix 08 – Club", meta: "A/B vs. ref track" },
                  { title: "Vocal comp", meta: "Linked to lyrics" },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground/50 font-mono">{item.meta}</p>
                    </div>
                    <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/[0.08] p-8 md:p-12 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-primary/10 blur-[80px] opacity-40" />
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/50 mb-6 relative">Studio note</p>
            <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed relative">
              "Sessions finally matches how we work. Version stacks, timeline notes, and the floating player mean I never dig through Dropbox again."
            </p>
            <div className="mt-8 flex items-center gap-4 text-sm relative">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10" />
              <div>
                <p className="font-medium">Rhea Park</p>
                <p className="text-muted-foreground/60">Mixer, EchoHaus</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/50 mb-4">Ready?</p>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}>
              Start a Session and keep every mix in flow.
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              One place for versions, notes, and tasks. Built for producers who live in the studio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={primaryCta}
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition-all shadow-lg shadow-white/5"
              >
                {user ? "Resume Session" : "Start Session"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground/40 text-xs">
            Built for producers. Powered by <span className="text-muted-foreground/60 font-medium">Sessions</span>.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
