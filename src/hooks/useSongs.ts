import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Song, SongStatus } from "@/lib/types";

export function useSongs(projectId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const songsQueryKey = projectId ? ["songs", user?.id, projectId] : ["songs", user?.id];

  const {
    data: songs = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: songsQueryKey,
    queryFn: async () => {
      if (!user) return [];

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
        throw error;
      }

      return (data as Song[]) || [];
    },
    enabled: !!user,
  });

  const createSongMutation = useMutation({
    mutationFn: async ({ title, projectId }: { title: string; projectId?: string }) => {
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
        throw error;
      }

      return data as Song;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });

  const updateSongMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<Song, "id" | "user_id" | "created_at">> }) => {
      const { error } = await supabase.from("songs").update(updates).eq("id", id);

      if (error) {
        console.error("Error updating song:", error);
        throw error;
      }

      return { error };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["song", id] });
    },
  });

  const deleteSongMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.from("songs").delete().eq("id", id);

      if (error) {
        console.error("Error deleting song:", error);
        throw error;
      }

      return { error };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });

  const createSong = async (title: string, projectId?: string): Promise<Song | null> => {
    try {
      return await createSongMutation.mutateAsync({ title, projectId });
    } catch {
      return null;
    }
  };

  const updateSong = async (id: string, updates: Partial<Omit<Song, "id" | "user_id" | "created_at">>) => {
    try {
      return await updateSongMutation.mutateAsync({ id, updates });
    } catch (error) {
      return { error };
    }
  };

  const deleteSong = async (id: string) => {
    try {
      return await deleteSongMutation.mutateAsync({ id });
    } catch (error) {
      return { error };
    }
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
    refetch,
  };
}

export function useSong(id: string | undefined) {
  const {
    data: song,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["song", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching song:", error);
        throw error;
      }

      return data as Song | null;
    },
    enabled: !!id,
  });

  return { song: song ?? null, loading, refetch };
}
