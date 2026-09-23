import type {
  DeviceIdentity,
  MeasurementMode,
  MeasurementType,
  MeterSettings,
} from "./types";

export function rangeOptions(
  type: MeasurementType,
  mode: MeasurementMode,
): string[] {
  switch (type) {
    case "Voltage":
      return mode === "DC"
        ? ["50 mV", "500 mV", "5 V", "50 V", "500 V", "1000 V"]
        : ["500 mV", "5 V", "50 V", "500 V", "750 V"];
    case "Current":
      return ["500 µA", "5 mA", "50 mA", "500 mA", "5 A", "10 A"];
    case "Resistance":
      return ["500 Ω", "5 kΩ", "50 kΩ", "500 kΩ", "5 MΩ", "50 MΩ"];
    case "Capacitance":
      return ["50 nF", "500 nF", "5 µF", "50 µF", "500 µF", "5 mF", "50 mF"];
    default:
      return [];
  }
}

export function configurationCommand(
  type: MeasurementType,
  mode: MeasurementMode,
): string {
  const commands: Record<MeasurementType, string> = {
    Voltage: `VOLT:${mode}`,
    Current: `CURR:${mode}`,
    Resistance: "RES",
    Continuity: "CONT",
    Diode: "DIOD",
    Capacitance: "CAP",
    Frequency: "FREQ",
    Period: "PER",
    Temperature: "TEMP:RTD",
  };
  return `CONF:${commands[type]}`;
}

export function parseFunction(
  raw: string,
): Pick<MeterSettings, "type" | "mode"> {
  const value = raw
    .replaceAll('"', "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
  const names: Record<string, MeasurementType> = {
    VOLT: "Voltage",
    CURR: "Current",
    RES: "Resistance",
    CONT: "Continuity",
    DIOD: "Diode",
    CAP: "Capacitance",
    FREQ: "Frequency",
    PER: "Period",
    TEMP: "Temperature",
  };
  const type = names[value.split(" ")[0]];
  if (!type) throw new Error(`Unsupported meter function: ${raw}`);
  return { type, mode: value.endsWith(" AC") ? "AC" : "DC" };
}

export function parseIdentity(raw: string): DeviceIdentity {
  const [brand, model, serial, firmware] = raw
    .split(",")
    .map((part) => part.trim());
  if (
    brand?.toUpperCase() !== "OWON" ||
    model?.toUpperCase() !== "XDM1041" ||
    !serial ||
    !firmware
  ) {
    throw new Error(
      "The selected device is not an OWON XDM1041. Select its USB serial port.",
    );
  }
  return { manufacturer: "OWON", model, serial, firmware };
}

export function parseReading(raw: string): {
  value: number | null;
  overload: boolean;
} {
  const text = raw.trim();
  if (/^[+-]?(?:OL|OVERLOAD|INF(?:INITY)?)$/i.test(text))
    return { value: null, overload: true };
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:E[+-]?\d+)?$/i.test(text))
    throw new Error(`Invalid reading from meter: ${text}`);
  const value = Number(text);
  // XDM1041 reports 1E+9 for an open circuit/overrange, including a missing probe.
  if (!Number.isFinite(value) || Math.abs(value) >= 1e9)
    return { value: null, overload: true };
  return { value, overload: false };
}
