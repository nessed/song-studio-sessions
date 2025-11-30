import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Task, SongSection } from "@/lib/types";

export function useTasks(songId: string | undefined) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!songId || !user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("song_id", songId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks((data as Task[]) || []);
    }
    setLoading(false);
  }, [songId, user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (section: SongSection, title: string): Promise<Task | null> => {
    if (!songId || !user) return null;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        song_id: songId,
        user_id: user.id,
        section,
        title,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
      return null;
    }

    const newTask = data as Task;
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Pick<Task, "title" | "done">>) => {
    const { error } = await supabase.from("tasks").update(updates).eq("id", id);

    if (!error) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    }

    return { error };
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (!error) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }

    return { error };
  };

  return { tasks, loading, createTask, updateTask, deleteTask, refetch: fetchTasks };
}