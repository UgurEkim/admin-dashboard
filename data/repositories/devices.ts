import { devices } from "@/data/mock/devices";
import type { Device } from "@/data/types";

export async function getAll(): Promise<Device[]> {
  return devices;
}

export async function getById(id: string): Promise<Device | undefined> {
  return devices.find((device) => device.id === id);
}

export async function getByCustomerId(customerId: string): Promise<Device[]> {
  return devices.filter((device) => device.customerId === customerId);
}
