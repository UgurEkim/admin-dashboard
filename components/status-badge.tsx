import { Badge } from "@/components/ui/badge";
import type { WorkOrderStatus } from "@/data";
import { getWorkOrderStatusStyle } from "@/lib/work-order-status";

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  const colors = getWorkOrderStatusStyle(status);
  return (
    <Badge variant="outline" className={colors.badge}>
      <span
        aria-hidden="true"
        className={"size-1.5 rounded-full " + colors.bar}
      />
      {status}
    </Badge>
  );
}
