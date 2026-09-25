import type { Device } from "../types";
import { repository } from "./api";
const repo = repository<Device>("devices");
export const { getAll, getById, create, update, remove } = repo;
export async function getByCustomerId(customerId: string) {
  return (await getAll()).filter((item) => item.customerId === customerId);
}
