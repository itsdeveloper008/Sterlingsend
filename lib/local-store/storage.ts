"use client";

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[local-store] read failed for ${key}`, error);
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[local-store] write failed for ${key}`, error);
  }
}

export function removeKey(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}
