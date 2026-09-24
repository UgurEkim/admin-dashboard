interface StoredCollection<T> {
  version: 1;
  data: T[];
}

export function readStored<T>(key: string, fallback: readonly T[]): T[] {
  if (typeof window === "undefined") return [...fallback];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [...fallback];
    const value: unknown = JSON.parse(raw);
    if (Array.isArray(value)) return value as T[]; // Upgrade older prototype data.
    if (
      value &&
      typeof value === "object" &&
      "version" in value &&
      "data" in value
    ) {
      const stored = value as Partial<StoredCollection<T>>;
      if (stored.version === 1 && Array.isArray(stored.data))
        return stored.data;
    }
    throw new Error(
      "Saved records could not be read. Export a backup before changing browser storage.",
    );
  } catch {
    throw new Error(
      "Saved records could not be read. Your stored data has not been changed.",
    );
  }
}

export function writeStored<T>(key: string, value: readonly T[]) {
  if (typeof window === "undefined") return;
  const stored: StoredCollection<T> = { version: 1, data: [...value] };
  window.localStorage.setItem(key, JSON.stringify(stored));
  window.dispatchEvent(
    new CustomEvent("repair-admin:repository-change", { detail: { key } }),
  );
}

export function nextId(prefix: string, ids: readonly string[]) {
  const max = ids.reduce((highest, id) => {
    const match = id.match(/(\d+)$/);
    return Math.max(highest, match ? Number(match[1]) : 0);
  }, 0);
  const key = `repair-admin.sequence.${prefix}`;
  const previous =
    typeof window === "undefined"
      ? 0
      : Number(window.localStorage.getItem(key)) || 0;
  const next = Math.max(max, previous) + 1;
  if (typeof window !== "undefined")
    window.localStorage.setItem(key, String(next));
  return `${prefix}-${String(next).padStart(5, "0")}`;
}
