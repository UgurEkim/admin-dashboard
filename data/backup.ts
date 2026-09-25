import type { Snapshot } from "./schemas";

// Keep the import-compatible envelope and every application field, including PINs.
export function createBackup(snapshot: Snapshot, now = new Date()) {
  const exportedAt = now.toISOString();
  return {
    filename: `repair-database-${exportedAt.replace(/[:.]/g, "-")}.json`,
    content: JSON.stringify({ version: 1, exportedAt, ...snapshot }, null, 2),
  };
}
