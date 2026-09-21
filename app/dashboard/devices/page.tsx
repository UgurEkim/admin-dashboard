"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const devices = [
    {
        id: "DEV-00087",
        name: "PlayStation 5",
        customer: "Mark Jansen",
        customerId: "CUS-00124",
        serialNumber: "S01A23456789",
        category: "Console",
        workOrders: 2,
        status: "Repairing",
        lastActivity: "12 minutes ago",
    },
    {
        id: "DEV-00052",
        name: "DualSense",
        customer: "Mark Jansen",
        customerId: "CUS-00124",
        serialNumber: "CFI-ZCT1W-12345",
        category: "Controller",
        workOrders: 1,
        status: "Completed",
        lastActivity: "2 weeks ago",
    },
    {
        id: "DEV-00091",
        name: "PlayStation 5",
        customer: "Lisa de Vries",
        customerId: "CUS-00123",
        serialNumber: "S01B98765432",
        category: "Console",
        workOrders: 3,
        status: "Testing",
        lastActivity: "28 minutes ago",
    },
    {
        id: "DEV-00076",
        name: "Xbox Series X",
        customer: "Thomas Bakker",
        customerId: "CUS-00122",
        serialNumber: "XBX123456789",
        category: "Console",
        workOrders: 1,
        status: "Waiting",
        lastActivity: "1 hour ago",
    },
    {
        id: "DEV-00063",
        name: "Nintendo Switch OLED",
        customer: "Sophie Peters",
        customerId: "CUS-00121",
        serialNumber: "XAW70012345678",
        category: "Console",
        workOrders: 2,
        status: "Completed",
        lastActivity: "2 hours ago",
    },
];

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

export default function DevicesPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [status, setStatus] = useState("all");

    const filteredDevices = useMemo(() => {
        const query = search.toLowerCase().trim();

        return devices.filter((device) => {
            const matchesSearch =
                query === "" ||
                device.name.toLowerCase().includes(query) ||
                device.customer.toLowerCase().includes(query) ||
                device.serialNumber.toLowerCase().includes(query) ||
                device.id.toLowerCase().includes(query);

            const matchesCategory =
                category === "all" || device.category === category;

            const matchesStatus = status === "all" || device.status === status;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [search, category, status]);

    const clearFilters = () => {
        setSearch("");
        setCategory("all");
        setStatus("all");
    };

    const hasFilters =
        search.trim() !== "" || category !== "all" || status !== "all";

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Devices</h1>

                <p className="mt-1 text-muted-foreground">
                    Manage customer devices and view their repair history.
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            placeholder="Search by device, customer, serial number, or ID..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <Select
                        value={category}
                        onValueChange={(value) => {
                            if (value !== null) {
                                setCategory(value);
                            }
                        }}
                    >
                        <SelectTrigger className="w-full md:w-44">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            <SelectItem value="Console">Console</SelectItem>
                            <SelectItem value="Controller">Controller</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={status}
                        onValueChange={(value) => {
                            if (value !== null) {
                                setStatus(value);
                            }
                        }}
                    >
                        <SelectTrigger className="w-full md:w-44">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="Repairing">Repairing</SelectItem>
                            <SelectItem value="Waiting">Waiting</SelectItem>
                            <SelectItem value="Testing">Testing</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Clear filters
                        </button>
                    )}
                </CardContent>
            </Card>

            {/* Results */}
            <div className="text-sm text-muted-foreground">
                Showing {filteredDevices.length} of {devices.length} devices
            </div>

            {/* Device table */}
            <Card>
                <CardContent className="p-0">
                    {filteredDevices.length === 0 ? (
                        <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
                            <p className="font-medium">No devices found</p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Try adjusting your search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr className="text-left text-sm text-muted-foreground">
                                        <th className="px-6 py-4 font-medium">Device</th>
                                        <th className="px-6 py-4 font-medium">Customer</th>
                                        <th className="px-6 py-4 font-medium">Serial Number</th>
                                        <th className="px-6 py-4 font-medium">Category</th>
                                        <th className="px-6 py-4 font-medium">Work Orders</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Last Activity</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredDevices.map((device) => (
                                        <tr
                                            key={device.id}
                                            className="cursor-pointer border-b transition-colors hover:bg-muted/50 last:border-0"
                                            tabIndex={0}
                                            role="link"
                                            onClick={() => router.push(`/dashboard/devices/${device.id}`)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    router.push(`/dashboard/devices/${device.id}`);
                                                }
                                            }}
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium">{device.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {device.id}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">{device.customer}</td>

                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {device.serialNumber}
                                            </td>

                                            <td className="px-6 py-4">
                                                {device.category}
                                            </td>

                                            <td className="px-6 py-4">
                                                {device.workOrders}
                                            </td>

                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant="outline"
                                                    className={getStatusClass(device.status)}
                                                >
                                                    {device.status}
                                                </Badge>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {device.lastActivity}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}