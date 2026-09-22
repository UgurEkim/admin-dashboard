import type { WorkOrderStatus } from "@/data";

type WorkOrderStatusColor = "blue" | "amber" | "purple" | "green";

export function isActiveWorkOrderStatus(status: WorkOrderStatus) {
  return status === "Repairing" || status === "Waiting" || status === "Testing";
}

export function isCompletedWorkOrderStatus(status: WorkOrderStatus) {
  return status === "Completed";
}

export function getWorkOrderActivityTitle(status: WorkOrderStatus) {
  switch (status) {
    case "Repairing":
      return "Repair started";
    case "Waiting":
      return "Waiting for customer";
    case "Testing":
      return "Repair testing";
    case "Completed":
      return "Repair completed";
  }
}

export function getWorkOrderStatusColor(
  status: WorkOrderStatus,
): WorkOrderStatusColor {
  switch (status) {
    case "Repairing":
      return "blue";
    case "Waiting":
      return "amber";
    case "Testing":
      return "purple";
    case "Completed":
      return "green";
  }
}
