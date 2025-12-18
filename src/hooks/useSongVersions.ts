import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface SongVersion {
  id: string;
  song_id: string;
  version_number: number;
  file_url: string;
  description: string | null;
  is_current: boolean;
  created_at: string;
  user_id: string;
}

export function useSongVersions(songId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ["song-versions", songId],
    queryFn: async () => {
      if (!songId || !user) return [];

      const { data, error } = await supabase
        .from("song_versions")
        .select("*")
        .eq("song_id", songId)
        .order("version_number", { ascending: false });

      if (error) {
        console.error("Error fetching versions:", error);
        return [];
      }

      return data as SongVersion[];
    },
    enabled: !!songId && !!user,
  });

  const currentVersion = versions.find((v) => v.is_current) || versions[0] || null;

  const uploadVersionMutation = useMutation({
    mutationFn: async ({ file, description }: { file: File; description: string }) => {
      if (!user || !songId) throw new Error("Missing user or song");

      const nextVersionNumber = versions.length + 1;
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/songs/${songId}/v${nextVersionNumber}.${fileExt}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from("audio")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("audio").getPublicUrl(filePath);
      const fileUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Unset current from all existing versions
      await supabase
        .from("song_versions")
        .update({ is_current: false })
        .eq("song_id", songId);

      // Insert new version
      const { data, error } = await supabase
        .from("song_versions")
        .insert({
          song_id: songId,
          user_id: user.id,
          version_number: nextVersionNumber,
          file_url: fileUrl,
          description,
          is_current: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Also update the song's mp3_url for backwards compatibility
      await supabase.from("songs").update({ mp3_url: fileUrl }).eq("id", songId);

      return data as SongVersion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-versions", songId] });
      queryClient.invalidateQueries({ queryKey: ["song", songId] });
    },
  });

  const setCurrentVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      if (!songId) throw new Error("Missing song");

      // Unset all
      await supabase
        .from("song_versions")
        .update({ is_current: false })
        .eq("song_id", songId);

      // Set the selected one
      const { data, error } = await supabase
        .from("song_versions")
        .update({ is_current: true })
        .eq("id", versionId)
        .select()
        .single();

      if (error) throw error;

      // Update song mp3_url
      await supabase.from("songs").update({ mp3_url: data.file_url }).eq("id", songId);

      return data as SongVersion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-versions", songId] });
      queryClient.invalidateQueries({ queryKey: ["song", songId] });
    },
  });

  const deleteVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      if (!songId) throw new Error("Missing song");

      // Check if we are deleting the current version
      const isDeletingCurrent = versions.find(v => v.id === versionId)?.is_current;

      const { error } = await supabase
        .from("song_versions")
        .delete()
        .eq("id", versionId);

      if (error) throw error;

      // If we deleted the current version, we should probably set another one as current
      // ideally the backend handles this or we pick the latest Remaining one
      if (isDeletingCurrent) {
         // Logic to set newest as current is a bit complex for client-side, 
         // but we can at least ensure the song's mp3_url is updated.
         // For now, let's just clear the song's mp3_url if no versions remain,
         // or set it to the next latest one.
         const remainingVersions = versions.filter(v => v.id !== versionId);
         if (remainingVersions.length > 0) {
            const nextLatest = remainingVersions[0];
            await supabase.from("song_versions").update({ is_current: true }).eq("id", nextLatest.id);
            await supabase.from("songs").update({ mp3_url: nextLatest.file_url }).eq("id", songId);
         } else {
            // No versions left
            await supabase.from("songs").update({ mp3_url: null }).eq("id", songId);
         }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-versions", songId] });
      queryClient.invalidateQueries({ queryKey: ["song", songId] });
    },
  });

  return {
    versions,
    currentVersion,
    isLoading,
    uploadVersion: async (file: File, description: string) => {
      await uploadVersionMutation.mutateAsync({ file, description });
    },
    setCurrentVersion: async (versionId: string) => {
      await setCurrentVersionMutation.mutateAsync(versionId);
    },
    deleteVersion: async (versionId: string) => {
      await deleteVersionMutation.mutateAsync(versionId);
    },
    isUploading: uploadVersionMutation.isPending,
  };
}