import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  User,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const workOrder = {
  id: "WO-00142",
  customer: "Mark Jansen",
  email: "mark.jansen@example.com",
  phone: "+31 6 12345678",
  device: "PlayStation 5",
  issue: "No HDMI output",
  status: "Repairing",
  created: "21 September 2026",
  updated: "12 minutes ago",
  diagnosis:
    "HDMI output is not detected. Initial inspection indicates a possible HDMI port or HDMI circuit issue.",
  notes:
    "Console powers on normally. No video signal detected. HDMI port inspection required.",
};

function getStatusClass(status: string) {
  switch (status) {
    case "Repairing":
      return "border-blue-500/30 bg-blue-500/10 text-blue-500";

    case "Waiting":
      return "border-amber-500/30 bg-amber-500/10 text-amber-500";

    case "Testing":
      return "border-purple-500/30 bg-purple-500/10 text-purple-500";

    case "Completed":
      return "border-green-500/30 bg-green-500/10 text-green-500";

    default:
      return "";
  }
}

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/dashboard/work-orders">
            <ArrowLeft />
            Back to Work Orders
          </Link>
        </Button>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{id}</h1>

              <Badge
                variant="outline"
                className={getStatusClass(workOrder.status)}
              >
                {workOrder.status}
              </Badge>
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
                  <p className="font-medium">{workOrder.customer}</p>

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

                <span className="text-sm font-medium">{workOrder.id}</span>
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
