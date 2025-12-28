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
      console.error("Error fetching tasks:", JSON.stringify(error, null, 2));
    } else {
      setTasks((data as Task[]) || []);
    }
    setLoading(false);
  }, [songId, user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (
    section: SongSection, 
    title: string,
    options?: { priority?: 'high' | 'medium' | 'low'; due_date?: Date }
  ): Promise<Task | null> => {
    if (!songId || !user) return null;

    // Get max sort_order for this song
    const { data: existing } = await supabase
      .from("tasks")
      .select("sort_order")
      .eq("song_id", songId)
      .order("sort_order", { ascending: false })
      .limit(1);
    
    const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        song_id: songId,
        user_id: user.id,
        section,
        title,
        // Templated for future migration:
        // priority: options?.priority || 'medium',
        // due_date: options?.due_date?.toISOString() || null,
        // sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", JSON.stringify(error, null, 2));
      return null;
    }

    const newTask = data as Task;
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, [songId, user]);

  const updateTask = useCallback(async (id: string, updates: Partial<Pick<Task, "title" | "done">>) => {
    const { error } = await supabase.from("tasks").update(updates).eq("id", id);

    if (!error) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    }

    return { error };
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (!error) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }

    return { error };
  }, []);

  return { tasks, loading, createTask, updateTask, deleteTask, refetch: fetchTasks };
}