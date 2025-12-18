import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { SongNote } from "@/lib/types";

export function useSongNotes(songId: string | undefined) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<SongNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!songId || !user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("song_notes")
      .select("*")
      .eq("song_id", songId)
      .order("timestamp_seconds", { ascending: true });

    if (error) {
      console.error("Error fetching notes:", error);
    } else {
      setNotes((data as SongNote[]) || []);
    }
    setLoading(false);
  }, [songId, user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = async (timestampSeconds: number, body: string): Promise<SongNote | null> => {
    if (!songId || !user) return null;

    const { data, error } = await supabase
      .from("song_notes")
      .insert({
        song_id: songId,
        user_id: user.id,
        timestamp_seconds: timestampSeconds,
        body,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating note:", error);
      return null;
    }

    const newNote = data as SongNote;
    setNotes((prev) => [...prev, newNote].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds));
    return newNote;
  };

  const updateNote = async (id: string, body: string) => {
    const { error } = await supabase
      .from("song_notes")
      .update({ body })
      .eq("id", id);

    if (!error) {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, body } : n))
      );
    }
    return { error };
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from("song_notes").delete().eq("id", id);

    if (!error) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }

    return { error };
  };

  return { notes, loading, createNote, updateNote, deleteNote, refetch: fetchNotes };
}