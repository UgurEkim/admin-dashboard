import { createRequire } from "node:module";
import "./register-typescript.cjs";
const require = createRequire(import.meta.url);

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { SerialConnection } = require("../lib/multimeter/serial.ts");
const { OwonMeter } = require("../lib/multimeter/owon.ts");
const {
  parseReading,
  parseFunction,
  parseIdentity,
} = require("../lib/multimeter/owon-protocol.ts");
const {
  normalizeRange,
  isSameSelection,
  graphBounds,
  formatValue,
} = require("../lib/multimeter/protocol.ts");

function fakePort(reply, baudRate = 115200) {
  let source;
  const commands = [];
  let closed = false;
  return {
    commands,
    get closed() {
      return closed;
    },
    readable: new ReadableStream({
      start(controller) {
        source = controller;
      },
    }),
    writable: new WritableStream({
      write(bytes) {
        const command = new TextDecoder().decode(bytes).trim();
        commands.push(command);
        reply(command, (chunk) =>
          source.enqueue(new TextEncoder().encode(chunk)),
        );
      },
    }),
    async open(options) {
      assert.equal(options.baudRate, baudRate);
    },
    async close() {
      closed = true;
    },
    unplug() {
      source.close();
    },
  };
}

test("registry exposes OWON capabilities and rejects unknown devices", () => {
  const {
    multimeterAdapters,
    getMultimeterDefinition,
  } = require("../lib/multimeter/registry.ts");
  const definition = getMultimeterDefinition("owon-xdm1041");
  assert.equal(multimeterAdapters[0], definition);
  assert.equal(definition.capabilities.measurements.length, 9);
  assert.throws(() => getMultimeterDefinition("unknown"));
  assert.equal(parseIdentity("OWON,XDM1041,123,V1").manufacturer, "OWON");
});

test("capabilities support a smaller meter and fall back from AC to DC", () => {
  const {
    supportedMode,
    measurementCapability,
    assertSupportedSettings,
  } = require("../lib/multimeter/adapter.ts");
  const { owonXdm1041 } = require("../lib/multimeter/owon.ts");
  const capabilities = {
    measurements: [
      {
        type: "Voltage",
        modes: ["DC"],
        ranges: { DC: ["2 V", "20 V"] },
        autoRange: false,
      },
    ],
  };
  assert.equal(supportedMode(capabilities, "Voltage", "AC"), "DC");
  assert.equal(measurementCapability(capabilities, "Temperature"), undefined);
  assert.throws(() => supportedMode(capabilities, "Resistance", "DC"));
  assert.throws(() =>
    assertSupportedSettings(capabilities, {
      ...owonXdm1041.initialSettings,
      mode: "AC",
    }),
  );
  assert.equal(
    supportedMode(owonXdm1041.capabilities, "Resistance", "AC"),
    "DC",
  );
  assert.equal(supportedMode(owonXdm1041.capabilities, "Voltage", "AC"), "AC");
});

test("OWON rejects unsupported settings before sending commands", async () => {
  const { owonXdm1041 } = require("../lib/multimeter/owon.ts");
  const port = fakePort(() => {});
  const device = owonXdm1041.create(port, () => {});
  await device.open();
  try {
    await assert.rejects(device.configure("Resistance", "AC"));
    await assert.rejects(device.setTemperature("OTHER", "C"));
    await assert.rejects(
      device.setRange({ ...owonXdm1041.initialSettings }, "2 V"),
    );
    assert.deepEqual(port.commands, []);
  } finally {
    await device.close();
  }
  assert.equal(port.closed, true);
});

test("serial transport accepts another adapter's baud rate and response encoding", async () => {
  const port = fakePort((command, send) => send("2 Ω\n"), 9600);
  const connection = new SerialConnection(
    port,
    () => {},
    1000,
    {
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: "none",
      flowControl: "none",
    },
    "utf-8",
    () => false,
  );
  await connection.open();
  try {
    assert.equal(await connection.query("READ?"), "2 Ω");
  } finally {
    await connection.close();
  }
});

test("signed/scientific readings and overloads never become fake zeroes", () => {
  assert.deepEqual(parseReading("-1.424190E-04"), {
    value: -0.000142419,
    overload: false,
  });
  assert.deepEqual(parseReading("5E-12"), { value: 5e-12, overload: false });
  for (const raw of ["1E+9", "-1E+9", "OL", "INF"])
    assert.equal(parseReading(raw).overload, true);
  for (const raw of ["", "OK", "1.2 garbage", "NaN"])
    assert.throws(() => parseReading(raw));
  assert.notEqual(formatValue(5e-12), "0.0000");
});

test("identity and function validation", () => {
  assert.equal(
    parseIdentity("OWON,XDM1041,25240609,V4.3.0,3").firmware,
    "V4.3.0",
  );
  assert.throws(() => parseIdentity("OTHER,METER,123,V1"));
  for (const raw of [
    "VOLT",
    "VOLT AC",
    "CURR",
    "CURR AC",
    "RES",
    "CONT",
    "DIOD",
    "CAP",
    "FREQ",
    "PER",
    "TEMP",
  ])
    assert.ok(parseFunction(`"${raw}"`).type);
  assert.throws(() => parseFunction("FRES"));
  assert.equal(normalizeRange("5 K¦¸"), normalizeRange("5 kΩ"));
  assert.equal(normalizeRange("5uF"), normalizeRange("5 µF"));
});

test("range matching preserves decimals, dimensions, and SI prefix case", () => {
  for (const raw of ["5 K¦¸", "5 KÎ©", "5 kΩ", "5 kΩ", "5 kohm", '"5 kΩ"']) {
    assert.equal(normalizeRange(raw), "5000:Ω");
  }
  for (const raw of ["500 mV", "0.5 V", "5E-1 V", ".5V"]) {
    assert.equal(normalizeRange(raw), "0.5:V");
  }
  for (const raw of ["5uF", "5 µF", "5 μF", "5 ÂµF", "5 Î¼F", "5 ¦ÌF"]) {
    assert.equal(normalizeRange(raw), "0.000005:F");
  }
  assert.notEqual(normalizeRange("0.5 V"), normalizeRange("5 V"));
  assert.notEqual(normalizeRange("5 mΩ"), normalizeRange("5 MΩ"));
  assert.notEqual(normalizeRange("5 mA"), normalizeRange("5 MA"));
  assert.notEqual(normalizeRange("5 V"), normalizeRange("5 A"));
  for (const raw of ["5 V garbage", "5 ?", "-5 V", "0 V", "1E999 V"]) {
    assert.match(normalizeRange(raw), /^unknown:/);
  }
});

test("unchanged selections preserve automatic/manual range distinctions", () => {
  const settings = {
    type: "Voltage",
    mode: "DC",
    autoRange: true,
    range: "500 mV",
    temperatureProbe: "PT100",
    temperatureUnit: "C",
  };
  assert.equal(
    isSameSelection(settings, { kind: "type", type: "Voltage" }),
    true,
  );
  assert.equal(
    isSameSelection(settings, { kind: "type", type: "Resistance" }),
    false,
  );
  assert.equal(isSameSelection(settings, { kind: "mode", mode: "DC" }), true);
  assert.equal(isSameSelection(settings, { kind: "mode", mode: "AC" }), false);
  assert.equal(
    isSameSelection(settings, { kind: "range", range: "auto" }),
    true,
  );
  assert.equal(
    isSameSelection(settings, { kind: "range", range: "500 mV" }),
    false,
  );
  const manual = { ...settings, autoRange: false };
  assert.equal(
    isSameSelection(manual, { kind: "range", range: "auto" }),
    false,
  );
  assert.equal(
    isSameSelection(manual, { kind: "range", range: "0.5 V" }),
    true,
  );
  assert.equal(isSameSelection(manual, { kind: "range", range: "5 V" }), false);
  assert.equal(
    isSameSelection(settings, {
      kind: "temperature",
      probe: "PT100",
      unit: "C",
    }),
    true,
  );
  assert.equal(
    isSameSelection(settings, {
      kind: "temperature",
      probe: "KITS90",
      unit: "C",
    }),
    false,
  );
  assert.equal(
    isSameSelection(settings, {
      kind: "temperature",
      probe: "PT100",
      unit: "F",
    }),
    false,
  );
});

test("adapter maps a UTF-8 resistance range to the canonical dropdown label", async () => {
  const replies = { "FUNC1?": '"RES"', "AUTO?": "0", "RANGE?": "5 KΩ" };
  const port = fakePort((command, send) => send(replies[command] + "\r\n"));
  const transport = new SerialConnection(port, () =>
    assert.fail("Unexpected disconnect"),
  );
  await transport.open();
  try {
    const device = new OwonMeter(transport);
    assert.equal((await device.settings()).range, "5 kΩ");
  } finally {
    await transport.close();
  }
});

test("graph bounds contain negative, tiny and flat readings", () => {
  for (const values of [
    [-5, -4],
    [1e-12, 2e-12],
    [0, 0],
    [5, 5],
  ]) {
    const bounds = graphBounds(values);
    assert.ok(bounds.min < Math.min(...values));
    assert.ok(bounds.max > Math.max(...values));
  }
});

test("fragmented lines, repeated acknowledgments and command serialization", async () => {
  const port = fakePort((command, send) => {
    send("OK\r\nOK\n");
    send(command === "*IDN?" ? "OWON,XDM" : "-1.2");
    send(command === "*IDN?" ? "1041,123,V4.3.0,3\r\n" : "E-6\r\n");
  });
  const transport = new SerialConnection(port, () =>
    assert.fail("Unexpected disconnect"),
  );
  await transport.open();
  const result = await Promise.all([
    transport.transaction(() => transport.query("*IDN?")),
    transport.transaction(() => transport.query("MEAS1?")),
  ]);
  assert.equal(result[0], "OWON,XDM1041,123,V4.3.0,3");
  assert.equal(result[1], "-1.2E-6");
  assert.deepEqual(port.commands, ["*IDN?", "MEAS1?"]);
  await transport.close();
  assert.ok(port.closed);
});

test("timeout closes port and rejects queued work to avoid reply misassociation", async () => {
  const port = fakePort(() => {});
  let lost = 0;
  const transport = new SerialConnection(port, () => lost++, 25);
  await transport.open();
  const results = await Promise.allSettled([
    transport.transaction(() => transport.query("MEAS1?")),
    transport.transaction(() => transport.query("FUNC1?")),
  ]);
  assert.ok(results.every((result) => result.status === "rejected"));
  await transport.close();
  assert.equal(lost, 1);
  assert.ok(port.closed);
  assert.deepEqual(port.commands, ["MEAS1?"]);
});

test("disconnect rejects pending query and releases stream locks", async () => {
  const port = fakePort(() => {});
  const transport = new SerialConnection(port, () => {});
  await transport.open();
  const query = transport.transaction(() => transport.query("MEAS1?"));
  const rejection = assert.rejects(query);
  await new Promise((resolve) => setTimeout(resolve, 5));
  port.unplug();
  await rejection;
  await transport.close();
  assert.ok(port.closed);
  assert.equal(port.readable.locked, false);
  assert.equal(port.writable.locked, false);
});

test("adapter samples real units and discards a front-panel mode transition", async () => {
  let functions = 0;
  const replies = { "AUTO?": "1", "RANGE?": "5 V", "MEAS1?": "-1.424190E-04" };
  const port = fakePort((command, send) =>
    send(
      (command === "FUNC1?"
        ? ++functions <= 3
          ? '"VOLT"'
          : '"RES"'
        : replies[command]) + "\r\n",
    ),
  );
  const transport = new SerialConnection(port, () => {});
  await transport.open();
  const device = new OwonMeter(transport);
  const sample = await device.sample();
  assert.equal(sample.reading.unit, "V");
  assert.equal(sample.reading.value, -0.000142419);
  assert.equal(await device.sample(), null);
  await transport.close();
});
