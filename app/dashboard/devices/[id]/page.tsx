import Link from "next/link";
import { ArrowLeft, Calendar, ClipboardList, Hash, User } from "lucide-react";
import { notFound } from "next/navigation";

import {
  customerRepository,
  deviceRepository,
  workOrderRepository,
} from "@/data";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format-date-time";
import { sortWorkOrdersByUpdatedAt } from "@/lib/sort-work-orders";

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const device = await deviceRepository.getById(id);

  if (!device) {
    notFound();
  }

  const [customer, workOrders] = await Promise.all([
    customerRepository.getById(device.customerId),
    workOrderRepository.getByDeviceId(device.id),
  ]);

  if (!customer) {
    notFound();
  }
  const sortedWorkOrders = sortWorkOrdersByUpdatedAt(workOrders);
  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-2 -ml-2"
        nativeButton={false}
        render={
          <Link href={`/dashboard/customers/${customer.id}`} />
        }
      >
        <ArrowLeft />
        Back to Customer
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {device.name}
            </h1>

            <Badge variant="secondary">{device.id}</Badge>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Device information and repair history
          </p>
        </div>

        <Button>New Work Order</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Hash className="mt-0.5 size-4 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">Serial Number</p>
                <p className="text-sm text-muted-foreground">
                  {device.serialNumber}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 size-4 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">Model</p>
                <p className="text-sm text-muted-foreground">
                  {device.model}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Hash className="mt-0.5 size-4 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">Category</p>
                <p className="text-sm text-muted-foreground">
                  {device.category}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 size-4 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">Added</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(device.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>

          <CardContent>
            <Link
              href={`/dashboard/customers/${customer.id}`}
              className="flex items-center gap-3 rounded-md p-2 -m-2 hover:bg-muted"
            >
              <User className="size-4 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">{customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.id}
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work Order History</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="divide-y">
            {sortedWorkOrders.map((workOrder) => (
              <Link
                key={workOrder.id}
                href={`/dashboard/work-orders/${workOrder.id}`}
                className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{workOrder.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {workOrder.issue}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={workOrder.status} />
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(workOrder.updatedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}