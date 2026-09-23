import { useEffect, useMemo, useRef, useState } from "react";
import {
  assertSupportedSettings,
  supportedMode,
  type MultimeterAdapter,
} from "@/lib/multimeter/adapter";
import {
  getMultimeterDefinition,
  multimeterAdapters,
} from "@/lib/multimeter/registry";
import { browserSerial } from "@/lib/multimeter/serial";
import {
  formatValue,
  units,
  isSameSelection,
  type MeterSelection,
} from "@/lib/multimeter/protocol";
import type {
  DeviceIdentity,
  Measurement,
  MeasurementMode,
  MeasurementType,
  MeterSettings,
  TemperatureProbe,
  TemperatureUnit,
} from "@/lib/multimeter/types";

const initialSettings = multimeterAdapters[0].initialSettings;

export function useMultimeter() {
  const [adapterId, setAdapterId] = useState(multimeterAdapters[0].id);
  const definition = getMultimeterDefinition(adapterId);
  const [settings, setSettings] = useState(initialSettings);
  const [identity, setIdentity] = useState<DeviceIdentity | null>(null);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState<Measurement | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [interval, setIntervalMs] = useState(1000);
  const meter = useRef<MultimeterAdapter | null>(null);
  const generation = useRef(0);
  const busyRef = useRef(false);
  const sequence = useRef(0);
  const alive = useRef(true);
  const settingsRef = useRef(initialSettings);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      void meter.current?.close();
    };
  }, []);

  function applySettings(next: MeterSettings) {
    assertSupportedSettings(definition.capabilities, next);
    const previous = settingsRef.current;
    if (
      previous.type !== next.type ||
      previous.mode !== next.mode ||
      previous.temperatureUnit !== next.temperatureUnit ||
      previous.temperatureProbe !== next.temperatureProbe
    ) {
      setMeasurements([]);
      setCurrent(null);
    }
    settingsRef.current = next;
    setSettings(next);
  }

  function stop() {
    generation.current++;
    setRunning(false);
  }

  async function toggleConnection() {
    if (busyRef.current) return;
    stop();
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      if (connected) {
        await meter.current?.close();
        meter.current = null;
        setConnected(false);
        setIdentity(null);
        return;
      }
      const serial = browserSerial();
      if (!serial || !window.isSecureContext)
        throw new Error(
          "Open this page in Chrome or Edge using localhost or HTTPS to connect by USB.",
        );
      // Must happen directly in the button gesture so the browser can show its chooser.
      const port = await serial.requestPort();
      if (!alive.current) return;
      const device = definition.create(port, (failure) => {
        if (!alive.current || meter.current !== device) return;
        generation.current++;
        setRunning(false);
        setConnected(false);
        setIdentity(null);
        setError(failure.message);
      });
      await meter.current?.close();
      meter.current = device;
      await device.open();
      const deviceIdentity = await device.identify();
      const actual = await device.settings();
      if (!alive.current) {
        await device.close();
        return;
      }
      meter.current = device;
      applySettings(actual);
      setCurrent(null);
      setMeasurements([]);
      setIdentity(deviceIdentity);
      setConnected(true);
      setRunning(true);
    } catch (failure) {
      await meter.current?.close();
      meter.current = null;
      if (alive.current) {
        setConnected(false);
        setIdentity(null);
        if (!(
          failure instanceof DOMException && failure.name === "NotFoundError"
        )) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not connect. Close other software using the meter and try again.",
          );
        }
      }
    } finally {
      busyRef.current = false;
      if (alive.current) setBusy(false);
    }
  }

  async function change(
    selection: MeterSelection,
    work: (device: MultimeterAdapter) => Promise<MeterSettings>,
  ) {
    if (busyRef.current || !connected || !meter.current) return;
    // Check before stopping the poller or clearing readings, including when paused.
    if (isSameSelection(settingsRef.current, selection)) return;
    stop();
    busyRef.current = true;
    setBusy(true);
    setError("");
    setCurrent(null);
    try {
      const next = await work(meter.current);
      if (alive.current) {
        applySettings(next);
        setMeasurements([]);
        setRunning(true);
      }
    } catch (failure) {
      if (alive.current)
        setError(
          failure instanceof Error
            ? failure.message
            : "Could not update the meter.",
        );
      // Refresh the actual state if a command was rejected without losing transport.
      try {
        const actual = await meter.current.settings();
        if (alive.current) applySettings(actual);
      } catch {
        /* Transport reports disconnection. */
      }
    } finally {
      busyRef.current = false;
      if (alive.current) setBusy(false);
    }
  }

  useEffect(() => {
    if (!running || !connected || !meter.current) return;
    const device = meter.current;
    const token = ++generation.current;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const sample = await device.sample();
        if (cancelled || generation.current !== token || !alive.current) return;
        if (sample) {
          assertSupportedSettings(device.capabilities, sample.settings);
          const previous = settingsRef.current;
          const changed =
            previous.type !== sample.settings.type ||
            previous.mode !== sample.settings.mode ||
            previous.temperatureUnit !== sample.settings.temperatureUnit ||
            previous.temperatureProbe !== sample.settings.temperatureProbe;
          settingsRef.current = sample.settings;
          setSettings(sample.settings);
          if (changed) {
            // A front-panel change may still expose the previous conversion. Skip it.
            setMeasurements([]);
            setCurrent(null);
          } else {
            const reading: Measurement = {
              ...sample.reading,
              id: ++sequence.current,
            };
            setCurrent(reading);
            setMeasurements((history) => [...history, reading].slice(-1000));
          }
        }
        timer = setTimeout(poll, interval);
      } catch (failure) {
        if (!cancelled && generation.current === token && alive.current) {
          setRunning(false);
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not read the meter.",
          );
        }
      }
    }
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [running, connected, interval]);

  const statistics = useMemo(() => {
    const values = measurements.flatMap((reading) =>
      reading.value === null ? [] : [reading.value],
    );
    if (!values.length) return { min: null, max: null, average: null };
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      average: values.reduce((sum, value) => sum + value, 0) / values.length,
    };
  }, [measurements]);

  const currentUnit =
    settings.type === "Temperature"
      ? settings.temperatureUnit === "K"
        ? "K"
        : `°${settings.temperatureUnit}`
      : units[settings.type];
  const graphTitle =
    settings.type === "Voltage" || settings.type === "Current"
      ? `${settings.type} (${settings.mode})`
      : settings.type;

  function exportCsv() {
    const rows = [
      "Timestamp,Measurement,Mode,Value,Unit,Status",
      ...measurements.map((reading) =>
        [
          reading.timestamp,
          reading.type,
          reading.type === "Voltage" || reading.type === "Current"
            ? reading.mode
            : "",
          reading.value ?? "",
          reading.unit,
          reading.overload ? "Overload" : "Valid",
        ].join(","),
      ),
    ];
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + rows.join("\r\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${adapterId}-${new Date().toISOString().replaceAll(":", "-")}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return {
    definition,
    adapters: multimeterAdapters,
    selectAdapter: (id: string) => {
      if (connected || busyRef.current) return;
      const next = getMultimeterDefinition(id);
      setAdapterId(id);
      settingsRef.current = next.initialSettings;
      setSettings(next.initialSettings);
      setCurrent(null);
      setMeasurements([]);
      setError("");
    },
    measurementType: settings.type,
    measurementMode: settings.mode,
    settings,
    identity,
    connected,
    busy,
    error,
    running,
    currentValue: current?.value ?? null,
    overload: current?.overload ?? false,
    lastReadingAt: current?.timestamp,
    currentUnit,
    measurements,
    statistics,
    graphTitle,
    interval,
    selectMeasurementType: (type: MeasurementType) =>
      change({ kind: "type", type }, (device) =>
        device.configure(
          type,
          supportedMode(device.capabilities, type, settingsRef.current.mode),
        ),
      ),
    selectMeasurementMode: (mode: MeasurementMode) =>
      change({ kind: "mode", mode }, (device) =>
        device.configure(settingsRef.current.type, mode),
      ),
    selectRange: (value: string) =>
      change({ kind: "range", range: value }, (device) =>
        device.setRange(settingsRef.current, value),
      ),
    selectTemperature: (probe: TemperatureProbe, unit: TemperatureUnit) =>
      change({ kind: "temperature", probe, unit }, (device) =>
        device.setTemperature(probe, unit),
      ),
    setIntervalMs,
    toggleConnection,
    start: () => {
      if (connected && !busyRef.current) {
        setError("");
        setRunning(true);
      }
    },
    stop,
    reset: () => {
      stop();
      setMeasurements([]);
      setCurrent(null);
    },
    clear: () => {
      generation.current++;
      setRunning(false);
      setMeasurements([]);
    },
    formatValue,
    exportCsv,
  };
}
