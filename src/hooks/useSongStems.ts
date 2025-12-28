import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { SongStem, StemType } from "@/lib/types";

// Note: song_stems table types will be available after running migration
// and regenerating Supabase types with `npx supabase gen types typescript`
// Until then, we use 'any' type assertions

export function useSongStems(versionId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: stems = [], isLoading } = useQuery({
    queryKey: ["song-stems", versionId],
    queryFn: async () => {
      if (!versionId || !user) return [];

      // Using 'any' until Supabase types are regenerated
      const { data, error } = await (supabase as any)
        .from("song_stems")
        .select("*")
        .eq("version_id", versionId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching stems:", error);
        return [];
      }

      return (data || []) as SongStem[];
    },
    enabled: !!versionId && !!user,
  });

  const uploadStemMutation = useMutation({
    mutationFn: async ({ 
      file, 
      stemType, 
      label 
    }: { 
      file: File; 
      stemType: StemType; 
      label?: string 
    }) => {
      if (!user || !versionId) throw new Error("Missing user or version");
      setUploadProgress(0);

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/stems/${versionId}/${stemType}_${Date.now()}.${fileExt}`;

      // Get session for token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      // Upload via XHR for progress
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/storage/v1/object/audio/${filePath}`;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
        xhr.setRequestHeader("x-upsert", "true");

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
            reject(new Error(xhr.statusText));
          }
        };

        xhr.onerror = () => reject(new Error("Network Error"));
        xhr.send(file);
      });

      // Get public URL
      const { data: urlData } = supabase.storage.from("audio").getPublicUrl(filePath);
      const fileUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Insert stem record
      const { data, error } = await (supabase as any)
        .from("song_stems")
        .insert({
          version_id: versionId,
          user_id: user.id,
          stem_type: stemType,
          file_url: fileUrl,
          label: label || null,
          is_muted: false,
          volume: 1.0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as SongStem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-stems", versionId] });
      setUploadProgress(0);
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  const updateStemMutation = useMutation({
    mutationFn: async ({ 
      stemId, 
      updates 
    }: { 
      stemId: string; 
      updates: Partial<Pick<SongStem, 'is_muted' | 'volume' | 'label'>> 
    }) => {
      const { data, error } = await (supabase as any)
        .from("song_stems")
        .update(updates)
        .eq("id", stemId)
        .select()
        .single();

      if (error) throw error;
      return data as SongStem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-stems", versionId] });
    },
  });

  const deleteStemMutation = useMutation({
    mutationFn: async (stemId: string) => {
      const { error } = await (supabase as any)
        .from("song_stems")
        .delete()
        .eq("id", stemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-stems", versionId] });
    },
  });

  return {
    stems,
    isLoading,
    uploadStem: async (file: File, stemType: StemType, label?: string) => {
      await uploadStemMutation.mutateAsync({ file, stemType, label });
    },
    updateStem: async (stemId: string, updates: Partial<Pick<SongStem, 'is_muted' | 'volume' | 'label'>>) => {
      await updateStemMutation.mutateAsync({ stemId, updates });
    },
    deleteStem: async (stemId: string) => {
      await deleteStemMutation.mutateAsync(stemId);
    },
    isUploading: uploadStemMutation.isPending,
    uploadProgress,
  };
}

