import type { WorkOrderStatus } from "@/data";

type WorkOrderStatusColor = "blue" | "amber" | "purple" | "green";

export function isActiveWorkOrderStatus(status: WorkOrderStatus) {
  return status !== "Completed";
}

export function isCompletedWorkOrderStatus(status: WorkOrderStatus) {
  return status === "Completed";
}

export function getWorkOrderActivityTitle(status: WorkOrderStatus) {
  switch (status) {
    case "Repairing":
      return "Repair started";
    case "Waiting":
      return "Work order waiting";
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

export const workOrderStatuses = [
  "Waiting",
  "Repairing",
  "Testing",
  "Completed",
] as const;

export const statusColors = {
  amber: {
    badge:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    button:
      "border-amber-500/30 bg-amber-500/5 text-amber-700 hover:bg-amber-500/15 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 aria-pressed:bg-amber-500/20 aria-pressed:border-amber-500/60",
    bar: "bg-amber-500",
    icon: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  blue: {
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    button:
      "border-blue-500/30 bg-blue-500/5 text-blue-700 hover:bg-blue-500/15 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 aria-pressed:bg-blue-500/20 aria-pressed:border-blue-500/60",
    bar: "bg-blue-500",
    icon: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  purple: {
    badge:
      "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400",
    button:
      "border-purple-500/30 bg-purple-500/5 text-purple-700 hover:bg-purple-500/15 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 aria-pressed:bg-purple-500/20 aria-pressed:border-purple-500/60",
    bar: "bg-purple-500",
    icon: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  },
  green: {
    badge:
      "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
    button:
      "border-green-500/30 bg-green-500/5 text-green-700 hover:bg-green-500/15 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 aria-pressed:bg-green-500/20 aria-pressed:border-green-500/60",
    bar: "bg-green-500",
    icon: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
} as const;

export function getWorkOrderStatusStyle(status: WorkOrderStatus) {
  return statusColors[getWorkOrderStatusColor(status)];
}
