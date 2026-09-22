import type { Customer, Device } from "@/data";

export function createCustomerMap(customers: Customer[]) {
  return new Map(customers.map((customer) => [customer.id, customer]));
}

export function createDeviceMap(devices: Device[]) {
  return new Map(devices.map((device) => [device.id, device]));
}
