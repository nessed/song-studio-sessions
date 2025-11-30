import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Song, SongStatus } from "@/lib/types";

export function useSongs(projectId?: string) {
  const { user } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSongs = useCallback(async () => {
    if (!user) {
      setSongs([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("songs")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching songs:", error);
    } else {
      setSongs((data as Song[]) || []);
    }
    setLoading(false);
  }, [user, projectId]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const createSong = async (title: string, projectId?: string): Promise<Song | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("songs")
      .insert({
        user_id: user.id,
        title,
        project_id: projectId || null,
        status: "idea" as SongStatus,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating song:", error);
      return null;
    }

    const newSong = data as Song;
    setSongs((prev) => [newSong, ...prev]);
    return newSong;
  };

  const updateSong = async (id: string, updates: Partial<Omit<Song, "id" | "user_id" | "created_at">>) => {
    const { error } = await supabase.from("songs").update(updates).eq("id", id);

    if (!error) {
      setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    }

    return { error };
  };

  const deleteSong = async (id: string) => {
    const { error } = await supabase.from("songs").delete().eq("id", id);

    if (!error) {
      setSongs((prev) => prev.filter((s) => s.id !== id));
    }

    return { error };
  };

  const uploadCoverArt = async (songId: string, file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/songs/${songId}/cover.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("cover-art")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage.from("cover-art").getPublicUrl(filePath);
    const url = `${data.publicUrl}?t=${Date.now()}`;

    await updateSong(songId, { cover_art_url: url });
    return url;
  };

  const uploadMp3 = async (songId: string, file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/songs/${songId}/demo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("audio")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage.from("audio").getPublicUrl(filePath);
    const url = `${data.publicUrl}?t=${Date.now()}`;

    await updateSong(songId, { mp3_url: url });
    return url;
  };

  return {
    songs,
    loading,
    createSong,
    updateSong,
    deleteSong,
    uploadCoverArt,
    uploadMp3,
    refetch: fetchSongs,
  };
}

export function useSong(id: string | undefined) {
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSong = useCallback(async () => {
    if (!id) {
      setSong(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching song:", error);
    } else {
      setSong(data as Song | null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchSong();
  }, [fetchSong]);

  return { song, loading, setSong, refetch: fetchSong };
}