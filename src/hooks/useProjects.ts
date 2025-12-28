import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Project } from "@/lib/types";

export function useProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: projects = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }

      return (data as Project[]) || [];
    },
    enabled: !!user,
  });

  const createProjectMutation = useMutation({
    mutationFn: async ({ title }: { title: string }) => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("projects")
        .insert({ user_id: user.id, title })
        .select()
        .single();

      if (error) {
        console.error("Error creating project:", error);
        throw error;
      }

      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<Project, "id" | "user_id" | "created_at">> }) => {
      const { error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id);

      if (error) {
        console.error("Error updating project:", error);
        throw error;
      }

      return { error };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) {
        console.error("Error deleting project:", error);
        throw error;
      }

      return { error };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const createProject = useCallback(async (title: string): Promise<Project | null> => {
    try {
      return await createProjectMutation.mutateAsync({ title });
    } catch {
      return null;
    }
  }, [createProjectMutation]);

  const updateProject = useCallback(async (id: string, updates: Partial<Omit<Project, "id" | "user_id" | "created_at">>) => {
    try {
      return await updateProjectMutation.mutateAsync({ id, updates });
    } catch (error) {
      return { error };
    }
  }, [updateProjectMutation]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      return await deleteProjectMutation.mutateAsync({ id });
    } catch (error) {
      return { error };
    }
  }, [deleteProjectMutation]);

  const uploadCoverArt = useCallback(async (projectId: string, file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/projects/${projectId}/cover.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("cover-art")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage.from("cover-art").getPublicUrl(filePath);
    const url = `${data.publicUrl}?t=${Date.now()}`;

    await updateProject(projectId, { cover_art_url: url });
    return url;
  }, [user, updateProject]);

  return { projects, loading, createProject, updateProject, deleteProject, uploadCoverArt, refetch };
}

export function useProject(id: string | undefined) {
  const {
    data: project,
    isLoading: loading,
  } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching project:", error);
        throw error;
      }

      return data as Project | null;
    },
    enabled: !!id,
  });

  return { project: project ?? null, loading };
}
