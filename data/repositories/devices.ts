import type { Device } from "@/data/types";
import { nextId, readStored, writeStored } from "./storage";
import { validateDevice } from "./validation";
import type { WorkOrder } from "../types";
const storageKey = "repair-admin.devices";
function records() {
  return readStored<Device>(storageKey, []);
}

export async function getAll(): Promise<Device[]> {
  return records();
}

export async function getById(id: string): Promise<Device | undefined> {
  return records().find((device) => device.id === id);
}

export async function getByCustomerId(customerId: string): Promise<Device[]> {
  return records().filter((device) => device.customerId === customerId);
}

export async function create(input: Omit<Device, "id" | "createdAt">) {
  validateDevice(input);
  const value: Device = {
    ...input,
    id: nextId(
      "DEV",
      records().map((item) => item.id),
    ),
    createdAt: new Date().toISOString(),
  };
  const next = [...records(), value];
  writeStored(storageKey, next);
  return value;
}

export async function update(
  id: string,
  changes: Partial<Omit<Device, "id" | "createdAt">>,
) {
  const existing = records().find((item) => item.id === id);
  if (!existing) throw new Error("Device no longer exists.");
  validateDevice({ ...existing, ...changes }, id);
  const next = records().map((item) =>
    item.id === id ? { ...item, ...changes } : item,
  );
  writeStored(storageKey, next);
  return next.find((item) => item.id === id);
}

export async function remove(id: string) {
  if (
    readStored<WorkOrder>("repair-admin.work-orders", []).some(
      (o) => o.deviceId === id,
    )
  )
    throw new Error(
      "Remove this device's work orders first. Its repair history is still linked.",
    );
  const previous = records();
  const next = previous.filter((item) => item.id !== id);
  writeStored(storageKey, next);
  return next.length !== previous.length;
}
