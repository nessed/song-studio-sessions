import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { SongVersion } from "@/lib/types";

// Re-export for convenience
export type { SongVersion } from "@/lib/types";


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

  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadVersionMutation = useMutation({
    mutationFn: async ({ file, description }: { file: File; description: string }) => {
      if (!user || !songId) throw new Error("Missing user or song");
      setUploadProgress(0);

      const nextVersionNumber = versions.reduce((max, v) => Math.max(max, v.version_number), 0) + 1;
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/songs/${songId}/v${nextVersionNumber}.${fileExt}`;

      // Get session for token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      // Upload via XHR (instead of supabase-js) so we get real progress events
      await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const projectUrl = import.meta.env.VITE_SUPABASE_URL;
          const url = `${projectUrl}/storage/v1/object/audio/${filePath}`;

          xhr.open("POST", url);
          xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
          xhr.setRequestHeader("apikey", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
          xhr.setRequestHeader("x-upsert", "true");
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

          xhr.upload.onprogress = (e) => {
             if (e.lengthComputable) {
                const percent = (e.loaded / e.total) * 100;
                setUploadProgress(Math.round(percent));
             }
          };

          xhr.onload = () => {
             if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
             } else {
                reject(new Error(xhr.responseText || xhr.statusText));
             }
          };

          xhr.onerror = () => reject(new Error("Network Error"));

          xhr.send(file);
      });

      // Verification / Get Public URL
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

      // Update song
      await supabase.from("songs").update({ mp3_url: fileUrl }).eq("id", songId);

      return data as SongVersion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-versions", songId] });
      queryClient.invalidateQueries({ queryKey: ["song", songId] });
      setUploadProgress(0);
    },
    onError: () => {
      setUploadProgress(0);
    }
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
    uploadProgress,
  };
}