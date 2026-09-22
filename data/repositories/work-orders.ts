import { workOrders } from "@/data/mock/work-orders";
import type { WorkOrder } from "@/data/types";

export async function getAll(): Promise<WorkOrder[]> {
  return workOrders;
}

export async function getById(id: string): Promise<WorkOrder | undefined> {
  return workOrders.find((workOrder) => workOrder.id === id);
}

export async function getByCustomerId(
  customerId: string,
): Promise<WorkOrder[]> {
  return workOrders.filter((workOrder) => workOrder.customerId === customerId);
}

export async function getByDeviceId(deviceId: string): Promise<WorkOrder[]> {
  return workOrders.filter((workOrder) => workOrder.deviceId === deviceId);
}
