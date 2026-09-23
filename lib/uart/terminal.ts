export type DataFormat = "text" | "hex";
export type LineEnding = "none" | "lf" | "cr" | "crlf";
export interface TerminalRecord {
  id: number;
  timestamp: string;
  direction: "RX" | "TX";
  bytes: number[];
  text: string;
}

export function encodeMessage(
  input: string,
  format: DataFormat,
  ending: LineEnding,
): Uint8Array {
  if (format === "hex") {
    const hex = input.replace(/\s/g, "");
    if (!hex || !/^(?:[0-9a-fA-F]{2})+$/.test(hex)) {
      throw new Error(
        "Enter complete hexadecimal bytes, for example: 48 65 6C 6C 6F.",
      );
    }
    if (hex.length > 131072) throw new Error("Send at most 64 KiB at a time.");
    return Uint8Array.from(hex.match(/../g)!, (byte) => parseInt(byte, 16));
  }
  const suffix = { none: "", lf: "\n", cr: "\r", crlf: "\r\n" }[ending];
  const bytes = new TextEncoder().encode(input + suffix);
  if (!bytes.length)
    throw new Error("Enter a message or select a line ending.");
  if (bytes.length > 65536) throw new Error("Send at most 64 KiB at a time.");
  return bytes;
}

export function formatHex(bytes: readonly number[]): string {
  return bytes
    .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
    .join(" ");
}

// Show control characters as text; serial output is never interpreted as HTML or ANSI.
export function visibleText(text: string): string {
  return text.replace(/[\x00-\x08\x0b-\x1f\x7f]/g, (char) =>
    char === "\r"
      ? "␍"
      : `\\x${char.charCodeAt(0).toString(16).padStart(2, "0")}`,
  );
}

export function exportLog(records: TerminalRecord[]): string {
  return records
    .map(
      (row) =>
        `${row.timestamp}\t${row.direction}\t${formatHex(row.bytes)}\t${JSON.stringify(row.text)}`,
    )
    .join("\r\n");
}
