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
export type TemperatureProbe = "KITS90" | "PT100";

export interface MeterSettings {
  type: MeasurementType;
  mode: MeasurementMode;
  autoRange: boolean;
  range: string;
  temperatureUnit: TemperatureUnit;
  temperatureProbe: TemperatureProbe;
}

export interface DeviceIdentity {
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
