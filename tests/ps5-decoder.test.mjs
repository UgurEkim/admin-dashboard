import { createRequire } from "node:module";
import "./register-typescript.cjs";
const require = createRequire(import.meta.url);
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizePs5Code,
  describePs5Code,
  extractPs5Codes,
} = require("../lib/uart/ps5-decoder.ts");
test("normalizes and describes PS5 codes conservatively", () => {
  assert.equal(normalizePs5Code("0x80810001"), "80810001");
  assert.equal(describePs5Code("80810001").confidence, "reference");
  assert.equal(describePs5Code("80050003").confidence, "unknown");
  assert.equal(describePs5Code("not-code"), null);
});
test("extracts unique codes from errlog output", () => {
  assert.deepEqual(
    extractPs5Codes(
      "errlog 0:AA OK 00000000 80810001 C0160203 80810001:DD",
    ).map((value) => value.code),
    ["80810001", "C0160203"],
  );
  assert.deepEqual(extractPs5Codes("C0160203X 1234567"), []);
});
