import { Activity, CheckCircle2, Clock3, Wrench } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClickableWorkOrder } from "@/components/clickable-work-order";
import { StatusBadge } from "@/components/status-badge";

const stats = [
  {
    title: "Active Repairs",
    value: "8",
    description: "Currently being worked on",
    icon: Wrench,
    color: "blue",
  },
  {
    title: "Waiting Approval",
    value: "3",
    description: "Waiting for customer response",
    icon: Clock3,
    color: "amber",
  },
  {
    title: "Testing",
    value: "2",
    description: "Currently being tested",
    icon: Activity,
    color: "purple",
  },
  {
    title: "Ready for Pickup",
    value: "4",
    description: "Repairs completed",
    icon: CheckCircle2,
    color: "green",
  },
];
const recentWorkOrders = [
  {
    id: "WO-00142",
    device: "PlayStation 5",
    issue: "No HDMI output",
    status: "Repairing",
  },
  {
    id: "WO-00141",
    device: "DualSense",
    issue: "Stick drift",
    status: "Testing",
  },
  {
    id: "WO-00140",
    device: "PlayStation 4",
    issue: "No power",
    status: "Waiting",
  },
  {
    id: "WO-00139",
    device: "DualSense",
    issue: "USB-C replacement",
    status: "Completed",
  },
];

const recentActivity = [
  {
    title: "Repair started",
    device: "PlayStation 5",
    workOrderId: "WO-00142",
    time: "12 minutes ago",
  },
  {
    title: "Work order created",
    device: "DualSense",
    workOrderId: "WO-00143",
    time: "32 minutes ago",
  },
  {
    title: "Repair completed",
    device: "PlayStation 4",
    workOrderId: "WO-00138",
    time: "1 hour ago",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Good afternoon, Ugur
        </h1>

        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening in your workshop today.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <div
                className={`absolute inset-x-0 top-0 h-1 ${stat.color === "blue"
                  ? "bg-blue-500"
                  : stat.color === "amber"
                    ? "bg-amber-500"
                    : stat.color === "purple"
                      ? "bg-purple-500"
                      : "bg-green-500"
                  }`}
              />

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>

                <div
                  className={`rounded-lg p-2 ${stat.color === "blue"
                    ? "bg-blue-500/10 text-blue-500"
                    : stat.color === "amber"
                      ? "bg-amber-500/10 text-amber-500"
                      : stat.color === "purple"
                        ? "bg-purple-500/10 text-purple-500"
                        : "bg-green-500/10 text-green-500"
                    }`}
                >
                  <Icon className="size-4" />
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent work orders */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Work Orders</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-1">
              {recentWorkOrders.map((workOrder) => (
                <ClickableWorkOrder
                  key={workOrder.id}
                  id={workOrder.id}
                  className="flex items-center justify-between gap-6 p-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{workOrder.id}</span>

                      <span className="text-sm text-muted-foreground">
                        {workOrder.device}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {workOrder.issue}
                    </p>
                  </div>

                  <StatusBadge status={workOrder.status} />
                </ClickableWorkOrder>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <ClickableWorkOrder
                  key={activity.workOrderId}
                  id={activity.workOrderId}
                  className="flex gap-3 p-2"
                >
                  <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />

                  <div className="min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>

                    <p className="text-sm text-muted-foreground">
                      {activity.device} — {activity.workOrderId}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {activity.time}
                    </p>
                  </div>
                </ClickableWorkOrder>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
