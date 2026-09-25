import type { Snapshot } from "../schemas";
export async function request<T>(command?: object): Promise<T> {
  const response = await fetch(
    "/api/records",
    command
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        }
      : { cache: "no-store" },
  );
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Could not save the record.");
  if (command) {
    window.dispatchEvent(new Event("repair-admin:repository-change"));
    // Notify other tabs without keeping any business data in localStorage.
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("repair-admin-records");
      channel.postMessage("changed");
      channel.close();
    }
  }
  return result as T;
}
export const getSnapshot = () => request<Snapshot>();
export function repository<T extends { id: string }>(
  collection: "customers" | "devices" | "orders",
) {
  return {
    getAll: async () => (await getSnapshot())[collection] as unknown as T[],
    getById: async (id: string) =>
      ((await getSnapshot())[collection] as unknown as T[]).find(
        (i) => i.id === id,
      ),
    create: (data: object) => request<T>({ action: "save", collection, data }),
    update: (id: string, data: object) =>
      request<T>({ action: "save", collection, id, data }),
    remove: (id: string) =>
      request<boolean>({ action: "delete", collection, id }),
  };
}
