import type { WorkOrder } from "@/data/types";
import { nextId, readStored, writeStored } from "./storage";
import { validateOrder } from "./validation";
const storageKey = "repair-admin.work-orders";
function records() {
  return readStored<WorkOrder>(storageKey, []);
}

export async function getAll(): Promise<WorkOrder[]> {
  return records();
}

export async function getById(id: string): Promise<WorkOrder | undefined> {
  return records().find((workOrder) => workOrder.id === id);
}

export async function getByCustomerId(
  customerId: string,
): Promise<WorkOrder[]> {
  return records().filter((workOrder) => workOrder.customerId === customerId);
}

export async function getByDeviceId(deviceId: string): Promise<WorkOrder[]> {
  return records().filter((workOrder) => workOrder.deviceId === deviceId);
}

export async function create(
  input: Omit<WorkOrder, "id" | "createdAt" | "updatedAt">,
) {
  validateOrder(input);
  const now = new Date().toISOString();
  const value: WorkOrder = {
    ...input,
    id: nextId(
      "WO",
      records().map((item) => item.id),
    ),
    createdAt: now,
    history: [{ status: input.status, at: now }],
    updatedAt: now,
  };
  const next = [...records(), value];
  writeStored(storageKey, next);
  return value;
}

export async function update(
  id: string,
  changes: Partial<Omit<WorkOrder, "id" | "createdAt">>,
) {
  const existing = records().find((item) => item.id === id);
  if (!existing) throw new Error("Work order no longer exists.");
  validateOrder({ ...existing, ...changes });
  const next = records().map((item) =>
    item.id === id
      ? {
          ...item,
          ...changes,
          updatedAt: new Date().toISOString(),
          history:
            changes.status && changes.status !== item.status
              ? [
                  ...(item.history ?? []),
                  { status: changes.status, at: new Date().toISOString() },
                ]
              : item.history,
        }
      : item,
  );
  writeStored(storageKey, next);
  return next.find((item) => item.id === id);
}

export async function remove(id: string) {
  const previous = records();
  const next = previous.filter((item) => item.id !== id);
  writeStored(storageKey, next);
  return next.length !== previous.length;
}
