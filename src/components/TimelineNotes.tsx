import { useEffect, useState, useRef } from "react";
import { useSongNotes } from "@/hooks/useSongNotes";
import { Trash2, X, Send, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import { SongNote } from "@/lib/types";

interface TimelineNotesProps {
  songId: string;
  currentTime: number;
  accentColor?: string | null;
  notes?: SongNote[];
  onCreateNote?: (timestampSeconds: number, body: string) => Promise<SongNote | null>;
  onUpdateNote?: (id: string, body: string) => Promise<{ error: any } | void>;
  onDeleteNote?: (id: string) => Promise<{ error: any } | void>;
  triggerAddTime?: number;
}

export function TimelineNotes({ songId, currentTime, notes: externalNotes, onCreateNote, onUpdateNote, onDeleteNote, triggerAddTime, accentColor }: TimelineNotesProps) {
  const { notes: internalNotes, createNote, updateNote, deleteNote } = useSongNotes(songId);
  const notes = externalNotes ?? internalNotes;
  const addNote = onCreateNote ?? createNote;
  const editNote = onUpdateNote ?? updateNote;
  const removeNote = onDeleteNote ?? deleteNote;
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [editText, setEditText] = useState("");
  const [draftTime, setDraftTime] = useState(currentTime);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof triggerAddTime === "number") {
      setDraftTime(triggerAddTime);
      setIsAdding(true);
      setIsCollapsed(false); // Auto-expand when adding
      // Small delay to ensure render
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [triggerAddTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAdd = async () => {
    if (!noteText.trim() || !addNote) return;
    await addNote(draftTime, noteText.trim());
    setNoteText("");
    setIsAdding(false);
  };

  const handleUpdate = async () => {
    if (!editingId || !editText.trim() || !editNote) return;
    await editNote(editingId, editText.trim());
    setEditingId(null);
    setEditText("");
  };

  const handleSeek = (timestamp: number) => {
    const audio = document.querySelector("audio");
    if (audio) {
      audio.currentTime = timestamp;
      audio.play();
    }
  };

  // If no notes and not adding, don't show anything (to keep UI clean)
  if (notes.length === 0 && !isAdding) return null;

  return (
    <div className={`w-full max-w-sm ml-8 mb-2 transition-all duration-300 ease-in-out ${isCollapsed ? 'translate-y-[calc(100%-44px)]' : ''}`}>
       {/* Glass Container */}
       <div className="bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[300px]">
          
          {/* Header */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between w-full hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2">
               <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                 Session Notes
               </h4>
               <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                 {notes.length}
               </span>
            </div>
            {isCollapsed ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
          </button>

          {/* Notes List */}
          {!isCollapsed && (
             <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
             {notes.length === 0 && isAdding && (
                <div className="text-center py-4 text-xs text-white/20 italic">
                   New note at {formatTime(draftTime)}...
                </div>
             )}

             {notes.map((note) => (
                <div 
                  key={note.id} 
                  onClick={() => handleSeek(note.timestamp_seconds)}
                  className="group flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer relative"
                >
                   {/* Timestamp */}
                   <div 
                      className="flex-shrink-0 px-1.5 py-0.5 rounded bg-white/5 border border-white/5 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-colors"
                   >
                      <span className="text-[10px] font-mono text-white/50 group-hover:text-emerald-400 block tabular-nums">
                        {formatTime(note.timestamp_seconds)}
                      </span>
                   </div>
                   
                   {/* Body or Edit Form */}
                   {editingId === note.id ? (
                      <div className="flex-1 space-y-2">
                        <textarea
                          ref={editInputRef}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                               e.preventDefault();
                               handleUpdate();
                            }
                            if(e.key === 'Escape') setEditingId(null);
                          }}
                          className="w-full bg-black/40 text-xs text-white p-2 rounded border border-white/20 focus:border-emerald-500/50 outline-none resize-none"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleUpdate(); }}
                            className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"
                          >
                            Save
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                            className="text-[10px] px-2 py-1 text-white/40 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                   ) : (
                      <div className="flex-1 pt-0.5">
                         {/* Author Label */}
                         <div className="text-[9px] font-bold uppercase tracking-wider text-white/30 mb-0.5">
                            {note.guest_name || "Creator"}
                         </div>
                         <p className="text-xs text-white/80 leading-relaxed group-hover:text-white break-words">
                            {note.body}
                         </p>
                      </div>
                   )}

                   {/* Actions */}
                   {editingId !== note.id && (
                     <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-[#09090b] shadow-xl p-1 rounded-md border border-white/10">
                        <button
                          onClick={(e) => {
                             e.stopPropagation();
                             setEditingId(note.id);
                             setEditText(note.body);
                          }}
                          className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
                        >
                           <Pencil className="w-3 h-3" />
                        </button>
                        <button
                           onClick={(e) => {
                              e.stopPropagation();
                              removeNote(note.id);
                           }}
                           className="p-1 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        >
                           <Trash2 className="w-3 h-3" />
                        </button>
                     </div>
                   )}
                </div>
             ))}

             {/* Inline Add Form */}
             {isAdding && (
                <div className="mt-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl animation-fade-in relative">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase text-emerald-500 tracking-wider">
                         Add at {formatTime(draftTime)}
                      </span>
                      <button onClick={() => setIsAdding(false)} className="text-white/20 hover:text-white">
                         <X className="w-3 h-3" />
                      </button>
                   </div>
                   
                   <textarea
                      ref={inputRef}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      onKeyDown={(e) => {
                         if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAdd();
                         }
                      }}
                      placeholder="Type your note..."
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/20 resize-none focus:outline-none min-h-[60px]"
                   />
                   
                   <div className="flex justify-end mt-2">
                      <button
                         onClick={handleAdd}
                         disabled={!noteText.trim()}
                         className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold uppercase disabled:opacity-50 hover:bg-emerald-400 transition-colors"
                      >
                         <span>Save Note</span>
                         <Send className="w-3 h-3" />
                      </button>
                   </div>
                </div>
             )}
          </div>
          )}
       </div>
    </div>
  );
}
