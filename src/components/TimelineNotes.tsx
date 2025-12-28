import { useEffect, useState, useRef } from "react";
import { useSongNotes } from "@/hooks/useSongNotes";
import { Trash2, X, Send, Pencil, MessageCircle } from "lucide-react";
import { SongNote } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

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

export function TimelineNotes({ 
  songId, 
  currentTime, 
  notes: externalNotes, 
  onCreateNote, 
  onUpdateNote, 
  onDeleteNote, 
  triggerAddTime 
}: TimelineNotesProps) {
  const { notes: internalNotes, createNote, updateNote, deleteNote } = useSongNotes(songId);
  const notes = externalNotes ?? internalNotes;
  const addNote = onCreateNote ?? createNote;
  const editNote = onUpdateNote ?? updateNote;
  const removeNote = onDeleteNote ?? deleteNote;
  
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [editText, setEditText] = useState("");
  const [draftTime, setDraftTime] = useState(currentTime);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Auto-trigger add when parent requests
  useEffect(() => {
    if (typeof triggerAddTime === "number") {
      setDraftTime(triggerAddTime);
      setIsAdding(true);
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [triggerAddTime]);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsAdding(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

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

  const startAdd = () => {
    setDraftTime(currentTime);
    setIsAdding(true);
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div ref={popoverRef} className="relative">
      {/* Compact Badge/Button */}
      <button
        onClick={() => notes.length > 0 ? setIsOpen(!isOpen) : startAdd()}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
          isOpen 
            ? "bg-violet-500/20 border-violet-500/40 text-violet-400" 
            : notes.length > 0 
              ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white" 
              : "bg-white/5 border-dashed border-white/20 text-white/40 hover:bg-white/10 hover:text-white hover:border-white/30"
        }`}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {notes.length > 0 ? (
          <span className="text-[10px] font-bold tabular-nums">{notes.length}</span>
        ) : (
          <span className="text-[10px] font-medium">Add Note</span>
        )}
      </button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 right-0 w-72 bg-[#0c0c0f]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Notes ({notes.length})
              </span>
              <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white p-1">
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Notes List */}
            <div className="max-h-48 overflow-y-auto">
              {notes.length === 0 && !isAdding && (
                <div className="text-center py-6 text-xs text-white/20">
                  No notes yet
                </div>
              )}

              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleSeek(note.timestamp_seconds)}
                  className="group flex items-start gap-2 px-3 py-2 hover:bg-white/5 border-b border-white/5 last:border-0 cursor-pointer"
                >
                  {/* Timestamp */}
                  <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
                    {formatTime(note.timestamp_seconds)}
                  </span>

                  {/* Content */}
                  {editingId === note.id ? (
                    <div className="flex-1 flex gap-1">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-black/40 text-xs text-white px-2 py-1 rounded border border-white/20 focus:border-violet-500/50 outline-none"
                        autoFocus
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdate(); }}
                        className="text-violet-400 hover:text-violet-300 px-1"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/80 leading-relaxed break-words">{note.body}</p>
                        {note.guest_name && (
                          <span className="text-[9px] text-white/30">— {note.guest_name}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(note.id);
                            setEditText(note.body);
                          }}
                          className="p-1 text-white/40 hover:text-white"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNote(note.id);
                          }}
                          className="p-1 text-white/40 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add Form */}
            {isAdding ? (
              <div className="p-3 border-t border-white/5 bg-violet-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono text-violet-400 bg-violet-500/20 px-1.5 py-0.5 rounded">
                    {formatTime(draftTime)}
                  </span>
                  <span className="text-[10px] text-white/30">Adding note...</span>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdd();
                      if (e.key === "Escape") setIsAdding(false);
                    }}
                    placeholder="Type your note..."
                    className="flex-1 bg-black/40 text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:border-violet-500/50 outline-none placeholder:text-white/20"
                  />
                  <button
                    onClick={handleAdd}
                    disabled={!noteText.trim()}
                    className="px-3 py-2 rounded-lg bg-violet-500 text-white text-xs font-bold disabled:opacity-50 hover:bg-violet-400 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={startAdd}
                className="w-full px-3 py-2.5 border-t border-white/5 text-[10px] font-medium text-white/40 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <span>+</span> Add note at {formatTime(currentTime)}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
