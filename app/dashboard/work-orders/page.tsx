"use client";

import * as React from "react";
import { Plus, Search, X } from "lucide-react";

import { ClickableWorkOrder } from "@/components/clickable-work-order";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const workOrders = [
  {
    id: "WO-00142",
    customer: "Mark Jansen",
    device: "PlayStation 5",
    issue: "No HDMI output",
    status: "Repairing",
    updated: "12 minutes ago",
  },
  {
    id: "WO-00141",
    customer: "Lisa de Vries",
    device: "DualSense",
    issue: "Stick drift",
    status: "Testing",
    updated: "28 minutes ago",
  },
  {
    id: "WO-00140",
    customer: "Thomas Bakker",
    device: "PlayStation 4",
    issue: "No power",
    status: "Waiting",
    updated: "1 hour ago",
  },
  {
    id: "WO-00139",
    customer: "Sophie Peters",
    device: "DualSense",
    issue: "USB-C replacement",
    status: "Completed",
    updated: "2 hours ago",
  },
  {
    id: "WO-00138",
    customer: "Daan Smit",
    device: "PlayStation 5",
    issue: "Overheating",
    status: "Completed",
    updated: "3 hours ago",
  },
];

export default function WorkOrdersPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [device, setDevice] = React.useState("all");

  const filteredWorkOrders = workOrders.filter((order) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      order.id.toLowerCase().includes(searchValue) ||
      order.customer.toLowerCase().includes(searchValue) ||
      order.device.toLowerCase().includes(searchValue) ||
      order.issue.toLowerCase().includes(searchValue);

    const matchesStatus = status === "all" || order.status === status;

    const matchesDevice = device === "all" || order.device === device;

    return matchesSearch && matchesStatus && matchesDevice;
  });

  const hasFilters = search !== "" || status !== "all" || device !== "all";

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setDevice("all");
  }

  return (
    <div className="space-y-8">
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

      <Card>
        <CardHeader>
          <CardTitle>All Work Orders</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search work orders..."
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
                <SelectItem value="PlayStation 4">PlayStation 4</SelectItem>
                <SelectItem value="DualSense">DualSense</SelectItem>
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
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredWorkOrders.length} of {workOrders.length} work
            orders
          </div>

          <div className="mt-3 space-y-1">
            {filteredWorkOrders.map((order) => (
              <ClickableWorkOrder
                key={order.id}
                id={order.id}
                className="p-4"
              >
                <div className="flex items-center justify-between gap-6">
                  < div className="min-w-0 flex-1" >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{order.id}</span>

                      <span className="text-sm text-muted-foreground">
                        {order.customer}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <span>{order.device}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {order.issue}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <span className="hidden text-sm text-muted-foreground md:block">
                      {order.updated}
                    </span>

                    <StatusBadge status={order.status} />
                  </div>
                </div>
              </ClickableWorkOrder>
            ))}

            {filteredWorkOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3">
                  <Search className="size-5 text-muted-foreground" />
                </div>

                <h3 className="mt-4 font-medium">No work orders found</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try changing your search or filters.
                </p>

                {hasFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent >
      </Card >
    </div >
  );
}