import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Mail,
  User,
  Wrench,
} from "lucide-react";

import {
  customerRepository,
  deviceRepository,
  workOrderRepository,
} from "@/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format-date-time";

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const workOrder = await workOrderRepository.getById(id);

  if (!workOrder) {
    notFound();
  }

  const [customer, device] = await Promise.all([
    customerRepository.getById(workOrder.customerId),
    deviceRepository.getById(workOrder.deviceId),
  ]);

  if (!customer || !device) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          nativeButton={false}
          render={<Link href="/dashboard/work-orders" />}
        >
          <ArrowLeft />
          Back to Work Orders
        </Button>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {workOrder.id}
              </h1>

              <StatusBadge status={workOrder.status} />
            </div>

            <p className="mt-1 text-muted-foreground">
              {device.name} · {workOrder.issue}
            </p>
          </div>

          <Button>
            <Wrench />
            Update Status
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Repair Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium">Reported Issue</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {workOrder.issue}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Diagnosis</p>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {workOrder.diagnosis}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Technician Notes</p>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {workOrder.technicianNotes}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Description</p>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {workOrder.description}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <div className="flex size-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                      <Wrench className="size-4" />
                    </div>
                  </div>

                  <div>
                    <p className="font-medium">Work order updated</p>

                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(workOrder.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1">
                    <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                      <Clock3 className="size-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <p className="font-medium">Work order created</p>

                    <p className="text-sm text-muted-foreground">{formatDateTime(workOrder.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                  <User className="size-4" />
                </div>

                <div>
                  <Link
                    href={`/dashboard/customers/${customer.id}`}
                    className="font-medium hover:underline"
                  >
                    {customer.name}
                  </Link>

                  <p className="text-sm text-muted-foreground">Customer</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Mail className="size-4 text-muted-foreground" />

                <span className="text-muted-foreground">
                  {customer.email}
                </span>
              </div>

              <Button variant="outline" className="w-full">
                <Mail />
                Contact Customer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work Order Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Work Order
                </span>

                <span className="text-sm font-medium">{workOrder.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Device</span>

                <Link
                  href={`/dashboard/devices/${device.id}`}
                  className="text-sm font-medium hover:underline"
                >
                  {device.name}
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>

                <span className="flex items-center gap-2 text-sm">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  {formatDateTime(workOrder.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Updated</span>

                <span className="text-sm">{formatDateTime(workOrder.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}