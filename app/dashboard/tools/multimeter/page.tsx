"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    CircleStop,
    Eraser,
    Play,
    RotateCcw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type MeasurementType =
    | "Voltage"
    | "Resistance"
    | "Current"
    | "Continuity"
    | "Diode";

type MeasurementMode = "DC" | "AC";

interface Measurement {
    id: number;
    value: number;
    timestamp: string;
}

interface MeasurementModeIconProps {
    className?: string;
}

function VoltageIcon({
    className,
}: MeasurementModeIconProps) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M12 9v30M36 9v30"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M7 14h10M31 34h10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M24 7v34"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="3 3"
                opacity="0.35"
            />

            <path
                d="m21 18 6 0-4 8h5l-7 12 2-9h-5l3-11Z"
                fill="currentColor"
            />
        </svg>
    );
}

function ResistanceIcon({
    className,
}: MeasurementModeIconProps) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M4 24h7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="m11 24 4-7 4 14 4-14 4 14 4-14 4 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M35 24h9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <text
                x="24"
                y="13"
                textAnchor="middle"
                fill="currentColor"
                fontSize="10"
                fontWeight="600"
                fontFamily="monospace"
            >
                Ω
            </text>
        </svg>
    );
}

function CurrentIcon({
    className,
}: MeasurementModeIconProps) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M7 24h34"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M24 7v34"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="3 3"
                opacity="0.35"
            />

            <path
                d="m24 10-6 8h4v9h4v-9h4l-6-8Z"
                fill="currentColor"
            />

            <path
                d="m24 38 6-8h-4v-9h-4v9h-4l6 8Z"
                fill="currentColor"
                opacity="0.55"
            />
        </svg>
    );
}

function ContinuityIcon({
    className,
}: MeasurementModeIconProps) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M5 24h8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M35 24h8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M13 24c4-14 18-14 22 0"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M13 24c4 14 18 14 22 0"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M24 17v14M18 24h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.55"
            />
        </svg>
    );
}

function DiodeIcon({
    className,
}: MeasurementModeIconProps) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M5 24h11"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M16 12v24l16-12-16-12Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
            />

            <path
                d="M32 12v24"
                stroke="currentColor"
                strokeWidth="2.5"
            />

            <path
                d="M32 24h11"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

const measurementTypes: MeasurementType[] = [
    "Voltage",
    "Resistance",
    "Current",
    "Continuity",
    "Diode",
];

const measurementIcons: Record<
    MeasurementType,
    (props: MeasurementModeIconProps) => React.ReactNode
> = {
    Voltage: VoltageIcon,
    Resistance: ResistanceIcon,
    Current: CurrentIcon,
    Continuity: ContinuityIcon,
    Diode: DiodeIcon,
};

const measurementUnits: Record<MeasurementType, string> = {
    Voltage: "V",
    Resistance: "Ω",
    Current: "A",
    Continuity: "Ω",
    Diode: "V",
};

const modeDefaults: Record<
    MeasurementType,
    Record<MeasurementMode, number>
> = {
    Voltage: {
        DC: 5.02,
        AC: 0.42,
    },
    Resistance: {
        DC: 482,
        AC: 482,
    },
    Current: {
        DC: 0.42,
        AC: 0.18,
    },
    Continuity: {
        DC: 0.8,
        AC: 0.8,
    },
    Diode: {
        DC: 0.61,
        AC: 0.61,
    },
};

export default function MultimeterPage() {
    const [measurementType, setMeasurementType] =
        useState<MeasurementType>("Voltage");

    const [measurementMode, setMeasurementMode] =
        useState<MeasurementMode>("DC");

    const [running, setRunning] = useState(false);

    const [currentValue, setCurrentValue] = useState(
        modeDefaults.Voltage.DC,
    );

    const [measurements, setMeasurements] = useState<Measurement[]>(
        [],
    );

    const usesAcDcMode =
        measurementType === "Voltage" ||
        measurementType === "Current";

    const currentUnit = measurementUnits[measurementType];

    const currentDefault =
        modeDefaults[measurementType][measurementMode];

    useEffect(() => {
        if (!running) {
            return;
        }

        const interval = window.setInterval(() => {
            const baseValue =
                modeDefaults[measurementType][measurementMode];

            const variation =
                measurementType === "Resistance"
                    ? (Math.random() - 0.5) * 30
                    : (Math.random() - 0.5) * baseValue * 0.04;

            const value = Math.max(0, baseValue + variation);

            setCurrentValue(value);

            setMeasurements((current) => {
                const nextMeasurement: Measurement = {
                    id: Date.now(),
                    value,
                    timestamp: new Date().toLocaleTimeString(),
                };

                return [...current, nextMeasurement].slice(-60);
            });
        }, 500);

        return () => window.clearInterval(interval);
    }, [measurementType, measurementMode, running]);

    const statistics = useMemo(() => {
        if (measurements.length === 0) {
            return {
                min: currentValue,
                max: currentValue,
                average: currentValue,
            };
        }

        const values = measurements.map(
            (measurement) => measurement.value,
        );

        const min = Math.min(...values);
        const max = Math.max(...values);

        const average =
            values.reduce((sum, value) => sum + value, 0) /
            values.length;

        return {
            min,
            max,
            average,
        };
    }, [currentValue, measurements]);

    const selectMeasurementType = (
        nextType: MeasurementType,
    ) => {
        setRunning(false);

        setMeasurementType(nextType);

        const nextValue =
            modeDefaults[nextType][measurementMode];

        setCurrentValue(nextValue);
        setMeasurements([]);
    };

    const selectMeasurementMode = (
        nextMode: MeasurementMode,
    ) => {
        setRunning(false);

        setMeasurementMode(nextMode);

        const nextValue =
            modeDefaults[measurementType][nextMode];

        setCurrentValue(nextValue);
        setMeasurements([]);
    };

    const clearMeasurements = () => {
        setMeasurements([]);
    };

    const resetMeasurement = () => {
        setRunning(false);
        setMeasurements([]);
        setCurrentValue(currentDefault);
    };

    const formatValue = (value: number) => {
        if (
            measurementType === "Resistance" ||
            measurementType === "Continuity"
        ) {
            return value.toFixed(1);
        }

        return value.toFixed(2);
    };

    const graphData = useMemo(() => {
        if (measurements.length === 0) {
            return null;
        }

        const values = measurements.map(
            (measurement) => measurement.value,
        );

        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        const range = Math.max(maxValue - minValue, 0.001);

        const padding = range * 0.15;

        const graphMin = Math.max(0, minValue - padding);
        const graphMax = maxValue + padding;

        const graphRange = Math.max(
            graphMax - graphMin,
            0.001,
        );

        const points = measurements.map(
            (measurement, index) => {
                const x =
                    90 +
                    (index /
                        Math.max(measurements.length - 1, 1)) *
                    880;

                const y =
                    30 +
                    ((graphMax - measurement.value) /
                        graphRange) *
                    230;

                return {
                    x,
                    y,
                };
            },
        );

        return {
            points,
            graphMin,
            graphMax,
        };
    }, [measurements]);

    const graphPoints =
        graphData?.points
            .map((point) => `${point.x},${point.y} `)
            .join(" ") ?? "";

    const yAxisLabels = useMemo(() => {
        if (!graphData) {
            return [];
        }

        return Array.from({ length: 5 }, (_, index) => {
            const ratio = index / 4;

            return {
                value:
                    graphData.graphMax -
                    (graphData.graphMax - graphData.graphMin) *
                    ratio,
                y: 30 + ratio * 230,
            };
        });
    }, [graphData]);

    const xAxisLabels = useMemo(() => {
        if (measurements.length === 0) {
            return [];
        }

        const count = Math.min(6, measurements.length);

        return Array.from({ length: count }, (_, index) => {
            const measurementIndex =
                count === 1
                    ? 0
                    : Math.round(
                        (index / (count - 1)) *
                        (measurements.length - 1),
                    );

            const x =
                90 +
                (measurementIndex /
                    Math.max(measurements.length - 1, 1)) *
                880;

            return {
                x,
                label: `${measurementIndex + 1} `,
            };
        });
    }, [measurements]);

    const graphTitle = usesAcDcMode
        ? `${measurementType} (${measurementMode})`
        : measurementType;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Multimeter
                </h1>

                <p className="mt-1 text-muted-foreground">
                    Monitor measurements and track electrical values over
                    time.
                </p>
            </div>

            {/* Measurement */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="size-5" />
                            Measurement
                        </CardTitle>

                        <Badge
                            variant="outline"
                            className={
                                running
                                    ? "border-green-500/30 bg-green-500/10 text-green-500"
                                    : "border-muted-foreground/30 bg-muted text-muted-foreground"
                            }
                        >
                            <span className="mr-1.5 size-2 rounded-full bg-current" />
                            {running ? "Measuring" : "Stopped"}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Measurement modes */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">
                            Measurement
                        </label>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            {measurementTypes.map((type) => {
                                const Icon = measurementIcons[type];
                                const selected =
                                    measurementType === type;

                                return (
                                    <Button
                                        key={type}
                                        type="button"
                                        variant={
                                            selected ? "default" : "outline"
                                        }
                                        onClick={() =>
                                            selectMeasurementType(type)
                                        }
                                        aria-pressed={selected}
                                        className="h-24 min-w-0 flex-col gap-2 px-3 text-base font-semibold sm:h-28 sm:text-lg"
                                    >
                                        <Icon className="size-9 sm:size-10" />

                                        <span>{type}</span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* AC/DC selector */}
                    {usesAcDcMode && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium">
                                Current type
                            </label>

                            <div className="flex w-full max-w-sm rounded-lg border bg-muted/30 p-1">
                                <Button
                                    type="button"
                                    variant={
                                        measurementMode === "DC"
                                            ? "default"
                                            : "ghost"
                                    }
                                    onClick={() =>
                                        selectMeasurementMode("DC")
                                    }
                                    aria-pressed={measurementMode === "DC"}
                                    className="h-12 flex-1 font-mono text-base font-semibold"
                                >
                                    DC
                                </Button>

                                <Button
                                    type="button"
                                    variant={
                                        measurementMode === "AC"
                                            ? "default"
                                            : "ghost"
                                    }
                                    onClick={() =>
                                        selectMeasurementMode("AC")
                                    }
                                    aria-pressed={measurementMode === "AC"}
                                    className="h-12 flex-1 font-mono text-base font-semibold"
                                >
                                    AC
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            onClick={() =>
                                setRunning((current) => !current)
                            }
                        >
                            {running ? (
                                <>
                                    <CircleStop className="size-4" />
                                    Stop
                                </>
                            ) : (
                                <>
                                    <Play className="size-4" />
                                    Start
                                </>
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetMeasurement}
                        >
                            <RotateCcw className="size-4" />
                            Reset
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={clearMeasurements}
                        >
                            <Eraser className="size-4" />
                            Clear graph
                        </Button>
                    </div>

                    {/* Live reading */}
                    <div className="rounded-xl border bg-muted/30 p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            {graphTitle}
                        </p>

                        <div className="mt-2 flex items-baseline justify-center gap-3">
                            <span className="font-mono text-6xl font-semibold tracking-tight">
                                {formatValue(currentValue)}
                            </span>

                            <span className="font-mono text-2xl text-muted-foreground">
                                {currentUnit}
                            </span>
                        </div>

                        <p className="mt-3 text-xs text-muted-foreground">
                            Mock measurement data
                        </p>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">
                                Minimum
                            </p>

                            <p className="mt-1 font-mono text-lg font-medium">
                                {formatValue(statistics.min)}{" "}
                                {currentUnit}
                            </p>
                        </div>

                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">
                                Average
                            </p>

                            <p className="mt-1 font-mono text-lg font-medium">
                                {formatValue(statistics.average)}{" "}
                                {currentUnit}
                            </p>
                        </div>

                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">
                                Maximum
                            </p>

                            <p className="mt-1 font-mono text-lg font-medium">
                                {formatValue(statistics.max)}{" "}
                                {currentUnit}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Live graph */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <CardTitle>Live graph</CardTitle>

                        <span className="text-sm text-muted-foreground">
                            {measurements.length} samples
                        </span>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-lg border bg-muted/20 p-2 sm:p-4">
                        {measurements.length < 2 ? (
                            <div className="flex h-72 items-center justify-center text-center text-sm text-muted-foreground">
                                Start the measurement to begin plotting data.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <svg
                                    viewBox="0 0 1000 330"
                                    className="h-80 min-w-[700px] w-full"
                                    role="img"
                                    aria-label={`${graphTitle} measurement graph with measurement value on the vertical axis and sample number on the horizontal axis`}
                                >
                                    {/* Y axis title */}
                                    <text
                                        x="18"
                                        y="155"
                                        textAnchor="middle"
                                        className="fill-muted-foreground text-[14px]"
                                        transform="rotate(-90 18 155)"
                                    >
                                        Value ({currentUnit})
                                    </text>

                                    {/* Horizontal grid lines */}
                                    {yAxisLabels.map((label) => (
                                        <g key={`y - ${label.y} `}>
                                            <line
                                                x1="90"
                                                y1={label.y}
                                                x2="970"
                                                y2={label.y}
                                                className="stroke-border"
                                                strokeDasharray="4 6"
                                            />

                                            <text
                                                x="80"
                                                y={label.y + 5}
                                                textAnchor="end"
                                                className="fill-muted-foreground text-[13px]"
                                            >
                                                {formatValue(label.value)}
                                            </text>
                                        </g>
                                    ))}

                                    {/* Vertical grid lines */}
                                    {xAxisLabels.map((label) => (
                                        <line
                                            key={`x - grid - ${label.x} `}
                                            x1={label.x}
                                            y1="30"
                                            x2={label.x}
                                            y2="260"
                                            className="stroke-border"
                                            strokeDasharray="4 6"
                                        />
                                    ))}

                                    {/* Y axis */}
                                    <line
                                        x1="90"
                                        y1="30"
                                        x2="90"
                                        y2="260"
                                        className="stroke-foreground"
                                        strokeWidth="1.5"
                                    />

                                    {/* X axis */}
                                    <line
                                        x1="90"
                                        y1="260"
                                        x2="970"
                                        y2="260"
                                        className="stroke-foreground"
                                        strokeWidth="1.5"
                                    />

                                    {/* Measurement line */}
                                    <polyline
                                        fill="none"
                                        className="stroke-blue-500"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        points={graphPoints}
                                    />

                                    {/* Measurement points */}
                                    {graphData?.points.map(
                                        (point, index) => (
                                            <circle
                                                key={measurements[index].id}
                                                cx={point.x}
                                                cy={point.y}
                                                r="3"
                                                className="fill-blue-500"
                                            />
                                        ),
                                    )}

                                    {/* X axis labels */}
                                    {xAxisLabels.map((label) => (
                                        <text
                                            key={`x - label - ${label.x} `}
                                            x={label.x}
                                            y="280"
                                            textAnchor="middle"
                                            className="fill-muted-foreground text-[13px]"
                                        >
                                            {label.label}
                                        </text>
                                    ))}

                                    {/* X axis title */}
                                    <text
                                        x="530"
                                        y="315"
                                        textAnchor="middle"
                                        className="fill-muted-foreground text-[14px]"
                                    >
                                        Sample
                                    </text>
                                </svg>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Measurement history */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <CardTitle>Measurement history</CardTitle>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearMeasurements}
                            disabled={measurements.length === 0}
                        >
                            <Eraser className="size-4" />
                            Clear
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {measurements.length === 0 ? (
                        <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
                            No measurements recorded yet.
                        </div>
                    ) : (
                        <div className="max-h-72 overflow-y-auto">
                            <div className="divide-y">
                                {[...measurements]
                                    .reverse()
                                    .map((measurement) => (
                                        <div
                                            key={measurement.id}
                                            className="flex items-center justify-between py-3"
                                        >
                                            <span className="text-sm text-muted-foreground">
                                                {measurement.timestamp}
                                            </span>

                                            <span className="font-mono font-medium">
                                                {formatValue(measurement.value)}{" "}
                                                {currentUnit}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}