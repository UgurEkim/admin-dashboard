"use client";

import { useState } from "react";
import {
    ArrowDown,
    ChevronDown,
    Circle,
    Eraser,
    Send,
    Terminal,
    Wifi,
    WifiOff,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface TerminalMessage {
    id: number;
    direction: "RX" | "TX";
    message: string;
    timestamp: string;
}

const baudRates = [
    "9600",
    "19200",
    "38400",
    "57600",
    "115200",
    "230400",
    "460800",
    "921600",
];

const dataBits = ["5", "6", "7", "8"];
const stopBits = ["1", "1.5", "2"];
const parities = ["None", "Even", "Odd"];

export default function UartTerminalPage() {
    const [connected, setConnected] = useState(false);
    const [port, setPort] = useState("COM3");
    const [baudRate, setBaudRate] = useState("115200");
    const [dataBit, setDataBit] = useState("8");
    const [stopBit, setStopBit] = useState("1");
    const [parity, setParity] = useState("None");
    const [command, setCommand] = useState("");
    const [autoScroll, setAutoScroll] = useState(true);

    const [messages, setMessages] = useState<TerminalMessage[]>([
        {
            id: 1,
            direction: "RX",
            message: "UART terminal ready.",
            timestamp: "12:41:03",
        },
        {
            id: 2,
            direction: "RX",
            message: "Waiting for connection...",
            timestamp: "12:41:03",
        },
    ]);

    const toggleConnection = () => {
        if (connected) {
            setConnected(false);

            setMessages((current) => [
                ...current,
                {
                    id: Date.now(),
                    direction: "RX",
                    message: "Disconnected.",
                    timestamp: new Date().toLocaleTimeString(),
                },
            ]);

            return;
        }

        setConnected(true);

        setMessages((current) => [
            ...current,
            {
                id: Date.now(),
                direction: "RX",
                message: `Connected to ${port} at ${baudRate} baud.`,
                timestamp: new Date().toLocaleTimeString(),
            },
        ]);
    };

    const sendCommand = () => {
        const trimmedCommand = command.trim();

        if (!trimmedCommand || !connected) {
            return;
        }

        const now = new Date().toLocaleTimeString();

        setMessages((current) => [
            ...current,
            {
                id: Date.now(),
                direction: "TX",
                message: trimmedCommand,
                timestamp: now,
            },
        ]);

        setCommand("");

        setTimeout(() => {
            setMessages((current) => [
                ...current,
                {
                    id: Date.now(),
                    direction: "RX",
                    message: `Mock response: ${trimmedCommand}`,
                    timestamp: new Date().toLocaleTimeString(),
                },
            ]);
        }, 300);
    };

    const clearTerminal = () => {
        setMessages([]);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">UART Terminal</h1>
                <p className="mt-1 text-muted-foreground">
                    Monitor and communicate with UART devices.
                </p>
            </div>

            {/* Connection */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Terminal className="size-5" />
                            Connection
                        </CardTitle>

                        <Badge
                            variant="outline"
                            className={
                                connected
                                    ? "border-green-500/30 bg-green-500/10 text-green-500"
                                    : "border-muted-foreground/30 bg-muted text-muted-foreground"
                            }
                        >
                            <Circle className="mr-1.5 size-2 fill-current" />
                            {connected ? "Connected" : "Disconnected"}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Port</label>
                            <Select value={port} onValueChange={(value) => value && setPort(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COM3">COM3</SelectItem>
                                    <SelectItem value="COM4">COM4</SelectItem>
                                    <SelectItem value="COM5">COM5</SelectItem>
                                    <SelectItem value="/dev/ttyUSB0">
                                        /dev/ttyUSB0
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Baud rate</label>
                            <Select
                                value={baudRate}
                                onValueChange={(value) => value && setBaudRate(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {baudRates.map((rate) => (
                                        <SelectItem key={rate} value={rate}>
                                            {rate}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Data bits</label>
                            <Select
                                value={dataBit}
                                onValueChange={(value) => value && setDataBit(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {dataBits.map((bits) => (
                                        <SelectItem key={bits} value={bits}>
                                            {bits}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Stop bits</label>
                            <Select
                                value={stopBit}
                                onValueChange={(value) => value && setStopBit(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {stopBits.map((bits) => (
                                        <SelectItem key={bits} value={bits}>
                                            {bits}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Parity</label>
                            <Select
                                value={parity}
                                onValueChange={(value) => value && setParity(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {parities.map((value) => (
                                        <SelectItem key={value} value={value}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button onClick={toggleConnection}>
                            {connected ? (
                                <>
                                    <WifiOff className="size-4" />
                                    Disconnect
                                </>
                            ) : (
                                <>
                                    <Wifi className="size-4" />
                                    Connect
                                </>
                            )}
                        </Button>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Configuration:</span>
                            <span className="font-mono">
                                {baudRate}-{dataBit}-{parity === "None" ? "N" : parity[0]}-
                                {stopBit}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Terminal */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Terminal</CardTitle>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAutoScroll((current) => !current)}
                            >
                                <ArrowDown className="size-4" />
                                Auto-scroll: {autoScroll ? "On" : "Off"}
                            </Button>

                            <Button variant="outline" size="sm" onClick={clearTerminal}>
                                <Eraser className="size-4" />
                                Clear
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="h-[420px] overflow-y-auto rounded-lg border bg-muted/30 p-4 font-mono text-sm">
                        {messages.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                Terminal cleared.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className="flex gap-3 leading-relaxed"
                                    >
                                        <span className="shrink-0 text-muted-foreground">
                                            [{message.timestamp}]
                                        </span>

                                        <span
                                            className={
                                                message.direction === "TX"
                                                    ? "font-semibold text-blue-500"
                                                    : "font-semibold text-green-500"
                                            }
                                        >
                                            {message.direction}
                                        </span>

                                        <span className="break-all">{message.message}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Send */}
            <Card>
                <CardHeader>
                    <CardTitle>Send Data</CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        className="flex flex-col gap-3 sm:flex-row"
                        onSubmit={(event) => {
                            event.preventDefault();
                            sendCommand();
                        }}
                    >
                        <Input
                            value={command}
                            onChange={(event) => setCommand(event.target.value)}
                            placeholder={
                                connected
                                    ? "Enter command or hexadecimal data..."
                                    : "Connect to a UART device first..."
                            }
                            disabled={!connected}
                            className="font-mono"
                        />

                        <Button
                            type="submit"
                            disabled={!connected || command.trim() === ""}
                        >
                            <Send className="size-4" />
                            Send
                        </Button>
                    </form>

                    <p className="mt-2 text-xs text-muted-foreground">
                        Press Enter to send.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}