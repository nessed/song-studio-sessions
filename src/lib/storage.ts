import { SessionsDB } from "./types";

const STORAGE_KEY = "sessions_db";

const DEFAULT_DB: SessionsDB = {
  songs: [],
  tasks: [],
};

export function loadDB(): SessionsDB {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_DB;
    return JSON.parse(data) as SessionsDB;
  } catch {
    return DEFAULT_DB;
  }
}

export function saveDB(db: SessionsDB): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}
