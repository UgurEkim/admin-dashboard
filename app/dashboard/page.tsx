import { Activity, CheckCircle2, Clock3, Wrench } from "lucide-react";

import {
  customerRepository,
  deviceRepository,
  workOrderRepository,
} from "@/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClickableWorkOrder } from "@/components/clickable-work-order";
import { StatusBadge } from "@/components/status-badge";
import { formatRelativeTime } from "@/lib/format-relative-time";
import {
  createCustomerMap,
  createDeviceMap,
} from "@/lib/data-maps";
import {
  getWorkOrderActivityTitle,
  getWorkOrderStatusColor,
} from "@/lib/work-order-status";
import { sortWorkOrdersByUpdatedAt } from "@/lib/sort-work-orders";
import { formatDateTime } from "@/lib/format-date-time";

const colorClasses = {
  blue: {
    bar: "bg-blue-500",
    icon: "bg-blue-500/10 text-blue-500",
  },
  amber: {
    bar: "bg-amber-500",
    icon: "bg-amber-500/10 text-amber-500",
  },
  purple: {
    bar: "bg-purple-500",
    icon: "bg-purple-500/10 text-purple-500",
  },
  green: {
    bar: "bg-green-500",
    icon: "bg-green-500/10 text-green-500",
  },
};

export default async function DashboardPage() {
  const [workOrders, devices, customers] = await Promise.all([
    workOrderRepository.getAll(),
    deviceRepository.getAll(),
    customerRepository.getAll(),
  ]);

  const deviceMap = createDeviceMap(devices);
  const customerMap = createCustomerMap(customers);

  const statusCounts = {
    Repairing: 0,
    Waiting: 0,
    Testing: 0,
    Completed: 0,
  };

  for (const workOrder of workOrders) {
    statusCounts[workOrder.status]++;
  }


  const stats = [
    {
      title: "Active Repairs",
      value: statusCounts.Repairing,
      description: "Currently being worked on",
      icon: Wrench,
      color: getWorkOrderStatusColor("Repairing"),
    },
    {
      title: "Waiting Approval",
      value: statusCounts.Waiting,
      description: "Waiting for customer response",
      icon: Clock3,
      color: getWorkOrderStatusColor("Waiting"),
    },
    {
      title: "Testing",
      value: statusCounts.Testing,
      description: "Currently being tested",
      icon: Activity,
      color: getWorkOrderStatusColor("Testing"),
    },
    {
      title: "Ready for Pickup",
      value: statusCounts.Completed,
      description: "Repairs completed",
      icon: CheckCircle2,
      color: getWorkOrderStatusColor("Completed"),
    },
  ];

  const sortedWorkOrders = sortWorkOrdersByUpdatedAt(workOrders);

  const recentWorkOrders = sortedWorkOrders.slice(0, 4);
  const recentActivity = sortedWorkOrders.slice(0, 3);

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
          const colors = colorClasses[stat.color];

          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <div
                className={`absolute inset-x-0 top-0 h-1 ${colors.bar}`}
              />

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>

                <div
                  className={`rounded-lg p-2 ${colors.icon}`}
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
              {recentWorkOrders.map((workOrder) => {
                const device = deviceMap.get(workOrder.deviceId);

                return (
                  <ClickableWorkOrder
                    key={workOrder.id}
                    id={workOrder.id}
                    className="flex items-center justify-between gap-6 p-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          {workOrder.id}
                        </span>

                        <span className="text-sm text-muted-foreground">
                          {device?.name ?? "Unknown device"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {workOrder.issue}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(workOrder.updatedAt)}
                      </p>
                    </div>

                    <StatusBadge status={workOrder.status} />
                  </ClickableWorkOrder>
                );
              })}
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
              {recentActivity.map((workOrder) => {
                const device = deviceMap.get(workOrder.deviceId);
                const customer = customerMap.get(workOrder.customerId);

                return (
                  <ClickableWorkOrder
                    key={workOrder.id}
                    id={workOrder.id}
                    className="flex gap-3 p-2"
                  >
                    <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />

                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {getWorkOrderActivityTitle(workOrder.status)}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {device?.name ?? "Unknown device"} —{" "}
                        {customer?.name ?? "Unknown customer"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {formatRelativeTime(workOrder.updatedAt)}
                      </p>
                    </div>
                  </ClickableWorkOrder>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}