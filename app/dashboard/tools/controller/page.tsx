"use client";

import {
    AlertTriangle,
    Cable,
    CircleHelp,
    Gamepad2,
    Info,
    RefreshCw,
    Usb,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function ControllerToolsPage() {
    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <Gamepad2 className="size-5" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Controller Tools
                        </h1>

                        <p className="mt-1 text-muted-foreground">
                            Connect, test, diagnose, and calibrate compatible
                            PlayStation controllers.
                        </p>
                    </div>
                </div>
            </div>

            <Card id="controller-panel">
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Usb className="size-5" />
                                Controller connection
                            </CardTitle>

                            <CardDescription>
                                Connect a controller using WebHID to access its
                                diagnostic and calibration tools.
                            </CardDescription>
                        </div>

                        <Badge
                            id="connection-status"
                            variant="outline"
                            className="w-fit border-muted-foreground/30 bg-muted text-muted-foreground"
                        >
                            <span className="mr-1.5 size-2 rounded-full bg-current" />
                            Not connected
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div
                        id="missinghid"
                        className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4"
                    >
                        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />

                        <div className="space-y-1">
                            <p className="font-medium text-amber-500">
                                WebHID availability
                            </p>

                            <p className="text-sm text-muted-foreground">
                                WebHID is required to communicate with a physical
                                controller. Use a compatible Chromium-based browser
                                such as Chrome or Edge.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            id="connect"
                            type="button"
                            size="lg"
                            className="min-w-40"
                        >
                            <Cable className="size-4" />
                            Connect controller
                        </Button>

                        <Button
                            id="disconnect"
                            type="button"
                            variant="outline"
                            size="lg"
                            disabled
                        >
                            Disconnect
                        </Button>

                        <Button
                            id="refresh"
                            type="button"
                            variant="outline"
                            size="lg"
                        >
                            <RefreshCw className="size-4" />
                            Refresh
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        No controller communication is active yet. The
                        connection controls will be wired to the DualShock
                        Tools WebHID implementation in the next step.
                    </p>
                </CardContent>
            </Card>

            <Card id="controller-help">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CircleHelp className="size-5" />
                        Before connecting
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>
                            • Connect the controller using a USB data cable.
                        </li>

                        <li>
                            • Make sure no other application is exclusively using
                            the controller.
                        </li>

                        <li>
                            • Calibration should only be performed when necessary,
                            especially after joystick hardware replacement.
                        </li>

                        <li>
                            • Do not disconnect the controller while a calibration
                            operation is writing data.
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}