import type { Customer } from "@/data/types";
import { nextId, readStored, writeStored } from "./storage";
import { validateCustomer } from "./validation";
import type { Device, WorkOrder } from "../types";

const storageKey = "repair-admin.customers";
function records() {
  return readStored<Customer>(storageKey, []);
}

export async function getAll(): Promise<Customer[]> {
  return records();
}

export async function getById(id: string): Promise<Customer | undefined> {
  return records().find((customer) => customer.id === id);
}

export async function create(
  input: Pick<Customer, "name" | "email" | "phone"> &
    Partial<
      Pick<
        Customer,
        | "phoneCountryCode"
        | "notes"
        | "street"
        | "houseNumber"
        | "postalCode"
        | "city"
        | "country"
      >
    >,
) {
  validateCustomer(input);
  const value: Customer = {
    ...input,
    id: nextId(
      "CUS",
      records().map((item) => item.id),
    ),
    createdAt: new Date().toISOString(),
  };
  const next = [...records(), value];
  writeStored(storageKey, next);
  return value;
}

export async function update(
  id: string,
  changes: Partial<Omit<Customer, "id" | "createdAt">>,
) {
  const existing = records().find((item) => item.id === id);
  if (!existing) throw new Error("Customer no longer exists.");
  validateCustomer({ ...existing, ...changes });
  const next = records().map((item) =>
    item.id === id ? { ...item, ...changes } : item,
  );
  writeStored(storageKey, next);
  return next.find((item) => item.id === id);
}

export async function remove(id: string) {
  if (
    readStored<Device>("repair-admin.devices", []).some(
      (d) => d.customerId === id,
    ) ||
    readStored<WorkOrder>("repair-admin.work-orders", []).some(
      (o) => o.customerId === id,
    )
  )
    throw new Error(
      "Remove this customer's devices and work orders first. Their repair history is still linked.",
    );
  const previous = records();
  const next = previous.filter((item) => item.id !== id);
  writeStored(storageKey, next);
  return next.length !== previous.length;
}
