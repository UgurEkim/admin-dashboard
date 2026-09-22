import type { WorkOrder } from "@/data";

export function sortWorkOrdersByUpdatedAt(workOrders: WorkOrder[]) {
  return [...workOrders].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}
