export type WorkOrderStatus = "Repairing" | "Waiting" | "Testing" | "Completed";

export interface IntakePhoto {
  id: string;
  name: string;
  dataUrl: string;
}
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
  service?: string;
  serviceId?: string;
  intakeCondition?: string;
  accessories?: string;
  accessCode?: string;
  intakePhotos?: IntakePhoto[];
  dueDate?: string;
  estimate?: string;
  finalCost?: string;
  paymentStatus?: string;
  collectedAt?: string;
  history?: { status: WorkOrderStatus; at: string }[];
}
