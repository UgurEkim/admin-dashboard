import type { Customer, Device, WorkOrder } from "../types";
import { readStored } from "./storage";

export function validateCustomer(
  customer: Pick<Customer, "name" | "email" | "phone">,
) {
  if (!customer.name.trim()) throw new Error("Enter a customer name.");
  if (!customer.email.trim() && !customer.phone.trim())
    throw new Error("Enter a phone number or email address.");
}

export function validateDevice(
  device: Omit<Device, "id" | "createdAt">,
  id?: string,
) {
  if (!device.name.trim() || !device.model.trim())
    throw new Error("Enter a device name and model.");
  if (!device.category.trim()) throw new Error("Select a device category.");
  if (
    !readStored<Customer>("repair-admin.customers", []).some(
      (c) => c.id === device.customerId,
    )
  )
    throw new Error("Select an existing customer.");
  if (
    device.serialNumber.trim() &&
    readStored<Device>("repair-admin.devices", []).some(
      (d) =>
        d.id !== id &&
        d.serialNumber.trim().toLowerCase() ===
          device.serialNumber.trim().toLowerCase(),
    )
  )
    throw new Error("A device with this serial number already exists.");
  if (
    readStored<WorkOrder>("repair-admin.work-orders", []).some(
      (o) => o.deviceId === id && o.customerId !== device.customerId,
    )
  )
    throw new Error(
      "This device has repair history. Its customer cannot be changed.",
    );
}

export function validateOrder(
  order: Omit<WorkOrder, "id" | "createdAt" | "updatedAt">,
) {
  const device = readStored<Device>("repair-admin.devices", []).find(
    (d) => d.id === order.deviceId,
  );
  if (!device || device.customerId !== order.customerId)
    throw new Error("Select a device belonging to this customer.");
  if (!order.issue.trim()) throw new Error("Describe the reported issue.");
  if (!["Waiting", "Repairing", "Testing", "Completed"].includes(order.status))
    throw new Error("Select a valid work order status.");
  for (const amount of [order.estimate, order.finalCost])
    if (amount && (!Number.isFinite(Number(amount)) || Number(amount) < 0))
      throw new Error("Costs must be valid, non-negative amounts.");
}
