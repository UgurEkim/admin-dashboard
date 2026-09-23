export interface Ps5ErrorCode {
  code: string;
  description: string;
  confidence: "reference" | "unknown";
}

// Conservative public references; unknown codes remain visible for board-specific lookup.
const known: Record<string, string> = {
  "80810001": "PSQ NVS access error (storage/controller path)",
  C0160203:
    "Storage controller error (reported with F7502 / storage fuse faults)",
  C0160303:
    "Storage controller error (reported with F7502 / storage fuse faults)",
};

export function normalizePs5Code(value: string): string | null {
  const code = value.trim().replace(/^0x/i, "").toUpperCase();
  return /^[0-9A-F]{8}$/.test(code) ? code : null;
}

export function describePs5Code(value: string): Ps5ErrorCode | null {
  const code = normalizePs5Code(value);
  if (!code) return null;
  return {
    code,
    description:
      known[code] ??
      "No local description; keep the raw code for board-specific lookup.",
    confidence: known[code] ? "reference" : "unknown",
  };
}

export function extractPs5Codes(text: string): Ps5ErrorCode[] {
  const seen = new Set<string>();
  const found: Ps5ErrorCode[] = [];
  for (const match of text.matchAll(
    /(?:^|\s|:)(?:0x)?([0-9A-Fa-f]{8})(?=\s|$|:)/g,
  )) {
    const description = describePs5Code(match[1]);
    if (
      description &&
      description.code !== "00000000" &&
      description.code !== "FFFFFFFF" &&
      !seen.has(description.code)
    ) {
      seen.add(description.code);
      found.push(description);
    }
  }
  return found;
}
