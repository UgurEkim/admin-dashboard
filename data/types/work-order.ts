export type WorkOrderStatus = "Repairing" | "Waiting" | "Testing" | "Completed";

export interface WorkOrder {
  id: string;
  customerId: string;
  deviceId: string;
  issue: string;
  status: WorkOrderStatus;
  description: string;
  diagnosis: string;
  technicianNotes: string;
  createdAt: string;
  updatedAt: string;
}
