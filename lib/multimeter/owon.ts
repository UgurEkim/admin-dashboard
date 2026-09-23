import {
  configurationCommand,
  parseFunction,
  parseIdentity,
  parseReading,
  rangeOptions,
} from "./owon-protocol";
import { normalizeRange, units } from "./protocol";
import { SerialConnection } from "./serial";
import {
  measurementCapability,
  type MeterCapabilities,
  type MultimeterAdapter,
  type MultimeterDefinition,
} from "./adapter";
import type {
  MeasurementMode,
  MeasurementType,
  MeterSettings,
  TemperatureProbe,
  TemperatureUnit,
} from "./types";

// Hardware testing showed the first conversion can remain stale beyond one second.
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 3000));

export const owonCapabilities: MeterCapabilities = {
  measurements: (
    [
      "Voltage",
      "Resistance",
      "Current",
      "Continuity",
      "Diode",
      "Capacitance",
      "Frequency",
      "Period",
      "Temperature",
    ] as const
  ).map((type) => ({
    type,
    modes: type === "Voltage" || type === "Current" ? ["DC", "AC"] : ["DC"],
    ranges: { DC: rangeOptions(type, "DC"), AC: rangeOptions(type, "AC") },
    autoRange: rangeOptions(type, "DC").length > 0,
  })),
  temperature: {
    probes: [
      { value: "PT100", label: "PT100" },
      { value: "KITS90", label: "K-type thermocouple" },
    ],
    units: [
      { value: "C", label: "Celsius (°C)" },
      { value: "F", label: "Fahrenheit (°F)" },
      { value: "K", label: "Kelvin (K)" },
    ],
  },
};

export class OwonMeter implements MultimeterAdapter {
  readonly capabilities = owonCapabilities;
  private connection: SerialConnection;
  constructor(connection: SerialConnection) {
    this.connection = connection;
  }

  open() {
    return this.connection.open();
  }
  close() {
    return this.connection.close();
  }

  identify() {
    return this.connection.transaction(async () =>
      parseIdentity(await this.connection.query("*IDN?")),
    );
  }

  private async readSettings(): Promise<MeterSettings> {
    const functionState = parseFunction(await this.connection.query("FUNC1?"));
    const ranged =
      rangeOptions(functionState.type, functionState.mode).length > 0;
    const autoResponse = ranged
      ? (await this.connection.query("AUTO?")).trim()
      : "0";
    if (autoResponse !== "0" && autoResponse !== "1")
      throw new Error(`Invalid auto range response: ${autoResponse}`);
    const autoRange = autoResponse === "1";
    const rawRange = ranged ? await this.connection.query("RANGE?") : "";
    const range =
      rangeOptions(functionState.type, functionState.mode).find(
        (option) => normalizeRange(option) === normalizeRange(rawRange),
      ) ?? rawRange;
    let temperatureUnit: TemperatureUnit = "C";
    let temperatureProbe: TemperatureProbe = "PT100";
    if (functionState.type === "Temperature") {
      const unit = (await this.connection.query("TEMP:RTD:UNIT?"))
        .replaceAll('"', "")
        .trim()
        .toUpperCase();
      const probe = (await this.connection.query("TEMP:RTD:TYPE?"))
        .replaceAll('"', "")
        .trim()
        .toUpperCase();
      if (unit !== "C" && unit !== "F" && unit !== "K")
        throw new Error(`Unknown temperature unit: ${unit}`);
      if (probe !== "PT100" && probe !== "KITS90")
        throw new Error(`Unknown temperature probe: ${probe}`);
      temperatureUnit = unit;
      temperatureProbe = probe;
    }
    return {
      ...functionState,
      autoRange,
      range,
      temperatureUnit,
      temperatureProbe,
    };
  }

  settings() {
    return this.connection.transaction(() => this.readSettings());
  }

  configure(type: MeasurementType, mode: MeasurementMode) {
    if (!measurementCapability(this.capabilities, type)?.modes.includes(mode)) {
      return Promise.reject(new Error("Unsupported OWON measurement mode."));
    }
    return this.connection.transaction(async () => {
      await this.connection.write(configurationCommand(type, mode));
      await settle();
      const settings = await this.readSettings();
      if (
        settings.type !== type ||
        ((type === "Voltage" || type === "Current") && settings.mode !== mode)
      ) {
        throw new Error("The meter did not accept that measurement mode.");
      }
      return settings;
    });
  }

  setRange(settings: MeterSettings, selection: string) {
    return this.connection.transaction(async () => {
      const options = rangeOptions(settings.type, settings.mode);
      const index = options.indexOf(selection);
      if (!options.length || (selection !== "auto" && index < 0))
        throw new Error("Invalid measurement range.");
      await this.connection.write(
        selection === "auto" ? "AUTO" : `RANGE ${index + 1}`,
      );
      await settle();
      const actual = await this.readSettings();
      if (
        selection === "auto"
          ? !actual.autoRange
          : actual.autoRange || actual.range !== selection
      )
        throw new Error("The meter did not accept that range.");
      return actual;
    });
  }

  setTemperature(probe: TemperatureProbe, unit: TemperatureUnit) {
    if (
      !this.capabilities.temperature?.probes.some(
        (option) => option.value === probe,
      ) ||
      !this.capabilities.temperature.units.some(
        (option) => option.value === unit,
      )
    ) {
      return Promise.reject(new Error("Unsupported OWON temperature setting."));
    }
    return this.connection.transaction(async () => {
      await this.connection.write(`TEMP:RTD:TYPE ${probe}`);
      await this.connection.write(`TEMP:RTD:UNIT ${unit}`);
      await settle();
      const actual = await this.readSettings();
      if (actual.temperatureProbe !== probe || actual.temperatureUnit !== unit)
        throw new Error("The meter did not accept those temperature settings.");
      return actual;
    });
  }

  sample() {
    return this.connection.transaction(async () => {
      const settings = await this.readSettings();
      const reading = parseReading(await this.connection.query("MEAS1?"));
      const after = parseFunction(await this.connection.query("FUNC1?"));
      if (after.type !== settings.type || after.mode !== settings.mode)
        return null;
      const unit =
        settings.type === "Temperature"
          ? settings.temperatureUnit === "K"
            ? "K"
            : `°${settings.temperatureUnit}`
          : units[settings.type];
      return {
        settings,
        reading: {
          ...reading,
          unit,
          type: settings.type,
          mode: settings.mode,
          timestamp: new Date().toISOString(),
        },
      };
    });
  }
}

export const owonXdm1041: MultimeterDefinition = {
  id: "owon-xdm1041",
  label: "OWON XDM1041",
  connectionHint: "Choose the meter’s USB-SERIAL CH340 port (currently COM3).",
  capabilities: owonCapabilities,
  initialSettings: {
    type: "Voltage",
    mode: "DC",
    autoRange: true,
    range: "",
    temperatureProbe: "PT100",
    temperatureUnit: "C",
  },
  create: (port, onLost) => new OwonMeter(new SerialConnection(port, onLost)),
};
