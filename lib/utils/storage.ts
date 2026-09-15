const STORAGE_VERSION = 1;

interface StorageEnvelope<T> {
  version: number;
  data: T;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Reads a namespaced value from localStorage. Returns null on the server,
 * on a cache miss, or if the stored JSON is missing/corrupted/from an
 * incompatible version — callers should fall back to seed data in that case.
 */
export function readStorage<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StorageEnvelope<T>;
    if (!parsed || typeof parsed !== "object" || parsed.version !== STORAGE_VERSION || !("data" in parsed)) {
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

/** Writes a namespaced value to localStorage. No-op on the server. */
export function writeStorage<T>(key: string, data: T): void {
  if (!isBrowser()) return;
  try {
    const envelope: StorageEnvelope<T> = { version: STORAGE_VERSION, data };
    window.localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Storage unavailable (private mode, quota exceeded, etc.) — in-memory state still works.
  }
}

/** Removes a namespaced value from localStorage. No-op on the server. */
export function removeStorage(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
