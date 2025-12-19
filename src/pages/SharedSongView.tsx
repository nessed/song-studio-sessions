
import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Song, SongVersion, SongNote } from "@/lib/types";
import { AudioPlayer } from "@/components/AudioPlayer";
import { SessionsLogo } from "@/components/SessionsLogo";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Download, Share2, AlertCircle, Clock, Calendar } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { TimelineNotes } from "@/components/TimelineNotes";
import { toast } from "sonner";

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

      // 3. Fetch Notes (Public Policy)
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

    // Get or ask for guest name
    let guestName = localStorage.getItem("sessions-guest-name");
    if (!guestName) {
      guestName = prompt("Please enter your name to leave feedback:");
      if (!guestName) return null; // Cancelled
      localStorage.setItem("sessions-guest-name", guestName);
    }

    const { data, error } = await supabase
      .from("song_notes")
      .insert({
         song_id: song.id,
         timestamp_seconds: timestamp,
         body: body,
         guest_name: guestName,
         user_id: null // Explicitly null for guests
      })
      .select()
      .single();

    if (error) {
       toast.error("Failed to post note. Try again.");
       console.error(error);
       return null;
    }

    const newNote = data as SongNote;
    setNotes(prev => [...prev, newNote].sort((a,b) => a.timestamp_seconds - b.timestamp_seconds));
    toast.success("Feedback added!");
    return newNote;
  };

  const activeVersion = versions.find(v => v.id === activeVersionId) || versions[0];
  const audioSrc = activeVersion?.file_url || song?.mp3_url;

  if (loading) return <LoadingScreen />;

  if (error || !song) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4 opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-white/40 mb-8">{error}</p>
        <Link to="/" className="text-sm font-medium text-emerald-400 hover:underline">
          Go to Sessions Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
      {/* Minimal Header */}
      <header className="px-6 py-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
           <div className="opacity-80 scale-90 origin-left">
              <SessionsLogo to="/" />
           </div>
           <div className="h-4 w-[1px] bg-white/10 mx-2" />
           <span className="text-xs font-mono uppercase tracking-widest text-white/40">Shared View</span>
        </div>
        <Link to="/auth" className="text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
           Get Sessions
        </Link>
      </header>

      {/* Hero / Player Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 flex flex-col gap-12">
        
        {/* Title Area */}
        <div className="text-center space-y-4 animate-fade-in-up">
           {song.cover_art_url && (
              <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10 border border-white/10 mb-6 relative group">
                 <img src={song.cover_art_url} alt={song.title} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
              </div>
           )}
           
           <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 font-syne text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                {song.title}
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                 <Calendar className="w-3 h-3" />
                 <span>Shared {format(new Date(), "MMM d, yyyy")}</span>
              </div>
           </div>

           {/* Tags */}
           <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-white/60 uppercase tracking-wider font-bold">
                 v{activeVersion?.version_number || 1}
              </span>
              {song.bpm && (
                 <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-white/60 uppercase tracking-wider font-bold">
                    {song.bpm} BPM
                 </span>
              )}
              {song.key && (
                 <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-white/60 uppercase tracking-wider font-bold">
                    {song.key}
                 </span>
              )}
           </div>
        </div>

        {/* Player Section - Big & Centered */}
        <div className="w-full space-y-4">
            <div className="w-full bg-[#121214] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-visible group">
               <div className="absolute top-0 right-0 p-40 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
               <div className="relative z-10">
                  {audioSrc ? (
                     <AudioPlayer 
                        src={audioSrc} 
                        timelineNotes={notes}
                        onTimeUpdate={setCurrentTime}
                        onRequestAddNote={(time) => setAddNoteTrigger(time)}
                        noteTray={
                           <TimelineNotes 
                              songId={song.id}
                              currentTime={currentTime}
                              notes={notes}
                              onCreateNote={handleCreateGuestNote}
                              triggerAddTime={addNoteTrigger}
                              // Guests cannot update/delete others' notes usually, but for MVP we might hide it or allow it.
                              // For now, disable update/delete for guests (passing undefined/noop)
                              onUpdateNote={async () => toast.error("Guest editing not allowed")}
                              onDeleteNote={async () => toast.error("Guest deletion not allowed")}
                           />
                        }
                     />
                  ) : (
                     <div className="h-24 flex items-center justify-center text-white/30 italic">No audio file</div>
                  )}
               </div>
            </div>
            
            <p className="text-center text-xs text-white/30 pt-2">
               Tip: Press <span className="text-white/60 font-bold bg-white/10 px-1 rounded">+</span> to add feedback at current time
            </p>
        </div>

        {/* Version History (ReadOnly) */}
        {versions.length > 1 && (
           <div className="max-w-xl mx-auto w-full space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 text-center">Version History</h3>
              <div className="space-y-2">
                 {versions.map((ver) => (
                    <button
                       key={ver.id}
                       onClick={() => setActiveVersionId(ver.id)}
                       className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                          activeVersionId === ver.id 
                          ? "bg-white/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10" 
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                       }`}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                             activeVersionId === ver.id ? "bg-emerald-500 text-black border-emerald-500" : "bg-white/5 text-white/40 border-white/10"
                          }`}>
                             v{ver.version_number}
                          </div>
                          <div className="text-left">
                             <div className={`text-sm font-medium ${activeVersionId === ver.id ? "text-white" : "text-white/70"}`}>
                                {ver.description || "No description"}
                             </div>
                             <div className="text-[10px] font-mono text-white/30 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(ver.created_at), { addSuffix: true })}
                             </div>
                          </div>
                       </div>
                       
                       {activeVersionId === ver.id && (
                          <div className="text-xs font-bold text-emerald-400">PLAYING</div>
                       )}
                    </button>
                 ))}
              </div>
           </div>
        )}

        {/* Footer */}
        <div className="text-center pt-12 pb-6 border-t border-white/5">
           <p className="text-white/20 text-xs">
              Powered by <span className="text-white/60 font-medium">Sessions</span>. The OS for modern producers.
           </p>
        </div>

      </main>
    </div>
  );
}
