import type { WorkOrder } from "../types";
import { repository } from "./api";
const repo = repository<WorkOrder>("orders");
export const { getAll, getById, create, update, remove } = repo;
export async function getByCustomerId(customerId: string) {
  return (await getAll()).filter((item) => item.customerId === customerId);
}
export async function getByDeviceId(deviceId: string) {
  return (await getAll()).filter((item) => item.deviceId === deviceId);
}
