"use client";

import {
  Activity,
  CircleStop,
  Download,
  Eraser,
  Play,
  Plug,
  Unplug,
  RotateCcw,
  LoaderCircle,
} from "lucide-react";
import {
  measurementIcons,
  measurementTypes,
  usesAcDcMode,
} from "@/components/multimeter/measurement-config";
import { MeasurementGraph } from "@/components/multimeter/measurement-graph";
import { useMultimeter } from "@/components/multimeter/use-multimeter";
import { rangeOptions } from "@/lib/multimeter/protocol";
import type { TemperatureProbe, TemperatureUnit } from "@/lib/multimeter/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const selectClass =
  "mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm disabled:opacity-50";

export default function MultimeterPage() {
  const meter = useMultimeter();
  const {
    measurementType,
    measurementMode,
    settings,
    connected,
    busy,
    running,
    measurements,
    statistics,
    currentUnit,
    formatValue,
  } = meter;
  const ranges = rangeOptions(measurementType, measurementMode);
  const controlsDisabled = !connected || busy;
  const manualRange = ranges.includes(settings.range) ? settings.range : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multimeter</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor measurements and track electrical values over time.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Button
            type="button"
            variant={connected ? "outline" : "default"}
            onClick={meter.toggleConnection}
            disabled={busy}
          >
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : connected ? (
              <Unplug className="size-4" />
            ) : (
              <Plug className="size-4" />
            )}
            {busy
              ? "Please wait…"
              : connected
                ? "Disconnect"
                : "Connect to device"}
          </Button>
          <p role="status" className="text-xs text-muted-foreground">
            {meter.identity
              ? `OWON ${meter.identity.model} · ${meter.identity.firmware} · ${meter.identity.serial}`
              : "Connect your OWON XDM1041 by USB"}
          </p>
        </div>
      </div>

      {meter.error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {meter.error}
        </div>
      )}
      {!connected && (
        <p className="text-sm text-muted-foreground">
          Use Chrome or Edge. Choose USB-SERIAL CH340 (COM3) in the connection
          window. Close other apps using the meter first.
        </p>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              Measurement
            </CardTitle>
            <Badge
              variant="outline"
              className={
                running
                  ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              }
            >
              <span className="mr-1.5 size-2 rounded-full bg-current" />
              {busy
                ? "Updating"
                : running
                  ? "Measuring"
                  : connected
                    ? "Stopped"
                    : "Disconnected"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium">Measurement</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {measurementTypes.map((type) => {
                const Icon = measurementIcons[type];
                return (
                  <Button
                    key={type}
                    type="button"
                    variant={measurementType === type ? "default" : "outline"}
                    disabled={controlsDisabled}
                    onClick={() => meter.selectMeasurementType(type)}
                    aria-pressed={measurementType === type}
                    className="h-24 min-w-0 flex-col gap-2 px-2 text-sm font-semibold sm:h-28 sm:text-base"
                  >
                    <Icon className="size-9 sm:size-10" />
                    <span>{type}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {usesAcDcMode(measurementType) && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Current type</p>
              <div className="flex w-full max-w-sm rounded-lg border bg-muted/30 p-1">
                {(["DC", "AC"] as const).map((mode) => (
                  <Button
                    key={mode}
                    type="button"
                    variant={measurementMode === mode ? "default" : "ghost"}
                    disabled={controlsDisabled}
                    onClick={() => meter.selectMeasurementMode(mode)}
                    aria-pressed={measurementMode === mode}
                    className="h-12 flex-1 font-mono text-base font-semibold"
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ranges.length > 0 && (
              <label className="text-sm font-medium">
                Measurement range
                <select
                  className={selectClass}
                  value={settings.autoRange ? "auto" : manualRange}
                  disabled={controlsDisabled}
                  onChange={(event) => meter.selectRange(event.target.value)}
                >
                  <option value="auto">
                    Auto range
                    {settings.autoRange && settings.range
                      ? ` · ${settings.range}`
                      : ""}
                  </option>
                  {!settings.autoRange && !manualRange && (
                    <option value="" disabled>
                      {settings.range || "Unknown range"}
                    </option>
                  )}
                  {ranges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {measurementType === "Temperature" && (
              <>
                <label className="text-sm font-medium">
                  Temperature probe
                  <select
                    className={selectClass}
                    disabled={controlsDisabled}
                    value={settings.temperatureProbe}
                    onChange={(event) =>
                      meter.selectTemperature(
                        event.target.value as TemperatureProbe,
                        settings.temperatureUnit,
                      )
                    }
                  >
                    <option value="PT100">PT100</option>
                    <option value="KITS90">K-type thermocouple</option>
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Temperature unit
                  <select
                    className={selectClass}
                    disabled={controlsDisabled}
                    value={settings.temperatureUnit}
                    onChange={(event) =>
                      meter.selectTemperature(
                        settings.temperatureProbe,
                        event.target.value as TemperatureUnit,
                      )
                    }
                  >
                    <option value="C">Celsius (°C)</option>
                    <option value="F">Fahrenheit (°F)</option>
                    <option value="K">Kelvin (K)</option>
                  </select>
                </label>
              </>
            )}
            <label className="text-sm font-medium">
              Read interval
              <select
                className={selectClass}
                value={meter.interval}
                disabled={busy}
                onChange={(event) =>
                  meter.setIntervalMs(Number(event.target.value))
                }
              >
                <option value={500}>0.5 seconds</option>
                <option value={1000}>1 second</option>
                <option value={2000}>2 seconds</option>
                <option value={5000}>5 seconds</option>
              </select>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Changing mode or range stops recording and starts a new history.
            Start resumes readings. The read interval is the pause between
            completed readings.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={controlsDisabled}
              onClick={running ? meter.stop : meter.start}
            >
              {running ? (
                <CircleStop className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
              {running ? "Stop" : "Start"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={meter.reset}
              disabled={busy}
            >
              <RotateCcw className="size-4" />
              Reset readings
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={meter.clear}
              disabled={!measurements.length || busy}
            >
              <Eraser className="size-4" />
              Clear graph
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={meter.exportCsv}
              disabled={!measurements.length}
            >
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-100 p-6 text-center text-blue-950 sm:p-8">
            <p className="text-sm text-blue-800">{meter.graphTitle}</p>
            <div className="mt-2 flex flex-wrap items-baseline justify-center gap-3">
              <span className="break-all font-mono text-4xl font-semibold tracking-tight sm:text-6xl">
                {meter.overload ? "OL" : formatValue(meter.currentValue)}
              </span>
              <span className="font-mono text-2xl text-blue-800">
                {currentUnit}
              </span>
            </div>
            <p className="mt-3 text-xs text-blue-800">
              {meter.overload
                ? "Over range or open input"
                : !connected
                  ? "Disconnected"
                  : meter.lastReadingAt
                    ? `${running ? "Live reading" : "Last reading"} · ${new Date(meter.lastReadingAt).toLocaleTimeString()}`
                    : "Press Start to read from the meter"}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(
              [
                ["Minimum", statistics.min],
                ["Average", statistics.average],
                ["Maximum", statistics.max],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 break-all font-mono text-lg font-medium">
                  {formatValue(value)} {currentUnit}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <MeasurementGraph
        measurements={measurements}
        graphTitle={meter.graphTitle}
        currentUnit={currentUnit}
        formatValue={formatValue}
      />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Measurement history</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={meter.clear}
              disabled={!measurements.length || busy}
            >
              <Eraser className="size-4" />
              Clear
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Latest 1,000 readings. Statistics exclude overloads.
          </p>
        </CardHeader>
        <CardContent>
          {!measurements.length ? (
            <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
              No measurements recorded yet.
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              <div className="divide-y">
                {[...measurements].reverse().map((reading) => (
                  <div
                    key={reading.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <time
                      dateTime={reading.timestamp}
                      className="text-sm text-muted-foreground"
                    >
                      {new Date(reading.timestamp).toLocaleTimeString()}
                    </time>
                    <span className="font-mono font-medium">
                      {reading.overload ? "OL" : formatValue(reading.value)}{" "}
                      {reading.unit}
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
