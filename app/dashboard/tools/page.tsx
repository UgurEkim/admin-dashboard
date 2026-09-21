import { Cable, Gamepad2, Gauge } from "lucide-react";

import { ToolCard } from "@/components/tool-card";

const tools = [
    {
        title: "Controller Tools",
        description:
            "Test and diagnose controllers, buttons, analog sticks, triggers, and other inputs.",
        href: "/dashboard/tools/controller",
        icon: Gamepad2,
    },
    {
        title: "UART Terminal",
        description:
            "Connect to devices over UART and inspect serial communication for diagnostics.",
        href: "/dashboard/tools/uart",
        icon: Cable,
    },
    {
        title: "Multimeter",
        description:
            "View measurements and readings from a connected digital multimeter.",
        href: "/dashboard/tools/multimeter",
        icon: Gauge,
    },
];

export default function ToolsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Tools</h1>
                <p className="text-muted-foreground">
                    Repair and diagnostic tools for your workshop.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tools.map((tool) => (
                    <ToolCard key={tool.title} {...tool} />
                ))}
            </div>
        </div>
    );
}