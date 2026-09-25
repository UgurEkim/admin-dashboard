"use client";

import {
    AlertTriangle,
    BatteryFull,
    BatteryLow,
    BatteryMedium,
    Bug,
    Cable,
    Code2,
    Gamepad2,
    Info,
    RefreshCw,
    Save,
    Usb,
    Wrench,
} from "lucide-react";
import { useSyncExternalStore, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

type Controller = {
    model: string;
    hardwareRevision: string;
    firmware: string;
    battery: number;
    connectionType: string;
};

const mockController: Controller = {
    model: "DualSense Wireless Controller",
    hardwareRevision: "BDM-030",
    firmware: "0458",
    battery: 87,
    connectionType: "USB",
};

function BatteryIndicator({ level }: { level: number }) {
    const clampedLevel = Math.max(0, Math.min(100, level));

    let Icon = BatteryFull;

    if (clampedLevel <= 15) {
        Icon = BatteryLow;
    } else if (clampedLevel <= 40) {
        Icon = BatteryMedium;
    }

    return (
        <div className="flex items-center gap-2">
            <Icon className="size-5" />
            <span>{clampedLevel}%</span>
        </div>
    );
}

const subscribeToCapabilities = () => () => {};

export default function ControllerToolsPage() {
    const [connected, setConnected] = useState(false);
    const webHidSupported = useSyncExternalStore(subscribeToCapabilities, () => "hid" in navigator, () => false);

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/40">
                        <Gamepad2 className="size-5" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Controller Tools
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Diagnose, test and calibrate PlayStation controllers.
                        </p>
                    </div>
                </div>
            </div>

            {/* WebHID warning */}
            {!connected && !webHidSupported && (
                <div
                    id="missinghid"
                    className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4"
                >
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />

                    <div className="space-y-1">
                        <p className="font-medium">
                            WebHID unavailable
                        </p>

                        <p className="text-sm text-muted-foreground">
                            This browser does not support WebHID. Use a
                            compatible Chromium-based browser such as Chrome
                            or Edge on a PC or Mac.
                        </p>

                        <p className="text-sm text-muted-foreground">
                            Phones and tablets are not supported.
                        </p>
                    </div>
                </div>
            )}

            {/* Connection card */}
            <Card id="controller-connection">
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Cable className="size-5" />
                                Controller connection
                            </CardTitle>

                            <CardDescription>
                                Connect a compatible controller through WebHID.
                            </CardDescription>
                        </div>

                        <Badge
                            id="connection-status"
                            variant="outline"
                            className={
                                connected
                                    ? "border-green-500/30 bg-green-500/10 text-green-500"
                                    : "border-muted-foreground/30 bg-muted text-muted-foreground"
                            }
                        >
                            <span className="mr-1.5 size-2 rounded-full bg-current" />
                            {connected ? "Connected" : "Not connected"}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent>
                    {!connected ? (
                        <div className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">
                                    No controller connected
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    Connect a DualShock 4, DualSense,
                                    DualSense Edge or VR2 controller and press
                                    Connect.
                                </p>
                            </div>

                            <Button
                                id="connect"
                                type="button"
                                size="lg"
                                className="min-w-40"
                                disabled={!webHidSupported}
                                onClick={() => setConnected(true)}
                            >
                                <Usb className="size-4" />
                                Connect controller
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="font-medium">
                                    {mockController.model}
                                </p>
                                <p>
                                    <BatteryIndicator level={mockController.battery} />
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    id="refresh"
                                    type="button"
                                    variant="outline"
                                    onClick={() => { }}
                                >
                                    <RefreshCw className="size-4" />
                                    Refresh
                                </Button>

                                <Button
                                    id="disconnect"
                                    type="button"
                                    variant="outline"
                                    onClick={() => setConnected(false)}
                                >
                                    <Cable className="size-4" />
                                    Disconnect
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Main controller interface */}
            {connected && (
                <Card id="mainmenu">
                    <CardContent className="pt-6">
                        <Tabs defaultValue="calibration">
                            <TabsList className="w-full justify-start overflow-x-auto">
                                <TabsTrigger
                                    id="controller-tab"
                                    value="calibration"
                                >
                                    <Gamepad2 className="size-4" />
                                    Calibration
                                </TabsTrigger>

                                <TabsTrigger
                                    id="info-tab"
                                    value="info"
                                >
                                    <Info className="size-4" />
                                    Info
                                </TabsTrigger>

                                <TabsTrigger
                                    id="debug-tab"
                                    value="debug"
                                >
                                    <Bug className="size-4" />
                                    Debug
                                </TabsTrigger>
                            </TabsList>

                            {/* Calibration */}
                            <TabsContent
                                id="controller-content"
                                value="calibration"
                                className="mt-6"
                            >
                                <div className="grid gap-6 lg:grid-cols-2">
                                    {/* Left side */}
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Gamepad2 className="size-4" />
                                                    Controller Info
                                                </CardTitle>

                                                <CardDescription>
                                                    Connected controller
                                                    information.
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent>
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Model
                                                        </p>
                                                        <p className="font-medium">
                                                            {mockController.model}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Hardware
                                                        </p>
                                                        <p className="font-medium">
                                                            {mockController.hardwareRevision}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Firmware
                                                        </p>
                                                        <p className="font-medium">
                                                            {mockController.firmware}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Connection
                                                        </p>
                                                        <p className="font-medium">
                                                            {mockController.connectionType}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Battery
                                                        </p>
                                                        <p className="font-medium">
                                                            <BatteryIndicator level={mockController.battery} />
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Status
                                                        </p>
                                                        <p className="font-medium text-green-500">
                                                            Ready
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Controller visualization placeholder */}
                                        <Card id="controller-svg-container">
                                            <CardHeader>
                                                <CardTitle>
                                                    Controller
                                                </CardTitle>

                                                <CardDescription>
                                                    Live controller
                                                    visualization.
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent>
                                                <div
                                                    id="controller-svg-placeholder"
                                                    className="flex min-h-72 items-center justify-center rounded-lg border border-dashed bg-muted/20"
                                                >
                                                    <div className="text-center text-muted-foreground">
                                                        <Gamepad2 className="mx-auto mb-3 size-12 opacity-40" />

                                                        <p className="text-sm font-medium">
                                                            Controller
                                                            visualization
                                                        </p>

                                                        <p className="mt-1 text-xs">
                                                            Will be added in the
                                                            next step.
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Right side */}
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    Calibration
                                                </CardTitle>

                                                <CardDescription>
                                                    Calibrate the controller
                                                    sticks and manage saved
                                                    calibration data.
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent>
                                                <div className="rounded-lg border">
                                                    <Button
                                                        id="quick-center-calib"
                                                        type="button"
                                                        variant="ghost"
                                                        className="h-11 w-full justify-center rounded-none bg-sky-600/10 text-sky-600 hover:bg-sky-600/20 focus-visible:border-sky-600/40 focus-visible:ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-400 dark:hover:bg-sky-400/20 dark:focus-visible:border-sky-400/40 dark:focus-visible:ring-sky-400/40"
                                                    >
                                                        <Gamepad2 className="size-4" />
                                                        Calibrate stick center
                                                    </Button>

                                                    <div className="border-t" />

                                                    <Button
                                                        id="range-calib"
                                                        type="button"
                                                        variant="ghost"
                                                        className="h-11 w-full justify-center rounded-none bg-sky-600/10 text-sky-600 hover:bg-sky-600/20 focus-visible:border-sky-600/40 focus-visible:ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-400 dark:hover:bg-sky-400/20 dark:focus-visible:border-sky-400/40 dark:focus-visible:ring-sky-400/40"
                                                    >
                                                        <Gamepad2 className="size-4" />
                                                        Calibrate stick range
                                                    </Button>

                                                    <div className="border-t" />

                                                    <Button
                                                        id="ds5finetune"
                                                        type="button"
                                                        variant="ghost"
                                                        className="h-11 w-full justify-center rounded-none bg-amber-600/10 text-amber-600 hover:bg-amber-600/20 focus-visible:border-amber-600/40 focus-visible:ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400/20 dark:focus-visible:border-amber-400/40 dark:focus-visible:ring-amber-400/40"
                                                    >
                                                        <Wrench className="size-4" />
                                                        Fine-tune stick
                                                        calibration
                                                    </Button>

                                                    <div className="border-t" />

                                                    <Button
                                                        id="savechanges"
                                                        type="button"
                                                        variant="ghost"
                                                        className="h-11 w-full justify-center rounded-none bg-green-600/10 text-green-600 hover:bg-green-600/20 focus-visible:border-green-600/40 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:hover:bg-green-400/20 dark:focus-visible:border-green-400/40 dark:focus-visible:ring-green-400/40"
                                                    >
                                                        <Save className="size-4" />
                                                        Save changes permanently
                                                    </Button>

                                                    <div className="border-t" />

                                                    <Button
                                                        id="restore-calibration-btn"
                                                        type="button"
                                                        variant="ghost"
                                                        className="h-11 w-full justify-center rounded-none bg-amber-600/10 text-amber-600 hover:bg-amber-600/20 focus-visible:border-amber-600/40 focus-visible:ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400/20 dark:focus-visible:border-amber-400/40 dark:focus-visible:ring-amber-400/40"
                                                    >

                                                        <Save className="size-4" />
                                                        Restore calibration
                                                    </Button>

                                                    <div className="border-t" />

                                                    <Button
                                                        id="resetBtn"
                                                        type="button"
                                                        variant="ghost"
                                                        className="h-11 w-full justify-center rounded-none bg-red-600/10 text-red-600 hover:bg-red-600/20 focus-visible:border-red-600/40 focus-visible:ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:hover:bg-red-400/20 dark:focus-visible:border-red-400/40 dark:focus-visible:ring-red-400/40"
                                                    >
                                                        <Save className="size-4" />
                                                        Reboot controller
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Joystick diagnostics */}
                                        <Card id="stick-diagnostics">
                                            <CardHeader>
                                                <CardTitle>
                                                    Joystick Info
                                                </CardTitle>

                                                <CardDescription>
                                                    Live stick position and
                                                    diagnostic information.
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent className="space-y-5">
                                                <div className="flex min-h-44 items-center justify-center rounded-lg border border-dashed bg-muted/20">
                                                    <div className="text-center text-muted-foreground">
                                                        <p className="text-sm font-medium">
                                                            Stick graph
                                                        </p>

                                                        <p className="mt-1 text-xs">
                                                            Live diagnostic
                                                            graph will be added
                                                            later.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-4 gap-2">
                                                    {[
                                                        ["LX", "0"],
                                                        ["LY", "0"],
                                                        ["RX", "0"],
                                                        ["RY", "0"],
                                                    ].map(([label, value]) => (
                                                        <div
                                                            key={label}
                                                            className="rounded-lg border bg-muted/20 p-3 text-center"
                                                        >
                                                            <p className="text-xs text-muted-foreground">
                                                                {label}
                                                            </p>

                                                            <p className="mt-1 font-mono text-sm font-medium">
                                                                {value}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex flex-wrap justify-center gap-2">
                                                    <Button
                                                        id="normalMode"
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                    >
                                                        Normal
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        10× zoom
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        Check circularity
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Info */}
                            <TabsContent
                                id="info-content"
                                value="info"
                                className="mt-6"
                            >
                                <div className="grid gap-6 lg:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Code2 className="size-4" />
                                                Software
                                            </CardTitle>

                                            <CardDescription>
                                                Controller software and
                                                firmware information.
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent>
                                            <dl className="space-y-4 text-sm">
                                                <div className="flex justify-between gap-4 border-b pb-3">
                                                    <dt className="text-muted-foreground">
                                                        Firmware
                                                    </dt>
                                                    <dd className="font-medium">
                                                        {mockController.firmware}
                                                    </dd>
                                                </div>

                                                <div className="flex justify-between gap-4">
                                                    <dt className="text-muted-foreground">
                                                        Connection
                                                    </dt>
                                                    <dd className="font-medium">
                                                        WebHID
                                                    </dd>
                                                </div>
                                            </dl>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Gamepad2 className="size-4" />
                                                Hardware
                                            </CardTitle>

                                            <CardDescription>
                                                Controller hardware
                                                information.
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent>
                                            <dl className="space-y-4 text-sm">
                                                <div className="flex justify-between gap-4 border-b pb-3">
                                                    <dt className="text-muted-foreground">
                                                        Model
                                                    </dt>
                                                    <dd className="font-medium">
                                                        {mockController.model}
                                                    </dd>
                                                </div>

                                                <div className="flex justify-between gap-4">
                                                    <dt className="text-muted-foreground">
                                                        Hardware revision
                                                    </dt>
                                                    <dd className="font-medium">
                                                        {mockController.hardwareRevision}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* Debug */}
                            <TabsContent
                                id="debug-content"
                                value="debug"
                                className="mt-6"
                            >
                                <div className="space-y-6">
                                    <p className="text-sm text-muted-foreground">
                                        Debug information and manual controller
                                        commands.
                                    </p>

                                    <div className="grid gap-6 lg:grid-cols-2">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Bug className="size-4" />
                                                    Debug Info
                                                </CardTitle>
                                            </CardHeader>

                                            <CardContent>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        NVS Status
                                                    </span>

                                                    <Badge variant="secondary">
                                                        Unknown
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Wrench className="size-4" />
                                                    Debug buttons
                                                </CardTitle>
                                            </CardHeader>

                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                    >
                                                        Query NVS status
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                    >
                                                        NVS unlock
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                    >
                                                        NVS lock
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )
            }
        </div >
    );
}