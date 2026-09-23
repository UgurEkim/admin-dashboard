import type { MeterPort } from "./serial";
import type {
  DeviceIdentity,
  Measurement,
  MeasurementMode,
  MeasurementType,
  MeterSettings,
  TemperatureProbe,
  TemperatureUnit,
} from "./types";

export interface MeasurementCapability {
  type: MeasurementType;
  modes: readonly MeasurementMode[];
  ranges: Partial<Record<MeasurementMode, readonly string[]>>;
  autoRange: boolean;
}

export interface MeterCapabilities {
  measurements: readonly MeasurementCapability[];
  temperature?: {
    probes: readonly { value: TemperatureProbe; label: string }[];
    units: readonly { value: TemperatureUnit; label: string }[];
  };
}

export interface MultimeterAdapter {
  readonly capabilities: MeterCapabilities;
  open(): Promise<void>;
  close(): Promise<void>;
  identify(): Promise<DeviceIdentity>;
  settings(): Promise<MeterSettings>;
  configure(
    type: MeasurementType,
    mode: MeasurementMode,
  ): Promise<MeterSettings>;
  setRange(settings: MeterSettings, selection: string): Promise<MeterSettings>;
  setTemperature(
    probe: TemperatureProbe,
    unit: TemperatureUnit,
  ): Promise<MeterSettings>;
  sample(): Promise<{
    settings: MeterSettings;
    reading: Omit<Measurement, "id">;
  } | null>;
}

// Registration describes the UI and constructs an adapter for a selected USB serial port.
export interface MultimeterDefinition {
  id: string;
  label: string;
  connectionHint: string;
  initialSettings: MeterSettings;
  capabilities: MeterCapabilities;
  create(port: MeterPort, onLost: (error: Error) => void): MultimeterAdapter;
}

export function measurementCapability(
  capabilities: MeterCapabilities,
  type: MeasurementType,
) {
  return capabilities.measurements.find(
    (measurement) => measurement.type === type,
  );
}

export function supportedMode(
  capabilities: MeterCapabilities,
  type: MeasurementType,
  preferred: MeasurementMode,
): MeasurementMode {
  const capability = measurementCapability(capabilities, type);
  if (!capability?.modes.length)
    throw new Error(`This meter does not support ${type}.`);
  return capability.modes.includes(preferred) ? preferred : capability.modes[0];
}

export function assertSupportedSettings(
  capabilities: MeterCapabilities,
  settings: MeterSettings,
) {
  const capability = measurementCapability(capabilities, settings.type);
  if (!capability?.modes.includes(settings.mode))
    throw new Error("The meter reported an unsupported measurement mode.");
  if (settings.type === "Temperature" && capabilities.temperature) {
    if (
      !capabilities.temperature.probes.some(
        (probe) => probe.value === settings.temperatureProbe,
      ) ||
      !capabilities.temperature.units.some(
        (unit) => unit.value === settings.temperatureUnit,
      )
    ) {
      throw new Error("The meter reported unsupported temperature settings.");
    }
  }
}
