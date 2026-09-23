export type MeasurementType =
  | "Voltage"
  | "Resistance"
  | "Current"
  | "Continuity"
  | "Diode"
  | "Capacitance"
  | "Frequency"
  | "Period"
  | "Temperature";

export type MeasurementMode = "DC" | "AC";
export type TemperatureUnit = "C" | "F" | "K";
// Adapter-defined identifier; the adapter supplies the user-facing label.
export type TemperatureProbe = string;

export interface MeterSettings {
  type: MeasurementType;
  mode: MeasurementMode;
  autoRange: boolean;
  range: string;
  temperatureUnit: TemperatureUnit;
  temperatureProbe: TemperatureProbe;
}

export interface DeviceIdentity {
  manufacturer: string;
  model: string;
  serial: string;
  firmware: string;
}

export interface Measurement {
  id: number;
  value: number | null;
  timestamp: string;
  type: MeasurementType;
  mode: MeasurementMode;
  unit: string;
  overload: boolean;
}
