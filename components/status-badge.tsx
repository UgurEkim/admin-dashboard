import { Badge } from "@/components/ui/badge";

import type { WorkOrderStatus } from "@/data";

interface StatusBadgeProps {
    status: WorkOrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const getStatusClass = () => {
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
    };

    return (
        <Badge variant="outline" className={getStatusClass()}>
            {status}
        </Badge>
    );
}