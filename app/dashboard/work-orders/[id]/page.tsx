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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

const workOrders = [
  {
    id: "WO-00142",
    customer: "Mark Jansen",
    customerId: "CUS-00124",
    device: "PlayStation 5",
    deviceId: "DEV-00087",
    issue: "No HDMI output",
    status: "Repairing",
    created: "14 March 2025",
    updated: "12 minutes ago",
    diagnosis:
      "The HDMI port and surrounding HDMI circuitry require further inspection. Repair is currently in progress.",
    notes:
      "Initial inspection completed. HDMI port area is being inspected and tested.",
    email: "mark.jansen@example.com",
    description:
      "PlayStation 5 powers on but produces no HDMI output. Initial inspection indicates a possible HDMI port or HDMI circuit issue.",
  },
  {
    id: "WO-00121",
    customer: "Mark Jansen",
    customerId: "CUS-00124",
    device: "PlayStation 5",
    deviceId: "DEV-00087",
    issue: "Overheating",
    status: "Completed",
    created: "5 January 2025",
    updated: "2 months ago",
    diagnosis:
      "The console was overheating due to accumulated dust and degraded thermal material.",
    notes:
      "Internal cleaning and thermal maintenance completed. Console tested successfully.",
    email: "mark.jansen@example.com",
    description:
      "PlayStation 5 was overheating during extended use. Internal cleaning and thermal maintenance were performed.",
  },
  {
    id: "WO-00135",
    customer: "Mark Jansen",
    customerId: "CUS-00124",
    device: "DualSense",
    deviceId: "DEV-00052",
    issue: "Stick drift",
    status: "Completed",
    created: "1 March 2025",
    updated: "2 weeks ago",
    diagnosis:
      "The analog stick module was showing unwanted movement and inconsistent centering.",
    notes: "Stick module replaced and controller tested successfully.",
    email: "mark.jansen@example.com",
    description:
      "DualSense controller reported unwanted movement from the analog stick. Stick module replacement was performed.",
  },
];

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const workOrder = workOrders.find((workOrder) => workOrder.id === id);

  if (!workOrder) {
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
              <h1 className="text-3xl font-bold tracking-tight">{id}</h1>

              <StatusBadge status={workOrder.status} />
            </div>

            <p className="mt-1 text-muted-foreground">
              {workOrder.device} · {workOrder.issue}
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
                  {workOrder.notes}
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
                    <p className="font-medium">Repair started</p>

                    <p className="text-sm text-muted-foreground">
                      Today · 12 minutes ago
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

                    <p className="text-sm text-muted-foreground">
                      Today · 10:24
                    </p>
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
                    href={`/dashboard/customers/${workOrder.customerId}`}
                    className="font-medium hover:underline"
                  >
                    {workOrder.customer}
                  </Link>

                  <p className="text-sm text-muted-foreground">Customer</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Mail className="size-4 text-muted-foreground" />

                <span className="text-muted-foreground">{workOrder.email}</span>
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
                <Link
                  href={`/dashboard/devices/${workOrder.deviceId}`}
                  className="text-sm font-medium hover:underline"
                >
                  {workOrder.deviceId}
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Device</span>

                <span className="text-sm font-medium">{workOrder.device}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>

                <span className="flex items-center gap-2 text-sm">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  {workOrder.created}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Updated</span>

                <span className="text-sm">{workOrder.updated}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
