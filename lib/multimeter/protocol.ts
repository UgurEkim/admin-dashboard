import type { MeasurementMode, MeasurementType, MeterSettings } from "./types";

export const units: Record<MeasurementType, string> = {
  Voltage: "V",
  Current: "A",
  Resistance: "Ω",
  Continuity: "Ω",
  Diode: "V",
  Capacitance: "F",
  Frequency: "Hz",
  Period: "s",
  Temperature: "°C",
};

export function normalizeRange(raw: string): string {
  const text = raw
    .replaceAll('"', "")
    .replace(/\s+/g, "")
    // Accept UTF-8 symbols decoded as Windows-1252 and older OWON symbols.
    .replace(/Î©|â„¦|¦¸|Ω|ohms?/gi, "Ω")
    .replace(/Âµ|Î¼|¦Ì|μ/g, "µ");
  const match =
    /^([+]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)([pnuµmkKM]?)(Ω|V|A|F|Hz|s)$/.exec(
      text,
    );
  if (!match) return `unknown:${text}`;
  const [, magnitude, prefix, unit] = match;
  const factors: Record<string, number> = {
    "": 1,
    p: 1e-12,
    n: 1e-9,
    u: 1e-6,
    µ: 1e-6,
    m: 1e-3,
    k: 1e3,
    K: 1e3,
    M: 1e6,
  };
  const value = Number(magnitude) * factors[prefix];
  if (!Number.isFinite(value) || value <= 0) return `unknown:${text}`;
  return `${Number(value.toPrecision(12))}:${unit}`;
}

export type MeterSelection =
  | { kind: "type"; type: MeasurementType }
  | { kind: "mode"; mode: MeasurementMode }
  | { kind: "range"; range: string }
  | {
      kind: "temperature";
      probe: MeterSettings["temperatureProbe"];
      unit: MeterSettings["temperatureUnit"];
    };

export function isSameSelection(
  settings: MeterSettings,
  selection: MeterSelection,
): boolean {
  switch (selection.kind) {
    case "type":
      return settings.type === selection.type;
    case "mode":
      return settings.mode === selection.mode;
    case "range":
      return selection.range === "auto"
        ? settings.autoRange
        : !settings.autoRange &&
            normalizeRange(settings.range) === normalizeRange(selection.range);
    case "temperature":
      return (
        settings.temperatureProbe === selection.probe &&
        settings.temperatureUnit === selection.unit
      );
  }
}

export function formatValue(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  if (value === 0) return "0.0000";
  const magnitude = Math.abs(value);
  if (magnitude < 0.0001 || magnitude >= 1e6) return value.toExponential(4);
  return value.toFixed(
    Math.max(0, Math.min(8, 4 - Math.floor(Math.log10(magnitude)))),
  );
}

export function graphBounds(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, Math.abs(max) * 0.002, 1e-12);
  return { min: min - span * 0.15, max: max + span * 0.15 };
}
