import { useEffect, useState } from "react";
import { useSongNotes } from "@/hooks/useSongNotes";
import { Trash2 } from "lucide-react";
import { SongNote } from "@/lib/types";

interface TimelineNotesProps {
  songId: string;
  currentTime: number;
  notes?: SongNote[];
  onCreateNote?: (timestampSeconds: number, body: string) => Promise<SongNote | null>;
  onDeleteNote?: (id: string) => Promise<{ error: any } | void>;
  triggerAddTime?: number;
}

export function TimelineNotes({ songId, currentTime, notes: externalNotes, onCreateNote, onDeleteNote, triggerAddTime }: TimelineNotesProps) {
  const { notes: internalNotes, createNote, deleteNote } = useSongNotes(songId);
  const notes = externalNotes ?? internalNotes;
  const addNote = onCreateNote ?? createNote;
  const removeNote = onDeleteNote ?? deleteNote;
  const [isAdding, setIsAdding] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [draftTime, setDraftTime] = useState(currentTime);

  useEffect(() => {
    if (typeof triggerAddTime === "number") {
      setDraftTime(triggerAddTime);
      setIsAdding(true);
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

  const handleSeek = (timestamp: number) => {
    // Find the audio element and seek
    const audio = document.querySelector("audio") as HTMLAudioElement & { seekTo?: (time: number) => void };
    if (audio?.seekTo) {
      audio.seekTo(timestamp);
    } else if (audio) {
      audio.currentTime = timestamp;
      audio.play();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Timeline Notes
        </h4>
      </div>

      {isAdding && (
        <div className="mb-4 p-3 bg-card/50 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="timestamp-chip">{formatTime(draftTime)}</span>
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add your note..."
            rows={2}
            autoFocus
            className="w-full text-sm bg-transparent border-none resize-none focus:outline-none placeholder:text-muted-foreground"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setIsAdding(false);
                setNoteText("");
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!noteText.trim()}
              className="text-xs text-foreground font-medium disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {notes.length > 0 ? (
        <div className="space-y-1">
          {notes.map((note) => (
            <div key={note.id} className="timeline-note group" onClick={() => handleSeek(note.timestamp_seconds)}>
              <button className="timestamp-chip flex-shrink-0">
                {formatTime(note.timestamp_seconds)}
              </button>
              <p className="flex-1 text-sm">{note.body}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNote(note.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        !isAdding && (
          <p className="text-sm text-muted-foreground">
            No notes yet. Add one while listening!
          </p>
        )
      )}
    </div>
  );
}
