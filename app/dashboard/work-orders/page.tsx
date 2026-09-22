"use client";

import * as React from "react";
import { Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  customerRepository,
  deviceRepository,
  workOrderRepository,
} from "@/data";
import type { WorkOrder, WorkOrderStatus } from "@/data";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createCustomerMap,
  createDeviceMap,
} from "@/lib/data-maps";

interface WorkOrderListItem extends Pick<WorkOrder, "id" | "issue"> {
  customer: string;
  device: string;
  status: WorkOrderStatus;
  updated: string;
}

export default function WorkOrdersPage() {
  const router = useRouter();

  const [workOrders, setWorkOrders] = React.useState<WorkOrderListItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [device, setDevice] = React.useState("all");

  React.useEffect(() => {
    async function loadWorkOrders() {
      const [orders, customers, devices] = await Promise.all([
        workOrderRepository.getAll(),
        customerRepository.getAll(),
        deviceRepository.getAll(),
      ]);

      const customerMap = createCustomerMap(customers);
      const deviceMap = createDeviceMap(devices);

      const mappedWorkOrders = orders.map((order) => ({
        id: order.id,
        customer:
          customerMap.get(order.customerId)?.name ?? "Unknown customer",
        device: deviceMap.get(order.deviceId)?.name ?? "Unknown device",
        issue: order.issue,
        status: order.status,
        updated: new Date(order.updatedAt).toLocaleString(),
      }));

      setWorkOrders(mappedWorkOrders);
    }

    loadWorkOrders();
  }, []);

  const filteredWorkOrders = workOrders.filter((order) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      searchValue === "" ||
      order.id.toLowerCase().includes(searchValue) ||
      order.customer.toLowerCase().includes(searchValue) ||
      order.device.toLowerCase().includes(searchValue) ||
      order.issue.toLowerCase().includes(searchValue);

    const matchesStatus = status === "all" || order.status === status;

    const matchesDevice = device === "all" || order.device === device;

    return matchesSearch && matchesStatus && matchesDevice;
  });

  const hasFilters =
    search.trim() !== "" || status !== "all" || device !== "all";

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setDevice("all");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>

          <p className="mt-1 text-muted-foreground">
            Manage repairs and track their progress.
          </p>
        </div>

        <Button>
          <Plus />
          New Work Order
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search by work order, customer, device, or issue..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={status}
            onValueChange={(value) => {
              if (value !== null) {
                setStatus(value);
              }
            }}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Repairing">Repairing</SelectItem>
              <SelectItem value="Waiting">Waiting</SelectItem>
              <SelectItem value="Testing">Testing</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={device}
            onValueChange={(value) => {
              if (value !== null) {
                setDevice(value);
              }
            }}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Device" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All devices</SelectItem>
              <SelectItem value="PlayStation 5">PlayStation 5</SelectItem>
              <SelectItem value="PlayStation 4 Pro">
                PlayStation 4 Pro
              </SelectItem>
              <SelectItem value="DualSense">DualSense</SelectItem>
              <SelectItem value="Xbox Series X">Xbox Series X</SelectItem>
              <SelectItem value="Nintendo Switch OLED">
                Nintendo Switch OLED
              </SelectItem>
              <SelectItem value="Nintendo Switch">Nintendo Switch</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="shrink-0"
            >
              <X />
              Clear
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredWorkOrders.length} of {workOrders.length} work orders
      </div>

      {/* Work Order table */}
      <Card>
        <CardContent className="p-0">
          {filteredWorkOrders.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
              <p className="font-medium">No work orders found</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="px-6 py-4 font-medium">Work Order</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Device</th>
                    <th className="px-6 py-4 font-medium">Issue</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Updated</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredWorkOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="cursor-pointer border-b transition-colors hover:bg-muted/50 last:border-0"
                      tabIndex={0}
                      role="link"
                      onClick={() =>
                        router.push(`/dashboard/work-orders/${order.id}`)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(
                            `/dashboard/work-orders/${order.id}`,
                          );
                        }
                      }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium">{order.id}</span>
                      </td>

                      <td className="px-6 py-4">{order.customer}</td>

                      <td className="px-6 py-4">{order.device}</td>

                      <td className="px-6 py-4">{order.issue}</td>

                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>

                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {order.updated}
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