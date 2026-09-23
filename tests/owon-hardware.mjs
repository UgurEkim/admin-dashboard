import { createRequire } from "node:module";
import "./register-typescript.cjs";
const require = createRequire(import.meta.url);

const { spawn } = require("node:child_process");
const { Readable, Writable } = require("node:stream");
const { SerialConnection } = require("../lib/multimeter/serial.ts");
const { OwonMeter } = require("../lib/multimeter/owon.ts");
const assert = require("node:assert/strict");

// Explicit opt-in: this test changes meter modes. Disconnect test leads first.
if (!process.argv.includes("--leads-disconnected"))
  throw new Error("Requires --leads-disconnected");
let child;
const port = {
  readable: null,
  writable: null,
  async open() {
    child = spawn(
      "pwsh",
      ["-NoProfile", "-File", "tests/owon-hardware-bridge.ps1"],
      { windowsHide: true },
    );
    child.stderr.on("data", (data) => process.stderr.write(data));
    this.readable = Readable.toWeb(child.stdout);
    this.writable = Writable.toWeb(child.stdin);
  },
  async close() {
    child.stdin.end();
    child.kill();
  },
};
(async () => {
  const transport = new SerialConnection(
    port,
    (error) => console.error(error.message),
    5000,
  );
  await transport.open();
  const meter = new OwonMeter(transport);
  try {
    console.log("Identity", await meter.identify());
    for (const [type, mode] of [
      ["Voltage", "DC"],
      ["Voltage", "AC"],
      ["Current", "DC"],
      ["Current", "AC"],
      ["Resistance", "DC"],
      ["Continuity", "DC"],
      ["Diode", "DC"],
      ["Capacitance", "DC"],
      ["Frequency", "DC"],
      ["Period", "DC"],
      ["Temperature", "DC"],
    ]) {
      const settings = await meter.configure(type, mode);
      assert.equal(settings.type, type);
      if (type === "Resistance") {
        const manual = await meter.setRange(settings, "5 kΩ");
        assert.equal(manual.range, "5 kΩ");
        await meter.setRange(manual, "auto");
      }
      if (type === "Temperature") await meter.setTemperature("PT100", "C");
      const first = await meter.sample();
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const second = await meter.sample();
      console.log(
        type,
        mode,
        JSON.stringify({
          range: settings.range,
          first: first?.reading,
          second: second?.reading,
        }),
      );
    }
  } finally {
    try {
      const settings = await meter.configure("Voltage", "DC");
      await meter.setRange(settings, "auto");
    } finally {
      await transport.close();
    }
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
