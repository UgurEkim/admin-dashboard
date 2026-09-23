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
  normalizeRange,
  graphBounds,
  formatValue,
} = require("../lib/multimeter/protocol.ts");

function fakePort(reply) {
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
      assert.equal(options.baudRate, 115200);
    },
    async close() {
      closed = true;
    },
    unplug() {
      source.close();
    },
  };
}

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
  assert.equal(normalizeRange("5 K¦¸"), "5kΩ");
  assert.equal(normalizeRange("5uF"), normalizeRange("5 µF"));
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
