"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { isActiveWorkOrderStatus } from "@/lib/work-order-status";
import {
  customerRepository,
  workOrderRepository,
} from "@/data";
import type { Customer } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { sortWorkOrdersByUpdatedAt } from "@/lib/sort-work-orders";

interface CustomerListItem
  extends Pick<Customer, "id" | "name" | "email" | "phone"> {
  workOrders: number;
  activeRepairs: number;
  lastActivity: string;
}

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      const [customerRecords, workOrders] = await Promise.all([
        customerRepository.getAll(),
        workOrderRepository.getAll(),
      ]);

      const mappedCustomers = customerRecords.map((customer) => {
        const customerWorkOrders = sortWorkOrdersByUpdatedAt(
          workOrders.filter(
            (workOrder) => workOrder.customerId === customer.id,
          ),
        );

        const activeRepairs = customerWorkOrders.filter((workOrder) =>
          isActiveWorkOrderStatus(workOrder.status),
        ).length;

        const latestWorkOrder = customerWorkOrders[0];

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          workOrders: customerWorkOrders.length,
          activeRepairs,
          lastActivity: latestWorkOrder
            ? formatRelativeTime(latestWorkOrder.updatedAt)
            : formatRelativeTime(customer.createdAt),
        };
      });

      setCustomers(mappedCustomers);
    }

    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return customers.filter((customer) => {
      return (
        query === "" ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="mt-1 text-muted-foreground">
          Manage customers and view their repair history.
        </p>
      </div>
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>
      {/* Results */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>
      {/* Customer table */}
      <Card>
        <CardContent className="p-0">
          {filteredCustomers.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
              <p className="font-medium">No customers found</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Phone</th>
                    <th className="px-6 py-4 font-medium">Work Orders</th>
                    <th className="px-6 py-4 font-medium">Active Repairs</th>
                    <th className="px-6 py-4 font-medium">Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="cursor-pointer border-b transition-colors hover:bg-muted/50 last:border-0"
                      tabIndex={0}
                      role="link"
                      onClick={() =>
                        router.push(
                          `/dashboard/customers/${customer.id}`,
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(
                            `/dashboard/customers/${customer.id}`,
                          );
                        }
                      }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {customer.id}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{customer.email}</td>
                      <td className="px-6 py-4">{customer.phone}</td>
                      <td className="px-6 py-4">
                        {customer.workOrders}
                      </td>

                      <td className="px-6 py-4">
                        {customer.activeRepairs}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {customer.lastActivity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}