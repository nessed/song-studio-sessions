import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Song, SongVersion, SongNote } from "@/lib/types";
import { AudioPlayer } from "@/components/AudioPlayer";
import { SessionsLogo } from "@/components/SessionsLogo";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AlertCircle, Clock, Music2, MessageCircle, ChevronDown, ArrowRight } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { TimelineNotes } from "@/components/TimelineNotes";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SharedSongView() {
  const { hash } = useParams<{ hash: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [versions, setVersions] = useState<SongVersion[]>([]);
  const [notes, setNotes] = useState<SongNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [addNoteTrigger, setAddNoteTrigger] = useState<number | undefined>(undefined);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    async function fetchSharedSong() {
      if (!hash) {
        setError("Missing share link");
        setLoading(false);
        return;
      }

      // 1. Fetch Song
      const { data: songData, error: songError } = await supabase
        .from("songs")
        .select("*")
        .eq("share_hash", hash)
        .eq("is_public", true)
        .single();

      if (songError || !songData) {
        console.error(songError);
        setError("Song not found or access denied.");
        setLoading(false);
        return;
      }

      setSong(songData as Song);

      // 2. Fetch Versions
      const { data: versionsData } = await supabase
        .from("song_versions")
        .select("*")
        .eq("song_id", songData.id)
        .order("version_number", { ascending: false });

      if (versionsData) {
        setVersions(versionsData as SongVersion[]);
        const current = versionsData.find((v: any) => v.is_current) || versionsData[0];
        if (current) setActiveVersionId(current.id);
      }

      // 3. Fetch Notes
      const { data: notesData } = await supabase
        .from("song_notes")
        .select("*")
        .eq("song_id", songData.id)
        .order("timestamp_seconds", { ascending: true });

      if (notesData) {
        setNotes(notesData as SongNote[]);
      }

      setLoading(false);
    }

    fetchSharedSong();
  }, [hash]);

  const handleCreateGuestNote = async (timestamp: number, body: string) => {
    if (!song) return null;

    let guestName = localStorage.getItem("sessions-guest-name");
    if (!guestName) {
      guestName = prompt("Enter your name to leave feedback:");
      if (!guestName) return null;
      localStorage.setItem("sessions-guest-name", guestName);
    }

    const { data, error } = await supabase
      .from("song_notes")
      .insert({
        song_id: song.id,
        timestamp_seconds: timestamp,
        body: body,
        guest_name: guestName,
        user_id: null
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to post note. Try again.");
      console.error(error);
      return null;
    }

    const newNote = data as SongNote;
    setNotes(prev => [...prev, newNote].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds));
    toast.success("Feedback added!");
    return newNote;
  };

  const activeVersion = versions.find(v => v.id === activeVersionId) || versions[0];
  const audioSrc = activeVersion?.file_url || song?.mp3_url;

  if (loading) return <LoadingScreen />;

  if (error || !song) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white p-6">
        <AlertCircle className="w-16 h-16 text-red-500/60 mb-6" />
        <h1 className="text-3xl font-bold mb-3 tracking-tight">Access Denied</h1>
        <p className="text-white/40 mb-8 text-center max-w-md">{error || "This song doesn't exist or is no longer shared."}</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all"
        >
          Go to Sessions
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-emerald-500/8 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-violet-500/5 blur-[120px]" />
      </div>
      
      {/* Cover Art Glow - Dynamic */}
      {song.cover_art_url && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] blur-[100px] opacity-30 saturate-150"
            style={{ 
              backgroundImage: `url(${song.cover_art_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
      )}

      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between bg-[#09090b]/70 backdrop-blur-2xl sticky top-0 z-30 border-b border-white/[0.04]">
        <div className="flex items-center gap-4">
          <div className="opacity-70 hover:opacity-100 transition-opacity">
            <SessionsLogo to="/" />
          </div>
          <div className="h-5 w-px bg-white/10" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live Preview</span>
          </div>
        </div>
        <Link 
          to="/auth" 
          className="inline-flex items-center gap-2 text-sm font-semibold bg-white text-black px-5 py-2.5 rounded-full hover:bg-white/90 transition-all shadow-lg shadow-white/10"
        >
          Create Your Own
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 py-12 md:py-16 relative z-10">
        <div className="w-full max-w-3xl space-y-12">

          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            {/* Cover Art */}
            {song.cover_art_url ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative mx-auto w-56 h-56 md:w-64 md:h-64"
              >
                {/* Glow */}
                <div 
                  className="absolute -inset-6 rounded-3xl blur-2xl opacity-50"
                  style={{ 
                    backgroundImage: `url(${song.cover_art_url})`,
                    backgroundSize: "cover",
                  }}
                />
                {/* Image */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
                  <img src={song.cover_art_url} alt={song.title} className="w-full h-full object-cover" />
                </div>
              </motion.div>
            ) : (
              <div className="mx-auto w-56 h-56 md:w-64 md:h-64 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                <Music2 className="w-16 h-16 text-white/10" />
              </div>
            )}

            {/* Title & Meta */}
            <div className="space-y-3">
              <h1 
                className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {song.title}
              </h1>
              <div className="flex items-center justify-center gap-4 text-sm text-white/40">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDistanceToNow(new Date(song.created_at), { addSuffix: true })}
                </span>
                {notes.length > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {notes.length} note{notes.length !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Metadata Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {/* Version Selector */}
              {versions.length > 0 && (
                <button 
                  onClick={() => versions.length > 1 && setShowVersions(!showVersions)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold transition-all ${versions.length > 1 ? 'hover:bg-white/10 cursor-pointer' : ''}`}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-white/70">v{activeVersion?.version_number || 1}</span>
                  {activeVersion?.description && (
                    <span className="text-white/40">· {activeVersion.description}</span>
                  )}
                  {versions.length > 1 && (
                    <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${showVersions ? 'rotate-180' : ''}`} />
                  )}
                </button>
              )}
              {song.bpm && (
                <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/50">
                  {song.bpm} BPM
                </span>
              )}
              {song.key && (
                <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/50">
                  {song.key}
                </span>
              )}
              {song.mood_tags?.length > 0 && song.mood_tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/50">
                  {tag}
                </span>
              ))}
            </div>

            {/* Version Dropdown */}
            {showVersions && versions.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 mx-auto max-w-sm bg-[#0c0c0f]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
              >
                {versions.map((ver) => (
                  <button
                    key={ver.id}
                    onClick={() => {
                      setActiveVersionId(ver.id);
                      setShowVersions(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 transition-all ${
                      activeVersionId === ver.id 
                        ? "bg-emerald-500/10 text-white" 
                        : "hover:bg-white/5 text-white/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        activeVersionId === ver.id ? "bg-emerald-500 text-black" : "bg-white/10 text-white/40"
                      }`}>
                        {ver.version_number}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">{ver.description || `Version ${ver.version_number}`}</div>
                        <div className="text-[10px] text-white/30">
                          {formatDistanceToNow(new Date(ver.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    {activeVersionId === ver.id && (
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Playing</div>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Lyrics Section */}
          {song.lyrics && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 text-center">Lyrics</h3>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 md:p-8">
                <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans leading-relaxed max-h-80 overflow-y-auto scrollbar-thin">
                  {song.lyrics}
                </pre>
              </div>
            </motion.div>
          )}

          {/* Feedback CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-6"
          >
            <p className="text-xs text-white/30">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 text-white/50 font-medium mr-1">Double-click</span>
              on the waveform to add timestamped feedback
            </p>
          </motion.div>

        </div>
      </main>

      {/* Audio Player */}
      {audioSrc && (
        <AudioPlayer
          src={audioSrc}
          timelineNotes={notes}
          onTimeUpdate={setCurrentTime}
          onRequestAddNote={(time) => setAddNoteTrigger(time)}
          notesComponent={
            <TimelineNotes
              songId={song.id}
              currentTime={currentTime}
              notes={notes}
              onCreateNote={handleCreateGuestNote}
              triggerAddTime={addNoteTrigger}
              onUpdateNote={async () => { toast.error("Guest editing not allowed"); }}
              onDeleteNote={async () => { toast.error("Guest deletion not allowed"); }}
            />
          }
        />
      )}

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-white/[0.04]">
        <p className="text-white/20 text-xs">
          Shared via <span className="text-white/50 font-semibold">Sessions</span> — The OS for modern producers
        </p>
      </footer>
    </div>
  );
}
