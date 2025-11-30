import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Project } from "@/lib/types";

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      setProjects((data as Project[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (title: string): Promise<Project | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, title })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return null;
    }

    const newProject = data as Project;
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = async (id: string, updates: Partial<Omit<Project, "id" | "user_id" | "created_at">>) => {
    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id);

    if (!error) {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    }

    return { error };
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }

    return { error };
  };

  const uploadCoverArt = async (projectId: string, file: File): Promise<string | null> => {
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
  };

  return { projects, loading, createProject, updateProject, deleteProject, uploadCoverArt, refetch: fetchProjects };
}

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setProject(null);
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching project:", error);
      } else {
        setProject(data as Project | null);
      }
      setLoading(false);
    };

    fetchProject();
  }, [id]);

  return { project, loading, setProject };
}