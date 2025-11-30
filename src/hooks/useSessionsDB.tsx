import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Song, Task, SessionsDB, SongStatus, SongSection } from "@/lib/types";
import { loadDB, saveDB } from "@/lib/storage";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

interface SessionsContextValue {
  songs: Song[];
  tasks: Task[];
  createSong: (title: string) => Song;
  updateSong: (id: string, updates: Partial<Omit<Song, "id" | "createdAt">>) => void;
  deleteSong: (id: string) => void;
  getSong: (id: string) => Song | undefined;
  getSongTasks: (songId: string) => Task[];
  createTask: (songId: string, section: SongSection, title: string) => Task;
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "songId" | "createdAt">>) => void;
  deleteTask: (id: string) => void;
}

const SessionsContext = createContext<SessionsContextValue | null>(null);

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<SessionsDB>(() => loadDB());

  useEffect(() => {
    saveDB(db);
  }, [db]);

  const createSong = useCallback((title: string): Song => {
    const now = new Date().toISOString();
    const newSong: Song = {
      id: generateId(),
      title,
      status: "idea",
      moodTags: [],
      createdAt: now,
      updatedAt: now,
    };

    setDb((prev) => ({
      ...prev,
      songs: [...prev.songs, newSong],
    }));

    return newSong;
  }, []);

  const updateSong = useCallback((id: string, updates: Partial<Omit<Song, "id" | "createdAt">>) => {
    setDb((prev) => ({
      ...prev,
      songs: prev.songs.map((song) =>
        song.id === id
          ? { ...song, ...updates, updatedAt: new Date().toISOString() }
          : song
      ),
    }));
  }, []);

  const deleteSong = useCallback((id: string) => {
    setDb((prev) => ({
      songs: prev.songs.filter((song) => song.id !== id),
      tasks: prev.tasks.filter((task) => task.songId !== id),
    }));
  }, []);

  const getSong = useCallback((id: string): Song | undefined => {
    return db.songs.find((song) => song.id === id);
  }, [db.songs]);

  const getSongTasks = useCallback((songId: string): Task[] => {
    return db.tasks.filter((task) => task.songId === songId);
  }, [db.tasks]);

  const createTask = useCallback((songId: string, section: SongSection, title: string): Task => {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: generateId(),
      songId,
      section,
      title,
      done: false,
      createdAt: now,
      updatedAt: now,
    };

    setDb((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));

    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, "id" | "songId" | "createdAt">>) => {
    setDb((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      ),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  }, []);

  const value: SessionsContextValue = {
    songs: db.songs,
    tasks: db.tasks,
    createSong,
    updateSong,
    deleteSong,
    getSong,
    getSongTasks,
    createTask,
    updateTask,
    deleteTask,
  };

  return (
    <SessionsContext.Provider value={value}>
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessionsDB(): SessionsContextValue {
  const context = useContext(SessionsContext);
  if (!context) {
    throw new Error("useSessionsDB must be used within a SessionsProvider");
  }
  return context;
}

export function useSongs(): Song[] {
  const { songs } = useSessionsDB();
  return songs;
}

export function useSong(id: string): Song | undefined {
  const { getSong } = useSessionsDB();
  return getSong(id);
}

export function useSongTasks(songId: string): Task[] {
  const { getSongTasks } = useSessionsDB();
  return getSongTasks(songId);
}
