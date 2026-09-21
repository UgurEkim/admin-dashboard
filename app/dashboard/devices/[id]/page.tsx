import Link from "next/link";
import { ArrowLeft, Calendar, ClipboardList, Hash, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { notFound } from "next/navigation";

const devices = [
  {
    id: "DEV-00087",
    name: "PlayStation 5",
    serialNumber: "S01A23456789",
    category: "Console",
    model: "CFI-1216A",
    customer: "Mark Jansen",
    customerId: "CUS-00124",
    created: "14 March 2025",
    workOrders: [
      {
        id: "WO-00142",
        issue: "No HDMI output",
        status: "Repairing",
        updated: "12 minutes ago",
      },
      {
        id: "WO-00121",
        issue: "Overheating",
        status: "Completed",
        updated: "2 months ago",
      },
    ],
  },
  {
    id: "DEV-00052",
    name: "DualSense",
    serialNumber: "CFI-ZCT1W-12345",
    category: "Controller",
    model: "CFI-ZCT1W",
    customer: "Mark Jansen",
    customerId: "CUS-00124",
    created: "8 January 2025",
    workOrders: [
      {
        id: "WO-00135",
        issue: "Stick drift",
        status: "Completed",
        updated: "2 weeks ago",
      },
    ],
  },
];

const workOrders = [
  {
    id: "WO-00142",
    issue: "No HDMI output",
    status: "Repairing",
    updated: "12 minutes ago",
  },
  {
    id: "WO-00121",
    issue: "Overheating",
    status: "Completed",
    updated: "2 months ago",
  },
];

function getStatusClass(status: string) {
  switch (status) {
    case "Repairing":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    case "Testing":
      return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
    case "Waiting":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
    case "Completed":
      return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
    default:
      return "";
  }
}

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const device = devices.find((device) => device.id === id);

  if (!device) {
    notFound();
  }

  const workOrders = device.workOrders;
  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-2 -ml-2"
        nativeButton={false}
        render={<Link href="/dashboard/customers/CUS-00124" />}
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
                <p className="text-sm text-muted-foreground">{device.model}</p>
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
                  {device.created}
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
              href={`/dashboard/customers/${device.customerId}`}
              className="flex items-center gap-3 rounded-md p-2 -m-2 hover:bg-muted"
            >
              <User className="size-4 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">{device.customer}</p>
                <p className="text-xs text-muted-foreground">
                  {device.customerId}
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
            {workOrders.map((workOrder) => (
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
                  <Badge className={getStatusClass(workOrder.status)}>
                    {workOrder.status}
                  </Badge>

                  <span className="text-sm text-muted-foreground">
                    {workOrder.updated}
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
