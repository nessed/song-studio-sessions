import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { ExportData, Profile, Project, Song, Task, SongNote } from "@/lib/types";

export function useExportData() {
  const { user } = useAuth();

  const exportAllData = async (): Promise<void> => {
    if (!user) return;

    try {
      // Fetch all data in parallel
      const [profileRes, projectsRes, songsRes, tasksRes, notesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("projects").select("*").eq("user_id", user.id),
        supabase.from("songs").select("*").eq("user_id", user.id),
        supabase.from("tasks").select("*").eq("user_id", user.id),
        supabase.from("song_notes").select("*").eq("user_id", user.id),
      ]);

      const exportData: ExportData = {
        profile: profileRes.data as Profile | null,
        projects: (projectsRes.data as Project[]) || [],
        songs: (songsRes.data as Song[]) || [],
        tasks: (tasksRes.data as Task[]) || [],
        song_notes: (notesRes.data as SongNote[]) || [],
        exported_at: new Date().toISOString(),
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sessions-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

  return { exportAllData };
}