import { customers } from "@/data/mock/customers";
import type { Customer } from "@/data/types";

export async function getAll(): Promise<Customer[]> {
  return customers;
}

export async function getById(id: string): Promise<Customer | undefined> {
  return customers.find((customer) => customer.id === id);
}
