/**
 * Thin wrapper around localStorage that never throws on the server
 * (Next.js renders this module server-side too, where `window` is undefined)
 * and never throws if storage is disabled/full in the browser.
 */
export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or disabled (private browsing) — fail silently,
    // the app still works, it just won't persist this session.
  }
}

export const STORAGE_KEYS = {
  preferences: "content-dashboard:preferences",
  favorites: "content-dashboard:favorites",
} as const;
